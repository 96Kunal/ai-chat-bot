import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { DocumentModel } from '../models/Document';
import { extractTextFromBuffer } from '../services/documentService';
import { summarizeDocumentAI, streamChatResponse } from '../services/geminiService';

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded. Please provide a document.' });
      return;
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Extract text content
    const extractedText = await extractTextFromBuffer(buffer, mimetype, originalname);

    if (!extractedText || extractedText.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Could not extract readable text from this document.' });
      return;
    }

    // Generate AI Summary & Key points
    let summary = '';
    let keyPoints: string[] = [];
    let suggestedQuestions: string[] = [];

    try {
      const summaryResult = await summarizeDocumentAI({
        documentText: extractedText,
        documentName: originalname,
        customApiKey: req.customApiKey,
      });
      summary = summaryResult.summary;
      keyPoints = summaryResult.keyPoints;
      suggestedQuestions = summaryResult.suggestedQuestions;
    } catch (aiErr: any) {
      console.warn('[DocController] AI summary generation error:', aiErr.message);
      summary = 'Document uploaded successfully. AI summary pending API key.';
    }

    const doc = await DocumentModel.create({
      userId: req.userId,
      originalName: originalname,
      mimeType: mimetype,
      size,
      extractedText,
      summary,
      keyPoints,
    });

    res.status(201).json({
      success: true,
      message: 'Document processed successfully!',
      document: {
        id: doc._id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        summary: doc.summary,
        keyPoints: doc.keyPoints,
        suggestedQuestions,
        createdAt: doc.createdAt,
      },
    });
  } catch (err: any) {
    console.error('[DocController] Upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to process document.', error: err.message });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const docs = await DocumentModel.find({ userId: req.userId })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    res.json({ success: true, documents: docs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving documents.', error: err.message });
  }
};

export const getDocumentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await DocumentModel.findOne({ _id: id, userId: req.userId });

    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found.' });
      return;
    }

    res.json({ success: true, document: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching document.', error: err.message });
  }
};

export const askDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question) {
      res.status(400).json({ success: false, message: 'Question is required.' });
      return;
    }

    const doc = await DocumentModel.findOne({ _id: id, userId: req.userId });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found.' });
      return;
    }

    const documentContext = `DOCUMENT NAME: ${doc.originalName}\nDOCUMENT CONTENT:\n${doc.extractedText.slice(0, 30000)}`;

    let responseText = '';
    await streamChatResponse({
      messages: [],
      currentMessage: `Based strictly on the attached document, please answer this question thoroughly:\n${question}`,
      documentContext,
      customApiKey: req.customApiKey,
      onChunk: (chunk: string) => {
        responseText += chunk;
      },
    });

    res.json({
      success: true,
      answer: responseText,
      documentName: doc.originalName,
    });
  } catch (err: any) {
    console.error('[DocController] Ask document error:', err);
    res.status(500).json({ success: false, message: 'Error querying document.', error: err.message });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await DocumentModel.deleteOne({ _id: id, userId: req.userId });
    res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error deleting document.', error: err.message });
  }
};
