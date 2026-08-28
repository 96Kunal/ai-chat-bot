import { Router } from 'express';
import multer from 'multer';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  askDocument,
  deleteDocument,
} from '../controllers/documentController';
import { requireAuth } from '../middleware/authMiddleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

const router = Router();

router.post('/upload', requireAuth, upload.single('file'), uploadDocument);
router.get('/', requireAuth, getDocuments);
router.get('/:id', requireAuth, getDocumentById);
router.post('/:id/ask', requireAuth, askDocument);
router.delete('/:id', requireAuth, deleteDocument);

export default router;
