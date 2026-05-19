import express from 'express';
import { analyzeSymptoms } from '../controllers/diseaseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeSymptoms);

export default router;

