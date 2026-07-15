import { Note } from '../models/Note.js';

export const createNote = async (req, res) => {
  const { title, content, type, bookmarkedQuestions } = req.body;
  try {
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const note = await Note.create({
      userId: req.user.id,
      title,
      content: content || '',
      type: type || 'personal',
      bookmarkedQuestions: bookmarkedQuestions || []
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
};

export const updateNote = async (req, res) => {
  const { title, content, type, bookmarkedQuestions } = req.body;
  try {
    const existing = await Note.findById(req.params.noteId);
    if (!existing || existing.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const update = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (type !== undefined) update.type = type;
    if (bookmarkedQuestions !== undefined) update.bookmarkedQuestions = bookmarkedQuestions;

    const updated = await Note.findByIdAndUpdate(req.params.noteId, update);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const result = await Note.deleteOne({ _id: req.params.noteId, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
};
