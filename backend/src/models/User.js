import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  dsaStreak: { type: Number, default: 0 },
  dsaLastSolved: { type: String, default: '' },
  readinessScore: { type: Number, default: 0 },
  skills: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
