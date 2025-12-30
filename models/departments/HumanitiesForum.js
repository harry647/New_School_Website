import mongoose from 'mongoose';

const HumanitiesForumSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const HumanitiesForum = mongoose.model('HumanitiesForum', HumanitiesForumSchema);

export default HumanitiesForum;