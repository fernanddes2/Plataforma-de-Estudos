import { GoogleGenerativeAI } from "@google/generative-ai";
// Ajuste para garantir compatibilidade com as interfaces que você usa
import { Question, Chat as AppChat } from "../types"; 

// --- 1. CONFIGURAÇÃO DA CHAVE ---
// Tenta pegar do env, se não, usa a hardcoded (cuidado em produção)
export const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!API_KEY || API_KEY.length < 10) {
    console.error("⚠️ ERRO CRÍTICO: API Key parece inválida ou vazia.");
}

// Inicializa o cliente antigo (generative-ai) que é mais estável para web apps simples
const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-2.0-flash"; // Usando modelo mais recente se disponível, ou fallback

// --- 2. CONTEXTO E INSTRUÇÕES ---
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
Você é o ElectroBot, um tutor especialista em Engenharia Elétrica de nível universitário.

**FONTE DE VERDADE:**
Baseie-se em: ${ENGINEERING_BIBLIOGRAPHY}
Em divergência, prefira a notação do Sadiku (Circuitos) e Hayt (Eletromagnetismo).

**REGRAS CRÍTICAS DE FORMATO (PARA EVITAR ERROS DE RENDERIZAÇÃO):**
1. **MATEMÁTICA (LATEX):**
   - Inline: Use EXCLUSIVAMENTE \`$ equacao $\`. JAMAIS use \`\\( ... \\)\`.
   - Bloco: Use EXCLUSIVAMENTE \`$$ equacao $$\`. JAMAIS use \`\\[ ... \\]\`.
   - Não escreva equações verticais com texto puro. Use LaTeX.
   - Use \`j\` para imaginários.

2. **VISUALIZAÇÃO:**
   - Use blocos \`\`\`mermaid\` para fluxogramas. Use aspas nos textos: A["Texto"].
   - Use blocos \`\`\`svg\` para circuitos/gráficos vetoriais.

3. **ESTRUTURA:**
   - Seja direto. Resumo -> Matemática -> Aplicação.
   - Use a sintaxe \`$$INTERACTIVE|Template|Var...$$\` para simulações se solicitado.
`;

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: SYSTEM_INSTRUCTION,
});

// --- 3. HELPER JSON ROBUSTO ---
const cleanAndParseJSON = (text: string): any => {
  try {
    // Remove markdown code blocks
    let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Tenta encontrar os limites do JSON (Array ou Objeto)
    const firstBrace = cleanText.indexOf('[');
    const firstCurly = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf(']');
    const lastCurly = cleanText.lastIndexOf('}');
    
    // Prioriza Array se ambos existirem (comum para listas de questões)
    if (firstBrace !== -1 && lastBrace !== -1 && (firstCurly === -1 || firstBrace < firstCurly)) {
         cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    } else if (firstCurly !== -1 && lastCurly !== -1) {
         cleanText = cleanText.substring(firstCurly, lastCurly + 1);
    }

    const parsed = JSON.parse(cleanText);

    // Se o AI embrulhou o array num objeto { "questions": [...] }, tenta extrair
    if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
        const values = Object.values(parsed);
        const arrayValue = values.find(v => Array.isArray(v));
        if (arrayValue) return arrayValue;
    }

    return parsed;
  } catch (e) {
    console.error("JSON Parse Error:", e, "Texto original:", text);
    return [];
  }
};

// --- 4. FUNÇÕES EXPORTADAS ---

// Adaptador para manter compatibilidade com seu AppChat interface
export const createChatSession = (): AppChat => {
  // Inicia sessão real do SDK
  const chatSession = model.startChat({
    history: [],
    generationConfig: { temperature: 0.3 },
  });

  // Retorna objeto compatível com sua interface
  return {
    model: MODEL_NAME,
    history: [], 
    sendMessage: async (msg: string) => {
        const result = await chatSession.sendMessage(msg);
        return result.response.text();
    },
    // Expondo o objeto original caso precise acessar diretamente
    _rawSession: chatSession 
  } as unknown as AppChat;
};

export const sendMessageToGemini = async (chatSession: AppChat, message: string, mode: 'resolver' | 'socratic'): Promise<string> => {
  let finalMessage = message;
  
  if (mode === 'socratic') {
    finalMessage = `[MODO SOCRÁTICO] O aluno perguntou: "${message}". NÃO dê a resposta completa. Faça perguntas guias para ele chegar à conclusão. Peça para ele montar a primeira equação.`;
  } else {
    finalMessage = `[MODO RESOLVEDOR] O aluno perguntou: "${message}". Forneça a solução completa: Resumo Conceitual -> Diagrama (se útil) -> Matemática Rigorosa (LaTeX) -> Aplicação Real.`;
  }
  
  try {
    // Verifica se é o objeto adaptado ou direto
    if ((chatSession as any).sendMessage) {
        return await (chatSession as any).sendMessage(finalMessage);
    } else {
        // Fallback
        const result = await model.generateContent(finalMessage);
        return result.response.text();
    }
  } catch (error: any) {
    console.error("Erro no envio:", error);
    return `Erro ao processar resposta: ${error.message || "Tente novamente."}`;
  }
};

