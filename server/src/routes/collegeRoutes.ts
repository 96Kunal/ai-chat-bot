import { Router } from 'express';
import {
  getKnowledgeList,
  getEvents,
  rsvpEvent,
  getAnnouncements,
  getDashboardOverview,
} from '../controllers/collegeController';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/knowledge', getKnowledgeList);
router.get('/events', optionalAuth, getEvents);
router.post('/events/:id/rsvp', requireAuth, rsvpEvent);
router.get('/announcements', getAnnouncements);
router.get('/overview', optionalAuth, getDashboardOverview);

export default router;
