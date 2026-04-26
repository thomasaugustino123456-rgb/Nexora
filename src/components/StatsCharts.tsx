import React from 'react';
import { subDays, format, parseISO } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { DailyProgress } from '../types';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

export function StatsCharts({ history }: { history: DailyProgress[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = history.find(h => h.date === dateStr);
    return {
      name: format(date, 'EEE'),
      water: dayData?.waterDrank || 0,
      points: dayData?.completed ? 100 : (dayData?.completionsCount || 0) * 10,
    };
  });

  const totalTasks = history.reduce((acc, curr) => {
    if (curr.pushupsDone) acc.pushups++;
    if (curr.waterDrank > 0) acc.water++;
    if (curr.breathingDone) acc.breathing++;
    if (curr.drawingDone) acc.drawing++;
    if (curr.footballDone) acc.football++;
    if (curr.bubblesDone) acc.bubbles++;
    return acc;
  }, { pushups: 0, water: 0, breathing: 0, drawing: 0, football: 0, bubbles: 0 });

  const pieData = [
    { name: 'Physical', value: totalTasks.pushups + totalTasks.football, color: '#f87171' },
    { name: 'Mental', value: totalTasks.breathing + totalTasks.bubbles, color: '#60a5fa' },
    { name: 'Creative', value: totalTasks.drawing, color: '#34d399' },
    { name: 'Hydration', value: totalTasks.water, color: '#818cf8' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Line Chart: Performance Trend */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-500" size={18} />
          <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Volt Output Trend</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f9ff" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 800, fill: '#1e3a8a', opacity: 0.3 }}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart: Hydration */}
        <div className="glass-card p-6">
          <h3 className="text-[10px] font-black text-blue-900/30 uppercase tracking-widest mb-6">Hydration Efficiency</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#1e3a8a', opacity: 0.3 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="water" radius={[4, 4, 0, 0]}>
                  {last7Days.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.water >= 2 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Discipline Mix */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="text-purple-500" size={18} />
            <h3 className="text-[10px] font-black text-blue-900/30 uppercase tracking-widest">Discipline Allocation</h3>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={30}
                  iconType="circle"
                  formatter={(value) => <span className="text-[8px] font-black text-blue-900/40 uppercase tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
