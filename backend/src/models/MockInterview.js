import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['Technical', 'HR', 'Behavioral'], required: true },
  category: { type: String, default: 'General' },
  overallScore: { type: Number, default: 0 },
  improvementAreas: { type: [String], default: [] },
  questions: [{
    question: String,
    userAnswer: String,
    feedback: String,
    score: Number
  }],
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const MockInterview = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);
