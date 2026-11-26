import {
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  addDoc,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { ReferralRecord } from "../types";
import { parseTimestampIso } from "../lib/firestoreUtils";

export const REFERRAL_REWARD_COINS = 5;
export const PENDING_REFERRAL_KEY = "nexora_pending_referral_uid";
export const REFERRAL_CANONICAL_ORIGIN = "https://nexora-daily.vercel.app";

export interface ReferrerPublicProfile {
  uid: string;
  displayName: string;
  activeSkin?: string;
  activeHat?: string;
  level?: number;
}

export function sanitizeReferralUid(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!/^[a-zA-Z0-9_-]{6,128}$/.test(trimmed)) return null;
  return trimmed;
}

export function getPendingReferralUid(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromSession = sanitizeReferralUid(sessionStorage.getItem(PENDING_REFERRAL_KEY));
    if (fromSession) return fromSession;
    const fromLocal = sanitizeReferralUid(localStorage.getItem(PENDING_REFERRAL_KEY));
    if (fromLocal) return fromLocal;
  } catch {
    // Ignore storage read errors in restricted browsers
  }
  return null;
}

export function savePendingReferralUid(uid: string | null): string | null {
  const sanitized = sanitizeReferralUid(uid);
  if (!sanitized || typeof window === "undefined") return null;
  try {
    localStorage.setItem(PENDING_REFERRAL_KEY, sanitized);
    sessionStorage.setItem(PENDING_REFERRAL_KEY, sanitized);
  } catch {
    // Ignore storage errors
  }
  return sanitized;
}

export function clearPendingReferralUid(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_REFERRAL_KEY);
    sessionStorage.removeItem(PENDING_REFERRAL_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function captureReferralFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const refParam = sanitizeReferralUid(params.get("ref"));
    if (refParam) {
      savePendingReferralUid(refParam);
      return refParam;
    }
  } catch {
    // Ignore URL parse errors
  }
  return getPendingReferralUid();
}

export function buildReferralShareUrl(uid: string): string {
  const cleanUid = sanitizeReferralUid(uid) || uid;
  let origin = REFERRAL_CANONICAL_ORIGIN;
  if (typeof window !== "undefined" && window.location?.origin) {
    const hostname = (window.location.hostname || "").toLowerCase();
    const isPrivatePreviewOrLocal =
      !hostname ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".run.app") ||
      hostname.startsWith("ais-dev-") ||
      hostname.startsWith("ais-pre-");
    if (!isPrivatePreviewOrLocal) {
      origin = window.location.origin;
    }
  }
  return `${origin}/?ref=${encodeURIComponent(cleanUid)}`;
}

export async function fetchReferrerPublicProfile(
  referrerUid: string
): Promise<ReferrerPublicProfile | null> {
  const cleanUid = sanitizeReferralUid(referrerUid);
  if (!cleanUid) return null;

  try {
    // Try public leaderboard first to minimize read footprint
    const lbSnap = await getDoc(doc(db, "leaderboard", cleanUid));
    if (lbSnap.exists()) {
      const lbData = lbSnap.data();
      const safeName =
        typeof lbData.displayName === "string" && lbData.displayName.trim()
          ? lbData.displayName.trim().slice(0, 40)
          : "A Nexora Friend";
      return {
        uid: cleanUid,
        displayName: safeName,
        level: typeof lbData.level === "number" ? lbData.level : 1,
      };
    }

    // Fallback to public display fields on users doc (strictly no PII returned)
    const userSnap = await getDoc(doc(db, "users", cleanUid));
    if (userSnap.exists() && userSnap.data()?.deleted !== true) {
      const uData = userSnap.data();
      const rawName = uData.displayName || uData.name || uData.accountName || "";
      const safeName =
        typeof rawName === "string" &&
        rawName.trim() &&
        rawName !== "Champion" &&
        rawName !== "Nexora User"
          ? rawName.trim().slice(0, 40)
          : "A Nexora Friend";
      return {
        uid: cleanUid,
        displayName: safeName,
        activeSkin: typeof uData.activeSkin === "string" ? uData.activeSkin : "standard",
        activeHat: typeof uData.activeHat === "string" ? uData.activeHat : "none",
        level: typeof uData.level === "number" ? uData.level : 1,
      };
    }
  } catch (err) {
    console.warn("[Referral] Could not load referrer public profile:", err);
  }

  return {
    uid: cleanUid,
    displayName: "A Nexora Friend",
  };
}

