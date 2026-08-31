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
