import { 
  setDoc as firestoreSetDoc, 
  updateDoc as firestoreUpdateDoc, 
  addDoc as firestoreAddDoc,
  DocumentReference,
  CollectionReference,
  SetOptions
} from 'firebase/firestore';

/**
 * Recursively cleans an object/array of `undefined` values so Firestore setDoc / updateDoc never crashes.
 * Preserves Firestore FieldValues (serverTimestamp, arrayUnion, increment, etc.), Dates, and primitives.
 */
export function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj as any;

  // Preserve Firestore FieldValue and special database sentinel objects
  if (
    (obj as any)._methodName || 
    (obj as any).constructor?.name?.includes('FieldValue') ||
    (obj as any)._sentinel ||
    typeof (obj as any).isEqual === 'function'
  ) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanPayload).filter((v: any) => v !== undefined && v !== null) as any;
  }

  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      const cleanedVal = cleanPayload(val);
      if (cleanedVal !== undefined) {
        cleaned[key] = cleanedVal;
      }
    }
  }
  return cleaned;
}

/**
 * Safe wrapper around Firestore `setDoc` that automatically sanitizes payloads.
 */
export async function safeSetDoc<T = any>(
  reference: DocumentReference<T> | any, 
  data: any, 
  options?: SetOptions
) {
  return firestoreSetDoc(reference, cleanPayload(data), options as any);
}

/**
 * Safe wrapper around Firestore `updateDoc` that automatically sanitizes payloads.
 */
export async function safeUpdateDoc<T = any>(
  reference: DocumentReference<T> | any, 
  data: any
) {
  return firestoreUpdateDoc(reference, cleanPayload(data));
}

/**
 * Safe wrapper around Firestore `addDoc` that automatically sanitizes payloads.
 */
export async function safeAddDoc<T = any>(
  reference: CollectionReference<T> | any, 
  data: any
) {
  return firestoreAddDoc(reference, cleanPayload(data));
}

/**
 * Returns a stable, timezone-safe start-of-week string (YYYY-MM-DD representing Sunday)
 */
export function getStartOfWeekKey(d: Date = new Date()): string {
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  const year = sunday.getFullYear();
  const month = String(sunday.getMonth() + 1).padStart(2, "0");
  const day = String(sunday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Universal Timestamp normalizer handling ISO strings, numeric timestamps, and Firestore Timestamp objects ({ seconds, nanoseconds } or toMillis / toDate).
 */
export function parseTimestampMs(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  if (typeof val?.toMillis === 'function') {
    return val.toMillis();
  }
  if (typeof val?.toDate === 'function') {
    const d = val.toDate();
    return d instanceof Date && !isNaN(d.getTime()) ? d.getTime() : null;
  }
  if (typeof val?.seconds === 'number') {
    const ms = val.seconds * 1000 + (typeof val.nanoseconds === 'number' ? Math.floor(val.nanoseconds / 1000000) : 0);
    return isNaN(ms) ? null : ms;
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val.getTime();
  }
  if (typeof val === 'string') {
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Parses any timestamp representation into a clean ISO string format.
 */
export function parseTimestampIso(val: any): string | null {
  const ms = parseTimestampMs(val);
  return ms !== null ? new Date(ms).toISOString() : null;
}

const VALID_LEADERBOARD_LEAGUES = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Master',
  'Champion',
  'Divine',
  'Nexus',
] as const;

export interface SafeLeaderboardInput {
  uid: string;
  displayName?: unknown;
  photoURL?: unknown;
  fallbackPhotoURL?: unknown;
  streak?: unknown;
  totalPoints?: unknown;
  points?: unknown;
  weeklyPoints?: unknown;
  weeklyXP?: unknown;
  xp?: unknown;
  level?: unknown;
  league?: unknown;
  updatedAt?: unknown;
  includeAliases?: boolean;
}

const toSafeInt = (val: unknown, min: number, max?: number): number => {
  const num = Number(val);
  if (!Number.isFinite(num)) return min;
  const floored = Math.floor(num);
  if (floored < min) return min;
  if (max !== undefined && floored > max) return max;
  return floored;
};

export function normalizeLeaderboardLeague(val: unknown): string {
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    const matched = VALID_LEADERBOARD_LEAGUES.find((l) => l.toLowerCase() === trimmed);
    if (matched) return matched;
  }
  return 'Bronze';
}

export function buildSafeLeaderboardPayload(input: SafeLeaderboardInput) {
  const rawName = typeof input.displayName === 'string' ? input.displayName.trim() : '';
  const safeDisplayName = (rawName || 'Champion').slice(0, 95);

  let safePhotoURL = '';
  if (typeof input.photoURL === 'string' && input.photoURL.trim().length > 0 && input.photoURL.length <= 800000) {
    safePhotoURL = input.photoURL.trim();
  } else if (
    typeof input.fallbackPhotoURL === 'string' &&
    input.fallbackPhotoURL.trim().length > 0 &&
    input.fallbackPhotoURL.length <= 800000
  ) {
    safePhotoURL = input.fallbackPhotoURL.trim();
  }

  const safeTotalPoints = toSafeInt(input.totalPoints, 0, 999999);
  const safeWeeklyPoints = toSafeInt(input.weeklyPoints ?? input.totalPoints, 0, 999999);
  const safeWeeklyXP = toSafeInt(input.weeklyXP ?? input.weeklyPoints ?? input.totalPoints, 0, 999999);
  const safeXP = toSafeInt(input.xp ?? input.totalPoints, 0);
  const safePoints = toSafeInt(input.points ?? input.totalPoints, 0, 999999);
  const safeStreak = toSafeInt(input.streak, 0);
  const safeLevel = toSafeInt(input.level, 1);
  const safeLeague = normalizeLeaderboardLeague(input.league);

  const payload: Record<string, any> = {
    uid: input.uid,
    displayName: safeDisplayName,
    photoURL: safePhotoURL,
    streak: safeStreak,
    totalPoints: safeTotalPoints,
    weeklyPoints: safeWeeklyPoints,
    weeklyXP: safeWeeklyXP,
    xp: safeXP,
    level: safeLevel,
    league: safeLeague,
  };

  if (input.includeAliases !== false) {
    const compactAliasPhoto = safePhotoURL.length <= 250000 ? safePhotoURL : '';
    payload.userId = input.uid;
    payload.name = safeDisplayName;
    payload.points = safePoints;
    if (compactAliasPhoto) {
      payload.photoFileName = compactAliasPhoto;
      payload.profilePic = compactAliasPhoto;
    }
  }

  if (input.updatedAt !== undefined) {
    payload.updatedAt = input.updatedAt;
  }

  return cleanPayload(payload);
}

