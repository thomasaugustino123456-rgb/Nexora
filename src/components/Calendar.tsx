import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { format, subDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { DailyProgress } from '../types';

export function Calendar({ history }: { history: DailyProgress[] }) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest italic">Activity Calendar</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subDays(monthStart, 1))} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black text-blue-900 min-w-[120px] text-center uppercase tracking-tight">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentDate(subDays(monthEnd, -1))} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[11px] font-black text-blue-900/40 text-center py-2">{d}</div>
        ))}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayData = history.find(h => h.date === dateStr);
          const isToday = isSameDay(day, new Date());
          return (
            <div 
              key={dateStr}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-black transition-all ${
                dayData?.completed 
                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
                  : isToday 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                    : 'text-blue-900/40 hover:bg-blue-100 hover:text-blue-900'
              }`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
