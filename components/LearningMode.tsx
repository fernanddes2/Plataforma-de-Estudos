import React, { useState } from 'react';
import { MOCK_LEARNING_MODULES } from '../constants';
import { PlayCircle, CheckCircle, Clock, ArrowRight, Search, BookOpen, X, AlertCircle } from 'lucide-react';
import { generateLessonContent } from '../services/geminiService';

const LearningMode: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredModules = MOCK_LEARNING_MODULES.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModule = async (title: string) => {
    setSelectedModule(title);
    setLoading(true);
    setLessonContent(null);
    
    const content = await generateLessonContent(title);
    setLessonContent(content);
    setLoading(false);
  };

  const handleCloseModule = () => {
      setSelectedModule(null);
      setLessonContent(null);
  }

  // Lesson Viewer Modal
  if (selectedModule) {
      return (
          <div className="fixed inset-0 z-50 bg-white flex flex-col">
              <div className="bg-secondary-900 text-white p-4 flex justify-between items-center shadow-md">
                  <div className="flex items-center space-x-3">
                      <BookOpen className="w-6 h-6 text-primary-500" />
                      <div>
                          <h2 className="font-bold text-lg">{selectedModule}</h2>
                          <p className="text-xs text-gray-400">Guia de Estudo Gerado por IA</p>
                      </div>
                  </div>
                  <button onClick={handleCloseModule} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                      <X className="w-6 h-6" />
                  </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50 custom-scrollbar">
                  <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm min-h-full">
                      {loading ? (
                          <div className="flex flex-col items-center justify-center py-20">
                              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                              <p className="text-gray-500 animate-pulse">O ElectroBot está escrevendo sua aula sobre {selectedModule}...</p>
                          </div>
                      ) : (
                          <div className="prose prose-slate max-w-none">
                              {/* Simple Markdown Rendering */}
                              {lessonContent?.split('\n').map((line, idx) => {
                                  if (line.startsWith('# ')) return <h1 key={idx} className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b">{line.replace('# ', '')}</h1>;
                                  if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-gray-800 mt-8 mb-4">{line.replace('## ', '')}</h2>;
                                  if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
                                  if (line.trim() === '') return <br key={idx} />;
                                  return <p key={idx} className="text-gray-700 leading-relaxed mb-2">{line}</p>;
                              })}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Conteúdos e Aulas</h1>
        <p className="text-gray-500 mt-2">Guias de estudo gerados por IA para todas as disciplinas de Engenharia Elétrica.</p>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                placeholder="Buscar módulo (ex: Circuitos, Controle...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModules.map((module) => {
          return (
            <div key={module.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer" onClick={() => handleOpenModule(module.title)}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors" title={module.title}>{module.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{module.description}</p>
                </div>
                <div className={`p-3 rounded-full flex-shrink-0 ml-4 bg-blue-50 group-hover:bg-primary-50 transition-colors`}>
                    <PlayCircle className="w-6 h-6 text-primary-600" />
                </div>
              </div>

              {/* Progress Bar (Visual only for now) */}
              <div className="mb-4">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gray-300`}
                    style={{ width: `0%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Leitura ~10 min</span>
                </div>
                <button className="text-sm font-bold text-primary-600 group-hover:text-primary-700 flex items-center">
                  Acessar Conteúdo 
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
            <p className="text-gray-500">Nenhum módulo encontrado para "{searchTerm}".</p>
        </div>
      )}
    </div>
  );
};

export default LearningMode;