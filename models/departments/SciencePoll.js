import mongoose from 'mongoose';

const SciencePollSchema = new mongoose.Schema({
  subject: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
});

const SciencePoll = mongoose.model('SciencePoll', SciencePollSchema);

export default SciencePoll;