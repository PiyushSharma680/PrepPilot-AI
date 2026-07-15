import express from 'express';
import { register, login, getProfile, updateProfile, getDashboardData } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/dashboard', auth, getDashboardData);

export default router;
