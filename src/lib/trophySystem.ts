import { Trophy, UserStats } from '../types';

/**
 * Computes the number of full calendar days elapsed since the user's last task completion.
 * If no task has been completed yet, falls back to the most recent trophy earned date,
 * or last active date, or today (resulting in 0 days inactive).
 */
export function computeTrophyInactivityDays(stats?: Partial<UserStats> | null): number {
  if (!stats) return 0;

  const todayStr = new Date().toISOString().split('T')[0];

  let anchorDateStr = '';
  if (stats.lastCompletedDate) {
    anchorDateStr = stats.lastCompletedDate.split('T')[0].split(' ')[0].trim();
  } else if (stats.trophies && stats.trophies.length > 0) {
    const latestDate = stats.trophies.reduce((latest, t) => {
      const d = (t.earnedDate || t.lastUpdated || '').split('T')[0].trim();
      return d > latest ? d : latest;
    }, '');
    anchorDateStr = latestDate || (stats.lastActiveDate ? stats.lastActiveDate.split('T')[0].trim() : todayStr);
  } else if (stats.lastActiveDate) {
    anchorDateStr = stats.lastActiveDate.split('T')[0].trim();
  } else {
    anchorDateStr = todayStr;
  }

  const todayTime = new Date(todayStr + 'T00:00:00').getTime();
  const anchorTime = new Date(anchorDateStr + 'T00:00:00').getTime();

  if (isNaN(todayTime) || isNaN(anchorTime)) {
    return 0;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor((todayTime - anchorTime) / msPerDay));
}

/**
 * Deterministically returns the expected state for all trophies given the user's days of inactivity.
 *
 * Exact user lifecycle specifications:
 * - Day 1 (daysInactive = 0): User completed today. Trophies are well and healthy ('golden').
 * - Day 2 (daysInactive = 1): 1 missed day. Trophies are well and healthy ('golden').
 * - Day 3 (daysInactive = 2): Exactly 1 oldest trophy turns to ICE ('ice').
 * - Day 4 (daysInactive = 3): 1st trophy BREAKS ('broken').
 * - Day 5 (daysInactive = 4): 2nd oldest trophy turns to ICE ('ice') while 1st is broken.
 * - Day 6 (daysInactive = 5): 2nd oldest trophy BREAKS ('broken') while 1st is broken.
 * - Day 7 (daysInactive = 6): 3rd oldest trophy turns to ICE ('ice').
 * - Day 8 (daysInactive = 7): 3rd oldest trophy BREAKS ('broken').
 * - ...and so on, turning to ice and breaking ONE BY ONE until reaching 0 golden/ice trophies (all broken).
 *
 * If daysInactive < 2 (user completed today or yesterday), all trophies are well and healthy ('golden'),
 * ensuring that logging out, logging in, or switching devices preserves trophy health until the deadline.
 */
export function getExpectedTrophyStates(trophies: Trophy[], daysInactive: number): Trophy[] {
  if (!trophies || trophies.length === 0) return [];

  const N = trophies.length;

  // Day 1 & Day 2: All trophies are well and healthy
  if (daysInactive < 2) {
    return trophies.map((t) => {
      if (t.type === 'golden') return t;
      return {
        ...t,
        type: 'golden',
        lastUpdated: new Date().toISOString(),
      };
    });
  }

  // Target count of broken trophies:
  // daysInactive = 2 (Day 3) -> 0 broken
  // daysInactive = 3 (Day 4) -> 1 broken
  // daysInactive = 4 (Day 5) -> 1 broken
  // daysInactive = 5 (Day 6) -> 2 broken
  // daysInactive = 6 (Day 7) -> 2 broken
  // daysInactive = 7 (Day 8) -> 3 broken
  const targetBrokenCount = Math.min(N, Math.floor((daysInactive - 1) / 2));

  // If not all trophies are broken, check if there is an ice trophy on odd days (Day 3, Day 5, Day 7... -> even daysInactive: 2, 4, 6...)
  const targetHasIce = targetBrokenCount < N && daysInactive % 2 === 0;

  // In standard list, newest is at index 0, oldest is at index N - 1.
  // We degrade starting from the oldest trophy (index N - 1) backwards.
  const updated: Trophy[] = trophies.map((t, idx) => {
    // Distance from the end of the array (0 = oldest trophy, 1 = second oldest, ...)
    const fromOldest = N - 1 - idx;

    let expectedType: 'golden' | 'ice' | 'broken' = 'golden';

    if (fromOldest < targetBrokenCount) {
      expectedType = 'broken';
    } else if (fromOldest === targetBrokenCount && targetHasIce) {
      expectedType = 'ice';
    } else {
      expectedType = 'golden';
    }

    if (t.type === expectedType) {
      return t;
    }

    return {
      ...t,
      type: expectedType,
      lastUpdated: new Date().toISOString(),
    };
  });

  return updated;
}

/**
 * When the user returns and earns a trophy by completing a task:
 * - If there is an 'ice' trophy, that ice trophy is replaced by the new golden trophy.
 * - If no 'ice' trophy, but there is a 'broken' trophy, the oldest broken trophy is replaced.
 * - If no degraded trophies, the new golden trophy is added to the collection.
 */
export function replaceDegradedTrophyWithNew(trophies: Trophy[]): Trophy[] {
  const currentList = [...(trophies || [])];

  // 1. Find oldest 'ice' trophy to replace (furthest from start, closest to end)
  let removeIndex = -1;
  for (let i = currentList.length - 1; i >= 0; i--) {
    if (currentList[i].type === 'ice') {
      removeIndex = i;
      break;
    }
  }

  // 2. If no 'ice' trophy found, find the oldest 'broken' trophy to replace
  if (removeIndex === -1) {
    for (let i = currentList.length - 1; i >= 0; i--) {
      if (currentList[i].type === 'broken') {
        removeIndex = i;
        break;
      }
    }
  }

  if (removeIndex !== -1) {
    currentList.splice(removeIndex, 1);
  }

  // Add the newly earned golden trophy to the front
  currentList.unshift({
    id: `trophy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: 'golden',
    earnedDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  });

  return currentList;
}
