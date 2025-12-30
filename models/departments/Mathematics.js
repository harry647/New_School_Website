import mongoose from 'mongoose';

const MathematicsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  resources: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Mathematics = mongoose.model('Mathematics', MathematicsSchema);

export default Mathematics;