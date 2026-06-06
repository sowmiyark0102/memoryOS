export interface Topic {
  id: string;
  title: string;
  subject: string;
  content: string;
  createdAt: Date;
  lastReviewed: Date | null;
  nextReview: Date;
  retentionScore: number; // 0–100
  reviewCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  forgettingCurve: ForgettingPoint[];
}

export interface ForgettingPoint {
  date: Date;
  retention: number;
}

export interface Quiz {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizSession {
  id: string;
  topicId: string;
  startedAt: Date;
  completedAt: Date | null;
  score: number;
  total: number;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  quizId: string;
  selectedIndex: number;
  correct: boolean;
  timeMs: number;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  subject: string;
  retentionScore: number;
  connections: string[];
  x?: number;
  y?: number;
}

export interface DailyStats {
  date: string;
  topicsReviewed: number;
  avgRetention: number;
  studyMinutes: number;
  quizScore: number;
}

export interface UserStats {
  totalTopics: number;
  avgRetention: number;
  streak: number;
  topicsToReview: number;
  totalStudyHours: number;
  weeklyProgress: DailyStats[];
}
