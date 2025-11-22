import React, { useState, useEffect, useRef } from 'react';
import { MOCK_LEARNING_MODULES } from '../constants';
import { PlayCircle, CheckCircle, Clock, ArrowRight, Search, BookOpen, X, CheckSquare, Sparkles, RotateCcw, ListChecks } from 'lucide-react';
import { generateLessonContent, extractTopicsFromLesson } from '../services/geminiService';
import { LearningModule } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface LearningModeProps {
  learningProgress: Record<string, number>;
  onUpdateProgress: (moduleId: string, progress: number) => void;
}

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
    {/* AI Generation Header */}
    <div className="flex items-center justify-center space-x-2 mb-8 text-primary-600 dark:text-primary-400">
      <Sparkles className="w-5 h-5 animate-spin-slow" />
      <span className="text-sm font-medium">O ElectroBot está escrevendo sua aula...</span>
    </div>

    {/* Title Skeleton */}
    <div className="space-y-4 pb-8 border-b border-gray-100 dark:border-slate-700">
      <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
    </div>

    {/* Section 1 */}
    <div className="space-y-3">
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
    </div>

    {/* Section 2 */}
    <div className="space-y-3 pt-4">
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-2/5 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-11/12"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/5"></div>
    </div>

     {/* Section 3 (List style) */}
     <div className="space-y-4 pt-4">
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/4 mb-4"></div>
      <div className="flex items-center space-x-3">
         <div className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
         <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
      </div>
      <div className="flex items-center space-x-3">
         <div className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
         <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
      </div>
      <div className="flex items-center space-x-3">
         <div className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
         <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/5"></div>
      </div>
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
  
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredModules = MOCK_LEARNING_MODULES.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModule = async (module: LearningModule) => {
    setSelectedModule(module);
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
                    contentRef.current.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
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

  if (selectedModule) {
      const progress = learningProgress[selectedModule.id] || 0;
      const isCompleted = progress === 100;

      return (
          <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-fade-in">
              {/* Modal Header */}
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
              
              {/* Modal Content Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-slate-900 custom-scrollbar scroll-smooth" 
                ref={contentRef}
                onScroll={handleScroll}
              >
                  <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 md:p-10 rounded-2xl shadow-sm min-h-full mb-20 transition-all dark:border dark:border-slate-700">
                      {loading ? (
                          <SkeletonLoader />
                      ) : (
                          <div className="animate-fade-in-up">
                              {/* Topics Covered Section */}
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

              {/* Footer Action */}
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conteúdos e Aulas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Guias de estudo gerados por IA para todas as disciplinas de Engenharia Elétrica.</p>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModules.map((module) => {
          const progress = learningProgress[module.id] || 0;
          const isCompleted = progress === 100;

          return (
            <div 
                key={module.id} 
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer ${isCompleted ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-100 dark:border-slate-700'}`} 
                onClick={() => handleOpenModule(module)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" title={module.title}>{module.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{module.description}</p>
                </div>
                <div className={`p-3 rounded-full flex-shrink-0 transition-colors ${isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-50 dark:bg-blue-900/20 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30'}`}>
                    {isCompleted ? (
                         <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                         <PlayCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className={isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>{isCompleted ? 'Concluído' : 'Progresso'}</span>
                    <span className={isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500 dark:bg-green-400' : 'bg-primary-500 dark:bg-primary-400'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-700">
                <div className="flex items-center text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Leitura ~15 min</span>
                </div>
                <button className={`text-sm font-bold flex items-center ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300'}`}>
                  {isCompleted ? 'Revisar Conteúdo' : 'Acessar Conteúdo'}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Nenhum módulo encontrado para "{searchTerm}".</p>
        </div>
      )}
    </div>
  );
};

export default LearningMode;