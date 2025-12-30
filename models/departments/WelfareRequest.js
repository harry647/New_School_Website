import mongoose from 'mongoose';

const WelfareRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userType: { type: String, default: 'Not specified' },
  name: { type: String, default: 'Anonymous' },
  email: { type: String, required: true },
  supportType: { type: String, required: true },
  description: { type: String, required: true },
  attachments: { type: Array, default: [] },
  submitted_at: { type: Date, default: Date.now },
  status: { type: String, default: 'new' }
});

const WelfareRequest = mongoose.model('WelfareRequest', WelfareRequestSchema);

export default WelfareRequest;