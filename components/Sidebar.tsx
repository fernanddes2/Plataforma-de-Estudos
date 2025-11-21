import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, BookOpen, Bot, Zap, LogOut, GraduationCap, FileText, X } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose }) => {
  const navItems = [
    { view: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { view: ViewState.QUESTION_BANK, label: 'Banco de Questões', icon: BookOpen },
    { view: ViewState.LEARNING, label: 'Conteúdos & Aulas', icon: GraduationCap },
    { view: ViewState.EXAMS, label: 'Provas Anteriores', icon: FileText },
    { view: ViewState.AI_TUTOR, label: 'Tutor IA', icon: Bot },
  ];

  const handleNavClick = (view: ViewState) => {
    onNavigate(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:h-screen lg:shadow-none shadow-2xl
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-primary-600">
            <Zap className="w-8 h-8 fill-current" />
            <span className="text-2xl font-bold tracking-tight">Electro<span className="text-secondary-900">Mind</span></span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-secondary-900 text-white shadow-md transform scale-[1.02]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-secondary-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100 bg-gray-50">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;