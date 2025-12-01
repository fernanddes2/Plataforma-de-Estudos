import React, { useState, useEffect, useRef } from 'react';
import { MOCK_LEARNING_MODULES } from '../constants';
import { PlayCircle, CheckCircle, Search, Sparkles, FolderOpen, History, BookOpen, ChevronRight, ListChecks, RotateCcw, X, ExternalLink, CheckSquare } from 'lucide-react';
import { generateLessonContent, extractTopicsFromLesson } from '../services/geminiService';
import { LearningModule } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface LearningModeProps {
  learningProgress: Record<string, number>;
  onUpdateProgress: (moduleId: string, progress: number) => void;
}

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
    <div className="flex items-center justify-center space-x-2 mb-8 text-primary-600 dark:text-primary-400">
      <Sparkles className="w-5 h-5 animate-spin-slow" />
      <span className="text-sm font-medium">O ElectroBot está escrevendo sua aula...</span>
    </div>
    <div className="space-y-4 pb-8 border-b border-gray-100 dark:border-slate-700">
      <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
    </div>
    <div className="space-y-3">
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
    </div>
  </div>
);

const LearningMode: React.FC<LearningModeProps> = ({ learningProgress, onUpdateProgress }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [extractedTopics, setExtractedTopics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);
  const [recentModules, setRecentModules] = useState<LearningModule[]>([]);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('electroMindRecentModules');
      if (saved) {
        setRecentModules(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading recent history", e);
    }
  }, []);

  const updateRecentHistory = (module: LearningModule) => {
    setRecentModules(prev => {
      const filtered = prev.filter(m => m.id !== module.id);
      const updated = [module, ...filtered].slice(0, 4);
      localStorage.setItem('electroMindRecentModules', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredModules = MOCK_LEARNING_MODULES.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

  const handleOpenModule = async (module: LearningModule) => {
    setSelectedModule(module);
    updateRecentHistory(module);
    setLoading(true);
    setLessonContent(null);
    setExtractedTopics(null);
    
    const cacheKey = `electroMind_content_${module.id}`;
    let content = localStorage.getItem(cacheKey);

    if (content) {
        setLessonContent(content);
        setLoading(false);
        setShouldRestoreScroll(true);
    } else {
        content = await generateLessonContent(module.title);
        setLessonContent(content);
        setLoading(false);
        setShouldRestoreScroll(true);
        try {
            localStorage.setItem(cacheKey, content);
        } catch (e) {
            console.warn("Falha ao cachear conteúdo (Storage cheio)");
        }
    }

    setLoadingTopics(true);
    const topics = await extractTopicsFromLesson(content);
    setExtractedTopics(topics);
    setLoadingTopics(false);
  };

  useEffect(() => {
    if (!loading && lessonContent && selectedModule && shouldRestoreScroll && contentRef.current) {
        const timer = setTimeout(() => {
            if (!contentRef.current) return;
            const progress = learningProgress[selectedModule.id] || 0;
            if (progress > 0 && progress < 100) {
                const { scrollHeight, clientHeight } = contentRef.current;
                const maxScroll = scrollHeight - clientHeight;
                if (maxScroll > 0) {
                    const targetScroll = (progress / 100) * maxScroll;
                    contentRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
                }
            } else {
                contentRef.current.scrollTop = 0;
            }
            setShouldRestoreScroll(false);
        }, 200); 
        return () => clearTimeout(timer);
    }
  }, [loading, lessonContent, selectedModule, shouldRestoreScroll, learningProgress]);

  const handleCloseModule = () => {
      setSelectedModule(null);
      setLessonContent(null);
      setExtractedTopics(null);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
  };

  const handleCompleteLesson = () => {
    if (selectedModule) {
      onUpdateProgress(selectedModule.id, 100);
      handleCloseModule();
    }
  };

  const handleScroll = () => {
      if (!contentRef.current || !selectedModule) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;
      
      const percentage = Math.min(98, Math.floor((scrollTop / maxScroll) * 100));
      const currentSaved = learningProgress[selectedModule.id] || 0;

      if (currentSaved < 100 && percentage > currentSaved) {
          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = setTimeout(() => {
             onUpdateProgress(selectedModule.id, percentage);
          }, 500);
      }
  };

  // Helper para categorias de cores (igual ao QuestionBank)
  const getSubjectStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cálculo') || lower.includes('matemática') || lower.includes('álgebra') || lower.includes('estatística')) {
        return { 
            bg: 'bg-blue-50 dark:bg-blue-900/20', 
            text: 'text-blue-700 dark:text-blue-300', 
            iconBg: 'bg-blue-100 dark:bg-blue-800' 
        };
    }
    if (lower.includes('física') || lower.includes('mecânica') || lower.includes('termodinâmica')) {
        return { 
            bg: 'bg-purple-50 dark:bg-purple-900/20', 
            text: 'text-purple-700 dark:text-purple-300', 
            iconBg: 'bg-purple-100 dark:bg-purple-800' 
        };
    }
    if (lower.includes('elétric') || lower.includes('eletrônic') || lower.includes('circuito') || lower.includes('potência')) {
        return { 
            bg: 'bg-yellow-50 dark:bg-yellow-900/20', 
            text: 'text-yellow-700 dark:text-yellow-300', 
            iconBg: 'bg-yellow-100 dark:bg-yellow-800' 
        };
    }
    if (lower.includes('comput') || lower.includes('dados') || lower.includes('programação') || lower.includes('digitais')) {
        return { 
            bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
            text: 'text-emerald-700 dark:text-emerald-300', 
            iconBg: 'bg-emerald-100 dark:bg-emerald-800' 
        };
    }
    return { 
        bg: 'bg-gray-50 dark:bg-slate-700/50', 
        text: 'text-gray-700 dark:text-gray-300', 
        iconBg: 'bg-gray-100 dark:bg-slate-600' 
    };
  };

  if (selectedModule) {
      const progress = learningProgress[selectedModule.id] || 0;
      const isCompleted = progress === 100;

      return (
          <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-fade-in">
              <div className="bg-secondary-900 dark:bg-slate-800 text-white p-4 flex justify-between items-center shadow-md flex-shrink-0 z-10 border-b border-slate-700">
                  <div className="flex items-center space-x-3 overflow-hidden">
                      <BookOpen className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      <div className="overflow-hidden">
                          <h2 className="font-bold text-lg truncate text-white">{selectedModule.title}</h2>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <span>Guia de Estudo IA</span>
                              {!loading && progress > 0 && progress < 100 && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span className="text-green-400 font-medium">Continuando de {progress}%</span>
                                  </>
                              )}
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                    {isCompleted && (
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation();
                                onUpdateProgress(selectedModule.id, 0);
                                if (contentRef.current) contentRef.current.scrollTop = 0;
                            }} 
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 dark:hover:bg-slate-700 rounded-full transition-colors"
                            title="Reiniciar Progresso"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={handleCloseModule} className="p-2 hover:bg-gray-800 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                  </div>
              </div>
              
              <div 
                className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-slate-900 custom-scrollbar scroll-smooth" 
                ref={contentRef}
                onScroll={handleScroll}
              >
                  <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 p-6 md:p-10 2xl:p-14 rounded-2xl shadow-sm min-h-full mb-20 transition-all dark:border dark:border-slate-700 relative">
                      {!loading && (
                          <a 
                            href="https://drive.google.com/drive/folders/0B5t8V5qZUOqpc3JUX1dGSGc1SUk?resourcekey=0-0ZFBc1gjxduqPlYrLzPaLA&usp=drive_link"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-6 right-6 hidden md:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800"
                          >
                              <FolderOpen className="w-4 h-4" />
                              <span>Consultar Acervo (Drive)</span>
                              <ExternalLink className="w-3 h-3" />
                          </a>
                      )}

                      {loading ? (
                          <SkeletonLoader />
                      ) : (
                          <div className="animate-fade-in-up">
                              {loadingTopics && (
                                <div className="my-8 p-6 bg-gray-50 dark:bg-slate-700 rounded-lg animate-pulse">
                                  <div className="h-5 w-1/3 bg-gray-200 dark:bg-slate-600 rounded mb-4"></div>
                                  <div className="space-y-2">
                                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-600 rounded"></div>
                                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-600 rounded"></div>
                                    <div className="h-4 w-4/5 bg-gray-200 dark:bg-slate-600 rounded"></div>
                                  </div>
                                </div>
                              )}
                              {!loadingTopics && extractedTopics && (
                                <div className="my-8 p-6 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 rounded-r-lg">
                                    <h3 className="text-lg font-bold text-primary-800 dark:text-primary-300 mb-3 flex items-center">
                                      <ListChecks className="w-5 h-5 mr-2" />
                                      Tópicos Abordados
                                    </h3>
                                    <div className="text-primary-900/80 dark:text-primary-200 space-y-1 whitespace-pre-wrap text-sm leading-relaxed">
                                        {extractedTopics}
                                    </div>
                                </div>
                              )}
                              
                              {lessonContent && <MarkdownRenderer content={lessonContent} />}
                          </div>
                      )}
                  </div>
              </div>

              {!loading && (
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={handleCompleteLesson}
                        className={`
                            px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all transform hover:-translate-y-1 shadow-lg
                            ${isCompleted 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                                : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-primary-500/30'}
                        `}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Aula Concluída</span>
                            </>
                        ) : (
                            <>
                                <CheckSquare className="w-5 h-5" />
                                <span>Concluir Aula</span>
                            </>
                        )}
                    </button>
                </div>
              )}
          </div>
      );
  }

  return (
    <div className="p-8 2xl:p-12 max-w-screen-2xl 2xl:max-w-[1800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white">Conteúdos e Aulas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 2xl:text-lg">Guias de estudo gerados por IA baseados em bibliografia de referência.</p>
        
        {/* Search Bar */}
        <div className="mt-6 relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                placeholder="Buscar módulo (ex: Circuitos, Controle...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span>Mostrando {filteredModules.length} módulos</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 2xl:gap-6">
        {filteredModules.map((module) => {
          const progress = learningProgress[module.id] || 0;
          const isCompleted = progress === 100;
          const style = getSubjectStyle(module.title);

          return (
             <div 
                key={module.id} 
                className="bg-white dark:bg-slate-800 rounded-xl p-5 2xl:p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-200 group cursor-pointer flex flex-col justify-between h-full" 
                onClick={() => handleOpenModule(module)}
            >
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <BookOpen className={`w-5 h-5 ${style.text}`} />
                        </div>
                        {progress > 0 && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'}`}>
                                {progress}%
                            </span>
                        )}
                    </div>
                    
                    <h3 className="text-base 2xl:text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2" title={module.title}>
                        {module.title}
                    </h3>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-700">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModule(module);
                        }}
                        className="w-full py-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-bold flex items-center justify-center transition-colors mb-2"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {progress > 0 ? 'Continuar Aula' : 'Iniciar Aula'}
                    </button>
                    
                    {progress > 0 && (
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-primary-500'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">Nenhum módulo encontrado para "{searchTerm}".</p>
        </div>
      )}
    </div>
  );
};

export default LearningMode;