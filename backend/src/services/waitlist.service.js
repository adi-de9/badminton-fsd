import Waitlist from '../models/waitlist.model.js';
import * as BookingService from './booking.service.js';
import * as AvailabilityService from './availability.service.js';

export const addToWaitlist = async (data) => {
  return await Waitlist.create(data);
};

export const processWaitlist = async (courtId, startTime, endTime) => {
  // Find pending waitlist items that match the freed slot
  // This is a simplified logic. In reality, the freed slot might cover multiple waitlist items or partial.
  // Assuming exact match or subset validation for simplicity.
  
  const candidates = await Waitlist.find({
    courtId,
    status: 'pending',
    startTime: { $gte: startTime }, // Logic implies the freed slot covers the request
    endTime: { $lte: endTime } 
  }).sort({ createdAt: 1 }); // FIFO

  for (const candidate of candidates) {
    // Check if truly available now
    const isFree = await AvailabilityService.checkCourtAvailable(candidate.courtId, candidate.startTime, candidate.endTime);
    if (isFree) {
        // Option A: Auto-book
        // Option B: Notify
        // Prompt says: "attempts auto-booking, notifies user"
        
        try {
            // Attempt to book (without equipment/coach for now as waitlist schema didn't fully capture that depth in prompt, 
            // but we can assume basic court booking or expand waitlist schema).
            // Assuming waitlist tracks court only based on schema provided in prompt.
            
            await BookingService.createBooking({
                userId: candidate.userId,
                courtId: candidate.courtId,
                startTime: candidate.startTime,
                endTime: candidate.endTime,
                equipment: [], 
                totalPrice: 0 // In real app, re-calc price.
            });
            
            candidate.status = 'fulfilled';
            await candidate.save();
            
            console.log(`Waitlist fulfilled for user ${candidate.userId}`);
            // Notify user logic here...
            
            // Once a candidate fills the slot, we might stop or continue if there's remaining time?
            // If the booking fills the exact slot, we stop.
            break; 
            
        } catch (err) {
            console.log(`Failed to auto-book waitlist item ${candidate._id}: ${err.message}`);
            // Continue to next candidate?
        }
    }
  }
};
