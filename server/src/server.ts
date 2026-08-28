import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import studyRoutes from './routes/studyRoutes';
import documentRoutes from './routes/documentRoutes';
import collegeRoutes from './routes/collegeRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'Crimson AI Personal Assistant API',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  });
});

// Direct Database Viewer Endpoint
app.get('/api/debug/db', async (_req: Request, res: Response) => {
  try {
    const { User } = await import('./models/User');
    const { ChatSession } = await import('./models/Chat');
    const { Bookmark } = await import('./models/Bookmark');
    const { DocumentModel } = await import('./models/Document');

    const users = await User.find().select('-passwordHash');
    const chats = await ChatSession.find().sort({ updatedAt: -1 });
    const bookmarks = await Bookmark.find();
    const documents = await DocumentModel.find();

    res.json({
      database: {
        totalUsers: users.length,
        totalChats: chats.length,
        totalBookmarks: bookmarks.length,
        totalDocuments: documents.length,
      },
      users,
      chats,
      bookmarks,
      documents,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/knowledge', collegeRoutes);
app.use('/api/events', collegeRoutes);
app.use('/api/announcements', collegeRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

// Start Server & Connect DB
const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`⚡ [Server] Crimson AI Personal Assistant backend running on http://localhost:${PORT}`);
  });

  // Connect DB in background
  connectDB().catch((err) => console.error('[DB] Connection error:', err));
};

startServer();

export default app;
