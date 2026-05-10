import { useEffect, useMemo } from 'react';
import { MascotMood, DailyProgress, UserStats } from '../types';

export function useAppIcon(mood: MascotMood, stats: UserStats, dailyProgress: DailyProgress) {
  // Determine if we should show a badge
  const incompleteCount = useMemo(() => {
    let count = 0;
    const dp = dailyProgress as any;
    if (!dp.waterDrank || dp.waterDrank < 1) count++;
    if (!dp.breathingDone) count++;
    if (!dp.drawingDone) count++;
    return count;
  }, [dailyProgress]);

  useEffect(() => {
    // 1. App Badging API
    if ('setAppBadge' in navigator) {
      if (incompleteCount > 0) {
        (navigator as any).setAppBadge(incompleteCount).catch(() => {});
      } else {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    }

    // 2. Dynamic Favicon via Canvas
    const generateFavicon = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isBoiling = mood === 'boiling';
      const isAngry = mood === 'angry';

      // Draw Background Circle
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fillStyle = isBoiling ? '#FF5C5C' : isAngry ? '#0047FF' : '#5CD6FF';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw Mascot simplified (Bottle Shape)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(20, 20, 24, 30, 8);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#001845';
      if (isAngry) {
        // Furrowed brows
        ctx.fillRect(24, 28, 6, 2);
        ctx.fillRect(34, 28, 6, 2);
      } else {
        ctx.beginPath();
        ctx.arc(26, 32, 2.5, 0, Math.PI * 2);
        ctx.arc(38, 32, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth
      ctx.beginPath();
      if (isAngry) {
        ctx.arc(32, 42, 4, Math.PI, 0);
      } else {
        ctx.arc(32, 40, 4, 0, Math.PI);
      }
      ctx.stroke();

      // Update Favicon
      const link: any = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = canvas.toDataURL('image/x-icon');
      if (!document.querySelector("link[rel*='icon']")) {
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    };

    generateFavicon();
  }, [mood, incompleteCount]);
}
