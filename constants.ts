import { Question, UserStats, Exam, LearningModule } from './types';

export const SUBJECTS_LIST = [
  // --- MATEMÁTICA ---
  "Fundamentos de Cálculo e Geometria",
  "Cálculo Numérico",
  "Cálculo Vetorial e Geometria Analítica",
  "Cálculo 1",
  "Cálculo 2",
  "Cálculo 3",
  "Cálculo 4",
  "Álgebra Linear",
  "Probabilidade e Estatística",
  "Métodos Numéricos",

  // --- FÍSICA E CIÊNCIAS BÁSICAS ---
  "Fenômenos de Transportes",
  "Física I",
  "Física II",
  "Física III",
  "Mecânica Geral",
  "Química Geral e Tecnológica",
  "Resistência dos Materiais",
  "Ciência e Tecnologia dos Materiais",
  "Termodinâmica I",
  "Fundamentos de Desenho Técnico II",
  "Metodologia Científica",
  "Introdução à Ciência dos Materiais",

  // --- CIRCUITOS E ELETROMAGNETISMO ---
  "Circuitos Elétricos I (CC)",
  "Circuitos Elétricos II (CA)",
  "Laboratório de Circuitos Elétricos",
  "Eletromagnetismo",
  "Eletromagnetismo I",

  // --- ELETRÔNICA ---
  "Eletrônica",
  "Eletrônica Analógica",
  "Eletrônica Digital",
  "Circuitos Digitais 1",
  "Eletrônica de Potência",
  "Instrumentação e Medidas Elétricas",
  "Laboratório de Eletrônica",
  "Microcontroladores e Microprocessadores",
  "Dispositivos Eletrônicos Inteligentes - IEDs",

  // --- SISTEMAS DE ENERGIA E MÁQUINAS ---
  "Introdução aos Sistemas de Energia Elétrica",
  "Conversão Eletromecânica de Energia",
  "Conversão Eletromecânica de Energia e Transformadores",
  "Máquinas Elétricas",
  "Laboratório de Máquinas Elétricas",
  "Laboratório de Acionamento de Máquinas Elétricas",
  "Geração de Energia Elétrica",
  "Transmissão de Energia Elétrica I",
  "Distribuição de Energia Elétrica I",
  "Análise de Sistemas de Potência (SEP)",
  "Análise de Sistemas Elétricos I",
  "Análise de Sistemas Elétricos II",
  "Análise de Sistemas Elétricos III",
  "Instalações Elétricas I",
  "Instalações Elétricas II",
  "Instalações Elétricas Industriais",
  "Sistemas Elétricos Industriais",
  "Equipamentos Elétricos",
  "Subestações e Proteção de Sistemas",
  "Subestações de Energia Elétrica",
  "Proteção de Sistemas Elétricos I",
  "Laboratório de Sistemas de Energia Elétrica",
  "Eficiência Energética I",
  "Eficiência Energética II",
  "Sistemas de Energia Renovável",
  "Projeto Integrador de Máquinas Elétricas e Eletrônica de Potência",

  // --- CONTROLE E AUTOMAÇÃO ---
  "Sinais e Sistemas",
  "Sistemas de Controle I",
  "Sistemas de Controle II",
  "Automação Industrial e Robótica",
  "Redes Industriais e Supervisórios",
  "Laboratório de Instrumentação e Controle de Processos",
  "Processamento Digital de Sinais",

  // --- COMPUTAÇÃO E SISTEMAS DIGITAIS ---
  "Algoritmos e Programação",
  "Programação de Computadores",
  "Estruturas de Dados",
  "Sistemas de Computação",
  "Arquitetura de Computadores e Microprocessadores",
  "Redes de Computadores e Comunicação de Dados",
  "Introdução às Redes de Computadores I",

  // --- GESTÃO, PROJETOS E PRÁTICA ---
  "Concepção e Projeto de Engenharia Elétrica",
  "Laboratório de Engenharia Elétrica e Computação",
  "Administração Aplicada à Engenharia",
  "Economia Aplicada à Engenharia",
  "Gestão da Manutenção",
  "Engenharia de Segurança do Trabalho",
  "Engenharia e Meio Ambiente",
  "Metodologia Científica e Projetos",
  "Libras e Inclusão",
  "Estágio Curricular em Engenharia Elétrica",
  "Projeto Final de Engenharia Elétrica IV"
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
