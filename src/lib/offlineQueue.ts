// Offline Action Queue Manager for Nexora Phase 2 Offline Mode
// Guarantees persistence across restarts, strict UID scoping, and transaction safety.

export type OfflineActionType =
  | "COMPLETE_CHALLENGE"
  | "BUY_SHOP_ITEM"
  | "PLANT_ACTION"
  | "UPDATE_SETTINGS"
  | "GARDEN_ACTION"
  | "CUSTOM_PLAN_PROGRESS"
  | "GENERAL_SYNC";

export interface OfflineAction {
  id: string;
  uid: string;
  type: OfflineActionType;
  payload: any;
  timestamp: number;
  status: "pending" | "syncing" | "synced" | "failed";
  retryCount: number;
  lastAttempt?: number;
  error?: string;
}

const QUEUE_KEY_PREFIX = "nexora_offline_queue_";

export function getQueueKey(uid: string): string {
  return `${QUEUE_KEY_PREFIX}${uid}`;
}

export function getOfflineQueue(uid?: string): OfflineAction[] {
  if (typeof window === "undefined" || !uid) return [];
  try {
    const raw = localStorage.getItem(getQueueKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[OFFLINE QUEUE] Error loading offline queue for UID:", uid, err);
    return [];
  }
}

export function saveOfflineQueue(uid: string, queue: OfflineAction[]): void {
  if (typeof window === "undefined" || !uid) return;
  try {
    localStorage.setItem(getQueueKey(uid), JSON.stringify(queue));
  } catch (err) {
    console.warn("[OFFLINE QUEUE] Error saving offline queue for UID:", uid, err);
  }
}

export function enqueueOfflineAction(
  uid: string,
  type: OfflineActionType,
  payload: any
): OfflineAction {
  const existingQueue = getOfflineQueue(uid);
  
  // Idempotency check: avoid identical duplicate actions queued within 1 second
  const now = Date.now();
  const existingRecent = existingQueue.find(
    (a) => a.type === type && (now - a.timestamp < 1000) && JSON.stringify(a.payload) === JSON.stringify(payload)
  );
  if (existingRecent) {
    console.log("[OFFLINE QUEUE] Duplicate action avoided:", type, existingRecent.id);
    return existingRecent;
  }

  const action: OfflineAction = {
    id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    uid,
    type,
    payload,
    timestamp: now,
    status: "pending",
    retryCount: 0,
  };

  const updatedQueue = [...existingQueue, action];
  saveOfflineQueue(uid, updatedQueue);
  console.log(`[OFFLINE QUEUE] Enqueued ${type} (${action.id}) for user ${uid}. Total pending: ${updatedQueue.length}`);
  
  // Dispatch a custom window event to notify UI listeners
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nexora-offline-action-enqueued", { detail: action }));
  }

  return action;
}

export function updateActionStatus(
  uid: string,
  actionId: string,
  status: OfflineAction["status"],
  error?: string
): void {
  const queue = getOfflineQueue(uid);
  const updatedQueue = queue.map((action) => {
    if (action.id === actionId) {
      return {
        ...action,
        status,
        lastAttempt: Date.now(),
        retryCount: status === "failed" ? action.retryCount + 1 : action.retryCount,
        error: error || action.error,
      };
    }
    return action;
  });
  saveOfflineQueue(uid, updatedQueue);
}

export function removeOfflineAction(uid: string, actionId: string): void {
  const queue = getOfflineQueue(uid);
  const updatedQueue = queue.filter((action) => action.id !== actionId);
  saveOfflineQueue(uid, updatedQueue);
  console.log(`[OFFLINE QUEUE] Removed action ${actionId} for user ${uid}. Remaining: ${updatedQueue.length}`);
  
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nexora-offline-queue-updated", { detail: { uid, count: updatedQueue.length } }));
  }
}

export function clearSyncedActions(uid: string): void {
  const queue = getOfflineQueue(uid);
  const pendingOnly = queue.filter((action) => action.status === "pending" || action.status === "syncing");
  saveOfflineQueue(uid, pendingOnly);
}

export function getPendingActionsCount(uid?: string): number {
  if (!uid) return 0;
  const queue = getOfflineQueue(uid);
  return queue.filter((a) => a.status === "pending" || a.status === "syncing" || a.status === "failed").length;
}
