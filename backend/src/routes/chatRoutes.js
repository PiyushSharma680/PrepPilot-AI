import express from 'express';
import { chatMentor } from '../controllers/chatController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, chatMentor);

export default router;
