import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question, Chat as AppChat } from "../types";

// --- 1. CONFIGURAÇÃO ---
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("🚨 ERRO: VITE_GOOGLE_API_KEY não encontrada no .env.local");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// ATUALIZADO: Usando o modelo mais recente de 2025
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    // Configurações de segurança para evitar bloqueios desnecessários em conteúdo acadêmico
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000,
    } 
});

// --- HELPERS ---
const cleanJSON = (text: string) => {
  // Remove blocos de código markdown se a IA colocar
  let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const firstOpen = clean.indexOf('[');
  const lastClose = clean.lastIndexOf(']');
  if (firstOpen !== -1 && lastClose !== -1) {
    clean = clean.substring(firstOpen, lastClose + 1);
  }
  return clean;
};

// --- FUNÇÕES DO APP ---

export const createChatSession = (): AppChat => {
  const chat = model.startChat({
    history: [],
  });

  return {
    model: "gemini-2.0-flash",
    history: [],
    sendMessage: async (msg: string) => {
      try {
        const result = await chat.sendMessage(msg);
        return result.response.text();
      } catch (error) {
        console.error("Erro Chat:", error);
        return "Erro de conexão com o Gemini 2.0. Verifique sua chave.";
      }
    },
    _rawSession: chat
  };
};

export const sendMessageToGemini = async (chatSession: AppChat, message: string, mode: 'resolver' | 'socratic'): Promise<string> => {
  let finalPrompt = message;

  // Engenharia de Prompt aprimorada para o modelo 2.0
  if (mode === 'socratic') {
    finalPrompt = `
      [CONTEXTO: Tutor Universitário de Engenharia Elétrica]
      O aluno perguntou: "${message}"
      
      DIRETRIZES:
      1. NÃO dê a resposta final imediatamente.
      2. Faça perguntas socráticas para guiar o raciocínio.
      3. Se envolver cálculos, peça para o aluno montar a primeira equação.
      4. Seja breve e encorajador.
    `;
  } else {
    finalPrompt = `
      [CONTEXTO: Especialista Sênior em Engenharia Elétrica]
      O aluno perguntou: "${message}"
      
      DIRETRIZES:
      1. Resolva passo a passo com rigor matemático.
      2. Use notação LaTeX para todas as fórmulas (ex: $V = R \\cdot I$).
      3. Explique o conceito físico por trás da matemática.
      4. Se possível, dê um exemplo prático de aplicação industrial.
    `;
  }

  if (chatSession && chatSession._rawSession) {
    try {
        const result = await chatSession._rawSession.sendMessage(finalPrompt);
        return result.response.text();
    } catch (e) {
        console.error(e);
        return "Erro ao processar mensagem.";
    }
  }
  
  const result = await model.generateContent(finalPrompt);
  return result.response.text();
};

export const generateQuizForTopic = async (topic: string, count: number = 5, context: string | boolean = ""): Promise<Question[]> => {
  const difficultyContext = context ? "Nível Difícil (Estilo ITA/IME/Federais)" : "Nível Médio (Conceitual/Aplicação)";
  
  const prompt = `
    Gere um Array JSON estrito com ${count} questões de Engenharia Elétrica sobre: "${topic}".
    Contexto: ${difficultyContext}.
    
    FORMATO JSON OBRIGATÓRIO:
    [
      {
        "id": "q1",
        "topic": "${topic}",
        "difficulty": "Médio",
        "text": "Enunciado da questão aqui (Use LaTeX para fórmulas)...",
        "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
        "correctAnswerIndex": 0,
        "explanation": "Explicação detalhada."
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = cleanJSON(result.response.text());
    const questions = JSON.parse(text);

    return questions.map((q: any, i: number) => ({
      ...q,
      id: `${Date.now()}-${i}`,
      options: q.options || ["A", "B", "C", "D"],
      // Garante campos opcionais
      difficulty: q.difficulty || "Médio",
      text: q.text || "Erro no enunciado",
      explanation: q.explanation || "Sem explicação."
    }));
  } catch (error) {
    console.error("Erro Quiz:", error);
    return [];
  }
};

export const generateLessonContent = async (topic: string): Promise<string> => {
  const prompt = `
    Crie uma aula completa sobre "${topic}" para graduandos de Engenharia Elétrica.
    Use formatação Markdown rica.
    
    Estrutura:
    1. Definição Conceitual
    2. Modelagem Matemática (Use LaTeX $)
    3. Exemplo Numérico Resolvido
    4. Aplicação Prática
  `;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) { return "# Erro ao gerar aula."; }
};

export const extractTopicsFromLesson = async (content: string): Promise<string> => {
  try {
      const result = await model.generateContent(`Extraia os 5 conceitos-chave deste texto em bullet points: ${content.substring(0, 1500)}`);
      return result.response.text();
  } catch (e) { return ""; }
};

export const explainQuestion = async (questionText: string, options?: string[], correctOption?: string): Promise<string> => {
   const prompt = `Explique a questão: "${questionText}". \nOpções: [${options?.join(', ')}]. \nCorreta: ${correctOption}. \nJustifique física e matematicamente.`;
   const result = await model.generateContent(prompt);
   return result.response.text();
};
