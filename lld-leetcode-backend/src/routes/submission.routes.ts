import { Router } from 'express';
import { submitCode, getProblems } from '../controllers/submission.controller';

const router = Router();

// GET /api/problems -> Returns list of problems
router.get('/problems', getProblems);

// POST /api/submit -> Sends code to Gemini
router.post('/submit', submitCode);

export default router;