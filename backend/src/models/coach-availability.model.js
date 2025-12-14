import mongoose from 'mongoose';

const coachAvailabilitySchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  date: {
    type: Date,
    required: true // Store as pure date (00:00:00)
  },
  startTime: {
    type: String, // "09:00"
    required: true
  },
  endTime: {
    type: String, // "17:00"
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

// Index for fast lookup
coachAvailabilitySchema.index({ coachId: 1, date: 1 });

const CoachAvailability = mongoose.model('CoachAvailability', coachAvailabilitySchema);
export default CoachAvailability;
