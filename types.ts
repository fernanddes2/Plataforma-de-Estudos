export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  QUESTION_BANK = 'QUESTION_BANK',
  LEARNING = 'LEARNING',
  EXAMS = 'EXAMS',
  AI_TUTOR = 'AI_TUTOR',
  STATS = 'STATS',
  QUIZ_ACTIVE = 'QUIZ_ACTIVE'
}

export interface Question {
  id: string;
  topic: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: Record<string, number>; // questionId -> selectedIndex
  isFinished: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface UserStats {
  questionsSolved: number;
  accuracy: number; // percentage
  streakDays: number;
  topicPerformance: {
    topic: string;
    score: number; // 0-100
  }[];
}

export interface Exam {
  id: string;
  university: 'UFF' | 'Estácio de Sá';
  subject: string;
  year: number;
  period: string;
  url: string; // Mock URL
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}