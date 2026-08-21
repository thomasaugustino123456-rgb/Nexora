import React, { useState, useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { DailyProgress, UserStats, UserSettings } from '../types';
import { TrendingUp, PieChart as PieIcon, Droplets, Zap, Dumbbell, BrainCircuit, Palette } from 'lucide-react';

function calculatePointsForDay(day: DailyProgress): number {
  let pts = 0;
  if (day.pushupsDone) pts += 40;
  if (day.waterDrank > 0) pts += Math.min(8, day.waterDrank) * 15;
  if (day.breathingDone) pts += 45;
  if (day.drawingDone) pts += 50;
  if (day.footballDone) pts += 40;
  if (day.bubblesDone) pts += 35;
  if (day.memoryDone) pts += 45;
  if (day.reactionDone) pts += 45;
  if (day.gratitudeDone) pts += 35;
  if (day.meditationDone) pts += 50;
  if (day.writingDone) pts += 50;
  
  if (day.completed) {
    pts += 100 * (day.completionsCount || 1);
  }
  return pts;
}

// Generate smooth cubic bezier SVG path from a set of 2D points
function getSmoothCurvePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let path = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || current;
    const nextNext = points[i + 2] || next;

    const cp1x = current.x + (next.x - prev.x) / 6;
    const cp1y = current.y + (next.y - prev.y) / 6;

    const cp2x = next.x - (nextNext.x - current.x) / 6;
    const cp2y = next.y - (nextNext.y - current.y) / 6;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
  }

  return path;
}

