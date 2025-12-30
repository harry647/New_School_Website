import mongoose from 'mongoose';

const ScienceForumSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ScienceForum = mongoose.model('ScienceForum', ScienceForumSchema);

export default ScienceForum;