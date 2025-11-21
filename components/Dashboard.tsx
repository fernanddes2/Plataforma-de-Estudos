import React from 'react';
import { UserStats, ViewState } from '../types';
import { MOCK_STATS } from '../constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Trophy, Target, Flame, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const stats = MOCK_STATS;

  const pieData = [
    { name: 'Acertos', value: stats.accuracy },
    { name: 'Erros', value: 100 - stats.accuracy },
  ];
  const COLORS = ['#0ea5e9', '#e2e8f0'];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Olá, Engenheiro</h1>
          <p className="text-gray-500 mt-1">Vamos continuar seus estudos em sistemas elétricos hoje?</p>
        </div>
        <button 
            onClick={() => onNavigate(ViewState.QUESTION_BANK)}
            className="bg-secondary-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium flex items-center transition-colors shadow-lg hover:shadow-xl"
        >
          Continuar Praticando <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </header>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 rounded-xl">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Questões Resolvidas</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.questionsSolved}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-green-50 rounded-xl">
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Precisão Geral</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.accuracy}%</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-orange-50 rounded-xl">
            <Flame className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sequência de Dias</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.streakDays} dias</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Desempenho por Tópico</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topicPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="topic" type="category" width={120} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Pie */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-900 mb-4 w-full text-left">Precisão Total</h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-900">{stats.accuracy}%</span>
                <span className="text-xs text-gray-400 font-medium uppercase">Acertos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;