// Fix: Removed unused Schema from import.
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Question } from "../types";

// Ensure API Key is available
const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o ElectroBot, um tutor especialista em Engenharia Elétrica avançada.
Seja didático, preciso e use terminologia técnica correta (ABNT/IEEE).
Responda sempre em Português (Brasil).
IMPORTANTE: Ao escrever fórmulas matemáticas, use SEMPRE símbolos Unicode (ex: Ω, μF, π, ∫, ∑, ∆, θ, ∠, √) em vez de código LaTeX ou Markdown complexo, para garantir que o texto seja legível em qualquer interface simples. 
Exemplo: Em vez de \`\\frac{V}{R}\`, escreva "V / R". Em vez de \`\\omega\`, escreva "ω".
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
    // Attempt to salvage if it's a single object wrapped in array, etc.
    return [];
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
    const difficulty = isExamMode ? "Difícil, cálculos complexos e estilo concurso/prova (ENADE/Petrobras)" : "Conceitual e Prática";
    const prompt = `
      Gere um array JSON com ${count} questões de múltipla escolha sobre "${topic}".
      Nível de dificuldade: ${difficulty}.
      
      O formato do JSON deve ser estritamente:
      [
        {
          "id": "unique_id",
          "topic": "${topic}",
          "difficulty": "Fácil" | "Médio" | "Difícil",
          "text": "Enunciado da questão... (Use Unicode para símbolos: Ω, μ, etc)",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctAnswerIndex": 0,
          "explanation": "Explicação detalhada do porquê a resposta está correta."
        }
      ]
      NÃO use markdown no JSON. Apenas o JSON puro.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                // Fix: Added responseSchema to ensure structured JSON output.
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: {
                        type: Type.STRING,
                      },
                      topic: {
                        type: Type.STRING,
                      },
                      difficulty: {
                        type: Type.STRING,
                      },
                      text: {
                        type: Type.STRING,
                      },
                      options: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.STRING,
                        },
                      },
                      correctAnswerIndex: {
                        type: Type.INTEGER,
                      },
                      explanation: {
                        type: Type.STRING,
                      },
                    },
                    required: [
                      'id',
                      'topic',
                      'difficulty',
                      'text',
                      'options',
                      'correctAnswerIndex',
                      'explanation',
                    ],
                  },
                },
                temperature: 0.8,
            }
        });

        const text = response.text || "[]";
        const questions = cleanAndParseJSON(text);
        
        // Add unique IDs just in case
        if (Array.isArray(questions)) {
             return questions.map((q: any, idx: number) => ({
                ...q,
                id: `gen-${Date.now()}-${idx}`,
                options: Array.isArray(q.options) ? q.options : ["Erro na geração", "Tente novamente", "...", "..."]
            }));
        }
        return [];

    } catch (error) {
        console.error("Error generating quiz:", error);
        return [];
    }
};

export const explainQuestion = async (question: string, options: string[], correctOption: string): Promise<string> => {
    const prompt = `
      Explique detalhadamente a questão de Engenharia Elétrica abaixo para um estudante.
      Questão: "${question}"
      Opções: ${options.join(', ')}
      Correta: ${correctOption}

      Dê o passo a passo da resolução. Use símbolos Unicode (Ω, π, √, etc) para as fórmulas, NÃO use LaTeX ou blocos de código.
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
        Crie uma aula completa, rica e estruturada sobre "${topic}" para um estudante de Engenharia Elétrica.
        
        Diretrizes de Formatação:
        1. Use Markdown para títulos (#, ##, ###) e listas (-).
        2. NÃO use blocos de código para texto normal.
        3. CRÍTICO: Use símbolos UNICODE para todas as equações matemáticas e unidades. 
           - Exemplo correto: V(t) = Vmax · sin(ωt + θ)
           - Exemplo correto: R = 10 kΩ, C = 47 μF
           - NÃO use LaTeX (ex: \\omega, \\frac{}{}).
           - Se precisar de integral, use ∫. Se precisar de somatório, use ∑.
        
        Estrutura da Aula:
        # ${topic}
        ## Introdução e Definições
        ## Princípios de Funcionamento
        ## Modelagem Matemática (Fórmulas essenciais usando Unicode)
        ## Aplicações Práticas na Indústria
        ## Exemplo Numérico Resolvido (Passo a passo)
        ## Conclusão e Tendências

        Seja aprofundado, técnico, mas claro.
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


export const extractTopicsFromLesson = async (content: string): Promise<string> => {
    const prompt = `
        Analise o seguinte conteúdo de uma aula de Engenharia Elétrica.
        Extraia os 5-7 tópicos mais importantes abordados.
        Formate a saída como uma lista de bullet points, usando '- ' no início de cada linha.
        NÃO inclua um título ou qualquer texto introdutório, apenas a lista.

        CONTEÚDO DA AULA:
        ---
        ${content.substring(0, 3000)}...
        ---
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2
            }
        });
        return response.text || "Não foi possível extrair os tópicos.";
    } catch (error) {
        console.error("Error extracting topics:", error);
        return "";
    }
};