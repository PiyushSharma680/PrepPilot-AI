import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['personal', 'revision', 'flashcard'], default: 'personal' },
  bookmarkedQuestions: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);
