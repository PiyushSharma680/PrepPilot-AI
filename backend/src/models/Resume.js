import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  filename: { type: String, required: true },
  atsScore: { type: Number, required: true },
  missingSkills: { type: [String], default: [] },
  grammarSuggestions: { type: [String], default: [] },
  keywordOptimization: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  parsedText: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const Resume = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);
