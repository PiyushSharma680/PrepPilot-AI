import express from 'express';
import { createNote, getNotes, updateNote, deleteNote } from '../controllers/notesController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createNote);
router.get('/', auth, getNotes);
router.put('/:noteId', auth, updateNote);
router.delete('/:noteId', auth, deleteNote);

export default router;
