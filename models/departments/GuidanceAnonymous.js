import mongoose from 'mongoose';

const GuidanceAnonymousSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const GuidanceAnonymous = mongoose.model('GuidanceAnonymous', GuidanceAnonymousSchema);

export default GuidanceAnonymous;