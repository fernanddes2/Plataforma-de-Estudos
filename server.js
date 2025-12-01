import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt, history } = req.body;
    console.log(`📩 Processando: "${prompt?.substring(0, 15)}..."`);

    let contents = [];
    if (history && history.length > 0) {
        contents = history.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.parts?.[0]?.text || msg.text || "" }]
        }));
        contents.push({ role: 'user', parts: [{ text: prompt }] });
    } else {
        contents.push({ role: 'user', parts: [{ text: prompt }] });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: contents,
            generationConfig: { temperature: 0.7 }
        })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ text });

  } catch (error) {
    console.error("❌ Erro:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log(`🚀 SERVIDOR LOCAL OK: http://localhost:3001`));