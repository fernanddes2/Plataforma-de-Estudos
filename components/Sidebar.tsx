import React from 'react';
import { ViewState } from '../types';
import { Book, BrainCircuit, LayoutDashboard, Library, MessageSquare } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose, isDarkMode, toggleTheme }) => {
  const menuItems = [
    { view: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { view: ViewState.QUESTION_BANK, label: 'Banco de Questões', icon: Library },
    { view: ViewState.AI_TUTOR, label: 'Tutor IA', icon: MessageSquare },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 font-bold text-2xl text-blue-600">ElectroMind</div>
        <nav className="px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${currentView === item.view ? 'bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t dark:border-slate-700">
            <button onClick={toggleTheme} className="w-full py-2 bg-gray-100 dark:bg-slate-700 rounded text-sm dark:text-white">
                {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;