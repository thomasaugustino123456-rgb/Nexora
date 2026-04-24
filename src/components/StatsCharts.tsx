import React from 'react';
import { subDays, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailyProgress } from '../types';

export function StatsCharts({ history }: { history: DailyProgress[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = history.find(h => h.date === dateStr);
    return {
      name: format(date, 'EEE'),
      water: dayData?.waterDrank || 0,
    };
  });

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest mb-6">Hydration Stats</h3>
      <div className="h-48 w-full">
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
  );
}
