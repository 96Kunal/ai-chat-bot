import { Router } from 'express';
import { handleChat, getSessions, getSessionById, deleteSession, clearSession } from '../controllers/chatController';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Chat supports both authenticated and guest users (with optional grounding/history persistence)
router.post('/', optionalAuth, handleChat);
router.get('/sessions', requireAuth, getSessions);
router.get('/history/:id', requireAuth, getSessionById);
router.delete('/session/:id', requireAuth, deleteSession);
router.post('/clear/:id', requireAuth, clearSession);

export default router;
