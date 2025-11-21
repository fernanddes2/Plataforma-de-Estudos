import { GoogleGenAI, Chat, GenerateContentResponse, Type, Schema } from "@google/genai";
import { Question } from "../types";

// Ensure API Key is available
const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o ElectroBot, um tutor especialista em Engenharia Elétrica avançada.
Seja didático, preciso e use terminologia técnica correta (ABNT/IEEE).
Responda sempre em Português (Brasil).
`;

// Helper to clean JSON strings from AI (removes markdown code blocks)
const cleanAndParseJSON = (text: string): any => {
  try {
    // Remove markdown code blocks (```json ... ``` or just ``` ... ```)
    let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Sometimes AI adds text before or after the JSON
    const firstBrace = cleanText.indexOf('[');
    const lastBrace = cleanText.lastIndexOf(']');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    throw new Error("Invalid JSON format from AI");
  }
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Desculpe, não consegui processar sua resposta.";
  } catch (error) {
    console.error("Error sending message:", error);
    return "Ocorreu um erro ao comunicar com a IA. Tente novamente.";
  }
};

export const generateQuizForTopic = async (topic: string, count: number = 5, isExamMode: boolean = false): Promise<Question[]> => {
    const difficulty = isExamMode ? "Difícil e estilo concurso/prova" : "Mista (Fácil, Médio, Difícil)";
    const prompt = `
      Gere um array JSON com ${count} questões de múltipla escolha sobre "${topic}".
      Nível de dificuldade: ${difficulty}.
      
      O formato do JSON deve ser estritamente:
      [
        {
          "id": "unique_id",
          "topic": "${topic}",
          "difficulty": "Fácil" | "Médio" | "Difícil",
          "text": "Enunciado da questão...",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctAnswerIndex": 0,
          "explanation": "Explicação detalhada do porquê a resposta está correta."
        }
      ]
      NÃO use markdown. Apenas o JSON puro.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.8
            }
        });

        const text = response.text || "[]";
        const questions = cleanAndParseJSON(text);
        
        // Add unique IDs just in case
        return questions.map((q: any, idx: number) => ({
            ...q,
            id: `gen-${Date.now()}-${idx}`
        }));

    } catch (error) {
        console.error("Error generating quiz:", error);
        // Fallback for demo purposes if API fails
        return [];
    }
};

export const explainQuestion = async (question: string, options: string[], correctOption: string): Promise<string> => {
    const prompt = `
      Explique detalhadamente a questão de Engenharia Elétrica abaixo para um estudante.
      Questão: "${question}"
      Opções: ${options.join(', ')}
      Correta: ${correctOption}

      Dê o passo a passo da resolução, citando fórmulas se necessário. Use LaTeX simples para fórmulas se precisar.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });
        return response.text || "Não foi possível gerar a explicação.";
    } catch (error) {
        return "Erro ao gerar explicação.";
    }
};

export const generateLessonContent = async (topic: string): Promise<string> => {
    const prompt = `
        Crie uma aula completa e estruturada sobre "${topic}" para um estudante de Engenharia Elétrica.
        Use formatação Markdown.
        Estrutura:
        # Título
        ## Introdução Teórica
        ## Conceitos Fundamentais (Fórmulas principais)
        ## Aplicação Prática
        ## Exemplo Resolvido
        ## Conclusão

        Seja detalhista e didático.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });
        return response.text || "Conteúdo indisponível.";
    } catch (error) {
        return "Erro ao gerar o conteúdo da aula.";
    }
};
