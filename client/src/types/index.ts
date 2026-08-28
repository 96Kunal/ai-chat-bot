export interface User {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
  avatar: string;
  hasCustomKey?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  isGrounded?: boolean;
  groundingSources?: string[];
  documentContextId?: string;
  timestamp: string | Date;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  messageCount: number;
  lastMessage: string;
  updatedAt: string;
  createdAt: string;
}

export interface CollegeKnowledgeItem {
  _id: string;
  category: 'department' | 'faculty' | 'club' | 'facility' | 'rule' | 'contact' | 'faq' | 'curriculum';
  title: string;
  tags: string[];
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CampusEvent {
  _id: string;
  id?: string;
  title: string;
  description: string;
  category: 'Hackathon' | 'Workshop' | 'Seminar' | 'Cultural' | 'Sports' | 'Career';
  date: string;
  time: string;
  venue: string;
  organizer: string;
  bannerUrl?: string;
  registrationLink?: string;
  isRsvpd?: boolean;
  rsvpCount?: number;
}

export interface AnnouncementItem {
  _id: string;
  title: string;
  content: string;
  category: 'Urgent' | 'Academic' | 'Exam' | 'Campus' | 'Placement';
  priority: 'high' | 'medium' | 'low';
  author: string;
  publishedAt: string;
  attachments?: string[];
}

export interface DocumentItem {
  _id?: string;
  id?: string;
  originalName: string;
  mimeType: string;
  size: number;
  extractedText?: string;
  summary?: string;
  keyPoints?: string[];
  suggestedQuestions?: string[];
  createdAt: string;
}

export interface BookmarkItem {
  _id: string;
  userId: string;
  title: string;
  category: 'chat' | 'study_plan' | 'quiz' | 'concept' | 'note';
  content: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StudyPlanDay {
  dayNumber: number;
  focusTopic: string;
  tasks: string[];
  studyHours: number;
  reviewCheck: string;
}

export interface StudyPlanWeek {
  weekNumber: number;
  theme: string;
  days: StudyPlanDay[];
}

export interface StudyPlanResponse {
  subject: string;
  overview: string;
  totalEstimatedDays: number;
  dailyTargetHours: number;
  weeklyMilestones: StudyPlanWeek[];
  highYieldTips: string[];
  revisionStrategy: string;
}

export interface ConceptExplanationResponse {
  concept: string;
  oneSentenceSummary: string;
  simpleAnalogy: string;
  detailedExplanation: string;
  codeOrFormula: string;
  commonPitfalls: string[];
  quickCheckQuestions: Array<{ question: string; answer: string }>;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: string;
}

export interface QuizResponse {
  title: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface ExamQuestionItem {
  question: string;
  marks: number;
  frequency: string;
  keyPointsToInclude: string[];
  modelAnswerOutline: string;
}

export interface ExamCategory {
  sectionName: string;
  questions: ExamQuestionItem[];
}

export interface ImportantQuestionsResponse {
  subject: string;
  examType: string;
  categories: ExamCategory[];
  preparationStrategy: string[];
}