export const generateQuizForTopic = async (topic: string, count: number = 5, context: string | boolean = false): Promise<Question[]> => {
    
    // Perfilamento da Dificuldade (University Persona)
    let difficultyProfile = "Nível Universitário Padrão";
    let styleInstruction = "Equilibre teoria e prática. Questões originais.";
    let contextStr = typeof context === 'string' ? context : '';
    let realQuestionsPrompt = "";

    if (contextStr) {
        realQuestionsPrompt = "IMPORTANTE: Adapte ao estilo de provas passadas desta instituição.";
        
        if (contextStr.includes('ITA') || contextStr.includes('IME')) {
            difficultyProfile = "NÍVEL MILITAR (EXTREMO). Foco: Demonstrações, álgebra complexa, 'pegadinhas' conceituais.";
        } else if (contextStr.match(/(USP|UNICAMP|UFRJ|UFMG|UnB)/i)) {
            difficultyProfile = "NÍVEL PÚBLICA DE EXCELÊNCIA (DIFÍCIL). Foco: Rigor teórico, deduções (estilo Moysés/Halliday hard).";
        } else if (contextStr.match(/(PUC|Mackenzie|FEI)/i)) {
            difficultyProfile = "NÍVEL PRIVADA DE REFERÊNCIA (MÉDIO/ALTO). Foco: Engenharia aplicada sólida.";
        } else if (contextStr.match(/(Estácio|Anhanguera|UNIP)/i)) {
            difficultyProfile = "NÍVEL PRIVADA PADRÃO (MÉDIO). Foco: Aplicação direta de fórmulas, estilo ENADE.";
        }
    }

    const prompt = `
        Gere um JSON com EXATAMENTE ${count} questões sobre "${topic}".
        CONTEXTO: ${difficultyProfile}
        ESTILO: ${styleInstruction} ${realQuestionsPrompt}
        
        REGRAS JSON + LATEX:
        1. Responda APENAS o JSON.
        2. LaTeX OBRIGATÓRIO para matemática. Use \`$\` (inline) e \`$$\` (bloco).
        3. Escape as barras invertidas do LaTeX no JSON (ex: \\\\frac{a}{b}).
        
        Schema:
        [{"id":"1","topic":"${topic}","difficulty":"${contextStr ? 'Adaptado' : 'Médio'}","text":"Enunciado ($LaTeX$)...","options":["A","B","C","D"],"correctAnswerIndex":0,"explanation":"Explicação detalhada."}]
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        
        const text = result.response.text();
        const questions = cleanAndParseJSON(text);
        
        if (Array.isArray(questions) && questions.length > 0) {
             return questions.map((q: any, idx: number) => ({
                ...q,
                id: `exam-${Date.now()}-${idx}`,
                options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"]
            }));
        }
        return [];
    } catch (error) {
        console.error("Erro Quiz:", error);
        return [];
    }
};

export const generateLessonContent = async (topic: string): Promise<string> => {
    // Detecta se é Ciclo Básico (Teoria Pura) ou Profissional (Aplicação)
    const basicKeywords = ['Cálculo', 'Física', 'Álgebra', 'Geometria', 'Limites', 'Derivadas', 'Integrais', 'Mecânica'];
    const isBasic = basicKeywords.some(k => topic.includes(k));

    let structure = "";
    if (isBasic) {
        structure = `
        1. **Definição Formal:** Definições matemáticas precisas (Teoremas).
        2. **Dedução:** Demonstre a origem da fórmula principal (LaTeX \`$$\`).
        3. **Exemplo Clássico:** Resolva um problema "livro-texto".
        4. **Visualização:** Gere um diagrama simples (Mermaid/SVG) para abstração.
        5. **Conexão:** Onde isso entra na Engenharia?`;
    } else {
        structure = `
        1. **Resumo Executivo:** Visão geral rápida.
        2. **Diagrama do Sistema:** (Mermaid ou SVG).
        3. **Fundamentos Matemáticos:** Equações de governo (LaTeX).
        4. **Estudo de Caso:** Exemplo numérico resolvido passo a passo.
        5. **Indústria:** Aplicação real (ex: 5G, Carros Elétricos).`;
    }

    const prompt = `
        Crie uma aula universitária sobre "${topic}".
        ESTRUTURA OBRIGATÓRIA:
        ${structure}
        
        Use formatação rica (Markdown). Use LaTeX (\`$...\`, \`$$...$$\`) para TUDO que for matemático.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return `# Erro\nNão foi possível gerar a aula. Tente novamente.`;
    }
};

export const extractTopicsFromLesson = async (content: string): Promise<string> => {
    if (!content || content.startsWith("# Erro")) return "";
    try {
        const result = await model.generateContent(`Analise o texto abaixo e extraia os 5 tópicos principais em formato de lista bullet points (Markdown):\n\n${content.substring(0, 3000)}`);
        return result.response.text();
    } catch (error) {
        return "";
    }
};

export const explainQuestion = async (question: string, options: string[], correctOption: string): Promise<string> => {
    try {
        const prompt = `Explique a questão: "${question}". Opções: [${options}]. Correta: ${correctOption}. Justifique matematicamente e conceitualmente.`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return "Erro ao explicar.";
    }
};
