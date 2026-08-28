import { Router } from 'express';
import {
  createStudyPlan,
  explainConcept,
  generateQuiz,
  generateImportantQuestions,
} from '../controllers/studyController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// Study tools accessible with optional auth
router.post('/plan', optionalAuth, createStudyPlan);
router.post('/explain', optionalAuth, explainConcept);
router.post('/quiz', optionalAuth, generateQuiz);
router.post('/questions', optionalAuth, generateImportantQuestions);

export default router;
