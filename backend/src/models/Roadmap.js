import mongoose from 'mongoose';

const RoadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  targetCompany: { type: String, default: 'General' },
  durationWeeks: { type: Number, default: 4 },
  weeks: [{
    weekNumber: Number,
    weeklyGoal: String,
    dailyTasks: [String]
  }],
  completedTasks: { type: [String], default: [] },
  currentWeek: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

export const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);
