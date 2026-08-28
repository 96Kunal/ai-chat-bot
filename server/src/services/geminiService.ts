import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_SYSTEM_INSTRUCTION = `You are Crimson AI, an intelligent, helpful, encouraging, and versatile personal AI assistant.
Core Guidelines:
1. Identity: Your name is Crimson AI. Whenever asked who you are, what model or assistant you are, proudly introduce yourself as Crimson AI.
2. Grounding & Context: Prioritize verified information provided in the context when available. Clearly distinguish between verified reference data and general AI knowledge.
3. Accuracy & Honesty: Never invent facts. When uncertain, be transparent and provide practical next steps or suggest verified resources.
4. Educational & Productivity Quality: Explain academic, algorithmic, and engineering concepts step-by-step. Provide clean markdown, clear bullet points, actionable roadmaps, and well-commented code snippets with syntax highlighting.
5. Tone: Friendly, sharp, inspiring, and productivity-oriented.`;

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

export const getGeminiModelName = (): string => {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
};

export const getModelCandidateList = (): string[] => {
  const primary = getGeminiModelName();
  const list = [primary, ...FALLBACK_MODELS];
  // Deduplicate preserving order
  return Array.from(new Set(list));
};

const getGenAI = (customKey?: string) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please provide a valid Gemini API key in settings or environment variables.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const formatGeminiError = (error: any): string => {
  const msg = error?.message || String(error);
  if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
    return 'Invalid Gemini API Key. Please verify your API key in Settings or server environment.';
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
    return 'Gemini API rate limit reached. Please wait a moment before sending another request.';
  }
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('Service Unavailable') || msg.includes('UNAVAILABLE')) {
    return 'Gemini AI is currently experiencing high demand across Google servers. Please retry in a few moments.';
  }
  if (msg.includes('404') && msg.includes('models/')) {
    return 'The requested Gemini model is currently unavailable or deprecated. Please verify GEMINI_MODEL in .env.';
  }
  // Sanitize any accidentally leaked keys in raw URLs
  return msg.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=***');
};

const isTransientError = (err: any): boolean => {
  const msg = (err?.message || String(err)).toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('resource_exhausted') ||
    msg.includes('overloaded') ||
    msg.includes('429') ||
    msg.includes('404') ||
    msg.includes('fetch failed') ||
    msg.includes('econnreset') ||
    msg.includes('socket')
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function executeWithFallback<T>(
  action: (modelName: string, genAI: GoogleGenerativeAI) => Promise<T>,
  customApiKey?: string
): Promise<T> {
  const genAI = getGenAI(customApiKey);
  const candidates = getModelCandidateList();
  let lastError: any = null;

  for (let i = 0; i < candidates.length; i++) {
    const modelName = candidates[i];
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await action(modelName, genAI);
      } catch (err: any) {
        lastError = err;
        const transient = isTransientError(err);
        console.warn(
          `[GeminiService] Transient error on "${modelName}" (attempt ${attempt}/2):`,
          err?.message || err
        );

        if (transient && attempt < 2) {
          await sleep(700 * attempt);
          continue;
        }

        // If not transient (like invalid key), fail fast
        const errStr = (err?.message || String(err)).toLowerCase();
        if (errStr.includes('api_key') || errStr.includes('api key')) {
          throw new Error(formatGeminiError(err));
        }
        break;
      }
    }
    await sleep(300);
  }

  throw new Error(formatGeminiError(lastError));
}

const cleanAndParseJSON = (text: string): any => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
};

export interface ChatMessageContext {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const streamChatResponse = async ({
  messages,
  currentMessage,
  knowledgeContext,
  documentContext,
  customApiKey,
  onChunk,
}: {
  messages: Array<{ sender: 'user' | 'assistant'; content: string }>;
  currentMessage: string;
  knowledgeContext?: string;
  documentContext?: string;
  customApiKey?: string;
  onChunk: (chunk: string) => void;
}): Promise<string> => {
  return executeWithFallback(async (modelName, genAI) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
    });

    const history: ChatMessageContext[] = messages.slice(-10).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    let prompt = currentMessage;
    if (knowledgeContext) {
      prompt = `${knowledgeContext}\n\nStudent Question: ${currentMessage}`;
    }
    if (documentContext) {
      prompt = `### ATTACHED STUDY DOCUMENT CONTEXT:\n${documentContext}\n\n${prompt}`;
    }

    const resultStream = await chat.sendMessageStream(prompt);
    let fullText = '';

    for await (const chunk of resultStream.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText);
    }

    return fullText;
  }, customApiKey);
};

