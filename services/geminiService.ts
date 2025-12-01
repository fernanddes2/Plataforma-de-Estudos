import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question, Chat as AppChat } from "../types";

// Setup Local
const LOCAL_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const localGenAI = new GoogleGenerativeAI(LOCAL_API_KEY || "");
const localModel = localGenAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- Função Híbrida (Backend Vercel ou Fallback Local) ---
const callSmartAPI = async (prompt: string, history: any[] = []) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history }),
    });

    if (!response.ok) throw new Error("Backend indisponível");
    const data = await response.json();
    return data.text;

  } catch (error) {
    console.warn("⚠️ Usando modo local direto (SDK)...");
    if (!LOCAL_API_KEY) throw new Error("Sem chave VITE_GOOGLE_API_KEY");

    let text = "";
    if (history.length > 0) {
        const chatHistory = history.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: h.parts || [{ text: h.text || "" }]
        }));
        const chat = localModel.startChat({ history: chatHistory });
        const result = await chat.sendMessage(prompt);
        text = result.response.text();
    } else {
        const result = await localModel.generateContent(prompt);
        text = result.response.text();
    }
    return text;
  }
};

// --- Funções Exportadas ---

export const createChatSession = (): AppChat => {
  const history: any[] = [];
  return {
    model: "gemini-2.0-flash",
    history: history,
    sendMessage: async (msg: string) => {
      const responseText = await callSmartAPI(msg, [...history]);
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
    finalPrompt = `[MODO SOCRÁTICO] Aluno: "${message}". Guie-o com perguntas.`;
  } else {
    finalPrompt = `[MODO RESOLVEDOR] Aluno: "${message}". Explique detalhadamente.`;
  }
  
  if (chatSession && chatSession.sendMessage) {
    return await chatSession.sendMessage(finalPrompt);
  }
  return await callSmartAPI(finalPrompt);
};

export const generateQuizForTopic = async (topic: string, count: number = 5, context: string | boolean = ""): Promise<Question[]> => {
  let ctx = typeof context === 'boolean' ? (context ? "Prova Difícil" : "Exercício") : context;
  const prompt = `Gere um JSON com ${count} questões sobre "${topic}". Contexto: ${ctx}. 
  Schema: [{"id":"1","topic":"${topic}","difficulty":"Médio","text":"...","options":["A","B","C","D"],"correctAnswerIndex":0,"explanation":"..."}]`;

  try {
    let text = await callSmartAPI(prompt);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = text.indexOf('['); const end = text.lastIndexOf(']');
    const questions = JSON.parse(text.substring(start, end + 1));
    return questions.map((q: any, i: number) => ({ ...q, id: `${Date.now()}-${i}`, options: q.options || ["A","B","C","D"] }));
  } catch (e) { console.error(e); return []; }
};

export const generateLessonContent = async (topic: string) => callSmartAPI(`Crie aula sobre: ${topic}. Markdown/LaTeX.`);

export const extractTopicsFromLesson = async (content: string) => callSmartAPI(`Resuma tópicos: ${content.substring(0,1000)}`);

// CORREÇÃO: Adicionada a assinatura correta com 3 argumentos
export const explainQuestion = async (questionText: string, options?: string[], correctOption?: string): Promise<string> => {
  let prompt = `Explique conceitualmente: "${questionText}"`;
  if (options && correctOption) {
      prompt += `\nOpções: [${options.join(', ')}]. Correta: ${correctOption}.`;
  }
  return await callSmartAPI(prompt);
};