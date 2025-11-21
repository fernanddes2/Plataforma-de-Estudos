import React, { useState } from 'react';
import { SUBJECTS_LIST } from '../constants';
import { BookOpen, Search, ChevronRight, Layers, Hash } from 'lucide-react';

interface QuestionBankProps {
    onStartQuiz: (topic: string) => void;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ onStartQuiz }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSubjects = SUBJECTS_LIST.filter(subject => 
        subject.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort();

    // Helper to assign a mock category color/icon based on subject name
    const getSubjectStyle = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('cálculo') || lower.includes('matemática') || lower.includes('álgebra') || lower.includes('estatística')) {
            return { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' };
        }
        if (lower.includes('física') || lower.includes('mecânica') || lower.includes('termodinâmica')) {
            return { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' };
        }
        if (lower.includes('elétric') || lower.includes('eletrônic') || lower.includes('circuito') || lower.includes('potência')) {
            return { bg: 'bg-yellow-50', text: 'text-yellow-700', iconBg: 'bg-yellow-100' };
        }
        if (lower.includes('comput') || lower.includes('dados') || lower.includes('programação') || lower.includes('digitais')) {
            return { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' };
        }
        return { bg: 'bg-gray-50', text: 'text-gray-700', iconBg: 'bg-gray-100' };
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Banco de Questões</h1>
                <p className="text-gray-500 mt-2">Explore nossa biblioteca completa de disciplinas de Engenharia Elétrica.</p>
                
                {/* Search Bar */}
                <div className="mt-6 relative max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                        placeholder="Buscar disciplina (ex: Circuitos, Cálculo...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <span>Mostrando {filteredSubjects.length} disciplinas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSubjects.map((subject, idx) => {
                    const style = getSubjectStyle(subject);
                    return (
                        <div 
                            key={idx} 
                            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200 group cursor-pointer flex flex-col justify-between h-full" 
                            onClick={() => onStartQuiz(subject)}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg ${style.iconBg}`}>
                                        <BookOpen className={`w-5 h-5 ${style.text}`} />
                                    </div>
                                </div>
                                
                                <h3 className="text-base font-bold text-gray-900 leading-tight mb-2 line-clamp-2" title={subject}>
                                    {subject}
                                </h3>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center text-xs text-gray-400">
                                    <Layers className="w-3 h-3 mr-1" />
                                    <span>Módulos Aulas</span>
                                </div>
                                <span className="text-xs font-medium text-primary-600 group-hover:translate-x-1 transition-transform flex items-center">
                                    Praticar <ChevronRight className="w-3 h-3 ml-0.5" />
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredSubjects.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                        <Hash className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma disciplina encontrada</h3>
                    <p className="text-gray-500">Tente buscar por outro termo.</p>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;