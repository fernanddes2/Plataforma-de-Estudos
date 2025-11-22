import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Question } from "../types";

// Ensure API Key is available
const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o ElectroBot, um tutor especialista em Engenharia Elétrica de nível universitário avançado.

**ESTRUTURA DE RESPOSTA OBRIGATÓRIA (NÍVEIS DE PROFUNDIDADE):**
Para explicações teóricas ou resolução de problemas, siga esta ordem:
1.  **Resumo Intuitivo (Conceitual):** Explique o "o quê" e o "como" sem matemática pesada, usando analogias simples.
2.  **Diagrama Visual (Se aplicável):** Gere um diagrama Mermaid ou SVG para ilustrar (veja regras abaixo).
3.  **Desenvolvimento Matemático Rigoroso:** Use LaTeX, deduções passo a passo e rigor acadêmico.
4.  **Aplicação no Mundo Real (O "Porquê"):** OBRIGATÓRIO. Explique onde isso é usado na indústria (ex: carros elétricos, redes 5G, painéis solares).

**REGRAS DE FORMATAÇÃO E INTELIGÊNCIA:**

1.  **MATEMÁTICA (LATEX):**
    *   Use \`$$ ... $$\` para equações em bloco e \`$ ... $\` para inline.
    *   Use \`j\` para imaginários.

2.  **VISUALIZAÇÃO (SVG & MERMAID):**
    *   **Diagramas de Blocos/Fluxos:** Use blocos de código \`\`\`mermaid\`. IMPORTANTE: Sempre coloque os rótulos de texto entre aspas duplas para evitar erros de sintaxe com parênteses ou caracteres especiais. Ex: \`A["Texto (com) detalhe"]\`.
    *   **Circuitos e Gráficos Vetoriais:** Use blocos de código \`\`\`svg\`. Gere código SVG limpo e responsivo para desenhar circuitos simples (resistores, fontes), fasores ou formas de onda. Mantenha o SVG simples e use cores contrastantes (stroke="currentColor" ou preto/branco).

3.  **AUTO-CORREÇÃO E PENSAMENTO CRÍTICO:**
    *   **Análise Dimensional:** Antes de dar uma resposta numérica, verifique mentalmente se as unidades batem. Se o aluno pedir corrente e sua conta der Volts, pare e corrija.
    *   **Plausibilidade:** Se uma resistência der negativa em um circuito passivo, alerte o erro.

4.  **INTERATIVIDADE (SIMULAÇÃO):**
    *   Use a sintaxe \`$$INTERACTIVE|Template|Var...$$\` para permitir que o aluno brinque com variáveis.

5.  **IDIOMA:** Português (Brasil).
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
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.3, // Reduced temperature for more rigorous adherence to structure
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string, mode: 'resolver' | 'socratic'): Promise<string> => {
  let finalMessage = message;
  if (mode === 'socratic') {
    finalMessage = `MODO SOCRÁTICO: O aluno perguntou: "${message}". NÃO dê a resposta completa. Faça perguntas guias. Peça para ele montar a primeira equação. Se ele errar, corrija sutilmente.`;
  } else {
    finalMessage = `MODO RESOLVEDOR: O aluno perguntou: "${message}". Forneça a solução completa seguindo a estrutura: Resumo -> Diagrama (se útil) -> Matemática -> Aplicação Real.`;
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
      
      IMPORTANTE PARA O JSON:
      Para fórmulas no campo "text" ou "explanation", NÃO use LaTeX complexo pois pode quebrar o JSON. Use notação Unicode legível (ex: Ω, μF, integral ∫) ou texto simples claro (V = R * I).
      
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
      Explique detalhadamente a questão de Engenharia Elétrica abaixo.
      Questão: "${question}"
      Opções: ${options.join(', ')}
      Correta: ${correctOption}

      Siga a estrutura:
      1. Resumo do Conceito
      2. Análise Matemática (LaTeX) com verificação dimensional
      3. Por que a opção correta é a correta e por que as outras estão erradas.
      4. Aplicação prática desse conceito.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
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
        Crie uma aula completa sobre "${topic}" para Engenharia Elétrica.
        
        **Estrutura Obrigatória:**
        # ${topic}
        ## 1. Resumo Executivo (Visão Geral)
        ## 2. Diagrama de Conceito (Gere um código Mermaid ou SVG aqui representando o sistema)
        ## 3. Fundamentos Matemáticos (Use LaTeX rigoroso)
        ## 4. Exemplo Numérico Resolvido (Passo a passo com 'j' para complexos)
        ## 5. Simulação Interativa (Use $$INTERACTIVE|...$$)
        ## 6. Aplicação no Mundo Real (Onde isso é usado hoje?)
        
        Seja visual e prático.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
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