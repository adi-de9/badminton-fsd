import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  specialization: String,
  isActive: {
    type: Boolean,
    default: true
  }
});

const Coach = mongoose.model('Coach', coachSchema);
export default Coach;
