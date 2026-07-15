import express from 'express';
import { logDsaProblem, getDsaHistory, getDsaRecommendations, deleteDsaProblem } from '../controllers/dsaController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, logDsaProblem);
router.get('/', auth, getDsaHistory);
router.get('/recommendations', auth, getDsaRecommendations);
router.delete('/:dsaId', auth, deleteDsaProblem);

export default router;
