// api/chat.js
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // --- BLOCO DE CORS (Mantenha isso, é crucial para o Vercel) ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  // -------------------------------------------------------------

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    // Inicialização da NOVA SDK
    const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // Chamada usando a sintaxe nova
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash', // Ou 'gemini-2.0-flash-exp' se tiver acesso
      contents: [
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ]
    });

    // Extração do texto na nova SDK
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Erro na API do Google:", error);
    return res.status(500).json({ error: 'Erro ao processar a IA: ' + error.message });
  }
}
