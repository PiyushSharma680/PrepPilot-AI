import express from 'express';
import multer from 'multer';
import { uploadResume, getResumes, getLatestResume } from '../controllers/resumeController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', auth, upload.single('resume'), uploadResume);
router.get('/', auth, getResumes);
router.get('/latest', auth, getLatestResume);

export default router;
