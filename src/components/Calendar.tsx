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
        <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest">Activity Calendar</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subDays(monthStart, 1))} className="p-1 hover:bg-blue-50 rounded-md text-blue-400">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-blue-900/60 min-w-[100px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentDate(subDays(monthEnd, -1))} className="p-1 hover:bg-blue-50 rounded-md text-blue-400">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[10px] font-black text-blue-900/20 text-center py-2">{d}</div>
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
              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                dayData?.completed 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : isToday 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-blue-900/30 hover:bg-blue-50/50'
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
