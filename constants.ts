import { Question, UserStats, Exam, LearningModule } from './types';

export const SUBJECTS_LIST = [
  "Administração Aplicada à Engenharia",
  "Administração de Novos Negócios",
  "Álgebra Linear",
  "Análise de Sistemas Elétricos I",
  "Análise de Sistemas Elétricos II",
  "Análise e Previsão de Desem. de Sist. e de Potência",
  "Análise Textual",
  "Arquitetura e Organização de Computadores",
  "Automação de Processos e Robótica",
  "Cálculo 1",
  "Cálculo 2",
  "Cálculo 3",
  "Cálculo 4",
  "Cálculo Diferencial e Integral I",
  "Cálculo Diferencial e Integral II",
  "Cálculo Diferencial e Integral III",
  "Cálculo Numérico",
  "Cálculo Vetorial e Geometria Analítica",
  "Ciências do Ambiente",
  "Circuitos Digitais",
  "Circuitos Digitais 1",
  "Circuitos Elétricos I",
  "Circuitos Elétricos II",
  "Circuitos Elétricos de Corrente Alternada",
  "Circuitos Elétricos de Corrente Contínua",
  "Circuitos Especiais",
  "Competências Gerenciais",
  "Comunicações de Dados",
  "Concepção e Projeto de Engenharia Elétrica",
  "Controle e Servomecanismos I",
  "Controle e Servomecanismos II",
  "Conversão Eletromecânica de Energia I",
  "Conversão Eletromecânica de Energia II",
  "Conversão Eletromecânica de Energia e Transformadores",
  "Desenho Técnico",
  "Distribuição de Energia Elétrica",
  "Economia Aplicada à Engenharia",
  "Economia do Meio Ambiente e Financ. de Projetos",
  "Educação Ambiental",
  "Eficiência Energética I",
  "Eletricidade Aplicada",
  "Eletromagnetismo",
  "Eletromagnetismo I",
  "Eletrônica",
  "Eletrônica de Potência",
  "Engenharia e Meio Ambiente",
  "Ergonomia, Higiene e Segurança do Trabalho",
  "Estágio Curricular em Engenharia Elétrica",
  "Estágio Supervisionado em Engenharia Elétrica",
  "Estatística Básica",
  "Estruturas de Dados",
  "Fenômenos de Transportes",
  "Física Experimental I",
  "Física Experimental II",
  "Física Experimental III",
  "Física I",
  "Física II",
  "Física III",
  "Física Teórica I",
  "Física Teórica II",
  "Física Teórica III",
  "Fundamentos de Cálculo e Geometria",
  "Fundamentos de Desenho Técnico II",
  "Fundamentos de Economia",
  "Geração de Energia Elétrica",
  "Gerenciamento de Riscos Ambientais",
  "Gestão e Legislação Ambiental",
  "Inovação Tecnológica",
  "Instalações de Baixa Tensão",
  "Instalações Elétricas I",
  "Instalações Elétricas II",
  "Instalações Elétricas Industriais",
  "Instrumentação e Medidas Elétricas",
  "Introdução à Administração",
  "Introdução à Ciência dos Materiais",
  "Introdução ao Cálculo Diferencial",
  "Introdução aos Sistemas de Energia Elétrica",
  "Introdução às Redes de Computadores I",
  "Laboratório de Circuitos Elétricos",
  "Laboratório de Eletrônica",
  "Laboratório de Engenharia Elétrica e Computação",
  "Laboratório de Máquinas Elétricas",
  "Linguagem de Programação para Controle e Automação",
  "Lógica de Programação",
  "Máquinas Elétricas",
  "Máquinas Elétricas e Acionamentos",
  "Materiais Elétricos",
  "Mecânica Geral",
  "Mecânica Geral V",
  "Metodologia Científica",
  "Métodos Numéricos",
  "Modelagem e Análise de Sistemas Dinâmicos",
  "Planejamento de Carreira e Sucesso Profissional",
  "Planejamento Energético",
  "Probabilidade e Estatística Aplicada à Engenharia",
  "Processamento Digital de Sinais",
  "Programação de Computadores",
  "Projeto de Sistemas",
  "Projeto Final de Engenharia Elétrica IV",
  "Projeto Integrador de Máquinas Elétricas e Eletrônica de Potência",
  "Química Geral",
  "Química Geral Tecnológica",
  "Redes de Computadores I",
  "Redes Industriais e Sistemas Supervisórios",
  "Resistência dos Materiais",
  "Resistência dos Materiais I",
  "Seminários Integrados em Engenharia Elétrica",
  "Sinais e Sistemas",
  "Sistemas a Microprocessadores",
  "Sistemas de Computação",
  "Sistemas de Controle I",
  "Sistemas de Proteção e Medição",
  "Subestação",
  "Subestações de Energia Elétrica",
  "Sustentabilidade",
  "TCC 1 em Engenharia",
  "TCC 2 em Engenharia Elétrica",
  "Termodinâmica I",
  "Tópicos em Libras: Surdez e Inclusão",
  "Tópicos Especiais em Energias Renováveis",
  "Transmissão de Energia Elétrica I",
  "Transmissão de Energia Elétrica II"
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
        progress: index % 13 === 0 ? 100 : (index % 7 === 0 ? Math.floor(Math.random() * 80) + 10 : 0), // Random progress for demo visual variety
        totalLessons: 12 + (index % 8),
        completedLessons: index % 13 === 0 ? 12 + (index % 8) : (index % 7 === 0 ? Math.floor(Math.random() * 5) : 0)
    }));
}

