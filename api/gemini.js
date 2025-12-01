// api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Configuração de CORS para permitir que seu site chame essa função
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responde imediatamente a requisições de preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { prompt, history } = req.body;
  
  // Pega a chave do ambiente seguro do servidor (não do VITE_)
  const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key não configurada no servidor' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let text = "";

    if (history && Array.isArray(history)) {
      // Modo Chat
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(prompt);
      text = result.response.text();
    } else {
      // Modo Texto Simples
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Erro na API Vercel:", error);
    return res.status(500).json({ error: error.message });
  }
}
