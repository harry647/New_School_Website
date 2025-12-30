import mongoose from 'mongoose';

const GuidanceAppointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userType: { type: String, default: 'Not specified' },
  name: { type: String, default: 'Anonymous' },
  email: { type: String, required: true },
  supportType: { type: String, required: true },
  description: { type: String, required: true },
  submitted_at: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

const GuidanceAppointment = mongoose.model('GuidanceAppointment', GuidanceAppointmentSchema);

export default GuidanceAppointment;