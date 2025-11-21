import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import QuestionMode from './components/QuestionMode';
import QuestionBank from './components/QuestionBank';
import AIChat from './components/AIChat';
import LearningMode from './components/LearningMode';
import ExamArchive from './components/ExamArchive';
import { ViewState } from './types';
import { MOCK_STATS } from './constants';
import { Menu, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('electroMindTheme') === 'dark' ||
        (!localStorage.getItem('electroMindTheme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Local Storage Stats (Dashboard)
  const [stats, setStats] = useState(() => {
      try {
        const saved = localStorage.getItem('electroMindStats');
        return saved ? JSON.parse(saved) : MOCK_STATS;
      } catch (e) {
        return MOCK_STATS;
      }
  });

  // Local Storage Learning Progress
  const [learningProgress, setLearningProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('electroMindLearning');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('electroMindTheme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('electroMindTheme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
      localStorage.setItem('electroMindStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
      localStorage.setItem('electroMindLearning', JSON.stringify(learningProgress));
  }, [learningProgress]);

  const handleUpdateStats = (isCorrect: boolean) => {
    setStats((prev: any) => {
        const newSolved = prev.questionsSolved + 1;
        const oldCorrect = Math.round((prev.accuracy / 100) * prev.questionsSolved);
        const newCorrect = oldCorrect + (isCorrect ? 1 : 0);
        const newAccuracy = Math.round((newCorrect / newSolved) * 100);

        return {
            ...prev,
            questionsSolved: newSolved,
            accuracy: isNaN(newAccuracy) ? 0 : newAccuracy,
            streakDays: prev.streakDays 
        };
    });
  };

  const handleUpdateLearningProgress = (moduleId: string, progress: number) => {
    setLearningProgress(prev => ({
      ...prev,
      [moduleId]: progress
    }));
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view !== ViewState.QUIZ_ACTIVE) {
        setSelectedTopic(null);
        setIsExamMode(false);
    }
    setIsSidebarOpen(false);
  };

  const handleStartQuiz = (topic: string) => {
    setSelectedTopic(topic);
    setIsExamMode(false);
    setCurrentView(ViewState.QUIZ_ACTIVE);
  };

  const handleStartExam = (subject: string, university: string) => {
    setSelectedTopic(`${subject} (${university})`);
    setIsExamMode(true);
    setCurrentView(ViewState.QUIZ_ACTIVE);
  };

  const handleExitQuiz = () => {
    setCurrentView(ViewState.QUESTION_BANK);
    setSelectedTopic(null);
    setIsExamMode(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard onNavigate={handleNavigate} />;
      case ViewState.QUESTION_BANK:
        return <QuestionBank onStartQuiz={handleStartQuiz} />;
      case ViewState.LEARNING:
        return (
          <LearningMode 
            learningProgress={learningProgress}
            onUpdateProgress={handleUpdateLearningProgress}
          />
        );
      case ViewState.EXAMS:
        return <ExamArchive onStartExam={handleStartExam} />;
      case ViewState.AI_TUTOR:
        return <AIChat />;
      case ViewState.QUIZ_ACTIVE:
        return (
          <QuestionMode 
            topicName={selectedTopic || "Geral"} 
            isExamMode={isExamMode}
            onExit={handleExitQuiz} 
            onUpdateStats={handleUpdateStats}
          />
        );
      case ViewState.STATS:
         return <Dashboard onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 relative flex flex-col w-full max-w-[100vw] overflow-x-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
            <Zap className="w-6 h-6 fill-current" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Electro<span className="text-secondary-900 dark:text-primary-400">Mind</span></span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;