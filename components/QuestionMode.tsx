import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, ArrowRight, AlertCircle, Sparkles, ChevronRight, RefreshCw, Home, Trophy } from 'lucide-react';
import { explainQuestion, generateQuizForTopic } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

interface QuestionModeProps {
  initialQuestions?: Question[]; 
  topicName: string;
  isExamMode?: boolean;
  onExit: () => void;
  onUpdateStats: (correct: boolean) => void;
}

const QuestionMode: React.FC<QuestionModeProps> = ({ initialQuestions, topicName, isExamMode = false, onExit, onUpdateStats }) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const hasFetched = useRef(false);

  // Fetch questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
        if (initialQuestions && initialQuestions.length > 0) {
            setQuestions(initialQuestions);
            setLoading(false);
            return;
        }

        if (hasFetched.current) return;
        hasFetched.current = true;

        setLoading(true);
        try {
            const newQuestions = await generateQuizForTopic(topicName, 5, isExamMode);
            setQuestions(newQuestions);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    loadQuestions();
  }, [topicName, initialQuestions, isExamMode]);

  const currentQuestion = questions[currentIndex];
  const isCorrect = currentQuestion ? selectedOption === currentQuestion.correctAnswerIndex : false;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctAnswerIndex) {
        setScore(prev => prev + 1);
    }
    onUpdateStats(selectedOption === currentQuestion.correctAnswerIndex);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setAiExplanation(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleAskAI = async () => {
    setLoadingAi(true);
    const explanation = await explainQuestion(
        currentQuestion.text, 
        currentQuestion.options, 
        currentQuestion.options[currentQuestion.correctAnswerIndex]
    );
    setAiExplanation(explanation);
    setLoadingAi(false);
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Gerando Questões com IA</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  O ElectroBot está criando questões inéditas sobre <strong>{topicName}</strong> para você...
              </p>
          </div>
      );
  }

  if (quizFinished) {
      const percentage = Math.round((score / questions.length) * 100);
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in-up">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl text-center max-w-lg w-full border border-gray-100 dark:border-slate-700">
                  <div className="inline-flex p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-full mb-6">
                      <Trophy className="w-12 h-12 text-yellow-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Finalizado!</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">Você completou os exercícios de {topicName}.</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl">
                          <span className="block text-3xl font-bold text-primary-600 dark:text-primary-400">{score}/{questions.length}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Acertos</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl">
                          <span className={`block text-3xl font-bold ${percentage >= 70 ? 'text-green-500 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>{percentage}%</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Aproveitamento</span>
                      </div>
                  </div>

                  <div className="space-y-3">
                      <button 
                          onClick={() => {
                              // Reset state to restart
                              setCurrentIndex(0);
                              setScore(0);
                              setQuizFinished(false);
                              setIsAnswered(false);
                              setSelectedOption(null);
                              setAiExplanation(null);
                          }}
                          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center"
                      >
                          <RefreshCw className="w-4 h-4 mr-2" /> Refazer Quiz
                      </button>
                      <button 
                          onClick={onExit}
                          className="w-full py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors"
                      >
                          Voltar ao Menu
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (!currentQuestion) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Erro ao carregar</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Não foi possível gerar questões. Tente novamente.</p>
            <button onClick={onExit} className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl">Voltar</button>
        </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 h-full flex flex-col">
      {/* Header Progress */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
            <button onClick={onExit} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium text-sm flex items-center">
                <Home className="w-4 h-4 mr-1" /> Sair
            </button>
            <span className="text-sm font-semibold text-gray-400">
                Questão {currentIndex + 1} de {questions.length}
            </span>
        </div>
        <div className="flex-1 mx-6 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-xs">
            <div 
                className="h-full bg-primary-500 transition-all duration-300" 
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
        </div>
        <span className="text-xs px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full font-bold uppercase tracking-wide shadow-sm border border-primary-100 dark:border-primary-800 truncate max-w-[200px]">
            {topicName}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Left Column: Question & Options */}
        <div className="lg:col-span-2 space-y-8">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        currentQuestion.difficulty === 'Fácil' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        currentQuestion.difficulty === 'Médio' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                        {currentQuestion.difficulty}
                    </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {currentQuestion.text}
                </h2>
            </div>

            <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                    let styles = "border-gray-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-blue-50/50 dark:hover:bg-slate-700";
                    let icon = <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-500 group-hover:border-primary-500"></div>;
                    
                    if (isAnswered) {
                        if (index === currentQuestion.correctAnswerIndex) {
                            styles = "border-green-500 bg-green-50 dark:bg-green-900/20";
                            icon = <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
                        } else if (index === selectedOption && selectedOption !== currentQuestion.correctAnswerIndex) {
                            styles = "border-red-500 bg-red-50 dark:bg-red-900/20";
                            icon = <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
                        } else {
                            styles = "border-gray-200 dark:border-slate-800 opacity-50";
                        }
                    } else if (selectedOption === index) {
                        styles = "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500";
                        icon = <div className="w-5 h-5 rounded-full border-[5px] border-primary-500"></div>;
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(index)}
                            disabled={isAnswered}
                            className={`w-full p-4 text-left rounded-xl border-2 flex items-center space-x-4 transition-all duration-200 group bg-white dark:bg-slate-800 ${styles}`}
                        >
                            <div className="flex-shrink-0">{icon}</div>
                            <span className={`text-sm md:text-base font-medium ${isAnswered && index === currentQuestion.correctAnswerIndex ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                {option}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Action Buttons */}
            <div className="pt-4">
                {!isAnswered ? (
                    <button 
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                            selectedOption !== null 
                            ? 'bg-secondary-900 hover:bg-black dark:bg-primary-600 dark:hover:bg-primary-500 hover:shadow-xl transform hover:-translate-y-0.5' 
                            : 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed'
                        }`}
                    >
                        Responder
                    </button>
                ) : (
                    <div className="flex justify-end">
                         <button 
                            onClick={handleNext}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center space-x-2 transition-all"
                        >
                            <span>{currentIndex === questions.length - 1 ? 'Finalizar' : 'Próxima'}</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Explanation & AI */}
        <div className="lg:col-span-1">
            {isAnswered && (
                <div className="animate-fade-in-up space-y-4">
                    {/* Base Explanation Card */}
                    <div className={`p-6 rounded-2xl border ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900 shadow-sm'}`}>
                        <div className="flex items-center space-x-2 mb-3">
                            {isCorrect ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />}
                            <h3 className={`font-bold ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                {isCorrect ? 'Correto!' : 'Incorreto'}
                            </h3>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <MarkdownRenderer content={currentQuestion.explanation} />
                        </div>
                    </div>

                    {/* AI Explanation Section */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-24 h-24" />
                        </div>
                        
                        <h4 className="font-bold flex items-center gap-2 mb-3 text-blue-200">
                            <Sparkles className="w-4 h-4" />
                            ElectroBot AI
                        </h4>

                        {!aiExplanation && !loadingAi && (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-300 mb-4">
                                    Não entendeu completamente? Peça uma explicação aprofundada.
                                </p>
                                <button 
                                    onClick={handleAskAI}
                                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                                >
                                    Explicar Detalhadamente
                                </button>
                            </div>
                        )}

                        {loadingAi && (
                            <div className="flex flex-col items-center justify-center py-6 space-y-3">
                                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-blue-200 animate-pulse">Analisando...</span>
                            </div>
                        )}

                        {aiExplanation && (
                            <div className="text-sm text-gray-200 space-y-2 max-h-64 overflow-y-auto custom-scrollbar leading-relaxed">
                                <MarkdownRenderer content={aiExplanation} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default QuestionMode;