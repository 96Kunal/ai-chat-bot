import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Bookmark } from '../models/Bookmark';

export const createBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { title, category = 'chat', content, tags = [], metadata = {} } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required.' });
      return;
    }

    const bookmark = await Bookmark.create({
      userId: req.userId,
      title: title.trim(),
      category,
      content,
      tags,
      metadata,
    });

    res.status(201).json({ success: true, message: 'Bookmark saved!', bookmark });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create bookmark.', error: err.message });
  }
};

export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { category } = req.query;
    const filter: Record<string, any> = { userId: req.userId };

    if (category && category !== 'all') {
      filter.category = category;
    }

    const bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, bookmarks });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to get bookmarks.', error: err.message });
  }
};

export const deleteBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await Bookmark.deleteOne({ _id: id, userId: req.userId });
    res.json({ success: true, message: 'Bookmark removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete bookmark.', error: err.message });
  }
};
