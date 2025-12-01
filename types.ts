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
  difficulty: string; // ALTERADO: string genérica para aceitar o que vier da IA
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: Record<string, number>; 
  isFinished: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

// ADICIONADO: A interface que faltava
export interface Chat {
  model: string;
  history: ChatMessage[];
  sendMessage: (msg: string) => Promise<string>;
  _rawSession?: any;
}

export interface UserStats {
  questionsSolved: number;
  accuracy: number; 
  streakDays: number;
  topicPerformance: {
    topic: string;
    score: number; 
  }[];
}

export interface Exam {
  id: string;
  university: 'UFF' | 'Estácio de Sá';
  subject: string;
  year: number;
  period: string;
  url: string; 
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}