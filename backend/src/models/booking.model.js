import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach'
  },
  equipment: [{
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EquipmentInventory'
    },
    qty: {
      type: Number,
      required: true
    }
  }],
  startTime: {
    type: Date, // ISO Date
    required: true
  },
  endTime: {
    type: Date, // ISO Date
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for overlap checking
bookingSchema.index({ courtId: 1, startTime: 1, endTime: 1, status: 1 });
bookingSchema.index({ coachId: 1, startTime: 1, endTime: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
