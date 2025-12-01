import React, { useState, useEffect, useRef } from 'react';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, RefreshCw, Sparkles, Book, Zap, BrainCircuit } from 'lucide-react';
import { Chat } from "@google/genai";
import MarkdownRenderer from './MarkdownRenderer';

type ChatMode = 'resolver' | 'socratic';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Olá! Sou o ElectroBot, seu tutor de Engenharia Elétrica. Posso resolver um problema passo a passo ou guiá-lo com dicas no Modo Socrático. O que você gostaria de explorar hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('resolver');
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    chatSessionRef.current = createChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userText = input;
    setInput('');
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText
    };
    
    const loadingMsgId = 'loading-' + Date.now();
    const loadingMsg: ChatMessage = {
        id: loadingMsgId,
        role: 'model',
        text: '',
        isLoading: true
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(chatSessionRef.current, userText, chatMode);
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === loadingMsgId) {
            return { ...msg, text: responseText, isLoading: false };
        }
        return msg;
      }));

    } catch (error) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === loadingMsgId) {
            return { ...msg, text: "Houve um erro na comunicação. Tente novamente.", isLoading: false };
        }
        return msg;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full mx-auto px-4 lg:px-8 py-4">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tutor IA</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Especialista em Engenharia Elétrica</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => {
                        chatSessionRef.current = createChatSession();
                        setMessages([{ id: Date.now().toString(), role: 'model', text: 'Conversa reiniciada. Em que posso ajudar agora?' }]);
                    }}
                    className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Reiniciar conversa"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2 custom-scrollbar">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                            msg.role === 'user' ? 'bg-gray-200 dark:bg-slate-600' : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                            {msg.role === 'user' ? (
                                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                        </div>

                        <div className={`p-4 2xl:p-5 rounded-2xl text-sm 2xl:text-base leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-secondary-900 dark:bg-primary-600 text-white rounded-tr-none' 
                                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                        }`}>
                            {msg.isLoading ? (
                                <div className="flex space-x-2 items-center py-2 px-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            ) : (
                                <MarkdownRenderer content={msg.text} />
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg flex flex-col gap-2 transition-colors">
            {/* Mode Selector */}
            <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button 
                        onClick={() => setChatMode('resolver')}
                        className={`px-3 py-1 text-xs font-bold rounded-md flex items-center transition-colors ${chatMode === 'resolver' ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <Zap className="w-3 h-3 mr-1.5" /> Resolvedor
                    </button>
                    <button 
                        onClick={() => setChatMode('socratic')}
                        className={`px-3 py-1 text-xs font-bold rounded-md flex items-center transition-colors ${chatMode === 'socratic' ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <BrainCircuit className="w-3 h-3 mr-1.5" /> Socrático
                    </button>
                </div>
                 <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                    {chatMode === 'resolver' ? 'Receba a solução completa.' : 'Receba dicas para resolver.'}
                </p>
            </div>
            <div className="flex items-end gap-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Analisar um circuito RLC em série..."
                    className="flex-1 max-h-32 min-h-[3rem] p-3 bg-transparent border-none focus:ring-0 resize-none text-sm 2xl:text-base text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={`p-3 rounded-xl mb-1 mr-1 transition-all duration-200 ${
                        input.trim() && !isLoading
                            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default AIChat;