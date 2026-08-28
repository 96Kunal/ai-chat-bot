import axios from 'axios';
import {
  User,
  ChatSessionSummary,
  CollegeKnowledgeItem,
  CampusEvent,
  AnnouncementItem,
  DocumentItem,
  BookmarkItem,
  StudyPlanResponse,
  ConceptExplanationResponse,
  QuizResponse,
  ImportantQuestionsResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token and custom API key
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const customKey = localStorage.getItem('gemini_api_key');
  if (customKey) {
    config.headers['x-gemini-api-key'] = customKey;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },
  register: async (data: { name: string; email: string; password: string; major?: string; year?: string }) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  demoLogin: async () => {
    const res = await apiClient.post('/auth/demo');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return res.data.user;
  },
  updateProfile: async (data: Partial<User> & { customApiKey?: string }) => {
    const res = await apiClient.put<{ success: boolean; user: User; message: string }>('/auth/profile', data);
    return res.data;
  },
};

// Chat API (with streaming support via fetch)
export const chatApi = {
  sendMessageStream: async ({
    message,
    sessionId,
    documentId,
    onMeta,
    onChunk,
    onDone,
    onError,
  }: {
    message: string;
    sessionId?: string;
    documentId?: string;
    onMeta?: (meta: { sessionId: string; isGrounded: boolean; groundingSources: string[] }) => void;
    onChunk: (chunk: string) => void;
    onDone: (data: any) => void;
    onError: (err: string) => void;
  }) => {
    const token = localStorage.getItem('token');
    const customKey = localStorage.getItem('gemini_api_key');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (customKey) headers['x-gemini-api-key'] = customKey;

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message, sessionId, documentId, stream: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Chat request failed' }));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const line = block.trim();
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'meta' && onMeta) {
                onMeta(data);
              } else if (data.type === 'chunk') {
                onChunk(data.text);
              } else if (data.type === 'done') {
                onDone(data);
              } else if (data.type === 'error') {
                onError(data.error);
              }
            } catch (e) {
              console.warn('[Stream parse error]', e);
            }
          }
        }
      }
    } catch (err: any) {
      onError(err.message || 'Stream connection error');
    }
  },

  getSessions: async () => {
    const res = await apiClient.get<{ success: boolean; sessions: ChatSessionSummary[] }>('/chat/sessions');
    return res.data.sessions;
  },

  getSessionById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; session: any }>(`/chat/history/${id}`);
    return res.data.session;
  },

  deleteSession: async (id: string) => {
    const res = await apiClient.delete(`/chat/session/${id}`);
    return res.data;
  },

  clearSession: async (id: string) => {
    const res = await apiClient.post(`/chat/clear/${id}`);
    return res.data;
  },
};

// Study Tools API
export const studyApi = {
  generatePlan: async (data: {
    subject: string;
    examDate: string;
    availableHoursPerDay: number;
    currentLevel: string;
    topics?: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; plan: StudyPlanResponse }>('/study/plan', data);
    return res.data.plan;
  },

  explainConcept: async (data: { concept: string; targetDepth: string; includeCode: boolean }) => {
    const res = await apiClient.post<{ success: boolean; explanation: ConceptExplanationResponse }>('/study/explain', data);
    return res.data.explanation;
  },

  generateQuiz: async (data: { topic: string; questionCount: number; difficulty: string }) => {
    const res = await apiClient.post<{ success: boolean; quiz: QuizResponse }>('/study/quiz', data);
    return res.data.quiz;
  },

  generateQuestions: async (data: { subject: string; examType: string }) => {
    const res = await apiClient.post<{ success: boolean; questionsData: ImportantQuestionsResponse }>(
      '/study/questions',
      data
    );
    return res.data.questionsData;
  },
};

// Documents API
export const documentApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const customKey = localStorage.getItem('gemini_api_key');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (customKey) headers['x-gemini-api-key'] = customKey;

    const res = await axios.post<{ success: boolean; document: DocumentItem }>(
      `${API_BASE}/documents/upload`,
      formData,
      { headers }
    );
    return res.data.document;
  },

  getDocuments: async () => {
    const res = await apiClient.get<{ success: boolean; documents: DocumentItem[] }>('/documents');
    return res.data.documents;
  },

  getDocumentById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; document: DocumentItem }>(`/documents/${id}`);
    return res.data.document;
  },

  askDocument: async (id: string, question: string) => {
    const res = await apiClient.post<{ success: boolean; answer: string; documentName: string }>(
      `/documents/${id}/ask`,
      { question }
    );
    return res.data;
  },

  deleteDocument: async (id: string) => {
    const res = await apiClient.delete(`/documents/${id}`);
    return res.data;
  },
};

// College Hub API
export const collegeApi = {
  getKnowledge: async (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await apiClient.get<{ success: boolean; count: number; knowledge: CollegeKnowledgeItem[] }>(
      `/knowledge/knowledge?${params.toString()}`
    );
    return res.data.knowledge;
  },

  getEvents: async (category?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const res = await apiClient.get<{ success: boolean; events: CampusEvent[] }>(`/events/events?${params.toString()}`);
    return res.data.events;
  },

  rsvpEvent: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; isRsvpd: boolean; rsvpCount: number }>(
      `/events/events/${id}/rsvp`
    );
    return res.data;
  },

  getAnnouncements: async (category?: string, priority?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);
    const res = await apiClient.get<{ success: boolean; announcements: AnnouncementItem[] }>(
      `/announcements/announcements?${params.toString()}`
    );
    return res.data.announcements;
  },

  getOverview: async () => {
    const res = await apiClient.get<{
      success: boolean;
      stats: any;
      upcomingEvents: CampusEvent[];
      recentAnnouncements: AnnouncementItem[];
      recentChats: any[];
    }>('/college/overview');
    return res.data;
  },
};

// Bookmarks API
export const bookmarkApi = {
  create: async (data: {
    title: string;
    category: 'chat' | 'study_plan' | 'quiz' | 'concept' | 'note';
    content: string;
    tags?: string[];
    metadata?: any;
  }) => {
    const res = await apiClient.post<{ success: boolean; bookmark: BookmarkItem }>('/bookmarks', data);
    return res.data.bookmark;
  },

  getAll: async (category?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    const res = await apiClient.get<{ success: boolean; bookmarks: BookmarkItem[] }>(
      `/bookmarks?${params.toString()}`
    );
    return res.data.bookmarks;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/bookmarks/${id}`);
    return res.data;
  },
};
