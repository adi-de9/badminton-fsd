import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';
import CoachAvailability from '../models/coach-availability.model.js';
import EquipmentInventory from '../models/equipment-inventory.model.js';

export const checkCourtAvailable = async (courtId, start, end, excludeBookingId = null) => {
  const query = {
    courtId,
    status: { $ne: 'cancelled' },
    $or: [
      { startTime: { $lt: end }, endTime: { $gt: start } }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBooking = await Booking.findOne(query);
  return !existingBooking;
};

export const checkCoachAvailable = async (coachId, start, end, excludeBookingId = null) => {
  if (!coachId) return true;

  // 1. Check if coach is working at this time (CoachAvailability)
  // Assuming start and end are on the same day for simplicity
  // This logic can be expanded for multi-day, but keeping it simple for now.
  const startDate = new Date(start);
  const dateStr = new Date(startDate.setHours(0,0,0,0)); // midnight
  
  // Convert start/end to HH:MM for comparison
  const sTime = new Date(start).toTimeString().substring(0, 5);
  const eTime = new Date(end).toTimeString().substring(0, 5);

  const availability = await CoachAvailability.findOne({
    coachId,
    date: dateStr,
    isAvailable: true,
    startTime: { $lte: sTime },
    endTime: { $gte: eTime }
  });

  if (!availability) return false;

  // 2. Check for overlapping bookings
  const query = {
    coachId,
    status: { $ne: 'cancelled' },
    $or: [
      { startTime: { $lt: end }, endTime: { $gt: start } }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBooking = await Booking.findOne(query);
  return !existingBooking;
};

export const checkEquipmentAvailable = async (inventoryId, qty, start, end, excludeBookingId = null) => {
  if (!inventoryId || qty <= 0) return true;

  const inventory = await EquipmentInventory.findById(inventoryId);
  if (!inventory) return false;

  // Aggregate booked quantity in the time range
  const pipeline = [
    {
      $match: {
        status: { $ne: 'cancelled' },
        $or: [
          { startTime: { $lt: end }, endTime: { $gt: start } }
        ]
      }
    },
    {
      $unwind: '$equipment'
    },
    {
      $match: {
        'equipment.inventoryId': new mongoose.Types.ObjectId(inventoryId)
      }
    },
    {
      $group: {
        _id: null,
        totalBooked: { $sum: '$equipment.qty' }
      }
    }
  ];
  
  // Note: Aggregation doesn't support exclusion easily if done this way, 
  // needs excludeBookingId filter in the first match if updating.

  if (excludeBookingId) {
    pipeline[0].$match._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
  }

  const result = await Booking.aggregate(pipeline);
  const bookedQty = result.length > 0 ? result[0].totalBooked : 0;

  return (inventory.totalStock - inventory.maintenanceStock) >= (bookedQty + qty);
};
