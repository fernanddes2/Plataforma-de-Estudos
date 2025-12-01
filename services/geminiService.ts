import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Question } from "../types";

// Ensure API Key is available
const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Bibliografia baseada no conteúdo típico de drives de Engenharia (UFF/Federais)
const ENGINEERING_BIBLIOGRAPHY = `
*   **Circuitos:** "Fundamentos de Circuitos Elétricos" (Sadiku), "Circuitos Elétricos" (Nilsson & Riedel).
*   **Eletromagnetismo:** "Eletromagnetismo" (Hayt), "Elementos de Eletromagnetismo" (Sadiku), "Eletrodinâmica" (Griffiths).
*   **Matemática (Base e Aplicada):** "Cálculo" (James Stewart), "Um Curso de Cálculo" (Guidorizzi), "Equações Diferenciais Elementares" (Boyce & DiPrima), "Álgebra Linear" (Boldrini), "Variáveis Complexas" (Churchill).
*   **Física:** "Fundamentos de Física" (Halliday & Resnick), "Física" (Sears & Zemansky), "Física" (Moysés Nussenzveig - para USP/Federais).
*   **Controle:** "Engenharia de Controle Moderno" (Ogata), "Engenharia de Sistemas de Controle" (Norman Nise).
*   **Eletrônica Analógica:** "Dispositivos Eletrônicos" (Boylestad), "Microeletrônica" (Sedra/Smith).
*   **Eletrônica Digital:** "Sistemas Digitais" (Tocci), "Elementos de Eletrônica Digital" (Idoeta & Capuano).
*   **Sinais e Sistemas:** "Sinais e Sistemas" (Oppenheim), "Sinais e Sistemas Lineares" (Lathi).
*   **Máquinas Elétricas:** "Fundamentos de Máquinas Elétricas" (Chapman), "Máquinas Elétricas" (Fitzgerald).
`;

const SYSTEM_INSTRUCTION = `
Você é o ElectroBot, um tutor especialista em Engenharia Elétrica de nível universitário avançado.

**FONTE DE VERDADE (BIBLIOGRAFIA):**
Baseie suas explicações, notações e rigor matemático nas seguintes referências padrão:
${ENGINEERING_BIBLIOGRAPHY}
Se houver divergência de notação, prefira a notação do Sadiku (para circuitos) e Hayt (para eletromagnetismo).

**ESTRUTURA DE RESPOSTA OBRIGATÓRIA (NÍVEIS DE PROFUNDIDADE):**
Para explicações teóricas ou resolução de problemas, siga esta ordem:
1.  **Resumo Intuitivo (Conceitual):** Explique o "o quê" e o "como" sem matemática pesada, usando analogias simples.
2.  **Diagrama Visual (Se aplicável):** Gere um diagrama Mermaid ou SVG para ilustrar (veja regras abaixo).
3.  **Desenvolvimento Matemático Rigoroso:** Use LaTeX para toda e qualquer expressão matemática.
4.  **Aplicação no Mundo Real (O "Porquê"):** OBRIGATÓRIO. Explique onde isso é usado na indústria (ex: carros elétricos, redes 5G, painéis solares).

**REGRAS DE FORMATAÇÃO E INTELIGÊNCIA:**

1.  **MATEMÁTICA (LATEX):**
    *   **IMPORTANTE:** Para equações na mesma linha (inline), use EXCLUSIVAMENTE \`$ equacao $\`. Não use \`\\( ... \\)\`.
    *   **IMPORTANTE:** Para equações destacadas (bloco), use EXCLUSIVAMENTE \`$$ equacao $$\`. Não use \`\\[ ... \\]\`.
    *   **PROIBIDO:** NUNCA escreva equações formatadas verticalmente (uma letra por linha) usando texto puro. Se precisar de uma fórmula, USE LaTeX.
    *   Exemplo Correto: "A corrente é dada por $$ i(t) = I_m \\cos(\\omega t + \\phi) $$."
    *   Use \`j\` para imaginários (Notação de Engenharia).
    *   Para moeda, escreva "R$" ou "reais", nunca use o símbolo de cifrão solto para evitar conflito com LaTeX.

2.  **VISUALIZAÇÃO (SVG & MERMAID):**
    *   **Diagramas de Blocos/Fluxos:** Use blocos de código \`\`\`mermaid\`. IMPORTANTE: Sempre coloque os rótulos de texto entre aspas duplas. Ex: \`A["Texto"]\`.
    *   **Circuitos e Gráficos Vetoriais:** Use blocos de código \`\`\`svg\`. Gere código SVG limpo e responsivo.

3.  **AUTO-CORREÇÃO E PENSAMENTO CRÍTICO:**
    *   **Análise Dimensional:** Antes de dar uma resposta numérica, verifique mentalmente se as unidades batem.
    *   **Plausibilidade:** Se uma resistência der negativa em um circuito passivo, alerte o erro.

4.  **INTERATIVIDADE (SIMULAÇÃO):**
    *   Use a sintaxe \`$$INTERACTIVE|Template|Var...$$\` para permitir que o aluno brinque com variáveis.

5.  **IDIOMA:** Português (Brasil).
6.  **TEXTO E ESPAÇAMENTO:**
    *   Mantenha os parágrafos densos e informativos. Evite criar uma nova linha para cada pequena sentença.
    *   Não crie listas verticais para definições simples de variáveis; use texto corrido ou uma lista compacta.
`;

