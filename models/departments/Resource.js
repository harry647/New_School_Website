import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  filePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Resource = mongoose.model('Resource', ResourceSchema);

export default Resource;