export async function claimReferralRewardOnNewSignup(newUser: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
}): Promise<{ claimed: boolean; referrerUid?: string; reason?: string }> {
  const pendingReferrerUid = getPendingReferralUid();
  if (!pendingReferrerUid) {
    return { claimed: false, reason: "no_pending_referral" };
  }

  if (!newUser?.uid || pendingReferrerUid === newUser.uid) {
    clearPendingReferralUid();
    return { claimed: false, reason: "self_referral_blocked" };
  }

  const friendNameRaw =
    typeof newUser.displayName === "string" && newUser.displayName.trim()
      ? newUser.displayName.trim()
      : "New Nexora Friend";
  const safeFriendName = friendNameRaw.slice(0, 50);

  const referralDocRef = doc(db, "referrals", newUser.uid);
  const friendUserRef = doc(db, "users", newUser.uid);
  const referrerUserRef = doc(db, "users", pendingReferrerUid);

  const recordReferralMirrors = async () => {
    await Promise.allSettled([
      setDoc(
        doc(db, "users", pendingReferrerUid, "stats", "main"),
        {
          coins: increment(REFERRAL_REWARD_COINS),
          referralCount: increment(1),
          referralCoinsEarned: increment(REFERRAL_REWARD_COINS),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ),
      setDoc(
        doc(db, "rewards", pendingReferrerUid),
        {
          userId: pendingReferrerUid,
          coins: increment(REFERRAL_REWARD_COINS),
          lastRewardReceivedAt: serverTimestamp(),
          lastRewardSource: "friend_referral",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ),
      setDoc(
        doc(db, "users", newUser.uid, "settings", "referral"),
        {
          referredBy: pendingReferrerUid,
          claimedAt: serverTimestamp(),
        },
        { merge: true }
      ),
      addDoc(collection(db, "users", pendingReferrerUid, "notifications"), {
        title: "Friend Joined Nexora! 🎉",
        message: `${safeFriendName} created a new account using your invite! You earned +${REFERRAL_REWARD_COINS} Coins!`,
        type: "reward",
        read: false,
        createdAt: new Date().toISOString(),
      }),
    ]);
  };

  try {
    const result = await runTransaction(db, async (tx) => {
      const [referralSnap, referrerSnap, friendSnap] = await Promise.all([
        tx.get(referralDocRef),
        tx.get(referrerUserRef),
        tx.get(friendUserRef),
      ]);

      // 1. Never reward twice for the same friend account
      if (referralSnap.exists()) {
        return { claimed: false, reason: "already_claimed" };
      }

      // 2. Friend account must not already have a referrer recorded
      if (friendSnap.exists() && friendSnap.data()?.referredBy) {
        return { claimed: false, reason: "already_referred" };
      }

      // 3. Referrer must exist and not be deleted
      if (!referrerSnap.exists() || referrerSnap.data()?.deleted === true) {
        return { claimed: false, reason: "referrer_not_found" };
      }

      const referrerData = referrerSnap.data();
      // 4. Prevent obvious duplicate same-email abuse
      if (
        newUser.email &&
        referrerData?.email &&
        String(newUser.email).toLowerCase() === String(referrerData.email).toLowerCase()
      ) {
        return { claimed: false, reason: "same_email_blocked" };
      }

      // Record immutable referral proof keyed by the new user's UID
      tx.set(referralDocRef, {
        friendUid: newUser.uid,
        friendName: safeFriendName,
        referrerUid: pendingReferrerUid,
        coinsAwarded: REFERRAL_REWARD_COINS,
        status: "completed",
        createdAt: serverTimestamp(),
      });

      // Mark the friend's profile as referred
      tx.set(
        friendUserRef,
        {
          referredBy: pendingReferrerUid,
          referralClaimedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Atomically award +5 Coins and increment referral counters on referrer's primary doc
      tx.set(
        referrerUserRef,
        {
          coins: increment(REFERRAL_REWARD_COINS),
          stats: {
            coins: increment(REFERRAL_REWARD_COINS),
            referralCount: increment(1),
            referralCoinsEarned: increment(REFERRAL_REWARD_COINS),
          },
          referralCount: increment(1),
          referralCoinsEarned: increment(REFERRAL_REWARD_COINS),
          lastReferralFriendName: safeFriendName,
          lastReferralAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { claimed: true, referrerUid: pendingReferrerUid };
    });

    if (result.claimed) {
      await recordReferralMirrors();
    }

    clearPendingReferralUid();
    return result;
  } catch (err) {
    // Fallback if cross-user transaction update on referrerUserRef was blocked:
    // Record the friend-owned referral proof & mark referredBy so the referrer's live listener reconciles +5 Coins safely.
    try {
      const existingRefSnap = await getDoc(referralDocRef).catch(() => null);
      if (existingRefSnap?.exists()) {
        clearPendingReferralUid();
        return { claimed: false, reason: "already_claimed" };
      }

      await setDoc(referralDocRef, {
        friendUid: newUser.uid,
        friendName: safeFriendName,
        referrerUid: pendingReferrerUid,
        coinsAwarded: REFERRAL_REWARD_COINS,
        status: "completed",
        createdAt: serverTimestamp(),
      });

      await Promise.allSettled([
        setDoc(
          friendUserRef,
          {
            referredBy: pendingReferrerUid,
            referralClaimedAt: serverTimestamp(),
          },
          { merge: true }
        ),
        setDoc(
          referrerUserRef,
          {
            coins: increment(REFERRAL_REWARD_COINS),
            stats: {
              coins: increment(REFERRAL_REWARD_COINS),
              referralCount: increment(1),
              referralCoinsEarned: increment(REFERRAL_REWARD_COINS),
            },
            referralCount: increment(1),
            referralCoinsEarned: increment(REFERRAL_REWARD_COINS),
            lastReferralFriendName: safeFriendName,
            lastReferralAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ),
        recordReferralMirrors(),
      ]);

      clearPendingReferralUid();
      return { claimed: true, referrerUid: pendingReferrerUid };
    } catch (fallbackErr) {
      handleFirestoreError(err, OperationType.WRITE, `referrals/${newUser.uid}`);
      handleFirestoreError(fallbackErr, OperationType.WRITE, `referrals/${newUser.uid}`);
      return { claimed: false, reason: "transaction_error" };
    }
  }
}

export function subscribeToReferrals(
  referrerUid: string,
  onUpdate: (records: ReferralRecord[]) => void
): () => void {
  const cleanUid = sanitizeReferralUid(referrerUid);
  if (!cleanUid) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, "referrals"),
    where("referrerUid", "==", cleanUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReferralRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          friendUid: data.friendUid || d.id,
          friendName: data.friendName || "Nexora Friend",
          referrerUid: data.referrerUid || cleanUid,
          coinsAwarded: Number(data.coinsAwarded) || REFERRAL_REWARD_COINS,
          status: "completed",
          createdAt: parseTimestampIso(data.createdAt) || new Date().toISOString(),
        };
      });

      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "referrals");
    }
  );
}