export const generateStudyPlanAI = async ({
  subject,
  examDate,
  availableHoursPerDay,
  currentLevel,
  topics,
  customApiKey,
}: {
  subject: string;
  examDate: string;
  availableHoursPerDay: number;
  currentLevel: string;
  topics: string;
  customApiKey?: string;
}): Promise<any> => {
  return executeWithFallback(async (modelName, genAI) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `Create an optimized, structured study plan for a university student.
Subject: ${subject}
Target Exam Date: ${examDate}
Study Time Available: ${availableHoursPerDay} hours/day
Current Proficiency: ${currentLevel}
Key Topics to Cover: ${topics || 'Standard comprehensive university syllabus'}

Return ONLY a valid JSON object matching this TypeScript interface:
{
  "subject": string,
  "overview": string,
  "totalEstimatedDays": number,
  "dailyTargetHours": number,
  "weeklyMilestones": [
    {
      "weekNumber": number,
      "theme": string,
      "days": [
        {
          "dayNumber": number,
          "focusTopic": string,
          "tasks": string[],
          "studyHours": number,
          "reviewCheck": string
        }
      ]
    }
  ],
  "highYieldTips": string[],
  "revisionStrategy": string
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return cleanAndParseJSON(text);
  }, customApiKey);
};

export const explainConceptAI = async ({
  concept,
  targetDepth,
  includeCode,
  customApiKey,
}: {
  concept: string;
  targetDepth: 'beginner' | 'intermediate' | 'advanced';
  includeCode: boolean;
  customApiKey?: string;
}): Promise<any> => {
  return executeWithFallback(async (modelName, genAI) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `Explain the following academic/technical concept thoroughly for a college student:
Concept: "${concept}"
Depth: ${targetDepth}
Include Code/Formula Examples: ${includeCode}

Return ONLY a valid JSON object matching this schema:
{
  "concept": string,
  "oneSentenceSummary": string,
  "simpleAnalogy": string,
  "detailedExplanation": string (formatted in markdown with headings),
  "codeOrFormula": string (if applicable, code block or LaTeX-style formula, else empty string),
  "commonPitfalls": string[],
  "quickCheckQuestions": [
    {
      "question": string,
      "answer": string
    }
  ]
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return cleanAndParseJSON(text);
  }, customApiKey);
};

export const generateQuizAI = async ({
  topic,
  questionCount,
  difficulty,
  customApiKey,
}: {
  topic: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  customApiKey?: string;
}): Promise<any> => {
  return executeWithFallback(async (modelName, genAI) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `Generate a high-quality practice quiz for university students.
Topic: "${topic}"
Number of questions: ${questionCount || 5}
Difficulty Level: ${difficulty}

Return ONLY a valid JSON object matching this schema:
{
  "title": string,
  "topic": string,
  "difficulty": string,
  "questions": [
    {
      "id": number,
      "question": string,
      "options": string[] (array of exactly 4 strings),
      "correctAnswerIndex": number (0 to 3),
      "explanation": string,
      "difficulty": string
    }
  ]
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return cleanAndParseJSON(text);
  }, customApiKey);
};

export const generateImportantQuestionsAI = async ({
  subject,
  examType,
  customApiKey,
}: {
  subject: string;
  examType: string;
  customApiKey?: string;
}): Promise<any> => {
  return executeWithFallback(async (modelName, genAI) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `Generate high-yield predicted examination questions for university students.
Subject: "${subject}"
Exam Type: "${examType || 'End Semester Examination'}"

Return ONLY a valid JSON object matching this schema:
{
  "subject": string,
  "examType": string,
  "categories": [
    {
      "sectionName": string (e.g. "Short Answer Questions (2-5 Marks)", "Long Analytical Questions (10-15 Marks)"),
      "questions": [
        {
          "question": string,
          "marks": number,
          "frequency": string ("Frequently Asked" | "High Probability" | "Core Concept"),
          "keyPointsToInclude": string[],
          "modelAnswerOutline": string
        }
      ]
    }
  ],
  "preparationStrategy": string[]
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return cleanAndParseJSON(text);
  }, customApiKey);
};

export const summarizeDocumentAI = async ({
  documentText,
  documentName,
  customApiKey,
}: {
  documentText: string;
  documentName: string;
  customApiKey?: string;
}): Promise<{ summary: string; keyPoints: string[]; suggestedQuestions: string[] }> => {
  return executeWithFallback(async (modelName, genAI) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const truncatedText = documentText.slice(0, 30000); // safety cap for single-shot prompt

    const prompt = `Analyze and summarize this study material for a university student.
Document Name: "${documentName}"
Text Content:
${truncatedText}

Return ONLY a valid JSON object matching this schema:
{
  "summary": string (comprehensive multi-paragraph markdown summary),
  "keyPoints": string[] (list of 5-10 key bullet points),
  "suggestedQuestions": string[] (list of 4-6 smart questions a student can ask about this document)
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return cleanAndParseJSON(text);
  }, customApiKey);
};
