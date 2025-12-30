import mongoose from 'mongoose';

const LanguagesPollSchema = new mongoose.Schema({
  subject: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
});

const LanguagesPoll = mongoose.model('LanguagesPoll', LanguagesPollSchema);

export default LanguagesPoll;