// Helper to clean JSON strings from AI (removes markdown code blocks)
const cleanAndParseJSON = (text: string): any => {
  try {
    // Remove markdown code blocks (```json ... ``` or just ``` ... ```)
    let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Sometimes AI adds text before or after the JSON
    const firstBrace = cleanText.indexOf('[');
    const firstCurly = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf(']');
    const lastCurly = cleanText.lastIndexOf('}');
    
    // Determine if it's an array or object and slice accordingly
    if (firstBrace !== -1 && lastBrace !== -1 && (firstCurly === -1 || firstBrace < firstCurly)) {
         cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    } else if (firstCurly !== -1 && lastCurly !== -1) {
         cleanText = cleanText.substring(firstCurly, lastCurly + 1);
    }

    const parsed = JSON.parse(cleanText);

    // If it's an object wrapping an array (common AI quirk), extract the array
    if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
        // Look for any property that is an array
        const values = Object.values(parsed);
        const arrayValue = values.find(v => Array.isArray(v));
        if (arrayValue) return arrayValue;
    }

    return parsed;
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

export const generateQuizForTopic = async (topic: string, count: number = 5, context: string | boolean = false): Promise<Question[]> => {
    // Definindo o "Contexto" (Universidade) e Nível de Dificuldade
    let difficultyProfile = "Nível Universitário Padrão";
    let styleInstruction = "Equilibre teoria e prática. Crie questões originais baseadas nos livros padrão.";
    let contextStr = typeof context === 'string' ? context : '';
    let realQuestionsPrompt = "";

    // Lógica de "Personalidade" da Prova baseada na Universidade
    if (contextStr) {
        realQuestionsPrompt = "IMPORTANTE: Tente recuperar ou adaptar questões REAIS que já caíram em provas passadas desta instituição. Se não encontrar exatas, crie questões idênticas em estilo e dificuldade.";
        
        if (contextStr.includes('ITA') || contextStr.includes('IME')) {
            difficultyProfile = "NÍVEL MILITAR (INSANO/EXTREMO)";
            styleInstruction = "Questões devem exigir raciocínio matemático avançado, demonstrações e manipulação algébrica complexa. Evite números simples. Use 'pegadinhas' conceituais de alto nível. Similar a olimpíadas de física/matemática.";
        } else if (contextStr.includes('USP') || contextStr.includes('UNICAMP') || contextStr.includes('UFRJ') || contextStr.includes('UFMG')) {
            difficultyProfile = "NÍVEL PÚBLICA DE EXCELÊNCIA (DIFÍCIL)";
            styleInstruction = "Foque em rigor teórico profundo, deduções e problemas que exigem entendimento sólido do conceito físico. Referência: Moysés/Halliday nível hard.";
        } else if (contextStr.includes('PUC') || contextStr.includes('Mackenzie') || contextStr.includes('FEI')) {
            difficultyProfile = "NÍVEL PRIVADA DE REFERÊNCIA (MÉDIO/ALTO)";
            styleInstruction = "Boas questões teóricas e práticas. Foco em engenharia aplicada, mas com boa base matemática.";
        } else if (contextStr.includes('Estácio') || contextStr.includes('Anhanguera') || contextStr.includes('UNIP')) {
            difficultyProfile = "NÍVEL PRIVADA PADRÃO (MÉDIO)";
            styleInstruction = "Questões objetivas, aplicação direta de fórmulas, estilo ENADE. Foco em verificar aprendizado básico e prático.";
        } else if (contextStr.includes('UFF') || contextStr.includes('Federal')) {
            difficultyProfile = "NÍVEL FEDERAL PADRÃO (DIFÍCIL)";
            styleInstruction = "Analítico e rigoroso.";
        }
    }
    
    const prompt = `
      Gere um simulado JSON com EXATAMENTE ${count} questões sobre "${topic}".
      
      CONTEXTO DA PROVA: ${difficultyProfile}
      ESTILO DAS QUESTÕES: ${styleInstruction}
      ${realQuestionsPrompt}
      
      REGRAS CRÍTICAS DE FORMATO (JSON + LaTeX):
      1. Responda APENAS com o JSON.
      2. Use LaTeX para TODAS as fórmulas matemáticas nos campos "text" e "explanation".
      3. Use EXCLUSIVAMENTE \`$\` para equações inline (ex: \`$x^2$\`) e \`$$\` para blocos. NÃO use \`\\( ... \\)\`.
      4. ESCAPE AS BARRAS INVERTIDAS NO JSON: Use \\\\ (ex: \\\\frac{a}{b}, \\\\Omega).
      
      Schema:
      [
        {
          "id": "...",
          "topic": "${topic}",
          "difficulty": "Fácil" | "Médio" | "Difícil",
          "text": "Enunciado com LaTeX ($...$)...",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctAnswerIndex": 0,
          "explanation": "Explicação detalhada com LaTeX."
        }
      ]
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7, 
            }
        });

        const text = response.text || "[]";
        const questions = cleanAndParseJSON(text);
        
        if (Array.isArray(questions)) {
             return questions.map((q: any, idx: number) => ({
                ...q,
                id: `exam-${Date.now()}-${idx}`,
                options: Array.isArray(q.options) ? q.options : ["Erro", "Erro", "Erro", "Erro"]
            }));
        }
        return [];

    } catch (error) {
        console.error("Error generating exam:", error);
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
      2. Análise Matemática (LaTeX com \`$...\`) com verificação dimensional.
      3. Por que a opção correta é a correta e por que as outras estão erradas.
      4. Aplicação prática desse conceito.
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
    // Lógica para diferenciar Ciclo Básico (Teórico/Fundamentos) vs Profissionalizante (Prático/Indústria)
    const basicCycleKeywords = [
        'Cálculo', 'Física', 'Álgebra', 'Geometria', 'Química', 'Mecânica Geral', 
        'Probabilidade', 'Estatística', 'Fenômenos', 'Resistência'
    ];
    const isBasicCycle = basicCycleKeywords.some(keyword => topic.includes(keyword));

    let structurePrompt = "";
    
    if (isBasicCycle) {
        structurePrompt = `
        **ESTRUTURA FOCADA EM CICLO BÁSICO/TEÓRICO (ALTO RIGOR):**
        # ${topic}
        ## 1. Definição Formal
        Apresente as definições matemáticas precisas (Ex: Epsilon-Delta para limites, Leis de Newton vetoriais). Cite teoremas relevantes (ex: Teorema do Valor Médio, Teorema de Gauss).
        
        ## 2. Demonstração / Dedução Importante
        Escolha um resultado chave deste tópico e mostre a dedução passo a passo usando LaTeX rigoroso (use $$...$$ para blocos).
        
        ## 3. Exemplo Clássico de Prova
        Resolva um problema típico de livro-texto (estilo Guidorizzi, Halliday ou Moysés). Foco na modelagem do problema.
        
        ## 4. Visualização (Gráfico ou Diagrama)
        Gere um código Mermaid ou SVG simples que ajude a visualizar o conceito abstrato.
        
        ## 5. Conexão com a Engenharia
        Brevemente, explique onde este conceito matemático/físico será fundamental nas matérias futuras (ex: "Integrais são usadas para calcular potência média em Circuitos II").
        `;
    } else {
        structurePrompt = `
        **ESTRUTURA FOCADA EM ENGENHARIA APLICADA:**
        # ${topic}
        ## 1. Resumo Executivo (Visão Geral)
        ## 2. Diagrama de Conceito (Gere um código Mermaid ou SVG aqui representando o sistema)
        ## 3. Fundamentos Matemáticos (Use LaTeX rigoroso com $$...$$)
        ## 4. Exemplo Numérico Resolvido (Passo a passo com 'j' para complexos)
        ## 5. Simulação Interativa (Use $$INTERACTIVE|...$$ se possível)
        ## 6. Aplicação no Mundo Real (Onde isso é usado hoje na indústria?)
        `;
    }

    const prompt = `
        Crie uma aula completa e detalhada sobre "${topic}" para um estudante de Engenharia.
        ${structurePrompt}
        
        Seja didático, mas mantenha o nível universitário. Use formatação rica (Markdown, Bold).
        Use LaTeX (\`$...\` ou \`$$...$$\`) para TODA e QUALQUER matemática.
        NÃO use quebras de linha excessivas. Mantenha os parágrafos coesos e compactos.
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
        return "Erro ao gerar o conteúdo da aula. Tente novamente mais tarde.";
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