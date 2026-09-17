import { UserStats } from "../types";

export type StreakState = "active" | "frozen" | "broken";

export interface StreakInfo {
  status: StreakState;
  daysInactive: number;
  streakCount: number;
  lastDateStr: string;
}

/**
 * Calculates current user streak state based on calendar day difference:
 * - diffDays <= 0 (today completed): active (healthy red/gold flame)
 * - diffDays === 1 (completed yesterday, not yet completed today): frozen (ice flame). Count does NOT reduce.
 * - diffDays === 2 (completed 2 days ago, missed 1 day): broken (flame shattered). Count does NOT reduce yet.
 * - diffDays >= 3: Systematic 2-day cycle:
 *   - Day 3: Streak count reduces by 1, turns to Ice (frozen).
 *   - Day 4: Second day of that number, turns to Broken (broken).
 *   - Day 5: Streak count reduces by another 1, turns to Ice (frozen).
 *   - Day 6: Turns to Broken (broken).
 *   - Continues until user completes a task or reaches 0.
 *
 * CRITICAL: Uses stats.streakAtLastCompletion as baseStreak so that reading or clicking
 * can NEVER cascade-reduce the streak number repeatedly.
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

  // The base streak count achieved when the user was last active/completed.
  // Crucial: baseStreak never mutates during dormancy, preventing cascading decay feedback loops.
  const baseStreak =
    stats.streakAtLastCompletion !== undefined && stats.streakAtLastCompletion !== null
      ? stats.streakAtLastCompletion
      : currentStreak;

  if (isNaN(todayTime) || isNaN(lastTime)) {
    return {
      status: "active",
      daysInactive: 0,
      streakCount: baseStreak,
      lastDateStr,
    };
  }

  // Use Math.round to avoid daylight saving time offset rounding errors
  const diffDays = Math.round((todayTime - lastTime) / msPerDay);

  if (diffDays <= 0) {
    // Day 0: Completed today: Healthy red/gold flame!
    return {
      status: "active",
      daysInactive: 0,
      streakCount: baseStreak,
      lastDateStr,
    };
  } else if (diffDays === 1) {
    // Day 1: Completed yesterday, not yet completed today: Streak turns to ice (frozen)! Count does NOT reduce.
    return {
      status: "frozen",
      daysInactive: 1,
      streakCount: baseStreak,
      lastDateStr,
    };
  } else if (diffDays === 2) {
    // Day 2: 1 missed day: Streak breaks / shatters! Count does NOT reduce yet.
    return {
      status: "broken",
      daysInactive: 1,
      streakCount: baseStreak,
      lastDateStr,
    };
  } else {
    // Day 3+: Systematic 2-day inactivity decay cycle:
    // - Day 3 (cycleStep 0): streak reduces by 1, turns to Ice (frozen)
    // - Day 4 (cycleStep 1): stays reduced by 1, turns to Broken (broken)
    // - Day 5 (cycleStep 2): streak reduces by 2, turns to Ice (frozen)
    // - Day 6 (cycleStep 3): stays reduced by 2, turns to Broken (broken)
    // - Day 7 (cycleStep 4): streak reduces by 3, turns to Ice (frozen)
    // - Day 8 (cycleStep 5): stays reduced by 3, turns to Broken (broken)
    const cycleStep = diffDays - 3;
    const reduction = Math.floor(cycleStep / 2) + 1;
    const decayedStreak = Math.max(0, baseStreak - reduction);

    if (decayedStreak === 0) {
      return {
        status: "broken",
        daysInactive: diffDays - 1,
        streakCount: 0,
        lastDateStr,
      };
    }

    const status: StreakState = cycleStep % 2 === 0 ? "frozen" : "broken";

    return {
      status,
      daysInactive: diffDays - 1,
      streakCount: decayedStreak,
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
  const todayStr = new Date().toISOString().split("T")[0];
  const current = Math.max(1, stats.streak || 1);

  return {
    ...stats,
    streak: current,
    streakAtLastCompletion: current,
    streakStatus: "active",
    lastCompletedDate: todayStr,
    lastActiveDate: todayStr,
  };
}
