// types.ts - Arquivo COMPLETO de definições

// 1. Navegação
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  QUESTION_BANK = 'QUESTION_BANK',
  LEARNING = 'LEARNING',
  EXAMS = 'EXAMS',
  AI_TUTOR = 'AI_TUTOR',
  STATS = 'STATS',
  QUIZ_ACTIVE = 'QUIZ_ACTIVE'
}

// 2. Questões e Quiz
export interface Question {
  id: string;
  topic: string;
  difficulty: string; // String para aceitar "Fácil", "Médio", "Difícil" ou "Adaptado"
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: Record<string, number>; // Mapa: ID da questão -> Índice da resposta escolhida
  isFinished: boolean;
}

// 3. Chat (IA Tutor)
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  parts?: { text: string }[]; // Para compatibilidade com o formato do Google
  isLoading?: boolean;
}

export interface Chat {
  model: string;
  history: ChatMessage[];
  sendMessage: (msg: string) => Promise<string>;
  _rawSession?: any; // Para guardar a sessão original do SDK, se necessário
}

// 4. Estatísticas do Usuário (O QUE ESTAVA FALTANDO)
export interface UserStats {
  questionsSolved: number;
  accuracy: number; // Porcentagem (0-100)
  streakDays: number;
  topicPerformance: {
    topic: string;
    score: number; // 0-100
  }[];
}

// 5. Provas e Arquivos
export interface Exam {
  id: string;
  university: string; // String genérica para aceitar qualquer faculdade
  subject: string;
  year: number;
  period: string;
  url: string; // Link simulado
}

// 6. Módulos de Aprendizado (O QUE ESTAVA FALTANDO)
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  totalLessons: number;
  completedLessons: number;
}