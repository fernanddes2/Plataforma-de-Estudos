import React from 'react';
import { UserStats, ViewState } from '../types';
import { Award, BookOpen, Flame, Target, TrendingUp } from 'lucide-react';
// Agora o Recharts vai funcionar pois adicionamos no package.json
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  stats: UserStats;
  lastUpdate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, stats, lastUpdate }) => {
  // Prepara dados para o gráfico (evita quebrar se estiver vazio)
  const chartData = stats.topicPerformance.length > 0 
    ? stats.topicPerformance 
    : [{ topic: 'Geral', score: 0 }];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Bem-vindo de volta! Aqui está seu progresso em Engenharia Elétrica.
          </p>
        </div>
        <div className="text-sm text-gray-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
            Última atualização: {lastUpdate}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.questionsSolved}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Questões Resolvidas</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.accuracy}%</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Precisão Geral</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.streakDays}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Dias em Ofensiva</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Nível 3</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Engenheiro Júnior</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            Desempenho por Tópico
          </h3>
        </div>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis 
                        dataKey="topic" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        // CORREÇÃO: Adicionada tipagem explicita (value: string)
                        tickFormatter={(value: string) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                    />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
            onClick={() => onNavigate(ViewState.QUESTION_BANK)}
            className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left group"
        >
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-100 transition-colors">Praticar Agora</h3>
            <p className="text-blue-100 opacity-90">Resolver questões de provas anteriores e fixação.</p>
        </button>
        <button 
            onClick={() => onNavigate(ViewState.AI_TUTOR)}
            className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all text-left group"
        >
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Tirar Dúvida com IA</h3>
            <p className="text-gray-500 dark:text-gray-400">Pergunte ao ElectroBot sobre qualquer matéria.</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;