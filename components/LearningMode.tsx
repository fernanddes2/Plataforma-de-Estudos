import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, PlayCircle, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { generateLessonContent, extractTopicsFromLesson } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { MOCK_LEARNING_MODULES } from '../constants';

interface LearningModeProps {
  learningProgress: Record<string, number>;
  onUpdateProgress: (moduleId: string, progress: number) => void;
}

const LearningMode: React.FC<LearningModeProps> = ({ learningProgress, onUpdateProgress }) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyTopics, setKeyTopics] = useState<string>("");

  const selectedModule = MOCK_LEARNING_MODULES.find(m => m.id === selectedModuleId);

  // Load lesson content logic
  useEffect(() => {
    const loadContent = async () => {
        if (!selectedModule) return;
        
        const cacheKey = `lesson_${selectedModule.title}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            setLessonContent(cached);
            // Tenta carregar tópicos do cache também
            const cachedTopics = localStorage.getItem(`${cacheKey}_topics`);
            if (cachedTopics) setKeyTopics(cachedTopics);
        } else {
            setIsLoading(true);
            try {
                const content = await generateLessonContent(selectedModule.title);
                
                // CORREÇÃO: Check de null antes de salvar
                if (content) {
                    setLessonContent(content);
                    localStorage.setItem(cacheKey, content);

                    // Gera resumo dos tópicos
                    const topics = await extractTopicsFromLesson(content);
                    setKeyTopics(topics || ""); // Garante string
                    localStorage.setItem(`${cacheKey}_topics`, topics || "");
                } else {
                    setLessonContent("# Erro ao carregar conteúdo.");
                }
            } catch (error) {
                setLessonContent("# Erro de conexão.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (selectedModuleId) {
        loadContent();
    }
  }, [selectedModuleId, selectedModule]);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-slate-900">
      {/* Sidebar de Módulos */}
      <div className={`w-full md:w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-y-auto ${selectedModuleId ? 'hidden md:block' : 'block'}`}>
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Book className="w-6 h-6 text-blue-600" />
                Matérias
            </h2>
        </div>
        <div className="p-4 space-y-3">
            {MOCK_LEARNING_MODULES.map(module => (
                <button
                    key={module.id}
                    onClick={() => setSelectedModuleId(module.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedModuleId === module.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-1 ring-blue-500' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{module.title}</span>
                        {learningProgress[module.id] === 100 && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${learningProgress[module.id] || 0}%` }}
                        />
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Área de Conteúdo */}
      <div className={`flex-1 overflow-y-auto bg-white dark:bg-slate-900 ${!selectedModuleId ? 'hidden md:flex' : 'flex flex-col'}`}>
        {!selectedModuleId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <Book className="w-16 h-16 mb-4 opacity-20" />
                <p>Selecione um módulo para começar a estudar.</p>
            </div>
        ) : (
            <div className="max-w-4xl mx-auto w-full p-6 lg:p-10">
                <button 
                    onClick={() => setSelectedModuleId(null)}
                    className="md:hidden mb-4 flex items-center text-sm text-gray-500"
                >
                    ← Voltar
                </button>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedModule?.title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center"><PlayCircle className="w-4 h-4 mr-1"/> 12 Aulas</span>
                            <span className="flex items-center"><FileText className="w-4 h-4 mr-1"/> Teoria + Prática</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            const newKey = `lesson_${selectedModule?.title}_force`; // Truque para forçar reload
                            localStorage.removeItem(`lesson_${selectedModule?.title}`);
                            setSelectedModuleId(null);
                            setTimeout(() => setSelectedModuleId(selectedModule!.id), 10);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full" 
                        title="Regerar Conteúdo com IA"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-5/6"></div>
                        <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded-xl mt-8"></div>
                    </div>
                ) : (
                    <div className="prose dark:prose-invert max-w-none">
                        {/* Resumo de Tópicos (se houver) */}
                        {keyTopics && (
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-8 text-sm">
                                <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase text-xs tracking-wider">Tópicos Chave</h4>
                                <MarkdownRenderer content={keyTopics} />
                            </div>
                        )}
                        
                        <MarkdownRenderer content={lessonContent} />
                        
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800 flex justify-end">
                            <button 
                                onClick={() => onUpdateProgress(selectedModule!.id, 100)}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg transition-transform active:scale-95"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Marcar como Concluído
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default LearningMode;