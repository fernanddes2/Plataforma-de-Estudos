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

// Lista expandida de Universidades para simulação
const UNIVERSITIES = [
    // Militares (Nível Muito Difícil)
    { name: 'ITA', type: 'Militar', fullName: 'Instituto Tecnológico de Aeronáutica' },
    { name: 'IME', type: 'Militar', fullName: 'Instituto Militar de Engenharia' },
    
    // Públicas SP (Nível Difícil/Teórico)
    { name: 'USP', type: 'Publica', fullName: 'Universidade de São Paulo (Poli/São Carlos)' },
    { name: 'UNICAMP', type: 'Publica', fullName: 'Universidade Estadual de Campinas' },
    { name: 'UNESP', type: 'Publica', fullName: 'Universidade Estadual Paulista' },

    // Públicas Federais (Nível Difícil)
    { name: 'UFRJ', type: 'Publica', fullName: 'Universidade Federal do Rio de Janeiro' },
    { name: 'UFF', type: 'Publica', fullName: 'Universidade Federal Fluminense' },
    { name: 'UFMG', type: 'Publica', fullName: 'Universidade Federal de Minas Gerais' },
    { name: 'UFRGS', type: 'Publica', fullName: 'Universidade Federal do Rio Grande do Sul' },
    { name: 'UNB', type: 'Publica', fullName: 'Universidade de Brasília' },
    { name: 'UTFPR', type: 'Publica', fullName: 'Universidade Tecnológica Federal do Paraná' },

    // Privadas de Referência (Nível Médio/Alto)
    { name: 'PUC-Rio', type: 'PrivadaRef', fullName: 'Pontifícia Universidade Católica do Rio' },
    { name: 'Mackenzie', type: 'PrivadaRef', fullName: 'Universidade Presbiteriana Mackenzie' },
    { name: 'FEI', type: 'PrivadaRef', fullName: 'Centro Universitário FEI' },

    // Privadas / Grupos Educacionais (Nível Padrão/Enade)
    { name: 'Estácio de Sá', type: 'Privada', fullName: 'Universidade Estácio de Sá' },
    { name: 'Anhanguera', type: 'Privada', fullName: 'Anhanguera Educacional' },
    { name: 'UNIP', type: 'Privada', fullName: 'Universidade Paulista' }
];

// Generate MOCK_EXAMS dynamically for all subjects and universities
const generateExams = (): Exam[] => {
  const exams: Exam[] = [];
  
  SUBJECTS_LIST.forEach((subject, index) => {
     UNIVERSITIES.forEach((uni, uIndex) => {
        // Nem todas as faculdades têm prova de tudo no mock, vamos variar um pouco
        // Mas garantindo que matérias principais (Cálculo, Física, Circuitos) tenham em todas
        const isCoreSubject = index < 25; 
        const randomFactor = (index + uIndex) % 3 !== 0; // 2/3 de chance de ter a prova

        if (isCoreSubject || randomFactor) {
            exams.push({
                id: `${uni.name.toLowerCase()}-${index}`,
                university: uni.name as any,
                subject: subject,
                year: 2020 + (index % 4), // Cycles through 2020-2023
                period: `${(index % 2) + 1}º Sem`,
                url: '#'
            });
        }
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