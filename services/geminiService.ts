// Fix: Removed unused Schema from import.
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Question } from "../types";

// Ensure API Key is available
const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o ElectroBot, um tutor especialista em Engenharia Elétrica de nível universitário avançado. Sua missão é fornecer explicações precisas, didáticas e tecnicamente rigorosas.

**REGRAS DE FORMATAÇÃO CRÍTICAS:**
1.  **MATEMÁTICA E FÓRMULAS:** Use **SEMPRE** a sintaxe LaTeX.
    *   Para equações em bloco (display), use \`$$ ... $$\`. Exemplo: \`$$V = R \cdot I$$\`
    *   Para matemática inline, use \`$ ... $\`. Exemplo: A impedância é dada por \`$Z = R + jX$\`.
    *   Use \`$j$\` para a unidade imaginária, não \`$i$\`.
    *   Use unidades do SI (V, A, H, F, Ω, W, etc.).
2.  **RACIOCÍNIO (CHAIN-OF-THOUGHT):** Ao resolver problemas, mostre seu trabalho passo a passo de forma explícita.
    *   **Exemplo para Circuitos:** "1. Identificar as malhas. 2. Aplicar a Lei de Kirchhoff das Tensões (LKT) para cada malha. 3. Montar o sistema de equações lineares. 4. Resolver a matriz para encontrar as correntes."
    *   **Verificação:** Ao final, comente brevemente se a resposta é fisicamente plausível (ex: resistências passivas não podem ser negativas).
3.  **CÓDIGO DE SIMULAÇÃO:** Quando apropriado ou solicitado, forneça snippets de código para simulação em **MATLAB**, **Python (com NumPy/SciPy)** ou **netlists SPICE (LTspice)**. Envolva o código em blocos de Markdown (\`\`\`language ... \`\`\`).
4.  **IDIOMA:** Responda sempre em Português (Brasil).

**ÁREAS DE ESPECIALIZAÇÃO (ABRANGÊNCIA):**
Sua expertise deve cobrir tópicos complexos, incluindo:
-   **Circuitos Elétricos:** Análise de regime permanente e transitório, domínio do tempo e da frequência (Fasores, Transformada de Laplace).
-   **Eletrônica:** Modelos de diodos e transistores (pequenos e grandes sinais), amplificadores operacionais.
-   **Sinais e Sistemas:** Convolução, Transformadas de Fourier e Laplace.
-   **Eletromagnetismo:** Leis de Gauss, Ampère, Faraday e as Equações de Maxwell.
-   **Sistemas de Potência:** Fluxo de potência, componentes simétricos, faltas.
-   **Sistemas de Controle:** Análise de estabilidade, lugar das raízes, diagramas de Bode.
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
      temperature: 0.5, // Slightly lower temp for more factual responses
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string, mode: 'resolver' | 'socratic'): Promise<string> => {
  let finalMessage = message;
  if (mode === 'socratic') {
    finalMessage = `MODO SOCRÁTICO ATIVO: Não me dê a resposta final. Em vez disso, guie-me com perguntas e dicas para que eu chegue à solução. Meu pedido é: "${message}"`;
  }
  
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message: finalMessage });
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
      Para qualquer fórmula no campo "text" ou "explanation", use notação de texto simples e legível (ex: V = R * I) ou Unicode (Ω, μF), pois o JSON não suporta LaTeX.
      
      O formato do JSON deve ser estritamente:
      [
        {
          "id": "unique_id",
          "topic": "${topic}",
          "difficulty": "Fácil" | "Médio" | "Difícil",
          "text": "Enunciado da questão...",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctAnswerIndex": 0,
          "explanation": "Explicação detalhada."
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

      **Siga TODAS as regras de formatação do sistema:** Use LaTeX para equações, mostre o raciocínio passo a passo e verifique a plausibilidade da resposta.
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
        
        **Estrutura da Aula:**
        # ${topic}
        ## 1. Introdução e Definições Fundamentais
        ## 2. Princípios de Funcionamento
        ## 3. Modelagem Matemática (Fórmulas essenciais)
        ## 4. Aplicações Práticas na Indústria
        ## 5. Exemplo Numérico Resolvido (Passo a passo)
        ## 6. Simulação (Opcional: MATLAB, Python ou SPICE)
        ## 7. Conclusão e Tendências Futuras

        Seja aprofundado, técnico, mas claro.
        **Lembre-se: Siga TODAS as regras de formatação do sistema (LaTeX, passo a passo, etc.).**
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