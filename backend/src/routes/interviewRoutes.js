import express from 'express';
import { 
  startInterview, 
  getNextQuestion, 
  submitAnswer, 
  completeInterview, 
  getInterviews, 
  getInterviewById,
  getActiveInterview
} from '../controllers/interviewController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, startInterview);
router.get('/', auth, getInterviews);
router.get('/active', auth, getActiveInterview);
router.get('/:interviewId', auth, getInterviewById);
router.post('/:interviewId/question', auth, getNextQuestion);
router.post('/:interviewId/answer', auth, submitAnswer);
router.post('/:interviewId/complete', auth, completeInterview);

export default router;
