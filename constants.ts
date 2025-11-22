import { Question, UserStats, Exam, LearningModule } from './types';

export const SUBJECTS_LIST = [
  // --- MATEMÁTICA ---
  "Álgebra Linear",
  "Cálculo Diferencial e Integral I",
  "Cálculo Diferencial e Integral II",
  "Cálculo Diferencial e Integral III",
  "Cálculo Numérico",
  "Cálculo Vetorial e Geometria Analítica",
  "Probabilidade e Estatística",

  // --- FÍSICA E CIÊNCIAS BÁSICAS ---
  "Fenômenos de Transportes",
  "Física I (Mecânica)",
  "Física II (Ondas e Termodinâmica)",
  "Física III (Eletricidade e Magnetismo)",
  "Mecânica Geral",
  "Química Geral e Tecnológica",
  "Resistência dos Materiais",
  "Ciência e Tecnologia dos Materiais",

  // --- CIRCUITOS E ELETROMAGNETISMO ---
  "Circuitos Elétricos I (CC)",
  "Circuitos Elétricos II (CA)",
  "Eletromagnetismo",

  // --- ELETRÔNICA ---
  "Eletrônica Analógica",
  "Eletrônica Digital",
  "Eletrônica de Potência",
  "Instrumentação e Medidas Elétricas",

  // --- SISTEMAS DE ENERGIA E MÁQUINAS ---
  "Conversão Eletromecânica de Energia",
  "Máquinas Elétricas",
  "Geração, Transmissão e Distribuição (GTD)",
  "Análise de Sistemas de Potência (SEP)",
  "Instalações Elétricas",
  "Subestações e Proteção de Sistemas",
  "Eficiência Energética e Renováveis",

  // --- CONTROLE E AUTOMAÇÃO ---
  "Sinais e Sistemas",
  "Sistemas de Controle",
  "Automação Industrial e Robótica",
  "Redes Industriais e Supervisórios",

  // --- COMPUTAÇÃO E SISTEMAS DIGITAIS ---
  "Algoritmos e Programação",
  "Estruturas de Dados",
  "Arquitetura de Computadores e Microprocessadores",
  "Redes de Computadores e Comunicação de Dados",
  "Processamento Digital de Sinais (PDS)",

  // --- GESTÃO, AMBIENTE E HUMANIDADES ---
  "Administração e Economia para Engenharia",
  "Engenharia de Segurança do Trabalho",
  "Engenharia e Meio Ambiente",
  "Metodologia Científica e Projetos",
  "Libras e Inclusão"
];

// Generate MOCK_EXAMS dynamically for all subjects
const generateExams = (): Exam[] => {
  const exams: Exam[] = [];
  SUBJECTS_LIST.forEach((subject, index) => {
     // Add UFF Exam
     exams.push({
        id: `uff-${index}`,
        university: 'UFF',
        subject: subject,
        year: 2020 + (index % 4), // Cycles through 2020-2023
        period: `${(index % 2) + 1}º Sem`,
        url: '#'
     });
     // Add Estácio Exam
     exams.push({
        id: `est-${index}`,
        university: 'Estácio de Sá',
        subject: subject,
        year: 2019 + (index % 5), // Cycles through 2019-2023
        period: `${((index + 1) % 2) + 1}º Sem`,
        url: '#'
     });
  });
  return exams;
};

export const MOCK_EXAMS: Exam[] = generateExams();

// Generate MOCK_LEARNING_MODULES dynamically for all subjects
const generateModules = (): LearningModule[] => {
    return SUBJECTS_LIST.map((subject, index) => ({
        id: `lm-${index}`,
        title: subject,
        description: `Módulo completo: Teoria, exercícios resolvidos e aplicações práticas de ${subject}.`,
        progress: 0,
        totalLessons: 12 + (index % 8),
        completedLessons: 0
    }));
}

export const MOCK_LEARNING_MODULES: LearningModule[] = generateModules();

export const INITIAL_STATS: UserStats = {
  questionsSolved: 0,
  accuracy: 0,
  streakDays: 0,
  topicPerformance: []
};

// Initial sample data just so the UI isn't completely empty on first load if needed, 
// but logically we start from INITIAL_STATS in App.tsx
export const QUESTION_BANK_DATA: Question[] = [];