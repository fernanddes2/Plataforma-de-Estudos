// api/gemini.js
// Este arquivo roda nos servidores da Vercel

export const config = {
  runtime: 'edge', // Usa a infraestrutura mais rápida da Vercel
};

export default async function handler(req) {
  // 1. Configuração de CORS (Para o frontend poder chamar)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Pegar a Chave das Variáveis de Ambiente da Vercel
    const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key não configurada na Vercel' }), {
        status: 500,
        headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
        },
      });
    }

    const { prompt, history } = await req.json();

    // 3. Montar o Payload para o Google (Igual fizemos no server.js)
    let contents = [];
    if (history && Array.isArray(history) && history.length > 0) {
        contents = history.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.parts?.[0]?.text || msg.text || "" }]
        }));
        contents.push({ role: 'user', parts: [{ text: prompt }] });
    } else {
        contents.push({ role: 'user', parts: [{ text: prompt }] });
    }

    // 4. Chamada REST Direta (Fetch Nativo)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Erro na API do Google');
    }

    // Extrair o texto
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
    });
  }
}