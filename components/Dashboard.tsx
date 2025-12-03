import React from 'react';
import { ViewState, UserStats } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Trophy, Target, Flame, ArrowRight, Activity, Clock, FolderOpen, ExternalLink } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  stats: UserStats;
  lastUpdate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, stats, lastUpdate }) => {
  
  return (
    <div className="p-8 2xl:p-12 max-w-screen-2xl 2xl:max-w-[1800px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8 2xl:mb-12">
        <div>
            <h1 className="text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 2xl:text-lg">Bem-vindo de volta! Aqui está seu progresso.</p>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" /> Última atualização
            </p>
            <p className="font-medium text-gray-700 dark:text-gray-300">{lastUpdate}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 2xl:gap-8 mb-8 2xl:mb-12">
        <div className="bg-white dark:bg-slate-800 p-6 2xl:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-4 transition-colors">
            <div className="p-4 2xl:p-5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <Trophy className="w-8 h-8 2xl:w-10 2xl:h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <p className="text-sm 2xl:text-base text-gray-500 dark:text-gray-400 font-medium">Questões Resolvidas</p>
                <h3 className="text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white">{stats.questionsSolved}</h3>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 2xl:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-4 transition-colors">
            <div className="p-4 2xl:p-5 bg-green-50 dark:bg-green-900/30 rounded-xl">
                <Target className="w-8 h-8 2xl:w-10 2xl:h-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
                <p className="text-sm 2xl:text-base text-gray-500 dark:text-gray-400 font-medium">Precisão Global</p>
                <h3 className="text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white">{stats.accuracy}%</h3>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 2xl:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-4 transition-colors">
            <div className="p-4 2xl:p-5 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                <Flame className="w-8 h-8 2xl:w-10 2xl:h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
                <p className="text-sm 2xl:text-base text-gray-500 dark:text-gray-400 font-medium">Dias de Ofensiva</p>
                <h3 className="text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white">{stats.streakDays}</h3>
            </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 2xl:gap-12 mb-8">
        
        {/* Topic Performance Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 2xl:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors flex flex-col">
            <h3 className="text-lg 2xl:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 2xl:w-6 2xl:h-6 mr-2 text-primary-500" />
                Desempenho por Tópico
            </h3>
            <div className="h-72 2xl:h-96 flex-1">
                {stats.topicPerformance && stats.topicPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topicPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.1} />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis 
                                dataKey="topic" 
                                type="category" 
                                width={140} 
                                tick={{ fontSize: 13, fill: '#64748b' }} 
                                tickFormatter={(value) => value.length > 18 ? `${value.substring(0, 18)}...` : value}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                                cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="score" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-center p-4 border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-xl">
                        <p>Resolva questões para gerar gráficos de desempenho.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6 2xl:space-y-8">
            
            {/* Drive Access Card (New) */}
            <a 
                href="https://drive.google.com/drive/folders/0B5t8V5qZUOqpc3JUX1dGSGc1SUk?resourcekey=0-0ZFBc1gjxduqPlYrLzPaLA&usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-between group"
            >
                <div>
                    <h3 className="text-xl font-bold mb-1 flex items-center">
                        <FolderOpen className="w-5 h-5 mr-2" /> Acervo Digital
                    </h3>
                    <p className="text-emerald-100 text-sm">Acesse PDFs de livros (Sadiku, Halliday) e listas de exercícios.</p>
                </div>
                <ExternalLink className="w-6 h-6 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>

            <div className="bg-gradient-to-br from-secondary-900 to-slate-800 rounded-2xl p-8 2xl:p-10 text-white shadow-lg relative overflow-hidden flex-1 flex flex-col justify-center">
                <div className="relative z-10">
                    <h3 className="text-2xl 2xl:text-3xl font-bold mb-2">Continue Estudando</h3>
                    <p className="text-gray-300 mb-6 2xl:mb-8 max-w-md 2xl:text-lg">
                        {stats.questionsSolved === 0 
                            ? "Comece sua jornada resolvendo sua primeira questão no Banco de Questões." 
                            : "Que tal resolver mais algumas questões para manter o ritmo?"}
                    </p>
                    <button 
                        onClick={() => onNavigate(ViewState.QUESTION_BANK)}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 2xl:px-8 2xl:py-4 rounded-xl font-bold transition-colors flex items-center shadow-lg text-sm 2xl:text-base"
                    >
                        Ir para Banco de Questões <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 pointer-events-none">
                    <Target className="w-64 h-64 2xl:w-80 2xl:h-80" />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 2xl:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                 <h3 className="text-lg 2xl:text-xl font-bold text-gray-900 dark:text-white mb-4">Atalhos Rápidos</h3>
                 <div className="grid grid-cols-2 gap-4 2xl:gap-6">
                    <button 
                        onClick={() => onNavigate(ViewState.AI_TUTOR)}
                        className="p-4 2xl:p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left group"
                    >
                        <span className="block text-blue-600 dark:text-blue-400 font-bold mb-1 group-hover:translate-x-1 transition-transform">Tutor IA</span>
                        <span className="text-xs 2xl:text-sm text-blue-800 dark:text-blue-300">Tirar dúvidas agora</span>
                    </button>
                    <button 
                        onClick={() => onNavigate(ViewState.EXAMS)}
                        className="p-4 2xl:p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left group"
                    >
                        <span className="block text-purple-600 dark:text-purple-400 font-bold mb-1 group-hover:translate-x-1 transition-transform">Simulados</span>
                        <span className="text-xs 2xl:text-sm text-purple-800 dark:text-purple-300">Provas UFF/Estácio</span>
                    </button>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
