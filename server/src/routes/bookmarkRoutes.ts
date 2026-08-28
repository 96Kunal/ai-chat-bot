import { Router } from 'express';
import { createBookmark, getBookmarks, deleteBookmark } from '../controllers/bookmarkController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', requireAuth, createBookmark);
router.get('/', requireAuth, getBookmarks);
router.delete('/:id', requireAuth, deleteBookmark);

export default router;
