import mongoose from 'mongoose';

const DSASchema = new mongoose.Schema({
  userId: { type: String, required: true },
  problemName: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic: { type: String, required: true },
  platform: { type: String, default: 'LeetCode' },
  problemUrl: { type: String, default: '' },
  solvedAt: { type: Date, default: Date.now }
});

export const DSATracking = mongoose.models.DSA || mongoose.model('DSA', DSASchema);