export function StatsCharts({ 
  history = [], 
  stats, 
  dailyProgress, 
  settings 
}: { 
  history: DailyProgress[]; 
  stats?: UserStats; 
  dailyProgress?: DailyProgress; 
  settings?: UserSettings; 
}) {
  const [activeVoltIndex, setActiveVoltIndex] = useState<number | null>(6);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(6);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // 1. Prepare 7-day chronological data with seamless live-progress blending
  const last7Days = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      let dayData = history?.find(h => h.date === dateStr);
      
      const isToday = dateStr === todayStr;
      if (isToday) {
        dayData = {
          ...(dayData || {}),
          date: todayStr,
          completed: dayData?.completed || dailyProgress?.completed || false,
          completionsCount: dayData?.completionsCount || dailyProgress?.completionsCount || 0,
          pushupsDone: dayData?.pushupsDone || dailyProgress?.pushupsDone || false,
          waterDrank: typeof dailyProgress?.waterDrank === 'number' ? dailyProgress.waterDrank : (dayData?.waterDrank || 0),
          breathingDone: dayData?.breathingDone || dailyProgress?.breathingDone || false,
          drawingDone: dayData?.drawingDone || dailyProgress?.drawingDone || false,
          footballDone: dayData?.footballDone || dailyProgress?.footballDone || false,
          bubblesDone: dayData?.bubblesDone || dailyProgress?.bubblesDone || false,
          memoryDone: dayData?.memoryDone || dailyProgress?.memoryDone || false,
          gratitudeDone: dayData?.gratitudeDone || dailyProgress?.gratitudeDone || false,
          reactionDone: dayData?.reactionDone || dailyProgress?.reactionDone || false,
          meditationDone: dayData?.meditationDone || dailyProgress?.meditationDone || false,
          writingDone: dayData?.writingDone || dailyProgress?.writingDone || false,
        } as DailyProgress;
      }

      let rawWater = dayData?.waterDrank || 0;
      let points = 0;
      const isRealData = dayData !== undefined;

      if (isRealData && dayData) {
        points = calculatePointsForDay(dayData);
      }

      // Fallback synthetic baseline for newly created accounts to maintain visual structure
      if (!isRealData || (!history || history.length < 2)) {
        if (isToday) {
          if (points === 0) {
            const activePoints = stats?.totalPoints || 120;
            points = Math.max(35, Math.round((activePoints / 7) + (i * 6)));
          }
          if (rawWater === 0) {
            const savedLevel = parseFloat(typeof window !== 'undefined' ? (localStorage.getItem('hydration_water_level') || '0.0') : '0.0');
            rawWater = savedLevel > 0 ? savedLevel * 8 : 2.5;
          }
        } else {
          const activePoints = stats?.totalPoints || 120;
          const basePoints = Math.max(20, activePoints / 8);
          const wave = Math.sin(i * 1.5) * 15 + Math.cos(i * 2.2) * 10;
          points = Math.max(25, Math.round(basePoints + (i * 18) + wave));

          const activeStreak = stats?.streak || 1;
          const baseWater = Math.max(1.5, (activeStreak * 0.4) + (i % 3 === 0 ? 1 : 0.5));
          rawWater = Math.max(1, Math.round(baseWater + (i % 2 === 0 ? 1.2 : 0)));
        }
      }

      // Safe normalization: If user inputted milliliters (e.g. 4015 ml), convert to glasses (~250ml per glass)
      const normalizedWater = rawWater > 30 ? parseFloat((rawWater / 250).toFixed(1)) : parseFloat(rawWater.toFixed(1));
      const waterLiters = rawWater > 30 ? (rawWater / 1000).toFixed(2) + ' L' : (normalizedWater * 0.25).toFixed(1) + ' L';

      return {
        name: format(date, 'EEE'),
        fullDate: format(date, 'MMM d'),
        water: normalizedWater,
        waterDisplay: waterLiters,
        rawWater,
        points,
        completed: dayData?.completed || false,
      };
    });
  }, [history, dailyProgress, stats]);

  // 2. Discipline allocation calculations
  const totalTasks = useMemo(() => {
    const acc = { pushups: 0, water: 0, breathing: 0, drawing: 0, football: 0, bubbles: 0, mentalOther: 0, creativeOther: 0 };
    (history || []).forEach(curr => {
      if (curr.pushupsDone) acc.pushups++;
      if (curr.waterDrank > 0) acc.water += curr.waterDrank > 30 ? curr.waterDrank / 250 : curr.waterDrank;
      if (curr.breathingDone) acc.breathing++;
      if (curr.drawingDone) acc.drawing++;
      if (curr.footballDone) acc.football++;
      if (curr.bubblesDone) acc.bubbles++;
      if (curr.memoryDone) acc.mentalOther++;
      if (curr.gratitudeDone) acc.mentalOther++;
      if (curr.reactionDone) acc.mentalOther++;
      if (curr.meditationDone) acc.mentalOther++;
      if (curr.writingDone) acc.creativeOther++;
    });

    if (dailyProgress) {
      if (dailyProgress.pushupsDone) acc.pushups++;
      if (dailyProgress.waterDrank > 0) acc.water += dailyProgress.waterDrank > 30 ? dailyProgress.waterDrank / 250 : dailyProgress.waterDrank;
      if (dailyProgress.breathingDone) acc.breathing++;
      if (dailyProgress.drawingDone) acc.drawing++;
      if (dailyProgress.footballDone) acc.football++;
      if (dailyProgress.bubblesDone) acc.bubbles++;
      if (dailyProgress.memoryDone) acc.mentalOther++;
      if (dailyProgress.gratitudeDone) acc.mentalOther++;
      if (dailyProgress.reactionDone) acc.mentalOther++;
      if (dailyProgress.meditationDone) acc.mentalOther++;
      if (dailyProgress.writingDone) acc.creativeOther++;
    }
    return acc;
  }, [history, dailyProgress]);

  const totalPhysical = stats?.pointsByCategory?.physical || 0;
  const totalMental = stats?.pointsByCategory?.mental || 0;
  const totalCreative = stats?.pointsByCategory?.creative || 0;
  
  const valPhysical = Math.max(40, (totalTasks.pushups * 40) + (totalTasks.football * 40) || totalPhysical || 80);
  const valMental = Math.max(35, (totalTasks.breathing * 45) + (totalTasks.bubbles * 35) + (totalTasks.mentalOther * 45) || totalMental || 65);
  const valCreative = Math.max(30, (totalTasks.drawing * 50) + (totalTasks.creativeOther * 50) || totalCreative || 50);
  const valHydration = Math.max(25, Math.round(totalTasks.water * 15) || (stats?.streak ? stats.streak * 20 : 35));

  const totalAllVolts = valPhysical + valMental + valCreative + valHydration;

  const pieData = useMemo(() => [
    { name: 'Physical (Rigor)', shortName: 'Physical', value: valPhysical, color: '#69C496', icon: Dumbbell },
    { name: 'Mental (Clarity)', shortName: 'Mental', value: valMental, color: '#7D6B58', icon: BrainCircuit },
    { name: 'Creative (Flow)', shortName: 'Creative', value: valCreative, color: '#A39587', icon: Palette },
    { name: 'Hydration (Water)', shortName: 'Hydration', value: valHydration, color: '#0EA5E9', icon: Droplets },
  ], [valPhysical, valMental, valCreative, valHydration]);

  // 3. SVG Monotone Curve Calculations for Volt Output Trend
  const voltChartConfig = useMemo(() => {
    const width = 500;
    const height = 180;
    const paddingLeft = 32;
    const paddingRight = 32;
    const paddingTop = 24;
    const paddingBottom = 34;

    const usableWidth = width - paddingLeft - paddingRight;
    const usableHeight = height - paddingTop - paddingBottom;

    const maxPts = Math.max(120, ...last7Days.map(d => d.points));
    const minPts = 0;
    const range = maxPts - minPts || 1;

    const points = last7Days.map((d, index) => {
      const x = paddingLeft + (index / (last7Days.length - 1)) * usableWidth;
      const normalizedY = (d.points - minPts) / range;
      const y = paddingTop + usableHeight - (normalizedY * usableHeight);
      return { x, y, data: d };
    });

    const curvePath = getSmoothCurvePath(points);
    const areaPath = points.length > 0
      ? `${curvePath} L ${points[points.length - 1].x},${paddingTop + usableHeight} L ${points[0].x},${paddingTop + usableHeight} Z`
      : '';

    return { width, height, points, curvePath, areaPath, paddingTop, paddingBottom, usableHeight, maxPts };
  }, [last7Days]);

  // 4. Bar Chart Calculations for Hydration Efficiency
  const hydrationConfig = useMemo(() => {
    const width = 360;
    const height = 150;
    const paddingLeft = 20;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 28;

    const usableWidth = width - paddingLeft - paddingRight;
    const usableHeight = height - paddingTop - paddingBottom;
    const slotWidth = usableWidth / last7Days.length;
    const barWidth = 18;

    const targetGoal = settings?.commitmentLevel === 'casual' ? 4 : settings?.commitmentLevel === 'intense' ? 10 : (settings?.waterGoal || 8);
    const maxVal = Math.max(targetGoal * 1.2, ...last7Days.map(d => d.water), 6);

    const bars = last7Days.map((d, index) => {
      const centerX = paddingLeft + index * slotWidth + slotWidth / 2;
      const x = centerX - barWidth / 2;
      const barH = Math.max(6, (d.water / maxVal) * usableHeight);
      const y = paddingTop + usableHeight - barH;
      return { x, y, width: barWidth, height: barH, centerX, data: d };
    });

    const goalY = paddingTop + usableHeight - (targetGoal / maxVal) * usableHeight;

    return { width, height, bars, goalY, targetGoal, paddingTop, paddingBottom, usableHeight };
  }, [last7Days, settings]);

  // 5. SVG Donut Arc Segments
  const donutSegments = useMemo(() => {
    const size = 160;
    const center = size / 2;
    const radius = 55;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;
    return pieData.map((slice, idx) => {
      const percent = slice.value / totalAllVolts;
      const strokeDasharray = `${percent * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += percent;

      return {
        ...slice,
        idx,
        percent: Math.round(percent * 100),
        strokeDasharray,
        strokeDashoffset,
        radius,
        strokeWidth,
        center,
        size
      };
    });
  }, [pieData, totalAllVolts]);

  const activeVoltData = activeVoltIndex !== null ? last7Days[activeVoltIndex] : null;
  const activeBarData = activeBarIndex !== null ? last7Days[activeBarIndex] : null;
  const activeDonut = activePieIndex !== null ? pieData[activePieIndex] : null;

  return (
    <div className="space-y-6">
      {/* 1. Line Chart: Volt Output Trend */}
      <div className="bg-white border border-[#E9E4D4] rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#69C496]/10 flex items-center justify-center text-[#69C496]">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#4F3F34] uppercase tracking-widest">Volt Output Trend</h3>
              <p className="text-[10px] text-[#7D6B58] font-medium">7-Day energetic momentum & completions</p>
            </div>
          </div>
          {activeVoltData && (
            <motion.div 
              key={activeVoltData.name}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-right"
            >
              <div className="text-sm font-black text-[#69C496] flex items-center justify-end gap-1">
                <span>{activeVoltData.points}</span>
                <span className="text-[10px] text-[#4F3F34]/60 font-bold uppercase tracking-wider">VOLTS</span>
              </div>
              <p className="text-[9px] text-[#7D6B58] font-bold">{activeVoltData.fullDate} ({activeVoltData.name})</p>
            </motion.div>
          )}
        </div>

        {/* Custom High-Performance SVG Monotone Line Chart */}
        <div className="w-full relative touch-pan-y">
          <svg 
            viewBox={`0 0 ${voltChartConfig.width} ${voltChartConfig.height}`} 
            className="w-full h-44 overflow-visible select-none"
          >
            <defs>
              <linearGradient id="voltAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#69C496" stopOpacity="0.38" />
                <stop offset="65%" stopColor="#69C496" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#69C496" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="voltLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#52B788" />
                <stop offset="50%" stopColor="#69C496" />
                <stop offset="100%" stopColor="#80ED99" />
              </linearGradient>
              <filter id="voltGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#69C496" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Subtle horizontal grid lines */}
            {[0.2, 0.5, 0.8].map((ratio, idx) => {
              const y = voltChartConfig.paddingTop + voltChartConfig.usableHeight * ratio;
              return (
                <line 
                  key={idx}
                  x1="24" 
                  y1={y} 
                  x2={voltChartConfig.width - 24} 
                  y2={y} 
                  stroke="rgba(79, 63, 52, 0.07)" 
                  strokeDasharray="4 4" 
                  strokeWidth="1"
                />
              );
            })}

            {/* Glowing Gradient Area */}
            {voltChartConfig.areaPath && (
              <motion.path
                d={voltChartConfig.areaPath}
                fill="url(#voltAreaGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}

            {/* Main Smooth Monotone Stroke */}
            {voltChartConfig.curvePath && (
              <motion.path
                d={voltChartConfig.curvePath}
                fill="none"
                stroke="url(#voltLineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#voltGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
            )}

            {/* Interactive Data Points & Day Labels */}
            {voltChartConfig.points.map((pt, idx) => {
              const isSelected = activeVoltIndex === idx;
              return (
                <g key={idx} className="cursor-pointer" onClick={() => setActiveVoltIndex(idx)}>
                  {/* Invisible broad tap target */}
                  <rect
                    x={pt.x - 20}
                    y={voltChartConfig.paddingTop}
                    width={40}
                    height={voltChartConfig.usableHeight + 30}
                    fill="transparent"
                  />

                  {/* Vertical highlight cursor */}
                  {isSelected && (
                    <line
                      x1={pt.x}
                      y1={voltChartConfig.paddingTop}
                      x2={pt.x}
                      y2={voltChartConfig.paddingTop + voltChartConfig.usableHeight}
                      stroke="#69C496"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.65"
                    />
                  )}

                  {/* Animated outer ring on select */}
                  {isSelected && (
                    <motion.circle
                      cx={pt.x}
                      cy={pt.y}
                      r="10"
                      fill="#69C496"
                      initial={{ scale: 0, opacity: 0.4 }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                    />
                  )}

                  {/* Point core */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6 : 4.5}
                    fill="#69C496"
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 2.5 : 2}
                    className="transition-all duration-200"
                  />

                  {/* Day Label */}
                  <text
                    x={pt.x}
                    y={voltChartConfig.height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isSelected ? "900" : "700"}
                    fill={isSelected ? "#69C496" : "#4F3F34"}
                    opacity={isSelected ? 1 : 0.65}
                    className="transition-colors select-none"
                  >
                    {pt.data.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Bar Chart: Hydration Efficiency */}
        <div className="bg-white border border-[#E9E4D4] rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]">
                <Droplets size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#4F3F34] uppercase tracking-widest">Hydration Efficiency</h3>
                <p className="text-[9px] text-[#7D6B58] font-medium">Daily water intake vs target</p>
              </div>
            </div>
            {activeBarData && (
              <div className="text-right">
                <span className="text-xs font-black text-[#0EA5E9]">{activeBarData.waterDisplay}</span>
                <p className="text-[9px] text-[#7D6B58] font-bold">({activeBarData.water} glasses)</p>
              </div>
            )}
          </div>

          <div className="w-full relative">
            <svg 
              viewBox={`0 0 ${hydrationConfig.width} ${hydrationConfig.height}`} 
              className="w-full h-36 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="barActiveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
                <linearGradient id="barNormalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#69C496" />
                  <stop offset="100%" stopColor="#52B788" />
                </linearGradient>
                <linearGradient id="barMutedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4E4DC" />
                  <stop offset="100%" stopColor="#BACBBF" />
                </linearGradient>
              </defs>

              {/* Target goal dashed reference line */}
              <line
                x1="12"
                y1={hydrationConfig.goalY}
                x2={hydrationConfig.width - 12}
                y2={hydrationConfig.goalY}
                stroke="#0EA5E9"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.45"
              />

              {/* Animated Bars */}
              {hydrationConfig.bars.map((bar, idx) => {
                const isSelected = activeBarIndex === idx;
                const isGoalMet = bar.data.water >= hydrationConfig.targetGoal;
                const fill = isSelected ? "url(#barActiveGrad)" : isGoalMet ? "url(#barNormalGrad)" : "url(#barMutedGrad)";

                return (
                  <g key={idx} className="cursor-pointer" onClick={() => setActiveBarIndex(idx)}>
                    {/* Broad tap target */}
                    <rect
                      x={bar.centerX - 16}
                      y={0}
                      width={32}
                      height={hydrationConfig.height}
                      fill="transparent"
                    />

                    {/* Background track */}
                    <rect
                      x={bar.x}
                      y={hydrationConfig.paddingTop}
                      width={bar.width}
                      height={hydrationConfig.usableHeight}
                      rx={6}
                      fill="#F4EFE6"
                      opacity="0.6"
                    />

                    {/* Active Animated Fill Bar */}
                    <motion.rect
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      rx={6}
                      fill={fill}
                      initial={{ height: 0, y: hydrationConfig.paddingTop + hydrationConfig.usableHeight }}
                      animate={{ height: bar.height, y: bar.y }}
                      transition={{ duration: 0.6, delay: idx * 0.06, ease: "backOut" }}
                    />

                    {/* Day label */}
                    <text
                      x={bar.centerX}
                      y={hydrationConfig.height - 6}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isSelected ? "900" : "700"}
                      fill={isSelected ? "#0EA5E9" : "#4F3F34"}
                      opacity={isSelected ? 1 : 0.65}
                    >
                      {bar.data.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[9px] font-bold text-[#7D6B58] pt-2 border-t border-[#E9E4D4]/60">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0EA5E9]" /> Target: {hydrationConfig.targetGoal} Glasses/day
            </span>
            <span className="text-[#4F3F34] font-black">
              Avg: {(last7Days.reduce((a, b) => a + b.water, 0) / 7).toFixed(1)} / day
            </span>
          </div>
        </div>

        {/* 3. Donut Chart: Discipline Allocation */}
        <div className="bg-white border border-[#E9E4D4] rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                <PieIcon size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#4F3F34] uppercase tracking-widest">Discipline Allocation</h3>
                <p className="text-[9px] text-[#7D6B58] font-medium">Domain XP distribution</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-[#4F3F34] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#E9E4D4]">
              {totalAllVolts} XP
            </span>
          </div>

          <div className="flex items-center justify-center py-2 relative">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="55"
                  fill="none"
                  stroke="#F4EFE6"
                  strokeWidth="20"
                />

                {/* Animated Segments */}
                {donutSegments.map((segment) => {
                  const isHovered = activePieIndex === segment.idx;
                  return (
                    <motion.circle
                      key={segment.idx}
                      cx="80"
                      cy="80"
                      r="55"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth={isHovered ? 24 : 20}
                      strokeDasharray={segment.strokeDasharray}
                      strokeDashoffset={segment.strokeDashoffset}
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 345 }}
                      animate={{ strokeDashoffset: segment.strokeDashoffset }}
                      transition={{ duration: 0.9, delay: segment.idx * 0.1, ease: "easeOut" }}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setActivePieIndex(activePieIndex === segment.idx ? null : segment.idx)}
                    />
                  );
                })}
              </svg>

              {/* Center Dynamic Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                {activeDonut ? (
                  <motion.div
                    key={activeDonut.name}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: activeDonut.color }}>
                      {activeDonut.shortName}
                    </span>
                    <span className="text-base font-black text-[#4F3F34] leading-tight">
                      {Math.round((activeDonut.value / totalAllVolts) * 100)}%
                    </span>
                    <span className="text-[8px] font-bold text-[#7D6B58]">{activeDonut.value} XP</span>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-[#7D6B58] uppercase tracking-widest">TOTAL</span>
                    <span className="text-sm font-black text-[#4F3F34]">{totalAllVolts}</span>
                    <span className="text-[8px] font-bold text-[#69C496]">XP EARNED</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Legend Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E9E4D4]/60">
            {pieData.map((d, idx) => {
              const isSelected = activePieIndex === idx;
              const percent = Math.round((d.value / totalAllVolts) * 100);
              return (
                <button
                  key={idx}
                  onClick={() => setActivePieIndex(activePieIndex === idx ? null : idx)}
                  className={`flex items-center justify-between p-1.5 rounded-xl text-left transition-all ${
                    isSelected ? 'bg-[#FAF8F5] border border-[#E9E4D4] shadow-xs' : 'hover:bg-[#FAF8F5]/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-[9px] font-bold text-[#4F3F34] truncate">{d.shortName}</span>
                  </div>
                  <span className="text-[9px] font-black text-[#7D6B58] pl-1">{percent}%</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Skills Architecture Matrix */}
      <div className="bg-white border border-[#E9E4D4] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#69C496]/10 flex items-center justify-center text-[#69C496] font-black text-xs">
              <Zap size={14} />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#4F3F34] uppercase tracking-widest">Skills Architecture</h3>
              <p className="text-[10px] text-[#7D6B58] font-medium">Domain mastery, physical rigor, & mental agility</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#69C496] bg-[#69C496]/10 px-2.5 py-1 rounded-full">
            Tier {Math.min(10, Math.floor((stats?.totalPoints || 0) / 200) + 1)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Physical Rigor */}
          <div className="bg-[#FAF8F5] border border-[#E9E4D4] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-[#4F3F34]">Physical Rigor</span>
              <span className="text-xs font-black text-[#69C496]">{valPhysical} XP</span>
            </div>
            <div className="w-full bg-[#E9E4D4] h-2 rounded-full overflow-hidden mb-1">
              <motion.div 
                className="bg-[#69C496] h-full rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(15, (valPhysical / 500) * 100))}%` }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-[#7D6B58]">Pushups, football, stamina & energy output</p>
          </div>

          {/* Mental Clarity */}
          <div className="bg-[#FAF8F5] border border-[#E9E4D4] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-[#4F3F34]">Mental Clarity</span>
              <span className="text-xs font-black text-[#7D6B58]">{valMental} XP</span>
            </div>
            <div className="w-full bg-[#E9E4D4] h-2 rounded-full overflow-hidden mb-1">
              <motion.div 
                className="bg-[#7D6B58] h-full rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(15, (valMental / 500) * 100))}%` }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-[#7D6B58]">Meditation, focus, memory & breathwork</p>
          </div>

          {/* Creative Flow */}
          <div className="bg-[#FAF8F5] border border-[#E9E4D4] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-[#4F3F34]">Creative Flow</span>
              <span className="text-xs font-black text-[#A39587]">{valCreative} XP</span>
            </div>
            <div className="w-full bg-[#E9E4D4] h-2 rounded-full overflow-hidden mb-1">
              <motion.div 
                className="bg-[#A39587] h-full rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(15, (valCreative / 500) * 100))}%` }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-[#7D6B58]">Drawing, expressive journal & gratitude</p>
          </div>

          {/* Hydration Efficiency */}
          <div className="bg-[#FAF8F5] border border-[#E9E4D4] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-[#4F3F34]">Hydration Optimization</span>
              <span className="text-xs font-black text-[#0EA5E9]">{valHydration} XP</span>
            </div>
            <div className="w-full bg-[#E9E4D4] h-2 rounded-full overflow-hidden mb-1">
              <motion.div 
                className="bg-[#0EA5E9] h-full rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(15, (valHydration / 300) * 100))}%` }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-[#7D6B58]">Daily water intake & cellular recovery</p>
          </div>
        </div>
      </div>
    </div>
  );
}