export const MOCK_LEARNING_MODULES: LearningModule[] = generateModules();

export const MOCK_STATS: UserStats = {
  questionsSolved: 342,
  accuracy: 76,
  streakDays: 12,
  topicPerformance: [
    { topic: 'Circuitos Elétricos', score: 85 },
    { topic: 'Eletromagnetismo', score: 60 },
    { topic: 'Sistemas de Controle', score: 72 },
    { topic: 'Eletrônica Digital', score: 90 },
    { topic: 'Sistemas de Potência', score: 65 },
  ]
};

export const QUESTION_BANK_DATA: Question[] = [
  {
    id: 'q1',
    topic: 'Circuitos Elétricos',
    difficulty: 'Fácil',
    text: 'Em um circuito RLC série operando em ressonância, qual é a relação entre a reatância indutiva (XL) e a reatância capacitiva (XC)?',
    options: [
      'XL > XC',
      'XL < XC',
      'XL = XC',
      'XL = 0 e XC = 0'
    ],
    correctAnswerIndex: 2,
    explanation: 'Na ressonância de um circuito RLC série, as reatâncias indutiva e capacitiva se anulam, ou seja, XL = XC. Isso faz com que a impedância total seja puramente resistiva e mínima.'
  },
  {
    id: 'q2',
    topic: 'Eletrônica Digital',
    difficulty: 'Médio',
    text: 'Qual porta lógica produz uma saída ALTA (1) apenas quando ambas as entradas são BAIXAS (0)?',
    options: [
      'NAND',
      'NOR',
      'XOR',
      'AND'
    ],
    correctAnswerIndex: 1,
    explanation: 'A porta NOR (NOT OR) é o inverso da porta OR. A porta OR produz 0 apenas quando ambas as entradas são 0. Logo, a porta NOR produz 1 apenas quando ambas as entradas são 0.'
  },
  {
    id: 'q3',
    topic: 'Sistemas de Controle',
    difficulty: 'Difícil',
    text: 'Considere um sistema de controle com realimentação negativa. O que acontece com a estabilidade do sistema se os polos da malha fechada estiverem localizados no semiplano direito do plano S?',
    options: [
      'O sistema é marginalmente estável.',
      'O sistema é assintoticamente estável.',
      'O sistema é instável.',
      'A estabilidade depende dos zeros do sistema.'
    ],
    correctAnswerIndex: 2,
    explanation: 'Para um sistema linear invariante no tempo contínuo ser estável, todos os polos da função de transferência de malha fechada devem ter parte real estritamente negativa (localizados no semiplano esquerdo). Polos no semiplano direito indicam instabilidade exponencial.'
  },
  {
    id: 'q4',
    topic: 'Sistemas de Potência',
    difficulty: 'Médio',
    text: 'Qual é a principal função de um relé Buchholz em um transformador de potência?',
    options: [
      'Proteger contra sobrecorrente externa.',
      'Regular a tensão de saída.',
      'Detectar falhas internas incipientes (acúmulo de gás) e perda de óleo.',
      'Resfriar o núcleo do transformador.'
    ],
    correctAnswerIndex: 2,
    explanation: 'O relé Buchholz é um dispositivo de segurança montado em transformadores a óleo. Ele detecta o acúmulo de gás proveniente de pequenas falhas internas (decomposição do óleo) ou a perda súbita de óleo, disparando alarmes ou desconectando o transformador.'
  },
  {
    id: 'q5',
    topic: 'Eletromagnetismo',
    difficulty: 'Difícil',
    text: 'De acordo com a Lei de Faraday, a força eletromotriz (FEM) induzida em uma espira fechada é proporcional a:',
    options: [
      'Taxa de variação da corrente elétrica.',
      'Taxa de variação do fluxo magnético através da espira.',
      'Intensidade do campo magnético constante.',
      'Resistência do material da espira.'
    ],
    correctAnswerIndex: 1,
    explanation: 'A Lei de Faraday da indução afirma que a magnitude da força eletromotriz induzida em um circuito é igual à taxa de variação temporal do fluxo magnético através do circuito.'
  }
];