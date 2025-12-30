import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Helper function to get data from MongoDB with JSON fallback
const getDataWithFallback = async (modelName, jsonFilePath) => {
  try {
    // Try to get data from MongoDB first
    if (mongoose.connection.readyState === 1) {
      const Model = mongoose.model(modelName);
      const data = await Model.find({}).lean();
      console.log(`✅ Retrieved ${data.length} records from MongoDB for ${modelName}`);
      return data;
    }
  } catch (error) {
    console.error(`❌ MongoDB error for ${modelName}:`, error.message);
  }

  // Fallback to JSON if MongoDB fails or is not connected
  try {
    if (fs.existsSync(jsonFilePath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
      console.log(`🔄 Using JSON fallback for ${modelName}`);
      return Array.isArray(jsonData) ? jsonData : [];
    }
  } catch (error) {
    console.error(`❌ JSON fallback error for ${modelName}:`, error.message);
  }

  return [];
};

// Helper function to save data to MongoDB with JSON backup
const saveDataWithBackup = async (modelName, jsonFilePath, data) => {
  try {
    // Try to save to MongoDB first
    if (mongoose.connection.readyState === 1) {
      const Model = mongoose.model(modelName);
      await Model.create(data);
      console.log(`✅ Saved to MongoDB: ${modelName}`);
    }
  } catch (error) {
    console.error(`❌ MongoDB save error for ${modelName}:`, error.message);
  }

  // Always save to JSON as backup
  try {
    const dir = path.dirname(jsonFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let existingData = [];
    if (fs.existsSync(jsonFilePath)) {
      existingData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
      if (!Array.isArray(existingData)) {
        existingData = [];
      }
    }

    // Append new data
    existingData.push(data);
    fs.writeFileSync(jsonFilePath, JSON.stringify(existingData, null, 2), 'utf-8');
    console.log(`🔄 JSON backup saved for ${modelName}`);
  } catch (error) {
    console.error(`❌ JSON backup error for ${modelName}:`, error.message);
  }
};

export { getDataWithFallback, saveDataWithBackup };