import { UserStats } from "../types";

export type StreakState = "active" | "frozen" | "broken";

export interface StreakInfo {
  status: StreakState;
  daysInactive: number;
  streakCount: number;
  lastDateStr: string;
}

/**
 * Calculates current user streak state based on calendar day difference
 * - diffDays <= 0 (today completed): active (healthy red/gold flame)
 * - diffDays === 1 (completed yesterday, today active): active (healthy red/gold flame)
 * - diffDays === 2 (1 day expired without completion): frozen (turned to ice)
 * - diffDays >= 3 (2+ days expired without completion): broken (flame shattered)
 */
export function getStreakInfo(stats?: Partial<UserStats> | null): StreakInfo {
  const currentStreak = stats?.streak || 0;
  if (!stats || currentStreak <= 0) {
    return {
      status: "active",
      daysInactive: 0,
      streakCount: 0,
      lastDateStr: "",
    };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const lastDateStr = stats.lastCompletedDate
    ? stats.lastCompletedDate.split("T")[0].split(" ")[0].trim()
    : stats.lastActiveDate || todayStr;

  const msPerDay = 1000 * 60 * 60 * 24;
  const todayTime = new Date(todayStr + "T00:00:00").getTime();
  const lastTime = new Date(lastDateStr + "T00:00:00").getTime();

  if (isNaN(todayTime) || isNaN(lastTime)) {
    return {
      status: "active",
      daysInactive: 0,
      streakCount: currentStreak,
      lastDateStr,
    };
  }

  const diffDays = Math.floor((todayTime - lastTime) / msPerDay);

  if (diffDays <= 1) {
    // Completed today (0) or completed yesterday (1) with current day still active: healthy flame!
    return {
      status: "active",
      daysInactive: Math.max(0, diffDays),
      streakCount: currentStreak,
      lastDateStr,
    };
  } else if (diffDays === 2) {
    // 1 expired day missed without completing task: turned to ice!
    return {
      status: "frozen",
      daysInactive: 1,
      streakCount: currentStreak,
      lastDateStr,
    };
  } else {
    // 2 or more expired days missed: broken/shattered!
    return {
      status: "broken",
      daysInactive: diffDays - 1,
      streakCount: currentStreak,
      lastDateStr,
    };
  }
}

/**
 * Restores a frozen or broken streak back to active state.
 * Preserves the exact streak number without incrementing it,
 * allowing the user to complete a task today to advance it normally.
 */
export function restoreStreakState(stats: UserStats): UserStats {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  return {
    ...stats,
    streak: Math.max(1, stats.streak || 1),
    lastCompletedDate: yesterdayStr,
    lastActiveDate: todayStr,
  };
}
