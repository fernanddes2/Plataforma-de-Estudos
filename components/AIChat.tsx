import React, { useState, useEffect, useRef } from 'react';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { Chat as AppChat, ChatMessage } from '../types';
import { Send, User, Bot, RefreshCw } from 'lucide-react';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Olá! Sou seu Tutor de Engenharia. Como posso ajudar?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<AppChat | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatSessionRef.current = createChatSession(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input; setInput('');
    setMessages(p => [...p, { id: Date.now().toString(), role: 'user', text }]);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(chatSessionRef.current!, text, 'resolver');
      setMessages(p => [...p, { id: Date.now().toString(), role: 'model', text: response }]);
    } catch {
      setMessages(p => [...p, { id: Date.now().toString(), role: 'model', text: 'Erro ao conectar.' }]);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-[80%] gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-full ${m.role === 'user' ? 'bg-gray-200' : 'bg-blue-100'}`}>
                {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-3 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border dark:bg-slate-800 dark:text-white'}`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center text-gray-400">Digitando...</div>}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <input 
            value={input} onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 p-3 border rounded-xl dark:bg-slate-800 dark:text-white" placeholder="Pergunte algo..." 
        />
        <button onClick={handleSend} disabled={isLoading} className="p-3 bg-blue-600 text-white rounded-xl"><Send /></button>
      </div>
    </div>
  );
};
export default AIChat;