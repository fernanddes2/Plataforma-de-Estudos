import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question, Chat as AppChat } from "../types";

// --- CONFIGURAÇÃO ---
// Tenta pegar a chave VITE para uso local
const LOCAL_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Instância local do Google (Fallback para quando o /api/gemini não existir)
const localGenAI = new GoogleGenerativeAI(LOCAL_API_KEY || "");
const localModel = localGenAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- 1. FUNÇÃO HÍBRIDA (MÁGICA) ---
const callSmartAPI = async (prompt: string, history: any[] = []) => {
  try {
    // 1. TENTA CHAMAR O BACKEND (Funcionará na Vercel)
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history }),
    });

    // Se o backend responder 404 (não existe) ou erro de rede, vamos para o plano B
    if (response.status === 404 || !response.ok) {
        throw new Error("Backend não disponível");
    }

    const data = await response.json();
    return data.text;

  } catch (error) {
    // 2. PLANO B: LOCALHOST (Uso direto do SDK)
    // Isso acontece quando você roda 'npm run dev'
    console.warn("⚠️ Backend indisponível, usando modo local direto:", error);
    
    if (!LOCAL_API_KEY) {
        throw new Error("Chave VITE_GOOGLE_API_KEY não encontrada no .env.local");
    }

    try {
        let text = "";
        if (history.length > 0) {
            const chat = localModel.startChat({ 
                history: history.map(h => ({
                    role: h.role,
                    parts: h.parts || [{ text: h.text }] // Garante formato compatível
                }))
            });
            const result = await chat.sendMessage(prompt);
            text = result.response.text();
        } else {
            const result = await localModel.generateContent(prompt);
            text = result.response.text();
        }
        return text;
    } catch (sdkError: any) {
        console.error("Erro fatal no SDK Local:", sdkError);
        throw new Error("Falha ao gerar conteúdo (Modo Local). Verifique sua chave.");
    }
  }
};

// --- 2. ADAPTADORES ---

export const createChatSession = (): AppChat => {
  const history: any[] = [];
  
  return {
    model: "gemini-hybrid",
    history: history,
    sendMessage: async (msg: string) => {
      // Salva histórico para enviar para a API
      const responseText = await callSmartAPI(msg, [...history]);
      
      // Atualiza histórico local para a UI
      history.push({ role: "user", parts: [{ text: msg }] });
      history.push({ role: "model", parts: [{ text: responseText }] });
      
      return responseText;
    },
    _rawSession: null
  };
};

export const sendMessageToGemini = async (chatSession: AppChat, message: string, mode: 'resolver' | 'socratic'): Promise<string> => {
  let finalPrompt = message;
  if (mode === 'socratic') {
    finalPrompt = `[MODO SOCRÁTICO] O aluno disse: "${message}". Guie-o com perguntas, não dê a resposta.`;
  } else {
    finalPrompt = `[MODO RESOLVEDOR] O aluno disse: "${message}". Explique detalhadamente.`;
  }

  // Se já tivermos uma sessão de chat ativa, usamos o método dela
  if (chatSession && chatSession.sendMessage) {
    return await chatSession.sendMessage(finalPrompt);
  }
  
  return await callSmartAPI(finalPrompt);
};

// --- 3. GERADORES DE CONTEÚDO ---

const cleanJSON = (text: string) => {
  let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const firstOpen = clean.indexOf('[');
  const lastClose = clean.lastIndexOf(']');
  if (firstOpen !== -1 && lastClose !== -1) {
    clean = clean.substring(firstOpen, lastClose + 1);
  }
  return clean;
};

export const generateQuizForTopic = async (topic: string, count: number = 5, context: string | boolean = ""): Promise<Question[]> => {
  let contextString = "";
  if (typeof context === 'boolean') {
      contextString = context ? "Estilo de prova oficial." : "Estilo exercício de fixação.";
  } else {
      contextString = context || "";
  }

  const prompt = `
    Gere um Array JSON com ${count} questões sobre "${topic}".
    Contexto: ${contextString}.
    IMPORTANTE: Retorne APENAS o JSON puro.
    Formato:
    [{"id":"1", "topic":"${topic}", "difficulty":"Médio", "text":"pergunta", "options":["A","B","C","D"], "correctAnswerIndex":0, "explanation":"..."}]
  `;

  try {
    const text = await callSmartAPI(prompt);
    const jsonString = cleanJSON(text);
    const questions = JSON.parse(jsonString);

    return questions.map((q: any, index: number) => ({
      ...q,
      id: `${Date.now()}-${index}`,
      options: q.options || ["A", "B", "C", "D"]
    }));
  } catch (error) {
    console.error("Erro Quiz:", error);
    return [];
  }
};

export const generateLessonContent = async (topic: string): Promise<string> => {
  return await callSmartAPI(`Crie uma aula de engenharia sobre: ${topic}. Use Markdown e LaTeX.`);
};

export const extractTopicsFromLesson = async (content: string): Promise<string> => {
    const prompt = `Extraia os 5 principais tópicos chave do texto abaixo em lista (markdown): \n\n ${content.substring(0, 1500)}`;
    return await callSmartAPI(prompt);
};

export const explainQuestion = async (questionText: string, options?: string[], correctOption?: string): Promise<string> => {
  let prompt = `Explique conceitualmente: "${questionText}"`;
  if (options && correctOption) {
      prompt += `\nOpções: [${options.join(', ')}]. Correta: ${correctOption}.`;
  }
  return await callSmartAPI(prompt);
};
