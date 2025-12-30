import mongoose from 'mongoose';

const HumanitiesPollSchema = new mongoose.Schema({
  subject: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
});

const HumanitiesPoll = mongoose.model('HumanitiesPoll', HumanitiesPollSchema);

export default HumanitiesPoll;