import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/authMiddleware';
import { ChatSession, IMessage } from '../models/Chat';
import { DocumentModel } from '../models/Document';
import { findRelevantKnowledge, formatKnowledgeContext } from '../services/knowledgeService';
import { streamChatResponse } from '../services/geminiService';

export const handleChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, sessionId, documentId, stream = true } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message text is required.' });
      return;
    }

    const userId = req.userId;

    // Retrieve or create chat session if user is logged in
    let session = null;
    if (userId) {
      if (sessionId) {
        session = await ChatSession.findOne({ _id: sessionId, userId });
      }
      if (!session) {
        session = await ChatSession.create({
          userId,
          title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
          messages: [],
        });
      }
    }

    // 1. Check for grounded college knowledge
    const knowledgeMatches = await findRelevantKnowledge(message);
    const knowledgeContext = formatKnowledgeContext(knowledgeMatches);
    const isGrounded = knowledgeMatches.length > 0;
    const groundingSources = knowledgeMatches.map((k) => `${k.title} (${k.category})`);

    // 2. Check for attached document context
    let documentContext = '';
    if (documentId && userId) {
      const doc = await DocumentModel.findOne({ _id: documentId, userId });
      if (doc) {
        documentContext = `Document Name: "${doc.originalName}"\nContent:\n${doc.extractedText.slice(0, 25000)}`;
      }
    }

    const previousMessages = session ? session.messages : [];

    const userMessageObj: IMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      content: message,
      timestamp: new Date(),
    };

    if (session) {
      session.messages.push(userMessageObj);
    }

    const customKey = req.customApiKey;

    if (stream) {
      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      // Send initial metadata event
      res.write(
        `data: ${JSON.stringify({
          type: 'meta',
          sessionId: session ? session._id : null,
          isGrounded,
          groundingSources,
        })}\n\n`
      );

      try {
        const fullResponse = await streamChatResponse({
          messages: previousMessages,
          currentMessage: message,
          knowledgeContext,
          documentContext,
          customApiKey: customKey,
          onChunk: (chunk: string) => {
            res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
          },
        });

        const assistantMessageObj: IMessage = {
          id: crypto.randomUUID(),
          sender: 'assistant',
          content: fullResponse,
          isGrounded,
          groundingSources,
          documentContextId: documentId,
          timestamp: new Date(),
        };

        if (session) {
          session.messages.push(assistantMessageObj);
          await session.save();
        }

        res.write(
          `data: ${JSON.stringify({
            type: 'done',
            message: assistantMessageObj,
            sessionId: session ? session._id : null,
          })}\n\n`
        );
        res.end();
      } catch (geminiError: any) {
        console.error('[Chat Stream] Gemini Error:', geminiError);
        res.write(
          `data: ${JSON.stringify({
            type: 'error',
            error: geminiError.message || 'Error communicating with Gemini AI.',
          })}\n\n`
        );
        res.end();
      }
    } else {
      let fullResponse = '';
      await streamChatResponse({
        messages: previousMessages,
        currentMessage: message,
        knowledgeContext,
        documentContext,
        customApiKey: customKey,
        onChunk: (chunk: string) => {
          fullResponse += chunk;
        },
      });

      const assistantMessageObj: IMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        content: fullResponse,
        isGrounded,
        groundingSources,
        documentContextId: documentId,
        timestamp: new Date(),
      };

      if (session) {
        session.messages.push(assistantMessageObj);
        await session.save();
      }

      res.json({
        success: true,
        sessionId: session ? session._id : null,
        message: assistantMessageObj,
      });
    }
  } catch (err: any) {
    console.error('[Chat] Controller error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Chat execution error.', error: err.message });
    }
  }
};

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const sessions = await ChatSession.find({ userId: req.userId })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = sessions.map((s) => ({
      id: s._id,
      title: s.title,
      messageCount: s.messages?.length || 0,
      lastMessage: s.messages?.[s.messages.length - 1]?.content?.slice(0, 60) || '',
      updatedAt: s.updatedAt,
      createdAt: s.createdAt,
    }));

    res.json({ success: true, sessions: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving sessions.', error: err.message });
  }
};

export const getSessionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const session = await ChatSession.findOne({ _id: id, userId: req.userId });
    if (!session) {
      res.status(404).json({ success: false, message: 'Chat session not found.' });
      return;
    }

    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching session.', error: err.message });
  }
};

export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await ChatSession.deleteOne({ _id: id, userId: req.userId });
    res.json({ success: true, message: 'Chat session removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error deleting session.', error: err.message });
  }
};

export const clearSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const session = await ChatSession.findOne({ _id: id, userId: req.userId });
    if (session) {
      session.messages = [];
      await session.save();
    }

    res.json({ success: true, message: 'Chat history cleared.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error clearing session.', error: err.message });
  }
};
