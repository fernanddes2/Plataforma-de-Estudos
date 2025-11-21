import React, { useState } from 'react';
import { MOCK_EXAMS } from '../constants';
import { FileText, Play, Search, Filter, Building } from 'lucide-react';

interface ExamArchiveProps {
    onStartExam: (subject: string, university: string) => void;
}

const ExamArchive: React.FC<ExamArchiveProps> = ({ onStartExam }) => {
  const [filterUniversity, setFilterUniversity] = useState<'TODAS' | 'UFF' | 'Estácio de Sá'>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = MOCK_EXAMS.filter(exam => {
    const matchesUni = filterUniversity === 'TODAS' || exam.university === filterUniversity;
    const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesUni && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Provas Anteriores</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Simulados baseados no estilo da UFF e Estácio de Sá gerados por IA.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
            placeholder="Buscar por disciplina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilterUniversity('TODAS')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterUniversity === 'TODAS' ? 'bg-gray-900 dark:bg-slate-600 text-white' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
            Todas
          </button>
          <button 
             onClick={() => setFilterUniversity('UFF')}
             className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterUniversity === 'UFF' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
            UFF
          </button>
          <button 
             onClick={() => setFilterUniversity('Estácio de Sá')}
             className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterUniversity === 'Estácio de Sá' ? 'bg-green-600 text-white' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
            Estácio
          </button>
        </div>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.map((exam) => (
          <div key={exam.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${exam.university === 'UFF' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
                <Building className={`w-5 h-5 ${exam.university === 'UFF' ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'}`} />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-md border border-gray-100 dark:border-slate-600">
                {exam.year} - {exam.period}
              </span>
            </div>

            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight mb-1">
              {exam.subject}
            </h3>
            <p className={`text-xs font-bold mb-4 ${exam.university === 'UFF' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
              {exam.university}
            </p>

            <button 
                onClick={() => onStartExam(exam.subject, exam.university)}
                className="w-full mt-auto flex items-center justify-center space-x-2 py-2.5 bg-secondary-900 dark:bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-black dark:hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>Iniciar Simulado</span>
            </button>
          </div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="text-center py-20">
            <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhuma prova encontrada</h3>
            <p className="text-gray-500 dark:text-gray-400">Tente ajustar os filtros de busca.</p>
        </div>
      )}
    </div>
  );
};

export default ExamArchive;