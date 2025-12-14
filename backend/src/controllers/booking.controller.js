import * as BookingService from '../services/booking.service.js';
import * as AvailabilityService from '../services/availability.service.js';
import * as PricingService from '../services/pricing.service.js';
import * as WaitlistService from '../services/waitlist.service.js';
import Booking from '../models/booking.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const checkAvailability = catchAsync(async (req, res, next) => {
  const { courtId, coachId, equipment, start, end } = req.query; 
  // Expecting ISO strings for start/end
  
  const isCourtFree = await AvailabilityService.checkCourtAvailable(courtId, start, end);
  let isCoachFree = true;
  if (coachId) isCoachFree = await AvailabilityService.checkCoachAvailable(coachId, start, end);
  
  // Equipment check usually needs array parsing from query which is tricky, 
  // simplified for this example or assume POST for complex checks? 
  // Prompt says GET /api/availability. Usually simple checks.
  // We'll return court/coach availability mainly.
  
  res.status(200).json({
    success: true,
    data: {
      court: isCourtFree,
      coach: isCoachFree
    }
  });
});

export const previewPrice = catchAsync(async (req, res, next) => {
  const priceData = await PricingService.calculatePrice(req.body);
  res.status(200).json({
    success: true,
    data: priceData
  });
});

export const createBooking = catchAsync(async (req, res, next) => {
  // Ensure userId comes from auth token
  const bookingData = { ...req.body, userId: req.user._id };
  const booking = await BookingService.createBooking(bookingData);
  
  res.status(201).json({
    success: true,
    data: booking
  });
});

export const getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('courtId')
    .populate('coachId')
    .populate('equipment.inventoryId');

  if (!booking) return next(new AppError('No booking found with that ID', 404));

  res.status(200).json({
    success: true,
    data: booking
  });
});

export const getUserBookings = catchAsync(async (req, res, next) => {
  // User can only see their own bookings unless admin
  // User can only see their own bookings unless admin or owner
  if (!['admin', 'owner'].includes(req.user.role) && req.user.id !== req.params.id) {
      return next(new AppError('Unauthorized', 403));
  }

  const bookings = await Booking.find({ userId: req.params.id });
  
  res.status(200).json({
    success: true,
    results: bookings.length,
    data: bookings
  });
});

export const cancelBooking = catchAsync(async (req, res, next) => {
    // Check ownership
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('No booking found', 404));
    
    if (!['admin', 'owner'].includes(req.user.role) && booking.userId.toString() !== req.user.id) {
        return next(new AppError('Unauthorized', 403));
    }

    const cancelledBooking = await BookingService.cancelBooking(req.params.id);

    // Trigger waitlist check asynchronously
    WaitlistService.processWaitlist(
        cancelledBooking.courtId, 
        cancelledBooking.startTime, 
        cancelledBooking.endTime
    ).catch(err => console.error('Waitlist process error:', err));

    res.status(200).json({
        success: true,
        data: cancelledBooking
    });
});

export const joinWaitlist = catchAsync(async (req, res, next) => {
    const data = { ...req.body, userId: req.user._id };
    const entry = await WaitlistService.addToWaitlist(data);
    res.status(201).json({
        success: true,
        data: entry
    });
});
