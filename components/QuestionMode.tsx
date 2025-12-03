import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, RefreshCw, Home, Trophy, Zap, Sparkles } from 'lucide-react';
// Importando as funções do serviço novo que criamos
import { explainQuestion, generateQuizForTopic } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

interface QuestionModeProps {
  topicName: string;
  isExamMode?: boolean; // Isso define se é Banco de Questões (false) ou Prova (true)
  onExit: () => void;
  onUpdateStats: (correct: boolean) => void;
}

const QuestionMode: React.FC<QuestionModeProps> = ({ topicName, isExamMode = false, onExit, onUpdateStats }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  
  // Ref para evitar chamada dupla no React Strict Mode
  const hasFetched = useRef(false);

  // Função Principal: Chama a IA
  const fetchNewQuestions = async () => {
      setLoading(true);
      setQuestions([]);
      setCurrentIndex(0);
      setScore(0);
      setQuizFinished(false);
      setIsAnswered(false);
      setSelectedOption(null);
      setAiExplanation(null);

      try {
          // Define quantidade: 12 para Provas (mais difícil), 10 para Banco (rápido)
          const count = isExamMode ? 12 : 10;
          
          // CHAMA O SERVIÇO NOVO
          // Passamos isExamMode para a IA saber se deve pegar pesado (ITA/USP) ou leve
          const newQuestions = await generateQuizForTopic(topicName, count, isExamMode);
          
          if (newQuestions.length > 0) {
            setQuestions(newQuestions);
          } else {
            // Se a IA falhar e retornar vazio
            throw new Error("Nenhuma questão gerada");
          }
      } catch (e) {
          console.error("Erro ao buscar questões:", e);
      } finally {
          setLoading(false);
      }
  };

  // Carrega ao abrir
  useEffect(() => {
    if (!hasFetched.current) {
        hasFetched.current = true;
        fetchNewQuestions();
    }
  }, [topicName, isExamMode]);

  const currentQuestion = questions[currentIndex];
  const isCorrect = currentQuestion ? selectedOption === currentQuestion.correctAnswerIndex : false;

  const handleSelect = (index: number) => {
    if (!isAnswered) setSelectedOption(index);
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

  // TELA DE CARREGAMENTO
  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {isExamMode ? 'Consultando Acervo de Provas...' : 'Gerando Questões...'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  O ElectroBot está criando exercícios personalizados sobre <strong>{topicName}</strong> usando Inteligência Artificial.
              </p>
          </div>
      );
  }

  // TELA DE ERRO (Caso a IA falhe)
  if (!currentQuestion && !loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Ops!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Não foi possível gerar questões agora.</p>
            <button onClick={fetchNewQuestions} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
            </button>
            <button onClick={onExit} className="mt-4 text-gray-400 hover:text-gray-600 text-sm">Voltar</button>
        </div>
      );
  }

  // TELA DE RESULTADO FINAL
  if (quizFinished) {
      const percentage = Math.round((score / questions.length) * 100);
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in-up">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl text-center max-w-lg w-full border border-gray-100 dark:border-slate-700">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Simulado Finalizado!</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">Tópico: {topicName}</p>
                  
                  <div className="flex justify-center gap-8 mb-8">
                      <div className="text-center">
                          <span className="block text-3xl font-bold text-primary-600 dark:text-primary-400">{score}/{questions.length}</span>
                          <span className="text-xs text-gray-400 uppercase font-bold">Acertos</span>
                      </div>
                      <div className="text-center">
                          <span className={`block text-3xl font-bold ${percentage >= 70 ? 'text-green-500' : 'text-orange-500'}`}>{percentage}%</span>
                          <span className="text-xs text-gray-400 uppercase font-bold">Nota</span>
                      </div>
                  </div>

                  <div className="space-y-3">
                      <button onClick={fetchNewQuestions} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center">
                          <Zap className="w-4 h-4 mr-2" /> Praticar Mais (Gerar Novas)
                      </button>
                      <button onClick={onExit} className="w-full py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold">
                          Voltar ao Menu
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // TELA DA QUESTÃO (Interface Principal)
  return (
    <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onExit} className="text-gray-400 hover:text-gray-600 flex items-center">
            <Home className="w-4 h-4 mr-1" /> Sair
        </button>
        <span className="text-sm font-semibold text-gray-500">
            Questão {currentIndex + 1} de {questions.length}
        </span>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-bold">
            {currentQuestion.difficulty}
        </span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-y-auto">
        
        {/* Esquerda: Enunciado e Opções */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                    <MarkdownRenderer content={currentQuestion.text} />
                </div>
            </div>

            <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                    // Lógica de cores das opções
                    let style = "border-gray-200 dark:border-slate-700 hover:border-blue-400";
                    if (isAnswered) {
                        if (index === currentQuestion.correctAnswerIndex) style = "border-green-500 bg-green-50 dark:bg-green-900/20";
                        else if (index === selectedOption) style = "border-red-500 bg-red-50 dark:bg-red-900/20";
                    } else if (selectedOption === index) {
                        style = "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600";
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(index)}
                            disabled={isAnswered}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${style} bg-white dark:bg-slate-800`}
                        >
                            <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${selectedOption === index ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <div className="text-gray-700 dark:text-gray-200">
                                    <MarkdownRenderer content={option} />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {!isAnswered ? (
                <button 
                    onClick={handleSubmit} 
                    disabled={selectedOption === null}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${selectedOption !== null ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    Confirmar Resposta
                </button>
            ) : (
                <div className="flex justify-end">
                    <button onClick={handleNext} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center hover:bg-blue-700 shadow-lg">
                        Próxima <ChevronRight className="ml-2 w-5 h-5" />
                    </button>
                </div>
            )}
        </div>

        {/* Direita: Explicação e IA */}
        <div className="lg:col-span-1">
            {isAnswered && (
                <div className="space-y-4 animate-fade-in-up">
                    {/* Card de Explicação Padrão */}
                    <div className={`p-5 rounded-2xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} dark:bg-slate-800 dark:border-slate-700`}>
                        <div className="flex items-center gap-2 mb-2 font-bold">
                            {isCorrect ? <CheckCircle className="text-green-600" /> : <XCircle className="text-red-600" />}
                            <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <MarkdownRenderer content={currentQuestion.explanation} />
                        </div>
                    </div>

                    {/* Botão para pedir ajuda ao Professor IA */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-yellow-400" />
                            <h3 className="font-bold">Professor IA</h3>
                        </div>
                        
                        {!aiExplanation ? (
                            <div>
                                <p className="text-sm text-indigo-200 mb-4">Não entendeu a lógica? Peça uma explicação passo a passo.</p>
                                <button 
                                    onClick={handleAskAI}
                                    disabled={loadingAi}
                                    className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-bold transition-colors"
                                >
                                    {loadingAi ? 'Analisando...' : 'Explicar Detalhadamente'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-200 max-h-80 overflow-y-auto custom-scrollbar">
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
