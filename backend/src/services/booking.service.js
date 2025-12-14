import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';
import * as AvailabilityService from './availability.service.js';
import * as PricingService from './pricing.service.js';
import { acquireLock, releaseLock } from '../utils/lock.js';
import AppError from '../utils/AppError.js';

export const createBooking = async (bookingData) => {
  const { courtId, coachId, equipment, startTime, endTime } = bookingData;
  const locks = [];
  const resourcesToLock = [`court:${courtId}`];
  if (coachId) resourcesToLock.push(`coach:${coachId}`);
  if (equipment) {
    equipment.forEach(item => resourcesToLock.push(`inventory:${item.inventoryId}`));
  }

  // Sort resources to prevent deadlocks (simple alphabetical sort of keys)
  resourcesToLock.sort();

  try {
    // 1. Acquire Redis Locks
    for (const resource of resourcesToLock) {
      const lockId = await acquireLock(resource, 5000); // 5s ttl
      if (!lockId) {
        throw new AppError('System busy, resources locked. Please try again.', 409);
      }
      locks.push({ resource, lockId });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 2. Check Availability (Double check inside lock/transaction)
      // Pass session if AvailabilityService supports it (it doesn't yet, but reads are usually fine if we have locks. 
      // Strictly speaking, we should pass session to queries in AvailabilityService for read consistency in transaction,
      // but Mongoose queries outside transaction won't see transaction writes anyway.)
      // Since we rely on Redis locks for concurrency, standard reads are okay for checking overlap with *committed* data.
      
      const isCourtFree = await AvailabilityService.checkCourtAvailable(courtId, startTime, endTime);
      if (!isCourtFree) throw new AppError('Court is already booked.', 400);

      if (coachId) {
        const isCoachFree = await AvailabilityService.checkCoachAvailable(coachId, startTime, endTime);
        if (!isCoachFree) throw new AppError('Coach is unavailable.', 400);
      }

      if (equipment) {
        for (const item of equipment) {
          const isEqFree = await AvailabilityService.checkEquipmentAvailable(item.inventoryId, item.qty, startTime, endTime);
          if (!isEqFree) throw new AppError(`Not enough equipment inventory for ${item.inventoryId}`, 400);
        }
      }

      // 3. Calculate Price
      const { finalPrice } = await PricingService.calculatePrice(bookingData);

      // 4. Create Booking
      const newBooking = await Booking.create([{
        ...bookingData,
        totalPrice: finalPrice
      }], { session });

      await session.commitTransaction();
      return newBooking[0];

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } finally {
    // 5. Release Locks
    for (const lock of locks) {
      await releaseLock(lock.resource, lock.lockId);
    }
  }
};

export const cancelBooking = async (bookingId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status === 'cancelled') throw new AppError('Booking already cancelled', 400);

    booking.status = 'cancelled';
    await booking.save({ session });

    // Trigger Waitlist Processing (Fire and forget or await?)
    // In a real system, use an event queue. Here we can call service directly but catch errors so we don't block cancellation.
    // We'll return the cancelled booking and let controller handle waitlist triggering or do it here inside finally?
    // Better to do it after commit.

    await session.commitTransaction();
    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
