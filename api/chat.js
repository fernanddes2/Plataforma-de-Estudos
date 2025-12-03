// api/chat.js
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // --- Configuração do CORS (Obrigatório) ---
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Chave de API não configurada.');
    }

    const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ]
    });

    // CORREÇÃO AQUI:
    // Na nova SDK, response.text pode ser uma propriedade direta
    // Se ela não existir, pegamos do jeito manual (candidatos)
    let text = "";
    if (typeof response.text === 'string') {
        text = response.text;
    } else if (typeof response.text === 'function') {
        text = response.text();
    } else if (response.candidates && response.candidates.length > 0) {
        // Fallback garantido para estrutura JSON padrão
        text = response.candidates[0].content.parts[0].text;
    } else {
        throw new Error("A IA não retornou nenhum texto.");
    }

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Erro detalhado:", error);
    return res.status(500).json({ 
      error: 'Erro no processamento', 
      details: error.message 
    });
  }
}
