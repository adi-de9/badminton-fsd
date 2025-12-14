import express from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public or Protected? User needs to be logged in to book? Yes.
// Availability might be public.
router.get('/availability', bookingController.checkAvailability);
router.post('/pricing/preview', bookingController.previewPrice);

// Bookings
router.use(protect); // All below require login

router.route('/bookings')
  .post(bookingController.createBooking);

router.route('/bookings/:id')
  .get(bookingController.getBooking);

router.patch('/bookings/:id/cancel', bookingController.cancelBooking);

// Waitlist
router.post('/waitlist', bookingController.joinWaitlist);

export default router;
