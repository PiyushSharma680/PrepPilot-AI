import express from 'express';
import { createRoadmap, getRoadmaps, getRoadmapById, updateRoadmapProgress } from '../controllers/roadmapController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createRoadmap);
router.get('/', auth, getRoadmaps);
router.get('/:roadmapId', auth, getRoadmapById);
router.put('/:roadmapId', auth, updateRoadmapProgress);

export default router;
