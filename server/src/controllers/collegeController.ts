import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { CollegeKnowledge } from '../models/CollegeKnowledge';
import { Event } from '../models/Event';
import { Announcement } from '../models/Announcement';
import { ChatSession } from '../models/Chat';
import { DocumentModel } from '../models/Document';
import { Bookmark } from '../models/Bookmark';
import { findRelevantKnowledge } from '../services/knowledgeService';

export const getKnowledgeList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    const filter: Record<string, any> = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const items = await findRelevantKnowledge(search);
      res.json({ success: true, count: items.length, knowledge: items });
      return;
    }

    const items = await CollegeKnowledge.find(filter).sort({ category: 1, title: 1 });
    res.json({ success: true, count: items.length, knowledge: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving knowledge items.', error: err.message });
  }
};

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: Record<string, any> = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    const events = await Event.find(filter).sort({ date: 1 }).lean();

    // Map RSVP flag if user is logged in
    const userIdStr = req.userId?.toString();
    const formattedEvents = events.map((e) => ({
      ...e,
      id: e._id,
      isRsvpd: userIdStr ? e.rsvpUsers?.some((u) => u.toString() === userIdStr) : false,
      rsvpCount: e.rsvpUsers?.length || 0,
    }));

    res.json({ success: true, events: formattedEvents });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving events.', error: err.message });
  }
};

export const rsvpEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Login required to RSVP for events.' });
      return;
    }

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const userId = req.user!._id;
    const isAlreadyRsvpd = event.rsvpUsers.some((u) => u.toString() === userId.toString());

    if (isAlreadyRsvpd) {
      event.rsvpUsers = event.rsvpUsers.filter((u) => u.toString() !== userId.toString());
    } else {
      event.rsvpUsers.push(userId);
    }

    await event.save();

    res.json({
      success: true,
      message: isAlreadyRsvpd ? 'RSVP removed.' : 'RSVP confirmed! See you there 🎉',
      isRsvpd: !isAlreadyRsvpd,
      rsvpCount: event.rsvpUsers.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error updating RSVP.', error: err.message });
  }
};

export const getAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, priority } = req.query;
    const filter: Record<string, any> = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    const announcements = await Announcement.find(filter).sort({ publishedAt: -1 });
    res.json({ success: true, announcements });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving announcements.', error: err.message });
  }
};

export const getDashboardOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [eventsCount, announcementsCount, knowledgeCount] = await Promise.all([
      Event.countDocuments(),
      Announcement.countDocuments(),
      CollegeKnowledge.countDocuments(),
    ]);

    const upcomingEvents = await Event.find().sort({ date: 1 }).limit(3);
    const recentAnnouncements = await Announcement.find().sort({ publishedAt: -1 }).limit(3);

    let userSessionsCount = 0;
    let userDocsCount = 0;
    let userBookmarksCount = 0;
    let recentChats: any[] = [];

    if (req.userId) {
      [userSessionsCount, userDocsCount, userBookmarksCount, recentChats] = await Promise.all([
        ChatSession.countDocuments({ userId: req.userId }),
        DocumentModel.countDocuments({ userId: req.userId }),
        Bookmark.countDocuments({ userId: req.userId }),
        ChatSession.find({ userId: req.userId }).sort({ updatedAt: -1 }).limit(3).lean(),
      ]);
    }

    res.json({
      success: true,
      stats: {
        eventsCount,
        announcementsCount,
        knowledgeCount,
        userSessionsCount,
        userDocsCount,
        userBookmarksCount,
      },
      upcomingEvents,
      recentAnnouncements,
      recentChats: recentChats.map((c) => ({
        id: c._id,
        title: c.title,
        updatedAt: c.updatedAt,
        messageCount: c.messages?.length || 0,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error loading dashboard.', error: err.message });
  }
};
