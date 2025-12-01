import React, { useState } from 'react';
import { SUBJECTS_LIST } from '../constants';
import { BookOpen, Search, ChevronRight, Layers, Hash, Sparkles } from 'lucide-react';

interface QuestionBankProps {
    onStartQuiz: (topic: string) => void;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ onStartQuiz }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Função auxiliar para normalizar texto (remover acentos e lowercase)
    const normalizeText = (text: string) => {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    // Ordenação alfabética robusta e filtragem
    const filteredSubjects = SUBJECTS_LIST.filter(subject => 
        normalizeText(subject).includes(normalizeText(searchTerm))
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    // Helper to assign a mock category color/icon based on subject name
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

    return (
        <div className="p-8 2xl:p-12 max-w-screen-2xl 2xl:max-w-[1800px] mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white">Banco de Questões</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 2xl:text-lg">Explore nossa biblioteca completa de disciplinas de Engenharia Elétrica.</p>
                
                {/* Search Bar */}
                <div className="mt-6 relative max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                        placeholder="Buscar disciplina (ex: Circuitos, Cálculo, Eletrônica...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Mostrando {filteredSubjects.length} disciplinas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 2xl:gap-6">
                {filteredSubjects.map((subject, idx) => {
                    const style = getSubjectStyle(subject);
                    return (
                        <div 
                            key={idx} 
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 2xl:p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-200 group cursor-pointer flex flex-col justify-between h-full" 
                            onClick={() => onStartQuiz(subject)}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg ${style.iconBg}`}>
                                        <BookOpen className={`w-5 h-5 ${style.text}`} />
                                    </div>
                                </div>
                                
                                <h3 className="text-base 2xl:text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2" title={subject}>
                                    {subject}
                                </h3>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-700">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onStartQuiz(subject);
                                    }}
                                    className="w-full py-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-bold flex items-center justify-center transition-colors mb-2"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Gerar Questões
                                </button>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs 2xl:text-sm text-gray-400">
                                        <Layers className="w-3 h-3 mr-1" />
                                        <span>Módulos Aulas</span>
                                    </div>
                                    <span className="text-xs 2xl:text-sm font-medium text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center">
                                        Abrir <ChevronRight className="w-3 h-3 ml-0.5" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredSubjects.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
                        <Hash className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhuma disciplina encontrada</h3>
                    <p className="text-gray-500 dark:text-gray-400">Tente buscar por sinônimos ou partes do nome.</p>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;