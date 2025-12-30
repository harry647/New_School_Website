import mongoose from 'mongoose';

const HumanitiesSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  resources: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Humanities = mongoose.model('Humanities', HumanitiesSchema);

export default Humanities;