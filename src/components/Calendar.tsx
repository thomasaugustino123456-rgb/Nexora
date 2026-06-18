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
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
          <div key={`${d}-${index}`} className="text-[11px] font-black text-blue-900/40 text-center py-2">{d}</div>
        ))}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayData = history.find(h => h.date === dateStr);
          const isToday = isSameDay(day, new Date());
          
          const hasCustom = !!dayData?.customPlanCompleted;
          const hasOfficial = !!dayData?.completed;
          const isActive = hasCustom || hasOfficial;

          return (
            <div 
              key={dateStr}
              className={`aspect-square rounded-xl flex flex-col items-center justify-between py-1 px-0.5 relative transition-all duration-300 transform hover:scale-105 select-none ${
                isToday 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : isActive
                    ? 'bg-slate-50 border border-indigo-100/60 text-slate-800'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {/* Date number */}
              <span className={`text-[11px] font-black tracking-tight ${isToday ? 'mt-1' : 'mt-1.5'}`}>
                {day.getDate()}
              </span>

              {/* Budged Lights Indicator at the bottom */}
              <div className="flex items-center justify-center gap-1.5 h-3 mb-0.5">
                {hasCustom && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_2px_rgba(244,63,94,0.6)] animate-pulse" 
                    title="User Custom Plan Completed"
                  />
                )}
                {hasOfficial && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.6)] animate-pulse" 
                    title="Official Challenge Completed"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Legend and Micro UI */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
          <span>Custom Plan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          <span>Official App</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-1" />
          <span>Both Done</span>
        </div>
      </div>
    </div>
  );
}
