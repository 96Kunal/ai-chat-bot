import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  generateStudyPlanAI,
  explainConceptAI,
  generateQuizAI,
  generateImportantQuestionsAI,
} from '../services/geminiService';

export const createStudyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, examDate, availableHoursPerDay, currentLevel, topics } = req.body;

    if (!subject) {
      res.status(400).json({ success: false, message: 'Subject is required.' });
      return;
    }

    const plan = await generateStudyPlanAI({
      subject,
      examDate: examDate || 'In 30 Days',
      availableHoursPerDay: Number(availableHoursPerDay) || 3,
      currentLevel: currentLevel || 'Intermediate',
      topics: topics || '',
      customApiKey: req.customApiKey,
    });

    res.json({ success: true, plan });
  } catch (err: any) {
    console.error('[Study] Plan generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate study plan.', error: err.message });
  }
};

export const explainConcept = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { concept, targetDepth = 'intermediate', includeCode = true } = req.body;

    if (!concept) {
      res.status(400).json({ success: false, message: 'Concept name or question is required.' });
      return;
    }

    const explanation = await explainConceptAI({
      concept,
      targetDepth,
      includeCode,
      customApiKey: req.customApiKey,
    });

    res.json({ success: true, explanation });
  } catch (err: any) {
    console.error('[Study] Concept explanation error:', err);
    res.status(500).json({ success: false, message: 'Failed to explain concept.', error: err.message });
  }
};

export const generateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, questionCount = 5, difficulty = 'medium' } = req.body;

    if (!topic) {
      res.status(400).json({ success: false, message: 'Topic is required.' });
      return;
    }

    const quiz = await generateQuizAI({
      topic,
      questionCount: Number(questionCount) || 5,
      difficulty,
      customApiKey: req.customApiKey,
    });

    res.json({ success: true, quiz });
  } catch (err: any) {
    console.error('[Study] Quiz generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate quiz.', error: err.message });
  }
};

export const generateImportantQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, examType = 'End Semester Examination' } = req.body;

    if (!subject) {
      res.status(400).json({ success: false, message: 'Subject name is required.' });
      return;
    }

    const questionsData = await generateImportantQuestionsAI({
      subject,
      examType,
      customApiKey: req.customApiKey,
    });

    res.json({ success: true, questionsData });
  } catch (err: any) {
    console.error('[Study] Important questions generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate important questions.', error: err.message });
  }
};
