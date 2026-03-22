import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { DailyProgress } from '../types';

interface DashboardProps {
  history: DailyProgress[];
}

export const Calendar: React.FC<DashboardProps> = ({ history }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDayStatus = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const entry = history.find(h => h.date === dateStr);
    return entry?.completed || false;
  };

  return (
    <div className="glass-card p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-blue-500" size={20} />
          <h3 className="text-lg font-bold text-blue-900/80">Activity Calendar</h3>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-1 hover:bg-blue-50 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-blue-900/40" />
          </button>
          <span className="text-sm font-bold text-blue-900/60 min-w-[100px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-blue-50 rounded-full transition-colors">
            <ChevronRight size={20} className="text-blue-900/40" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-blue-900/20 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, i) => {
          const isActive = getDayStatus(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDay = isToday(day);

          return (
            <div 
              key={i}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all relative
                ${!isCurrentMonth ? 'opacity-10' : 'opacity-100'}
                ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105' : 'bg-blue-50/50 text-blue-900/40'}
                ${isTodayDay && !isActive ? 'border-2 border-blue-400' : ''}
              `}
            >
              {format(day, 'd')}
              {isActive && (
                <div className="absolute -top-1 -right-1 text-[10px]">✨</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const StatsCharts: React.FC<DashboardProps> = ({ history }) => {
  // Line Chart Data: Last 7 days completion
  const lineData = history.slice(-7).map(h => ({
    name: format(parseISO(h.date), 'EEE'),
    completed: h.completed ? 1 : 0,
    points: h.completed ? 10 : 0
  }));

  // Pie Chart Data: Task Distribution (Total across history)
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
    { name: 'Pushups', value: totalTasks.pushups, color: '#3B82F6' },
    { name: 'Water', value: totalTasks.water, color: '#60A5FA' },
    { name: 'Breathing', value: totalTasks.breathing, color: '#93C5FD' },
    { name: 'Drawing', value: totalTasks.drawing, color: '#A855F7' },
    { name: 'Football', value: totalTasks.football, color: '#EC4899' },
    { name: 'Bubbles', value: totalTasks.bubbles, color: '#F43F5E' },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-500" size={20} />
          <h3 className="text-lg font-bold text-blue-900/80">Points Trend</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0F2FF" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#1E3A8A', fontSize: 12, opacity: 0.4 }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="#3B82F6" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieIcon className="text-purple-500" size={20} />
          <h3 className="text-lg font-bold text-blue-900/80">Activity Mix</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
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
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-bold text-blue-900/40 uppercase">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
