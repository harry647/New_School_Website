import mongoose from 'mongoose';

const LanguagesForumSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const LanguagesForum = mongoose.model('LanguagesForum', LanguagesForumSchema);

export default LanguagesForum;