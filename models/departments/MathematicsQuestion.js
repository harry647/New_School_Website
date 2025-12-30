import mongoose from 'mongoose';

const MathematicsQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  teacher: { type: String, default: 'Any Teacher' },
  timestamp: { type: Date, default: Date.now }
});

const MathematicsQuestion = mongoose.model('MathematicsQuestion', MathematicsQuestionSchema);

export default MathematicsQuestion;