import React, { useState } from 'react';
import { MOCK_EXAMS, SUBJECTS_LIST } from '../constants';
import { FileText, ChevronLeft, Building, Calendar, BookOpen, Search, GraduationCap } from 'lucide-react';

interface ExamArchiveProps {
    onStartExam: (subject: string, university: string) => void;
}

const ExamArchive: React.FC<ExamArchiveProps> = ({ onStartExam }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Função auxiliar para normalizar texto (remover acentos e lowercase)
  const normalizeText = (text: string) => {
      return text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
  };

  // Passo 1: Filtrar matérias que correspondem à busca
  const availableSubjects = SUBJECTS_LIST.filter(subject => 
      normalizeText(subject).includes(normalizeText(searchTerm))
  );

  // Passo 2: Quando uma matéria é selecionada, buscar as provas dela
  const subjectExams = selectedSubject 
    ? MOCK_EXAMS.filter(exam => exam.subject === selectedSubject)
    : [];

  // Agrupar por universidade
  const uffExams = subjectExams.filter(e => e.university === 'UFF');
  const estacioExams = subjectExams.filter(e => e.university === 'Estácio de Sá');

  // Renderização da Lista de Matérias (Visão Principal)
  if (!selectedSubject) {
    return (
      <div className="p-8 2xl:p-12 max-w-screen-2xl 2xl:max-w-[1800px] mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white">Provas Anteriores e Simulados</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 2xl:text-lg">Escolha uma disciplina para acessar o banco de provas de diversas universidades.</p>
          
          <div className="mt-6 relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                placeholder="Buscar disciplina (ex: Cálculo, Circuitos...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 2xl:gap-6">
          {availableSubjects.map((subject, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedSubject(subject)}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500 transition-all text-left group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded-md border border-gray-200 dark:border-slate-600">
                   Acessar
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                {subject}
              </h3>
            </button>
          ))}
        </div>

        {availableSubjects.length === 0 && (
             <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                 Nenhuma disciplina encontrada com esse nome.
             </div>
        )}
      </div>
    );
  }

  // Componente de Card de Prova
  const ExamCard = ({ exam }: { exam: any }) => (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all mb-4 flex flex-col justify-between h-full">
          <div>
              <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs font-bold rounded uppercase text-gray-600 dark:text-gray-300">
                      {exam.period}
                  </span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" /> {exam.year}
                  </span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Prova Regular</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Simulado completo baseado no histórico.</p>
          </div>
          <button 
              onClick={() => onStartExam(exam.subject, exam.university)}
              className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:bg-primary-600 dark:hover:bg-gray-200 transition-colors text-sm"
          >
              Iniciar Simulado
          </button>
      </div>
  );

  // Renderização da Lista de Provas da Matéria Selecionada (Visão Detalhada)
  return (
    <div className="p-8 2xl:p-12 max-w-screen-2xl 2xl:max-w-[1800px] mx-auto animate-fade-in-up">
      <button 
        onClick={() => setSelectedSubject(null)}
        className="flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 mb-6 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar para Disciplinas
      </button>

      <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 dark:border-slate-700 pb-6">
        <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
            <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedSubject}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Selecione a universidade e o ano para praticar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Coluna UFF */}
          <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                      <Building className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">UFF</h3>
                      <p className="text-xs text-blue-600 dark:text-blue-300">Universidade Federal Fluminense</p>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uffExams.length > 0 ? (
                      uffExams.map(exam => <ExamCard key={exam.id} exam={exam} />)
                  ) : (
                      <div className="col-span-2 py-8 text-center border border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-gray-500 dark:text-gray-400 text-sm">
                          Nenhuma prova da UFF encontrada para esta disciplina.
                      </div>
                  )}
              </div>
          </div>

          {/* Coluna Estácio */}
          <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                      <GraduationCap className="w-5 h-5 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg text-green-900 dark:text-green-100">Estácio de Sá</h3>
                      <p className="text-xs text-green-600 dark:text-green-300">Universidade Estácio de Sá</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {estacioExams.length > 0 ? (
                      estacioExams.map(exam => <ExamCard key={exam.id} exam={exam} />)
                  ) : (
                      <div className="col-span-2 py-8 text-center border border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-gray-500 dark:text-gray-400 text-sm">
                          Nenhuma prova da Estácio encontrada para esta disciplina.
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Fallback Genérico */}
      {subjectExams.length === 0 && (
            <div className="mt-12 text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Não encontramos provas oficiais cadastradas.</p>
                <button 
                    onClick={() => onStartExam(selectedSubject, 'Geral')}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                    Gerar Simulado Genérico com IA
                </button>
            </div>
      )}
    </div>
  );
};

export default ExamArchive;