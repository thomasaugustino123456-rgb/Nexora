import { useState, useEffect, useRef, useCallback } from "react";
import { User as FirebaseUser, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  setDoc as firestoreSetDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  getDocFromCache,
  getDocsFromCache,
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType, onAuthStateChanged } from "../firebase";
import { UserSettings, UserStats, DailyProgress, isUserProUnlocked } from "../types";
import { GardenState, createInitialGardenState } from "../types/garden";
import { SHOP_ITEMS } from "../components/ShopScreen";
import { MASCOTS_DATA, MascotId } from "../lib/mascotSystem";
import { HOUSE_ITEMS } from "../constants/houseItems";
import { parseTimestampMs, parseTimestampIso } from "../lib/firestoreUtils";

export function extractRealDisplayName(docDataOrList: any | any[], currentUser?: any): string {
  const docList = Array.isArray(docDataOrList) ? docDataOrList : [docDataOrList];
  for (const doc of docList) {
    if (!doc) continue;
    const primaryCandidates = [
      doc.displayName,
      doc.settings?.displayName,
      doc.name,
      doc["Name"],
      doc["displayName"],
      doc["display_name"],
      doc["full_name"],
      doc["username"],
      doc.accountName,
      doc["Account name"],
      doc.settings?.accountName,
      doc.settings?.name,
    ];
    for (const c of primaryCandidates) {
      if (typeof c === 'string' && c.trim() !== "" && c.trim() !== "Nexora User" && c.trim() !== "Nexora Citizen" && c.trim() !== "Champion") {
        return c.trim();
      }
    }
  }
  if (currentUser?.displayName && typeof currentUser.displayName === 'string' && currentUser.displayName.trim() !== "" && currentUser.displayName.trim() !== "Nexora User" && currentUser.displayName.trim() !== "Nexora Citizen" && currentUser.displayName.trim() !== "Champion") {
    return currentUser.displayName.trim();
  }
  if (currentUser?.email) {
    const emailPrefix = currentUser.email.split('@')[0];
    if (emailPrefix && emailPrefix.trim() !== "") return emailPrefix.trim();
  }
  for (const doc of docList) {
    if (!doc) continue;
    const fallbackName = doc.displayName || doc.settings?.displayName || doc.name || doc["Name"];
    if (typeof fallbackName === 'string' && fallbackName.trim() !== "") return fallbackName.trim();
  }
  return currentUser?.displayName || "Champion";
}

export function extractRealProfilePic(docDataOrList: any | any[], currentUser?: any, fallbackPic?: string): string {
  const docList = Array.isArray(docDataOrList) ? docDataOrList : [docDataOrList];
  for (const doc of docList) {
    if (!doc) continue;
    const candidates = [
      doc.profilePic,
      doc.settings?.profilePic,
      doc.photoFileName,
      doc["Photo file name"],
      doc["Profile image"],
      doc["profilePic"],
      doc["profile_pic"],
      doc["profile_image"],
      doc["photo_file_name"],
      doc["photoURL"],
      doc["avatar"],
      doc.photoURL,
      doc.avatar,
      doc.settings?.photoFileName,
      doc.settings?.photoURL,
      doc.settings?.avatar,
      doc.settings?.["Profile image"],
      doc.settings?.["Photo file name"],
      doc.settings?.["profile_pic"],
      doc.settings?.["profile_image"],
      doc.settings?.["photo_file_name"],
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim() !== "") {
        return c.trim();
      }
    }
  }
  if (currentUser?.photoURL && typeof currentUser.photoURL === 'string' && currentUser.photoURL.trim() !== "") {
    return currentUser.photoURL.trim();
  }
  if (fallbackPic && typeof fallbackPic === 'string' && fallbackPic.trim() !== "") {
    return fallbackPic.trim();
  }
  return "";
}

export function extractRealAccountName(docDataOrList: any | any[], currentUser?: any): string {
  const docList = Array.isArray(docDataOrList) ? docDataOrList : [docDataOrList];
  for (const doc of docList) {
    if (!doc) continue;
    const candidates = [
      doc.accountName,
      doc["Account name"],
      doc.settings?.accountName,
      doc.username,
      doc["Username"],
      doc.displayName,
      doc.name,
      doc["Name"],
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim() !== "" && c.trim() !== "Champion") {
        return c.trim();
      }
    }
  }
  if (currentUser?.displayName && typeof currentUser.displayName === 'string' && currentUser.displayName.trim() !== "" && currentUser.displayName.trim() !== "Champion") {
    return currentUser.displayName.trim();
  }
  if (currentUser?.email) {
    const emailPrefix = currentUser.email.split('@')[0];
    if (emailPrefix && emailPrefix.trim() !== "") return emailPrefix.trim();
  }
  return "Champion";
}

export function extractRealLocation(docDataOrList: any | any[]): string {
  const docList = Array.isArray(docDataOrList) ? docDataOrList : [docDataOrList];
  for (const doc of docList) {
    if (!doc) continue;
    const candidates = [
      doc.location,
      doc["Location"],
      doc.settings?.location,
      doc.settings?.["Location"],
      doc.city,
      doc["City"]
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim() !== "") {
        return c.trim();
      }
    }
  }
  return "";
}

export function extractRealBio(docDataOrList: any | any[]): string {
  const docList = Array.isArray(docDataOrList) ? docDataOrList : [docDataOrList];
  for (const doc of docList) {
    if (!doc) continue;
    const candidates = [
      doc.bio,
      doc["Bio"],
      doc.about,
      doc["About"],
      doc.settings?.bio,
      doc.settings?.["Bio"],
      doc.settings?.about
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim() !== "") {
        return c.trim();
      }
    }
  }
  return "";
}

async function getDocSafely(docRef: any) {
  try {
    return await getDoc(docRef);
  } catch (e: any) {
    try {
      const cached = await getDocFromCache(docRef);
      if (cached) return cached;
    } catch {
      // ignore
    }
    return {
      exists: () => false,
      data: () => null
    };
  }
}

export function autoRestoreInventoryFromPurchased(purchasedItems: (string | any)[], existingInventory: any[]): any[] {
  const inventoryMap = new Map();

  (existingInventory || []).forEach((item: any) => {
    if (item && (item.id || item.itemId || item.name)) {
      const key = item.id || item.itemId || item.name;
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, item);
      } else {
        const existing = inventoryMap.get(key);
        inventoryMap.set(key, {
          ...existing,
          ...item,
          activated: existing.activated || item.activated || false,
        });
      }
    }
  });

  (purchasedItems || []).forEach((rawItem) => {
    if (!rawItem) return;
    const purchasedId = typeof rawItem === "string" ? rawItem : (rawItem.itemId || rawItem.id || rawItem.name);
    if (!purchasedId || typeof purchasedId !== "string") return;
    const hasKey = Array.from(inventoryMap.values()).some(
      (inv: any) => inv?.itemId === purchasedId || inv?.id === purchasedId
    );
    if (!hasKey) {
      const shopMatch = SHOP_ITEMS.find((si) => si.id === purchasedId);
      if (shopMatch) {
        inventoryMap.set(shopMatch.id, {
          id: `${shopMatch.id}-restored`,
          itemId: shopMatch.id,
          name: shopMatch.name,
          icon: typeof shopMatch.icon === "string" || typeof shopMatch.icon === "number" ? String(shopMatch.icon) : "🛒",
          activated: true,
          type: shopMatch.effect === "skin" ? "skin" : shopMatch.effect === "sound-pack" ? "sound-pack" : shopMatch.effect === "music" ? "music" : shopMatch.effect === "gift" ? "gift" : "power-up",
          purchasedAt: new Date().toISOString()
        });
      } else {
        const mascotMatch = MASCOTS_DATA[purchasedId as MascotId];
        if (mascotMatch) {
          inventoryMap.set(mascotMatch.id, {
            id: `${mascotMatch.id}-restored`,
            itemId: mascotMatch.id,
            name: mascotMatch.name,
            icon: "🐉",
            activated: true,
            type: "skin",
            purchasedAt: new Date().toISOString()
          });
        } else {
          const houseMatch = HOUSE_ITEMS.find((hi) => hi.id === purchasedId);
          if (houseMatch) {
            inventoryMap.set(houseMatch.id, {
              id: `${houseMatch.id}-restored`,
              itemId: houseMatch.id,
              name: houseMatch.name,
              icon: typeof houseMatch.icon === "string" || typeof houseMatch.icon === "number" ? String(houseMatch.icon) : "🏠",
              activated: true,
              type: "power-up",
              purchasedAt: new Date().toISOString()
            });
          } else {
            inventoryMap.set(purchasedId, {
              id: `${purchasedId}-restored`,
              itemId: purchasedId,
              name: purchasedId,
              icon: "✨",
              activated: true,
              type: "power-up",
              purchasedAt: new Date().toISOString()
            });
          }
        }
      }
    }
  });

  return Array.from(inventoryMap.values());
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a && b && typeof a === "object" && typeof b === "object") {
    if (a.constructor !== b.constructor) return false;
    if (Array.isArray(a)) {
      const length = a.length;
      if (length !== b.length) return false;
      for (let i = length; i-- !== 0;) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    for (let i = keys.length; i-- !== 0;) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    }
    for (let i = keys.length; i-- !== 0;) {
      const key = keys[i];
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return a !== a && b !== b;
}

function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj as any;
  // Preserve Firestore FieldValue and special database objects
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

const today = new Date().toISOString().split("T")[0];

function getBestPlantState(...candidates: (any)[]): any {
  const valid = candidates.filter((c): c is any => !!c && typeof c === 'object' && !!c.type);
  if (valid.length === 0) {
    return {
      type: "sprout",
      stage: 0,
      growthPoints: 0,
      lastGrowthDate: null,
      lastCheckDate: new Date().toISOString(),
      health: 100,
      isDead: false,
      isThirsty: false,
      unlockedTypes: ["sprout"],
    };
  }

  // Union of ALL unlockedTypes across ALL candidates so no unlocked plants are EVER lost
  const allUnlocked = Array.from(new Set(
    valid.flatMap(c => Array.isArray(c.unlockedTypes) ? c.unlockedTypes : ['sprout'])
  ));

  const best = valid.reduce((acc, curr) => {
    const currUnlockedCount = Array.isArray(curr.unlockedTypes) ? curr.unlockedTypes.length : 1;
    const accUnlockedCount = Array.isArray(acc.unlockedTypes) ? acc.unlockedTypes.length : 1;

    // Never pick a default sprout stage <= 1 over a non-sprout or higher stage or more unlocked plant
    const currIsDefault = curr.type === 'sprout' && (curr.stage || 0) <= 1 && currUnlockedCount <= 1;
    const accIsDefault = acc.type === 'sprout' && (acc.stage || 0) <= 1 && accUnlockedCount <= 1;

    if (currIsDefault && !accIsDefault) return acc;
    if (!currIsDefault && accIsDefault) return curr;

    if (!curr.isDead && acc.isDead) return curr;
    if (curr.isDead && !acc.isDead) return acc;

    // Compare progress score + unlocked types count
    const currScore = (curr.stage || 0) * 1000 + (curr.growthPoints || 0) + (currUnlockedCount * 10000);
    const accScore = (acc.stage || 0) * 1000 + (acc.growthPoints || 0) + (accUnlockedCount * 10000);

    if (currScore > accScore) return curr;
    if (accScore > currScore) return acc;

    return acc;
  }, valid[0]);

  return {
    ...best,
    unlockedTypes: allUnlocked.length > 0 ? allUnlocked : (best.unlockedTypes || ['sprout']),
  };
}

function getMergedPlantsProgress(...progressMaps: (Record<string, any> | undefined | null)[]): Record<string, any> {
  const merged: Record<string, any> = {};
  for (const map of progressMaps) {
    if (!map || typeof map !== 'object') continue;
    for (const [key, prog] of Object.entries(map)) {
      if (!prog || typeof prog !== 'object') continue;
      if (!merged[key]) {
        merged[key] = { ...prog };
      } else {
        const existing = merged[key];
        const progScore = (prog.stage || 0) * 1000 + (prog.growthPoints || 0);
        const existScore = (existing.stage || 0) * 1000 + (existing.growthPoints || 0);
        if (!prog.isDead && existing.isDead) {
          merged[key] = { ...existing, ...prog };
        } else if (progScore >= existScore) {
          merged[key] = {
            ...existing,
            ...prog,
            stage: Math.max(existing.stage || 0, prog.stage || 0),
            growthPoints: (prog.stage || 0) > (existing.stage || 0) ? (prog.growthPoints || 0) : Math.max(existing.growthPoints || 0, prog.growthPoints || 0),
            unlocked: Boolean(existing.unlocked || prog.unlocked),
          };
        } else {
          merged[key] = {
            ...prog,
            ...existing,
            unlocked: Boolean(existing.unlocked || prog.unlocked),
          };
        }
      }
    }
  }
  return merged;
}

export function isUserOnboardingCompleted(
  docData: any,
  onboardingData?: any,
  settingsObj?: any,
  uid?: string,
  plantSectionData?: any,
  plantsTopData?: any
): boolean {
  // 1. If actively in a new signup flow in this session, return false
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("nexora_signup_flow") === "true") {
    return false;
  }

  // 2. If any primary source explicitly confirms onboarding was completed, trust it immediately
  if (
    docData?.onboardingCompleted === true ||
    docData?.settings?.onboardingCompleted === true ||
    docData?.newUsersOnboardingCompleted === true ||
    docData?.appIntroductionOnboardingCompleted === true ||
    onboardingData?.onboardingCompleted === true ||
    onboardingData?.newUsersOnboardingCompleted === true ||
    onboardingData?.appIntroductionOnboardingCompleted === true ||
    settingsObj?.onboardingCompleted === true
  ) {
    return true;
  }

  // 3. Check profile data indicators populated exclusively during onboarding
  if (
    docData?.priorityFocus ||
    docData?.settings?.priorityFocus ||
    docData?.workType ||
    docData?.settings?.workType ||
    docData?.energyPeak ||
    docData?.settings?.energyPeak ||
    docData?.commitmentLevel ||
    docData?.settings?.commitmentLevel ||
    (docData?.archivedOfficialChallenges && docData.archivedOfficialChallenges.length > 0) ||
    (docData?.settings?.archivedOfficialChallenges && docData.settings.archivedOfficialChallenges.length > 0) ||
    (docData?.age !== undefined && docData?.age !== null && docData?.age !== '') ||
    (docData?.settings?.age !== undefined && docData?.settings?.age !== null && docData?.settings?.age !== '') ||
    (docData?.gender && docData.gender.trim() !== '') ||
    (docData?.settings?.gender && docData.settings.gender.trim() !== '')
  ) {
    return true;
  }

  // 4. Check existing user activity/progress indicators
  if ((docData?.stats?.totalPoints || 0) > 0) return true;
  if ((docData?.stats?.streak || 0) > 0) return true;
  if ((docData?.stats?.bestStreak || 0) > 0) return true;
  if ((docData?.stats?.xp || 0) > 0) return true;
  if ((docData?.stats?.coins || 0) > 0) return true;
  if ((docData?.stats?.level || 1) > 1) return true;
  if ((docData?.totalPoints || 0) > 0) return true;
  if ((docData?.streak || 0) > 0) return true;
  if ((docData?.bestStreak || 0) > 0) return true;
  if ((docData?.xp || 0) > 0) return true;
  if ((docData?.coins || 0) > 0) return true;
  if ((docData?.level || 1) > 1) return true;
  if ((docData?.inventory && docData.inventory.length > 0) || (docData?.settings?.inventory && docData.settings.inventory.length > 0)) return true;
  if ((docData?.purchasedItems && docData.purchasedItems.length > 0) || (docData?.settings?.purchasedItems && docData.settings.purchasedItems.length > 0)) return true;
  if ((docData?.trophies && docData.trophies.length > 0) || (docData?.stats?.trophies && docData.stats.trophies.length > 0)) return true;
  if ((docData?.gratitudeEntries && docData.gratitudeEntries.length > 0) || (docData?.stats?.gratitudeEntries && docData.stats.gratitudeEntries.length > 0)) return true;
  if ((docData?.drawings && docData.drawings.length > 0) || (docData?.stats?.drawings && docData.stats.drawings.length > 0)) return true;

  // 5. Check user-specific local storage cache
  if (uid && typeof localStorage !== 'undefined') {
    if (localStorage.getItem(`nexora_onboarding_completed_${uid}`) === "true") return true;
    if (localStorage.getItem(`nexora_onboarding_completed_${uid}`) === "false") return false;
  }

  // 6. If explicitly flagged as false without any activity/profile data, return false
  if (
    docData?.onboardingCompleted === false ||
    docData?.settings?.onboardingCompleted === false ||
    onboardingData?.onboardingCompleted === false
  ) {
    return false;
  }

  return false;
}

// ============================================================================
// Robust Bi-Directional State Merging Functions to Prevent Data Loss
// ============================================================================

function mergeStats(dbStats: UserStats, localStats: UserStats, defaultStats: UserStats): UserStats {
  const localHasProgress = (localStats.xp > 0 || localStats.coins > 0 || (localStats.totalPoints || 0) > 0 || (localStats.streak || 0) > 0);
  if (!localHasProgress) {
    return { ...defaultStats, ...dbStats };
  }

  const merged: UserStats = {
    ...defaultStats,
    ...localStats,
    ...dbStats, // dbStats is spread last so that unhandled positive remote fields are preserved

    streak: Math.max(dbStats.streak || 0, localStats.streak || 0),
    bestStreak: Math.max(dbStats.bestStreak || 0, localStats.bestStreak || 0),
    totalPoints: Math.max(dbStats.totalPoints || 0, localStats.totalPoints || 0),
    xp: Math.max(dbStats.xp || 0, localStats.xp || 0),
    level: Math.max(dbStats.level || 1, localStats.level || 1),
    coins: Math.max(dbStats.coins || 0, localStats.coins || 0, defaultStats.coins || 0),
    gems: Math.max(dbStats.gems || 0, localStats.gems || 0),
    totalCompletedDays: Math.max(dbStats.totalCompletedDays || 0, localStats.totalCompletedDays || 0),
    weeklyPoints: Math.max(dbStats.weeklyPoints || 0, localStats.weeklyPoints || 0),
    weeklyXP: Math.max(dbStats.weeklyXP || 0, localStats.weeklyXP || 0),
    
    lastCompletedDate: (dbStats.lastCompletedDate || "") > (localStats.lastCompletedDate || "")
      ? dbStats.lastCompletedDate
      : (localStats.lastCompletedDate ?? null),
    lastActiveDate: (dbStats.lastActiveDate || "") > (localStats.lastActiveDate || "")
      ? dbStats.lastActiveDate
      : (localStats.lastActiveDate ?? null),
    lastGiftDate: (dbStats.lastGiftDate || "") > (localStats.lastGiftDate || "")
      ? dbStats.lastGiftDate
      : (localStats.lastGiftDate ?? null),
  };

  // Merge trophies array uniquely by id
  const dbTrophies = dbStats.trophies || [];
  const localTrophies = localStats.trophies || [];
  const trophyMap = new Map<string, any>();
  dbTrophies.forEach(t => trophyMap.set(t.id, t));
  localTrophies.forEach(t => {
    const existing = trophyMap.get(t.id);
    if (!existing || (t.lastUpdated || "") > (existing.lastUpdated || "")) {
      trophyMap.set(t.id, t);
    }
  });
  merged.trophies = Array.from(trophyMap.values());

  // Merge pointsByCategory (take the maximum of each category)
  const dbPointsCat = dbStats.pointsByCategory || { physical: 0, mental: 0, creative: 0 };
  const localPointsCat = localStats.pointsByCategory || { physical: 0, mental: 0, creative: 0 };
  merged.pointsByCategory = {
    physical: Math.max(dbPointsCat.physical || 0, localPointsCat.physical || 0),
    mental: Math.max(dbPointsCat.mental || 0, localPointsCat.mental || 0),
    creative: Math.max(dbPointsCat.creative || 0, localPointsCat.creative || 0),
  };

  // Merge lists uniquely
  merged.drawings = Array.from(new Set([...(dbStats.drawings || []), ...(localStats.drawings || [])]));
  merged.unlockedHats = Array.from(new Set([...(dbStats.unlockedHats || []), ...(localStats.unlockedHats || [])]));

  // Merge gratitude entries uniquely by id
  const dbGratitude = dbStats.gratitudeEntries || [];
  const localGratitude = localStats.gratitudeEntries || [];
  const gratitudeMap = new Map<string, any>();
  dbGratitude.forEach(g => gratitudeMap.set(g.id, g));
  localGratitude.forEach(g => gratitudeMap.set(g.id, g)); // local wins or just keeps
  merged.gratitudeEntries = Array.from(gratitudeMap.values());

  // Merge claimed rank rewards map and rank tracking fields
  merged.claimedRankRewards = {
    ...(defaultStats.claimedRankRewards || {}),
    ...(localStats.claimedRankRewards || {}),
    ...(dbStats.claimedRankRewards || {}),
  };
  merged.lastRankRewardClaimWeek = dbStats.lastRankRewardClaimWeek || localStats.lastRankRewardClaimWeek || defaultStats.lastRankRewardClaimWeek;
  merged.lastClaimedRank = dbStats.lastClaimedRank ?? localStats.lastClaimedRank ?? defaultStats.lastClaimedRank;
  merged.lowestRankSinceClaim = Math.max(dbStats.lowestRankSinceClaim || 0, localStats.lowestRankSinceClaim || 0);

  return merged;
}

function mergeSettings(dbSettings: UserSettings, localSettings: UserSettings, defaultSettings: UserSettings, userId?: string): UserSettings {
  const localHasSettings = (localSettings.displayName && localSettings.displayName !== "Nexora User" && localSettings.displayName !== "Champion" && localSettings.displayName !== "Nexora Citizen") || localSettings.onboardingCompleted;

  const dbName = (dbSettings.displayName && dbSettings.displayName.trim() !== "" && dbSettings.displayName !== "Nexora User" && dbSettings.displayName !== "Champion" && dbSettings.displayName !== "Nexora Citizen") ? dbSettings.displayName : undefined;
  const localName = (localSettings.displayName && localSettings.displayName.trim() !== "" && localSettings.displayName !== "Nexora User" && localSettings.displayName !== "Champion" && localSettings.displayName !== "Nexora Citizen") ? localSettings.displayName : undefined;
  const finalName = dbName || localName || dbSettings.displayName || localSettings.displayName || defaultSettings.displayName || "Champion";

  const dbPic = (dbSettings.profilePic && dbSettings.profilePic.trim() !== "") ? dbSettings.profilePic : undefined;
  const localPic = (localSettings.profilePic && localSettings.profilePic.trim() !== "") ? localSettings.profilePic : undefined;
  const finalPic = dbPic || localPic || defaultSettings.profilePic || "";

  const dbLoc = (dbSettings.location && dbSettings.location.trim() !== "") ? dbSettings.location : undefined;
  const localLoc = (localSettings.location && localSettings.location.trim() !== "") ? localSettings.location : undefined;
  const finalLoc = dbLoc || localLoc || defaultSettings.location || "";

  const dbAccount = (dbSettings.accountName && dbSettings.accountName.trim() !== "" && dbSettings.accountName !== "Champion") ? dbSettings.accountName : undefined;
  const localAccount = (localSettings.accountName && localSettings.accountName.trim() !== "" && localSettings.accountName !== "Champion") ? localSettings.accountName : undefined;
  const finalAccount = dbAccount || localAccount || dbSettings.accountName || localSettings.accountName || defaultSettings.accountName || "Champion";

  const now = Date.now();
  const dbTestExpiresMs = parseTimestampMs(dbSettings.proTestExpiresAt);
  const localTestExpiresMs = parseTimestampMs(localSettings.proTestExpiresAt);
  const dbTestActive = Boolean(dbSettings.proTestActive) && Boolean(dbTestExpiresMs) && dbTestExpiresMs! > now;
  const localTestActive = Boolean(localSettings.proTestActive) && Boolean(localTestExpiresMs) && localTestExpiresMs! > now;
  const finalProTestActive = dbTestActive || localTestActive;
  const finalProTestExpiresAt = dbTestActive ? parseTimestampIso(dbSettings.proTestExpiresAt) : (localTestActive ? parseTimestampIso(localSettings.proTestExpiresAt) : (parseTimestampIso(dbSettings.proTestExpiresAt) || parseTimestampIso(localSettings.proTestExpiresAt) || null));
  const finalProTestStartedAt = parseTimestampIso(dbSettings.proTestStartedAt) || parseTimestampIso(localSettings.proTestStartedAt) || null;
  const finalProTestRemainingMs = dbSettings.proTestRemainingMs !== undefined && dbSettings.proTestRemainingMs !== null ? dbSettings.proTestRemainingMs : (localSettings.proTestRemainingMs !== undefined && localSettings.proTestRemainingMs !== null ? localSettings.proTestRemainingMs : null);
  const finalProTestCooldownUntil = parseTimestampIso(dbSettings.proTestCooldownUntil) || parseTimestampIso(localSettings.proTestCooldownUntil) || null;
  const finalProTestLastCompletedAt = parseTimestampIso(dbSettings.proTestLastCompletedAt) || parseTimestampIso(localSettings.proTestLastCompletedAt) || null;
  const finalProTestDay2Notified = Boolean(dbSettings.proTestDay2Notified || localSettings.proTestDay2Notified);

  const dbPlan = dbSettings.proPlan;
  const localPlan = localSettings.proPlan;
  const finalProPlan = (dbPlan && dbPlan !== 'Free Tier') ? dbPlan : (localPlan && localPlan !== 'Free Tier' ? localPlan : (dbPlan || localPlan || defaultSettings.proPlan || 'Free Tier'));
  const finalProActivatedAt = parseTimestampIso(dbSettings.proActivatedAt) || parseTimestampIso(localSettings.proActivatedAt) || null;
  const finalProExpiresAt = dbSettings.proExpiresAt || localSettings.proExpiresAt || null;

  const isPermanentPro = isUserProUnlocked(userId) || (Boolean(dbSettings.isPro) && dbSettings.proPlan !== '4-Day Free Pro Test' && dbSettings.proPlan !== 'Free Tier') || (Boolean(localSettings.isPro) && localSettings.proPlan !== '4-Day Free Pro Test' && localSettings.proPlan !== 'Free Tier');
  const isPro = isPermanentPro || Boolean(dbSettings.isPro) || Boolean(localSettings.isPro) || finalProTestActive;

  if (!localHasSettings) {
    return { 
      ...defaultSettings, 
      ...dbSettings, 
      displayName: finalName, 
      profilePic: finalPic, 
      location: finalLoc, 
      accountName: finalAccount, 
      isPro,
      proPlan: finalProPlan,
      proActivatedAt: finalProActivatedAt,
      proExpiresAt: finalProExpiresAt,
      proTestActive: finalProTestActive,
      proTestExpiresAt: finalProTestExpiresAt,
      proTestStartedAt: finalProTestStartedAt,
      proTestRemainingMs: finalProTestRemainingMs,
      proTestCooldownUntil: finalProTestCooldownUntil,
      proTestLastCompletedAt: finalProTestLastCompletedAt,
      proTestDay2Notified: finalProTestDay2Notified,
    };
  }

  const finalOnboardingDone = (dbSettings.onboardingCompleted === true) || (localSettings.onboardingCompleted === true);

  const merged: UserSettings = {
    ...defaultSettings,
    ...localSettings,
    ...dbSettings, // dbSettings wins by default for general/unhandled settings

    displayName: finalName,
    profilePic: finalPic,
    location: finalLoc,
    accountName: finalAccount,
    onboardingCompleted: finalOnboardingDone,
    plantOnboardingCompleted: (dbSettings.plantOnboardingCompleted === true) || (localSettings.plantOnboardingCompleted === true),
    spaceOnboardingCompleted: (dbSettings.spaceOnboardingCompleted === true) || (localSettings.spaceOnboardingCompleted === true),
    spaceHouseUnlocked: dbSettings.spaceHouseUnlocked || localSettings.spaceHouseUnlocked || false,
    hasEnteredGarden: dbSettings.hasEnteredGarden || localSettings.hasEnteredGarden || false,
    isPro: isPro,
    proPlan: finalProPlan,
    proActivatedAt: finalProActivatedAt,
    proExpiresAt: finalProExpiresAt,
    proTestActive: finalProTestActive,
    proTestExpiresAt: finalProTestExpiresAt,
    proTestStartedAt: finalProTestStartedAt,
    proTestRemainingMs: finalProTestRemainingMs,
    proTestCooldownUntil: finalProTestCooldownUntil,
    proTestLastCompletedAt: finalProTestLastCompletedAt,
    proTestDay2Notified: finalProTestDay2Notified,
    feedbackSubmitted: dbSettings.feedbackSubmitted || localSettings.feedbackSubmitted || false,
  };

  // Merge arrays uniquely
  merged.joinedCircleIds = Array.from(new Set([...(dbSettings.joinedCircleIds || []), ...(localSettings.joinedCircleIds || [])]));
  merged.notifEnabledCircleIds = Array.from(new Set([...(dbSettings.notifEnabledCircleIds || []), ...(localSettings.notifEnabledCircleIds || [])]));
  merged.purchasedEcosystemItemIds = Array.from(new Set([
    ...(dbSettings.purchasedEcosystemItemIds || []),
    ...(localSettings.purchasedEcosystemItemIds || [])
  ].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean)));
  
  merged.activeEcosystemItemIds = Array.from(new Set([
    ...(dbSettings.activeEcosystemItemIds || []),
    ...(localSettings.activeEcosystemItemIds || [])
  ].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean)));
  
  merged.purchasedHouseItemIds = Array.from(new Set([
    ...(dbSettings.purchasedHouseItemIds || []),
    ...(localSettings.purchasedHouseItemIds || [])
  ].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean)));
  
  merged.readBookIds = Array.from(new Set([...(dbSettings.readBookIds || []), ...(localSettings.readBookIds || [])]));
  
  const rawInventory = [
    ...(Array.isArray(dbSettings.inventory) ? dbSettings.inventory : []),
    ...(Array.isArray(localSettings.inventory) ? localSettings.inventory : [])
  ];
  const mergedPurchasedItems = Array.from(new Set([
    ...(Array.isArray(dbSettings.purchasedItems) ? dbSettings.purchasedItems : []),
    ...(Array.isArray(localSettings.purchasedItems) ? localSettings.purchasedItems : [])
  ].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean)));

  merged.inventory = autoRestoreInventoryFromPurchased(mergedPurchasedItems, rawInventory);
  merged.purchasedItems = mergedPurchasedItems;
  
  merged.savedChallengeIds = Array.from(new Set([...(dbSettings.savedChallengeIds || []), ...(localSettings.savedChallengeIds || [])]));
  merged.savedTrophyIds = Array.from(new Set([...(dbSettings.savedTrophyIds || []), ...(localSettings.savedTrophyIds || [])]));
  merged.savedVideoIds = Array.from(new Set([...(dbSettings.savedVideoIds || []), ...(localSettings.savedVideoIds || [])]));
  merged.savedPostIds = Array.from(new Set([...(dbSettings.savedPostIds || []), ...(localSettings.savedPostIds || [])]));

  // Merge placedHouseItems - keep non-empty, database preferred if not empty
  merged.placedHouseItems = (dbSettings.placedHouseItems && dbSettings.placedHouseItems.length > 0)
    ? dbSettings.placedHouseItems
    : (localSettings.placedHouseItems || []);

  // Merge activeSpaceRoom
  merged.activeSpaceRoom = dbSettings.activeSpaceRoom !== undefined && dbSettings.activeSpaceRoom !== 0
    ? dbSettings.activeSpaceRoom
    : (localSettings.activeSpaceRoom !== undefined ? localSettings.activeSpaceRoom : 0);

  // Merge mascotPos - handle default position {x:400, y:300} versus actual customized positions
  const dbMascotPos = dbSettings.mascotPos;
  const localMascotPos = localSettings.mascotPos;
  const isDefaultDbMascotPos = !dbMascotPos || (dbMascotPos.x === 400 && dbMascotPos.y === 300);
  const isDefaultLocalMascotPos = !localMascotPos || (localMascotPos.x === 400 && localMascotPos.y === 300);
  merged.mascotPos = (!isDefaultDbMascotPos)
    ? dbMascotPos
    : (!isDefaultLocalMascotPos ? localMascotPos : defaultSettings.mascotPos);


// Merge mascotSize
  const isDefaultDbMascotSize = dbSettings.mascotSize === undefined || dbSettings.mascotSize === 1.5;
  const isDefaultLocalMascotSize = localSettings.mascotSize === undefined || localSettings.mascotSize === 1.5;
  merged.mascotSize = (!isDefaultDbMascotSize)
    ? dbSettings.mascotSize
    : (!isDefaultLocalMascotSize ? localSettings.mascotSize : defaultSettings.mascotSize);

  // Merge mascotPinnedItemId
  merged.mascotPinnedItemId = dbSettings.mascotPinnedItemId !== undefined && dbSettings.mascotPinnedItemId !== null
    ? dbSettings.mascotPinnedItemId
    : (localSettings.mascotPinnedItemId !== undefined ? localSettings.mascotPinnedItemId : null);

  // Merge plantState safely so unlockedTypes and higher plant progress are preserved
  merged.plantState = getBestPlantState(dbSettings.plantState, localSettings.plantState, defaultSettings.plantState);

  // Merge plantsProgress using getMergedPlantsProgress
  const mergedPlantsProgress = getMergedPlantsProgress(dbSettings.plantsProgress, localSettings.plantsProgress);

  // Ensure every unlocked plant type has a progress object initialized in plantsProgress
  if (merged.plantState && Array.isArray(merged.plantState.unlockedTypes)) {
    merged.plantState.unlockedTypes.forEach((typeKey: string) => {
      if (!mergedPlantsProgress[typeKey]) {
        mergedPlantsProgress[typeKey] = {
          stage: typeKey === merged.plantState.type ? (merged.plantState.stage || 0) : 0,
          growthPoints: typeKey === merged.plantState.type ? (merged.plantState.growthPoints || 0) : 0,
          lastGrowthDate: null,
          lastCheckDate: new Date().toISOString(),
          health: 100,
          isDead: false,
          isThirsty: false,
          unlocked: true,
        };
      } else {
        mergedPlantsProgress[typeKey].unlocked = true;
      }
    });
  }

  merged.plantsProgress = mergedPlantsProgress;

  return merged;
}

function mergeGarden(dbGarden: GardenState, localGarden: GardenState, defaultGarden: GardenState): GardenState {
  const localHasGarden = (localGarden.tiles && localGarden.tiles.length > 0) || (localGarden.inventory && Object.keys(localGarden.inventory).length > 0);
  if (!localHasGarden) {
    return { ...defaultGarden, ...dbGarden };
  }

  const merged: GardenState = {
    ...defaultGarden,
    ...localGarden,
    ...dbGarden,
  };

  // Choose the one with more tiles, or if equal, keep local as baseline
  const dbTiles = dbGarden.tiles || [];
  const localTiles = localGarden.tiles || [];
  merged.tiles = localTiles.length >= dbTiles.length ? localTiles : dbTiles;

  // Merge inventory (take max of each seed count)
  const dbInventory = dbGarden.inventory || {};
  const localInventory = localGarden.inventory || {};
  const mergedInventory: Record<string, number> = { ...dbInventory };
  for (const key of Object.keys(localInventory)) {
    mergedInventory[key] = Math.max(dbInventory[key] || 0, localInventory[key] || 0);
  }
  merged.inventory = mergedInventory;

  // MascotState merging
  merged.mascotState = {
    mood: dbGarden.mascotState?.mood || localGarden.mascotState?.mood || 'happy',
    lastInteracted: dbGarden.mascotState?.lastInteracted || localGarden.mascotState?.lastInteracted || Date.now(),
    ...(dbGarden.mascotState || {}),
    ...(localGarden.mascotState || {}),
  };

  return merged;
}

function mergeProgress(dbProgress: DailyProgress, localProgress: DailyProgress, defaultProgress: DailyProgress): DailyProgress {
  const localHasProgress = (
    localProgress.completed || 
    localProgress.pushupsDone || 
    localProgress.waterDrank > 0 || 
    localProgress.breathingDone || 
    localProgress.drawingDone || 
    localProgress.footballDone || 
    localProgress.bubblesDone || 
    localProgress.completionsCount > 0 || 
    localProgress.customPlanCompleted ||
    localProgress.dailyQuestDone ||
    localProgress.memoryDone ||
    localProgress.gratitudeDone ||
    localProgress.reactionDone ||
    localProgress.meditationDone ||
    localProgress.writingDone
  );
  if (!localHasProgress) {
    return { ...defaultProgress, ...dbProgress };
  }

  const merged: DailyProgress = {
    ...defaultProgress,
    ...localProgress,
    ...dbProgress, // Firestore database takes precedence by default

    // Logically merge booleans with OR
    completed: dbProgress.completed || localProgress.completed || false,
    pushupsDone: dbProgress.pushupsDone || localProgress.pushupsDone || false,
    breathingDone: dbProgress.breathingDone || localProgress.breathingDone || false,
    drawingDone: dbProgress.drawingDone || localProgress.drawingDone || false,
    footballDone: dbProgress.footballDone || localProgress.footballDone || false,
    bubblesDone: dbProgress.bubblesDone || localProgress.bubblesDone || false,
    customPlanCompleted: dbProgress.customPlanCompleted || localProgress.customPlanCompleted || false,
    dailyQuestDone: dbProgress.dailyQuestDone || localProgress.dailyQuestDone || false,
    memoryDone: dbProgress.memoryDone || localProgress.memoryDone || false,
    gratitudeDone: dbProgress.gratitudeDone || localProgress.gratitudeDone || false,
    reactionDone: dbProgress.reactionDone || localProgress.reactionDone || false,
    meditationDone: dbProgress.meditationDone || localProgress.meditationDone || false,
    writingDone: dbProgress.writingDone || localProgress.writingDone || false,
    skippedPushups: dbProgress.skippedPushups || localProgress.skippedPushups || false,

    // Numerics
    waterDrank: Math.max(dbProgress.waterDrank || 0, localProgress.waterDrank || 0),
    completionsCount: Math.max(dbProgress.completionsCount || 0, localProgress.completionsCount || 0),
    waterChallengeCount: Math.max(dbProgress.waterChallengeCount || 0, localProgress.waterChallengeCount || 0),
  };

  // Merge water logs if present, ensuring unique entries by id
  const dbLogs = dbProgress.waterLogs || [];
  const localLogs = localProgress.waterLogs || [];
  const logMap = new Map<string, any>();
  dbLogs.forEach(log => { if (log?.id) logMap.set(log.id, log); });
  localLogs.forEach(log => { if (log?.id) logMap.set(log.id, log); });
  merged.waterLogs = Array.from(logMap.values());

  return merged;
}

export function useNexoraData(
  DEFAULT_SETTINGS: UserSettings,
  DEFAULT_STATS: UserStats,
  showToast: (msg: string, type: "success" | "error" | "info") => void,
) {
  // Load cached settings/stats immediately if available
  const getCachedJson = (key: string, defaultValue: any) => {
    try {
      const val = localStorage.getItem(key);
      if (!val || val === "undefined") return defaultValue;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`Failed to parse cache for ${key}:`, e);
      return defaultValue;
    }
  };

  const cachedUserId = localStorage.getItem("nexora_cached_user") || null;
  const cachedOnboarding =
    localStorage.getItem("nexora_onboarding_completed") === "true" ||
    (cachedUserId ? localStorage.getItem(`nexora_onboarding_completed_${cachedUserId}`) === "true" : false);

  const currentAuthUser = auth.currentUser;
  const hasCachedUser = Boolean(cachedUserId);
  const isCachedUserValid = Boolean(currentAuthUser ? cachedUserId === currentAuthUser.uid : hasCachedUser);

  const [user, setUser] = useState<FirebaseUser | null>(
    currentAuthUser || (cachedUserId ? ({ uid: cachedUserId } as FirebaseUser) : null),
  );

  // If the user has completed onboarding and we have a cached session, we immediately skip the splash loader.
  // This provides instant 100ms startup and bulletproof offline support.
  // Otherwise, we keep the splash loader active (loading = true) until we resolve user state from Firestore,
  // preventing user onboarding flashes/redirection glitches on slow connections.
  const [loading, setLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isStateHydrated, setIsStateHydrated] = useState(false);

  const cachedSettings = isCachedUserValid ? getCachedJson("nexora_settings", DEFAULT_SETTINGS) : DEFAULT_SETTINGS;
  const cachedStats = isCachedUserValid ? getCachedJson("nexora_stats", DEFAULT_STATS) : DEFAULT_STATS;
  const cachedProgress = isCachedUserValid ? getCachedJson("nexora_progress", null) : null;
  
  const rawCachedGarden = isCachedUserValid ? getCachedJson("nexora_garden", createInitialGardenState()) : createInitialGardenState();
  const initialGardenDefault = createInitialGardenState();
  const cachedGarden = {
    ...initialGardenDefault,
    ...rawCachedGarden,
    mascotState: {
      ...initialGardenDefault.mascotState,
      ...(rawCachedGarden?.mascotState || {}),
    },
    inventory: {
      ...initialGardenDefault.inventory,
      ...(rawCachedGarden?.inventory || {}),
    },
    tiles: rawCachedGarden?.tiles || initialGardenDefault.tiles,
  };

  const currentUpdateSource = useRef<string>("Default Values");
  const onboardingReasonRef = useRef<string>("Default Initialization");

  const [settings, rawSetSettings] = useState<UserSettings>(cachedSettings);
  const [stats, rawSetStats] = useState<UserStats>(cachedStats);
  const [dailyProgress, rawSetDailyProgress] = useState<DailyProgress>(
    (cachedProgress?.date === today && isCachedUserValid)
      ? cachedProgress
      : {
          date: today,
          completed: false,
          pushupsDone: false,
          waterDrank: 0,
          breathingDone: false,
          drawingDone: false,
          footballDone: false,
          bubblesDone: false,
          completionsCount: 0,
          customPlanCompleted: false,
        },
  );
  const [gardenState, rawSetGardenState] = useState<GardenState>(cachedGarden);

  const [needsOnboarding, rawSetNeedsOnboarding] = useState(
    hasCachedUser ? !cachedOnboarding : true
  );

  // Safe Firestore setDoc wrapper
  const setDoc = useCallback(async (reference: any, data: any, options?: any) => {
    if (blockAllWritesRef.current) {
      console.warn(`[PERSISTENCE FIX] Write attempt blocked: Data not yet loaded from Firestore. Target: ${reference.path}`);
      return;
    }
    return firestoreSetDoc(reference, cleanPayload(data), options);
  }, []);

  const setSettings = useCallback((update: any) => {
    rawSetSettings((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setSettings] Source: ${currentUpdateSource.current}`);
      console.log(`[STATE UPDATE INTERCEPT] Old Settings:`, JSON.stringify(prev));
      console.log(`[STATE UPDATE INTERCEPT] New Settings:`, JSON.stringify(next));
      return next;
    });
  }, []);

  const setStats = useCallback((update: any) => {
    rawSetStats((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setStats] Source: ${currentUpdateSource.current}`);
      console.log(`[STATE UPDATE INTERCEPT] Old Stats:`, JSON.stringify(prev));
      console.log(`[STATE UPDATE INTERCEPT] New Stats:`, JSON.stringify(next));
      return next;
    });
  }, []);

  const setDailyProgress = useCallback((update: any) => {
    rawSetDailyProgress((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setDailyProgress] Source: ${currentUpdateSource.current}`);
      console.log(`[STATE UPDATE INTERCEPT] Old DailyProgress:`, JSON.stringify(prev));
      console.log(`[STATE UPDATE INTERCEPT] New DailyProgress:`, JSON.stringify(next));
      return next;
    });
  }, []);

  const setGardenState = useCallback((update: any) => {
    rawSetGardenState((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setGardenState] Source: ${currentUpdateSource.current}`);
      console.log(`[STATE UPDATE INTERCEPT] Old GardenState:`, JSON.stringify(prev));
      console.log(`[STATE UPDATE INTERCEPT] New GardenState:`, JSON.stringify(next));
      return next;
    });
  }, []);

  const setNeedsOnboarding = useCallback((update: any) => {
    rawSetNeedsOnboarding((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setNeedsOnboarding] Transition: ${prev} -> ${next}. Reason: ${onboardingReasonRef.current}`);
      return next;
    });
  }, []);

  const [authLoading, setAuthLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Emergency Auth Initialization Safety Timeout:
  // Ensures authLoading resolves cleanly if Firebase Auth is offline or network is delayed,
  // while giving cached user sessions sufficient time to complete token restoration.
  useEffect(() => {
    const hasCachedUser = typeof window !== "undefined" && Boolean(localStorage.getItem("nexora_cached_user"));
    const timeoutDuration = hasCachedUser ? 7500 : 3500;
    const authTimer = setTimeout(() => {
      setAuthLoading((prev) => {
        if (prev && !isInitialAuthResolutionDone.current) {
          console.warn(`[STARTUP SAFETY] Auth initialization timeout (${timeoutDuration}ms) reached. Resolving auth state.`);
          setIsDataReady(true);
          setLoading(false);
          return false;
        }
        return prev;
      });
    }, timeoutDuration);
    return () => clearTimeout(authTimer);
  }, []);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);
  const dataLoadedFromFirestore = useRef(false);
  const hasExistingUserProgressRef = useRef(false);

  const lastLoadedUserIdRef = useRef<string | null>(null);
  const quotaExceededRef = useRef(false);
  const lastSyncedRef = useRef<any>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isStateLoadedRef = useRef(false);
  const blockAllWritesRef = useRef(false);

  const setIsStateLoaded = (val: boolean, reason: string) => {
    isStateLoadedRef.current = val;
    console.log(`[STATE LOADED REF CHANGE] isStateLoadedRef.current set to ${val}. Reason: ${reason}`);
  };

  const hasMatchedHydratedStateRef = useRef(false);
  const hydratedStateRef = useRef<any>(null);
  const isInitialAuthResolutionDone = useRef(false);

  useEffect(() => {
    let loadTimeout: any = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log(`[STARTUP] AUTH STATE RESOLVED - User UID: ${currentUser?.uid || "null"}`);

      // Capture previous cached user ID before updating localStorage to correctly detect user switches
      const previousCachedUserId = localStorage.getItem("nexora_cached_user");
      const isSameUser = Boolean(previousCachedUserId && previousCachedUserId === currentUser?.uid);
      const isUserSwitch = Boolean(currentUser && (!isSameUser || (lastLoadedUserIdRef.current !== null && lastLoadedUserIdRef.current !== currentUser.uid)));

      if (currentUser) {
        isInitialAuthResolutionDone.current = true;
        setUser(currentUser);

        if (isUserSwitch) {
          console.log(`[ACCOUNT ISOLATION] Account switch or fresh login detected: '${previousCachedUserId || "none"}' -> '${currentUser.uid}'. Wiping previous session cache and resetting states.`);
          
          // Clear all user-specific cached local storage (preserve shared public leaderboard cache)
          Object.keys(localStorage).forEach((key) => {
            if (
              (key.startsWith("nexora_") ||
              key.startsWith("hydration_") ||
              key === "admin_read_feedback_ids") &&
              key !== "nexora_leaderboard_cache"
            ) {
              localStorage.removeItem(key);
            }
          });

          // Reset React memory states immediately so previous user's state never leaks or gets saved to new user
          rawSetSettings(DEFAULT_SETTINGS);
          rawSetStats(DEFAULT_STATS);
          rawSetGardenState(createInitialGardenState());
          rawSetNeedsOnboarding(false);
          rawSetDailyProgress({
            date: today,
            completed: false,
            pushupsDone: false,
            waterDrank: 0,
            breathingDone: false,
            drawingDone: false,
            footballDone: false,
            bubblesDone: false,
            completionsCount: 0,
            customPlanCompleted: false,
            nextRestorationTime: null,
          });
          dataLoadedFromFirestore.current = false;
          hasMatchedHydratedStateRef.current = false;
          lastSyncedRef.current = null;
          hydratedStateRef.current = null;
        }

        localStorage.setItem("nexora_cached_user", currentUser.uid);

        // Optimization: If this exact user is already loaded and ready, preserve state to prevent flickering/logouts
        if (!isUserSwitch && lastLoadedUserIdRef.current === currentUser.uid && dataLoadedFromFirestore.current) {
          console.log(`[STARTUP] User ${currentUser.uid} already initialized & loaded. Maintaining session state.`);
          setAuthLoading(false);
          setIsDataReady(true);
          setLoading(false);
          return;
        }

        lastLoadedUserIdRef.current = currentUser.uid;
        setLoading(true);
        setIsDataReady(false);
        setIsStateHydrated(false);
        hasExistingUserProgressRef.current = false;
        
        const isFreshLogin = typeof window !== "undefined" && (sessionStorage.getItem("nexora_fresh_login") === "true" || isUserSwitch);
        const hasCachedUserData = typeof window !== "undefined" && Boolean(localStorage.getItem("nexora_cached_user") && localStorage.getItem("nexora_settings"));
        const shouldShowSyncSpinners = isFreshLogin || !hasCachedUserData;
        setIsSyncingData(shouldShowSyncSpinners);
        dataLoadedFromFirestore.current = false;
        hasMatchedHydratedStateRef.current = false;
        setIsStateLoaded(false, "User logging in, resetting states to load from Firestore.");
        
        let isTimeoutActive = false;
        if (loadTimeout) clearTimeout(loadTimeout);
        loadTimeout = setTimeout(() => {
          if (dataLoadedFromFirestore.current) return;
          console.warn("[PERSISTENCE TIMEOUT] Firestore load timed out after 8.5 seconds. Activating Offline Cache Mode with Write Lock to protect user data.");
          isTimeoutActive = true;
          blockAllWritesRef.current = true;
          dataLoadedFromFirestore.current = true;
          setIsHydrated(true);
          setIsStateLoaded(true, "Offline Fallback Timeout activated");
          hasMatchedHydratedStateRef.current = true;
          setIsStateHydrated(true);
          setNeedsOnboarding(false);
          setAuthLoading(false);
          setIsDataReady(true);
          setLoading(false);
        }, 8500);

        try {
          setAuthLoading(true);
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSingularDocRef = doc(db, "user", currentUser.uid);
          const deletedUserRef = doc(db, "deleted_users", currentUser.uid);

          // Safe fast check for deleted user account to ensure deleted users never load profile
          try {
            const deletedSnap = await getDoc(deletedUserRef);
            if (deletedSnap.exists() && deletedSnap.data()?.deleted !== false) {
              console.warn(`[FIRESTORE] Account ${currentUser.uid} was deleted. Signing out automatically and clearing session.`);
              if (typeof window !== "undefined") {
                localStorage.removeItem("nexora_cached_user");
                localStorage.removeItem(`nexora_cached_user_${currentUser.uid}`);
                localStorage.removeItem("nexora_onboarding_completed");
                localStorage.removeItem(`nexora_onboarding_completed_${currentUser.uid}`);
                sessionStorage.clear();
                Object.keys(localStorage).forEach((key) => {
                  if (key.startsWith("nexora_") || key.startsWith("hydration_") || key === "admin_read_feedback_ids") {
                    localStorage.removeItem(key);
                  }
                });
              }
              await signOut(auth).catch(() => {});
              setUser(null);
              setAuthLoading(false);
              setLoading(false);
              setIsDataReady(true);
              return;
            }
          } catch (err) {
            console.warn("[FIRESTORE] Non-critical check on deleted_users collection:", err);
          }

          // ZERO-LATENCY INSTANT LOCAL CACHE PRE-PASS (0ms) - ONLY for matching same user
          if (isSameUser && !isUserSwitch) {
            try {
              const localCacheSettings = getCachedJson("nexora_settings", null);
              const localCacheStats = getCachedJson("nexora_stats", null);
              const localCacheGarden = getCachedJson("nexora_garden", null);
              const localCacheProgress = getCachedJson("nexora_progress", null);

              if (localCacheSettings) {
                rawSetSettings((prev) => mergeSettings(localCacheSettings, prev, DEFAULT_SETTINGS, currentUser.uid));
                const isOnboardingDone = Boolean(localCacheSettings.onboardingCompleted || localStorage.getItem("nexora_onboarding_completed") === "true");
                rawSetNeedsOnboarding(!isOnboardingDone);
              }
              if (localCacheStats) {
                rawSetStats((prev) => mergeStats(localCacheStats, prev, DEFAULT_STATS));
              }
              if (localCacheGarden) {
                rawSetGardenState(localCacheGarden);
              }
              if (localCacheProgress && localCacheProgress.date === today) {
                rawSetDailyProgress(localCacheProgress);
              }

              // Only release UI load state if not a fresh login from AuthScreen, so Gateway verification runs for logging-in users
              const isFreshSessionLogin = typeof window !== "undefined" && sessionStorage.getItem("nexora_fresh_login") === "true";
              if ((localCacheSettings || localCacheStats) && !isFreshSessionLogin) {
                setAuthLoading(false);
                setIsDataReady(true);
                setLoading(false);
              }

              const [cacheUserSnap, cacheRewardsSnap, cacheStatsSnap] = await Promise.all([
                getDocFromCache(userDocRef).catch(() => null),
                getDocFromCache(doc(db, "users", currentUser.uid, "rewards", "main")).catch(() => null),
                getDocFromCache(doc(db, "users", currentUser.uid, "stats", "main")).catch(() => null),
              ]);

              if (cacheUserSnap?.exists()) {
                const cData = cacheUserSnap.data();
                const rData = cacheRewardsSnap?.exists() ? cacheRewardsSnap.data() : null;
                const sData = cacheStatsSnap?.exists() ? cacheStatsSnap.data() : null;
                const currentLocalStats = getCachedJson("nexora_stats", DEFAULT_STATS);

                const instantDisplayName = extractRealDisplayName(cData, currentUser);
                const instantProfilePic = extractRealProfilePic(cData, currentUser);
                const instantAccountName = extractRealAccountName(cData, currentUser);
                const instantLocation = extractRealLocation(cData);

                if (instantDisplayName || instantProfilePic) {
                  rawSetSettings((prev) => ({
                    ...prev,
                    displayName: instantDisplayName || prev.displayName,
                    profilePic: instantProfilePic || prev.profilePic,
                    accountName: instantAccountName || prev.accountName,
                    location: instantLocation || prev.location,
                  }));
                }

                const instantCoins = Math.max(
                  cData.coins || 0,
                  cData.stats?.coins || 0,
                  rData?.coins || 0,
                  rData?.stats?.coins || 0,
                  sData?.coins || 0,
                  sData?.stats?.coins || 0,
                  currentLocalStats?.coins || 0,
                  DEFAULT_STATS.coins
                );

                if (instantCoins > 0) {
                  rawSetStats((prev) => ({
                    ...prev,
                    coins: Math.max(prev.coins || 0, instantCoins),
                    xp: Math.max(prev.xp || 0, cData.xp || 0, cData.stats?.xp || 0, rData?.xp || 0, sData?.xp || 0),
                    streak: Math.max(prev.streak || 0, cData.streak || 0, cData.stats?.streak || 0, rData?.streak || 0, sData?.streak || 0),
                  }));
                }
              }
            } catch (cacheErr) {
              // Non-critical local cache read error
            }
          }

          // Fetch core user doc, rewards doc, and stats doc in parallel for instant fast hydration
          const [userDocSnapResult, rewardsDocSnapResult, statsDocSnapResult] = await Promise.allSettled([
            getDoc(userDocRef),
            getDoc(doc(db, "users", currentUser.uid, "rewards", "main")),
            getDoc(doc(db, "users", currentUser.uid, "stats", "main"))
          ]);

          let userDocSnap = userDocSnapResult.status === "fulfilled" ? userDocSnapResult.value : null;
          
          if (!userDocSnap || !userDocSnap.exists()) {
            try {
              userDocSnap = await getDocFromCache(userDocRef);
            } catch (cacheErr) {
              console.warn("[FIRESTORE] Cache fallback check for user doc:", cacheErr);
            }
          }

          const earlyRewardsSnap = rewardsDocSnapResult.status === "fulfilled" ? rewardsDocSnapResult.value : null;
          const earlyStatsSnap = statsDocSnapResult.status === "fulfilled" ? statsDocSnapResult.value : null;

          const earlyRewardsData = earlyRewardsSnap?.exists() ? earlyRewardsSnap.data() : null;
          const earlyStatsData = earlyStatsSnap?.exists() ? earlyStatsSnap.data() : null;
          let docData: any = null;
          
          if (!userDocSnap || !userDocSnap.exists()) {
            console.log(`[FIRESTORE] User not found at '${userDocRef.path}'. Checking fallback '${userSingularDocRef.path}'...`);
            try {
              const userSingularSnap = await getDoc(userSingularDocRef);
              if (userSingularSnap.exists()) {
                console.log(`[FIRESTORE] User document found in Legacy '/user' path! Restoring profile from fallback...`);
                userDocSnap = userSingularSnap;
                docData = userSingularSnap.data();
                // Backfill the '/users' collection asynchronously
                setDoc(userDocRef, docData).catch(() => {});
              }
            } catch (fallbackErr) {
              console.warn("[FIRESTORE] Legacy fallback check failed:", fallbackErr);
            }
          }
          
          if (!userDocSnap || !userDocSnap.exists()) {
            console.log(`[FIRESTORE] User not found in DB. Creating new user document at ${userDocRef.path}`);
            
            const accountNameVal = currentUser.displayName || currentUser.email?.split('@')[0] || "Champion";
            const newUserData = {
              uid: currentUser.uid,
              name: currentUser.displayName || "Champion",
              displayName: currentUser.displayName || "Champion",
              "Name": currentUser.displayName || "Champion",
              email: currentUser.email || `${currentUser.uid}@nexora.app`,
              "Email": currentUser.email || `${currentUser.uid}@nexora.app`,
              "Email address": currentUser.email || `${currentUser.uid}@nexora.app`,
              photoFileName: currentUser.photoURL || "",
              "Photo file name": currentUser.photoURL || "",
              profilePic: currentUser.photoURL || "",
              "Profile image": currentUser.photoURL || "",
              location: "",
              "Location": "",
              time: new Date().toISOString(),
              "Time": new Date().toISOString(),
              date: new Date().toISOString(),
              "Date": new Date().toISOString(),
              accountName: accountNameVal,
              "Account name": accountNameVal,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              role: "user",
              profilePrivacy: "private",
              settings: {
                ...DEFAULT_SETTINGS,
                profilePrivacy: "private",
                onboardingCompleted: false
              },
              stats: DEFAULT_STATS,
              garden: createInitialGardenState()
            };
            
            await setDoc(userDocRef, newUserData);
            setDoc(userSingularDocRef, newUserData).catch(() => {});
            docData = newUserData;
            rawSetNeedsOnboarding(true);
          } else {
            docData = userDocSnap.data();
            console.log(`[FIRESTORE] Loaded existing user document data:`, docData);
            
            // Asynchronously backfill missing profile fields without blocking profile loading
            const updates: any = {};
            let needsUpdate = false;
            
            if (docData.name === undefined || docData["Name"] === undefined) {
              const nameVal = docData.name || docData.displayName || currentUser.displayName || "Champion";
              updates.name = nameVal;
              updates["Name"] = nameVal;
              needsUpdate = true;
            }
            if (docData.email === undefined || docData["Email"] === undefined) {
              const emailVal = docData.email || currentUser.email || `${currentUser.uid}@nexora.app`;
              updates.email = emailVal;
              updates["Email"] = emailVal;
              needsUpdate = true;
            }
            if (docData.photoFileName === undefined || docData["Photo file name"] === undefined || docData["Profile image"] === undefined) {
              const picUrl = docData.profilePic || currentUser.photoURL || "";
              updates.photoFileName = picUrl;
              updates["Photo file name"] = picUrl;
              updates["Profile image"] = picUrl;
              needsUpdate = true;
            }
            if (docData.location === undefined || docData["Location"] === undefined) {
              const locVal = docData.location || "";
              updates.location = locVal;
              updates["Location"] = locVal;
              needsUpdate = true;
            }
            if (docData.time === undefined || docData["Time"] === undefined) {
              const timeVal = docData.time || new Date().toISOString();
              updates.time = timeVal;
              updates["Time"] = timeVal;
              needsUpdate = true;
            }
            if (docData.accountName === undefined || docData["Account name"] === undefined) {
              const actName = docData.accountName || currentUser.displayName || currentUser.email?.split('@')[0] || "Champion";
              updates.accountName = actName;
              updates["Account name"] = actName;
              needsUpdate = true;
            }
            if (docData.profilePrivacy === undefined) {
              updates.profilePrivacy = "private";
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              console.log(`[FIRESTORE] Asynchronously backfilling missing profile fields for existing user doc:`, updates);
              docData = { ...docData, ...updates };
              setDoc(userDocRef, updates, { merge: true }).catch(() => {});
              setDoc(userSingularDocRef, updates, { merge: true }).catch(() => {});
            }
          }
          
          if (docData) {
            // FAST PASS 1: Immediately hydrate User Profile, Coins, Plant Onboarding, and Core Stats from primary document (~50ms)
            try {
              const localCacheSettings = (isSameUser && !isUserSwitch) ? getCachedJson("nexora_settings", DEFAULT_SETTINGS) : DEFAULT_SETTINGS;
              const localCacheGarden = (isSameUser && !isUserSwitch) ? getCachedJson("nexora_garden", createInitialGardenState()) : createInitialGardenState();
              const localCacheStats = (isSameUser && !isUserSwitch) ? getCachedJson("nexora_stats", DEFAULT_STATS) : DEFAULT_STATS;

              const fastDisplayName = extractRealDisplayName(docData, currentUser);
              const fastProfilePic = extractRealProfilePic(docData, currentUser, localCacheSettings?.profilePic);
              const fastAccountName = extractRealAccountName(docData, currentUser);
              const fastEmail = docData.email || docData["Email"] || docData.settings?.email || currentUser?.email || "";
              const fastLocation = extractRealLocation(docData);
              const fastBio = extractRealBio(docData);

              // Comprehensive fast calculation for Plant Onboarding across docData, settings, localCache, garden, and ecosystem
              const fastPlantOnboardingCompleted = 
                (docData.plantSectionOnboardingCompleted === true) || 
                (docData.plantOnboardingCompleted === true) || 
                (docData.settings?.plantOnboardingCompleted === true) || 
                (docData.settings?.plantSectionOnboardingCompleted === true) ||
                (docData.hasEnteredGarden === true) ||
                (docData.settings?.hasEnteredGarden === true) ||
                (localCacheSettings?.plantOnboardingCompleted === true) ||
                (localCacheSettings?.plantSectionOnboardingCompleted === true) ||
                (localCacheSettings?.hasEnteredGarden === true) ||
                Boolean((docData.plantState || docData.settings?.plantState || localCacheSettings?.plantState) && (((docData.plantState?.stage || docData.settings?.plantState?.stage || localCacheSettings?.plantState?.stage) || 0) > 0 || ((docData.plantState?.growthPoints || docData.settings?.plantState?.growthPoints || localCacheSettings?.plantState?.growthPoints) || 0) > 0)) ||
                Boolean((docData.purchasedEcosystemItemIds?.length || 0) > 0 || (docData.activeEcosystemItemIds?.length || 0) > 0 || (localCacheSettings?.purchasedEcosystemItemIds?.length || 0) > 0) ||
                Boolean(localCacheGarden?.tiles?.some((t: any) => t.plantType || t.itemId || t.occupied));

              const fastOnboardingCompleted = isUserOnboardingCompleted(docData, null, localCacheSettings, currentUser.uid);
              if (fastOnboardingCompleted) {
                localStorage.setItem(`nexora_onboarding_completed_${currentUser.uid}`, "true");
                localStorage.setItem("nexora_onboarding_completed", "true");
              } else {
                localStorage.setItem(`nexora_onboarding_completed_${currentUser.uid}`, "false");
                localStorage.setItem("nexora_onboarding_completed", "false");
              }

              const fastPlantState = docData.plantState || docData.settings?.plantState || localCacheSettings?.plantState || DEFAULT_SETTINGS.plantState;
              const fastPlantsProgress = docData.plantsProgress || docData.settings?.plantsProgress || localCacheSettings?.plantsProgress || DEFAULT_SETTINGS.plantsProgress;

              const rawIsPro = Boolean(docData.isPro ?? docData.settings?.isPro ?? docData.subscription?.active);
              const rawPlan = docData.proPlan || docData.settings?.proPlan || docData.subscription?.plan || (rawIsPro ? "Yearly Master" : (localCacheSettings?.proPlan || DEFAULT_SETTINGS.proPlan));
              const testExpiresMs = parseTimestampMs(docData.proTestExpiresAt ?? docData.settings?.proTestExpiresAt ?? localCacheSettings?.proTestExpiresAt);
              const rawTestActive = Boolean(docData.proTestActive ?? docData.settings?.proTestActive ?? localCacheSettings?.proTestActive) && Boolean(testExpiresMs) && testExpiresMs! > Date.now();
              const isEffectivePro = isUserProUnlocked(currentUser.uid) || rawIsPro || (Boolean(localCacheSettings?.isPro) && localCacheSettings?.proPlan !== 'Free Tier') || rawTestActive;

              const fastSettingsObj: UserSettings = {
                ...DEFAULT_SETTINGS,
                ...(localCacheSettings || {}),
                ...(docData.settings || {}),
                displayName: fastDisplayName,
                profilePic: fastProfilePic,
                accountName: fastAccountName,
                email: fastEmail,
                location: fastLocation,
                plantOnboardingCompleted: fastPlantOnboardingCompleted,
                onboardingCompleted: fastOnboardingCompleted,
                plantState: fastPlantState,
                plantsProgress: fastPlantsProgress,
                isPro: isEffectivePro,
                proPlan: rawPlan,
                proActivatedAt: parseTimestampIso(docData.proActivatedAt ?? docData.settings?.proActivatedAt ?? docData.subscription?.activatedAt ?? localCacheSettings?.proActivatedAt),
                proExpiresAt: docData.proExpiresAt ?? docData.settings?.proExpiresAt ?? docData.subscription?.expiresAt ?? localCacheSettings?.proExpiresAt ?? (isEffectivePro && !rawTestActive ? 'Auto-Renewing' : null),
                proTestActive: rawTestActive,
                proTestStartedAt: parseTimestampIso(docData.proTestStartedAt ?? docData.settings?.proTestStartedAt ?? localCacheSettings?.proTestStartedAt),
                proTestExpiresAt: parseTimestampIso(docData.proTestExpiresAt ?? docData.settings?.proTestExpiresAt ?? localCacheSettings?.proTestExpiresAt),
                proTestRemainingMs: typeof (docData.proTestRemainingMs ?? docData.settings?.proTestRemainingMs ?? localCacheSettings?.proTestRemainingMs) === 'number' ? (docData.proTestRemainingMs ?? docData.settings?.proTestRemainingMs ?? localCacheSettings?.proTestRemainingMs) : null,
                proTestCooldownUntil: parseTimestampIso(docData.proTestCooldownUntil ?? docData.settings?.proTestCooldownUntil ?? localCacheSettings?.proTestCooldownUntil),
                proTestLastCompletedAt: parseTimestampIso(docData.proTestLastCompletedAt ?? docData.settings?.proTestLastCompletedAt ?? localCacheSettings?.proTestLastCompletedAt),
                proTestDay2Notified: Boolean(docData.proTestDay2Notified ?? docData.settings?.proTestDay2Notified ?? localCacheSettings?.proTestDay2Notified ?? false),
              };

              rawSetSettings((prev) => mergeSettings(fastSettingsObj, prev, DEFAULT_SETTINGS, currentUser.uid));
              rawSetNeedsOnboarding(!fastOnboardingCompleted);
              localStorage.setItem("nexora_settings", JSON.stringify(mergeSettings(fastSettingsObj, localCacheSettings, DEFAULT_SETTINGS, currentUser.uid)));

              const savedOrigStats = docData.originalStatsBeforeProTest || docData.settings?.originalStatsBeforeProTest;
              const isPermanentProUser = isUserProUnlocked(currentUser.uid) || (rawIsPro && rawPlan !== '4-Day Free Pro Test' && rawPlan !== 'Free Tier');
              const isPausedTestWithRemainingTime = !rawTestActive && typeof fastSettingsObj.proTestRemainingMs === 'number' && fastSettingsObj.proTestRemainingMs > 1000;
              const shouldRestoreStats = !rawTestActive && !isPermanentProUser && !isPausedTestWithRemainingTime && savedOrigStats && typeof savedOrigStats === "object";

              let fastCoins: number;
              let fastXP: number;
              let fastStreak: number;
              let fastBestStreak: number;
              let fastTotalPoints: number;
              let fastLevel: number;

              if (shouldRestoreStats) {
                fastStreak = Math.max(0, Number(savedOrigStats.streak) || 0);
                fastBestStreak = Math.max(fastStreak, Number(savedOrigStats.bestStreak) || 0);
                fastTotalPoints = Math.max(0, Number(savedOrigStats.totalPoints ?? savedOrigStats.xp) || 0);
                fastXP = Math.max(0, Number(savedOrigStats.xp) || 0);
                fastLevel = Math.max(1, Number(savedOrigStats.level) || 1);
                fastCoins = Math.max(0, Number(savedOrigStats.coins) || 0);
              } else {
                fastCoins = Math.max(
                  docData.coins || 0,
                  docData.stats?.coins || 0,
                  earlyRewardsData?.coins || 0,
                  earlyRewardsData?.stats?.coins || 0,
                  earlyStatsData?.coins || 0,
                  earlyStatsData?.stats?.coins || 0,
                  localCacheStats?.coins || 0,
                  DEFAULT_STATS.coins
                );
                fastXP = Math.max(
                  docData.xp || 0,
                  docData.stats?.xp || 0,
                  earlyRewardsData?.xp || 0,
                  earlyRewardsData?.stats?.xp || 0,
                  earlyStatsData?.xp || 0,
                  earlyStatsData?.stats?.xp || 0,
                  localCacheStats?.xp || 0,
                  DEFAULT_STATS.xp
                );
                fastStreak = Math.max(
                  docData.streak || 0,
                  docData.stats?.streak || 0,
                  earlyRewardsData?.streak || 0,
                  earlyRewardsData?.stats?.streak || 0,
                  earlyStatsData?.streak || 0,
                  earlyStatsData?.stats?.streak || 0,
                  localCacheStats?.streak || 0,
                  DEFAULT_STATS.streak
                );
                fastBestStreak = Math.max(
                  docData.bestStreak || 0,
                  docData.stats?.bestStreak || 0,
                  earlyRewardsData?.bestStreak || 0,
                  earlyRewardsData?.stats?.bestStreak || 0,
                  earlyStatsData?.bestStreak || 0,
                  earlyStatsData?.stats?.bestStreak || 0,
                  fastStreak,
                  localCacheStats?.bestStreak || 0,
                  DEFAULT_STATS.bestStreak
                );
                fastTotalPoints = Math.max(
                  docData.totalPoints || 0,
                  docData.stats?.totalPoints || 0,
                  docData.weeklyPoints || 0,
                  docData.weeklyXP || 0,
                  earlyRewardsData?.totalPoints || 0,
                  earlyRewardsData?.points || 0,
                  earlyStatsData?.totalPoints || 0,
                  earlyStatsData?.points || 0,
                  fastXP,
                  localCacheStats?.totalPoints || 0,
                  DEFAULT_STATS.totalPoints
                );
                fastLevel = Math.max(
                  docData.level || 1,
                  docData.stats?.level || 1,
                  earlyRewardsData?.level || 1,
                  earlyRewardsData?.stats?.level || 1,
                  earlyStatsData?.level || 1,
                  earlyStatsData?.stats?.level || 1,
                  localCacheStats?.level || 1,
                  DEFAULT_STATS.level || 1
                );
              }

              const fastStatsObj: UserStats = {
                ...DEFAULT_STATS,
                ...(localCacheStats || {}),
                ...(docData.stats || {}),
                streak: fastStreak,
                bestStreak: fastBestStreak,
                totalPoints: fastTotalPoints,
                xp: fastXP,
                level: fastLevel,
                coins: fastCoins,
                weeklyPoints: Math.max(docData.weeklyPoints || 0, docData.stats?.weeklyPoints || 0, localCacheStats?.weeklyPoints || 0, DEFAULT_STATS.weeklyPoints),
                weeklyXP: Math.max(docData.weeklyXP || 0, docData.stats?.weeklyXP || 0, localCacheStats?.weeklyXP || 0, DEFAULT_STATS.weeklyXP),
                gems: Math.max(docData.gems || 0, docData.stats?.gems || 0, localCacheStats?.gems || 0, DEFAULT_STATS.gems || 0),
                totalCompletedDays: docData.totalCompletedDays ?? docData.stats?.totalCompletedDays ?? localCacheStats?.totalCompletedDays ?? DEFAULT_STATS.totalCompletedDays,
                lastCompletedDate: docData.lastCompletedDate ?? docData.stats?.lastCompletedDate ?? localCacheStats?.lastCompletedDate ?? DEFAULT_STATS.lastCompletedDate ?? null,
                lastGiftDate: docData.lastGiftDate ?? docData.stats?.lastGiftDate ?? localCacheStats?.lastGiftDate ?? DEFAULT_STATS.lastGiftDate ?? null,
              };

              rawSetStats((prev) => mergeStats(fastStatsObj, prev, DEFAULT_STATS));
              localStorage.setItem("nexora_stats", JSON.stringify(mergeStats(fastStatsObj, localCacheStats, DEFAULT_STATS)));

              // Fast calculation for Garden State so plant tiles render immediately
              const fastGardenState: GardenState = {
                ...createInitialGardenState(),
                ...(localCacheGarden || {}),
                ...(docData.garden || {}),
                ...(docData.gardenState || {}),
              };
              rawSetGardenState(fastGardenState);
              localStorage.setItem("nexora_garden", JSON.stringify(fastGardenState));

              // Fast Gateway unlock: Release decision immediately for returning and new users (~50ms)
              setAuthLoading(false);
              setIsDataReady(true);
              setLoading(false);
              setIsHydrated(true);
              setIsStateHydrated(true);
            } catch (err) {
              console.warn("[FAST PASS HYDRATION] Early settings/stats calculation skipped:", err);
            }

            // Robust multi-layered parallel fetch of all auxiliary documents/subcollections
            let onboardingData: any = null;
            let rewardsData: any = null;
            let rewardsTopData: any = null;
            let rankTopData: any = null;
            let leaderboardTopData: any = null;
            let statsMainData: any = null;
            let statsTopData: any = null;
            let plantSectionData: any = null;
            let plantsTopData: any = null;
            let libraryTopData: any = null;
            let shopPurchasesTopData: any = null;
            let shopTopData: any = null;
            let userShopData: any = null;
            let notebookNotesList: any[] = [];
            let notebookDrawingsList: any[] = [];

            try {
              const onboardingIDRef = doc(db, "onboardingID", currentUser.uid);
              const onboardingSubdocRef = doc(db, "users", currentUser.uid, "onboarding", "main");
              const rewardsDocRef = doc(db, "users", currentUser.uid, "rewards", "main");
              const rewardsTopRef = doc(db, "rewards", currentUser.uid);
              const rankTopRef = doc(db, "rank", currentUser.uid);
              const leaderboardTopRef = doc(db, "leaderboard", currentUser.uid);
              const statsMainDocRef = doc(db, "users", currentUser.uid, "stats", "main");
              const statsTopRef = doc(db, "stats", currentUser.uid);
              const plantSectionDocRef = doc(db, "users", currentUser.uid, "plant_section", "main");
              const plantsTopRef = doc(db, "plants", currentUser.uid);
              const libraryTopRef = doc(db, "library", currentUser.uid);
              const shopPurchasesTopRef = doc(db, "shop_purchases", currentUser.uid);
              const shopTopRef = doc(db, "shop", currentUser.uid);
              const userShopDocRef = doc(db, "users", currentUser.uid, "shop", "main");
              const notebookRef = doc(db, "notebooks", currentUser.uid);

              const results = await Promise.allSettled([
                getDoc(onboardingIDRef),
                getDoc(onboardingSubdocRef),
                getDoc(rewardsDocRef),
                getDoc(rewardsTopRef),
                getDoc(rankTopRef),
                getDoc(leaderboardTopRef),
                getDoc(statsMainDocRef),
                getDoc(statsTopRef),
                getDoc(plantSectionDocRef),
                getDoc(plantsTopRef),
                getDoc(libraryTopRef),
                getDoc(shopPurchasesTopRef),
                getDoc(shopTopRef),
                getDoc(userShopDocRef),
                getDoc(notebookRef)
              ]);

              const rejectedAuxResults = results.filter(r => r.status === "rejected");
              if (rejectedAuxResults.length > 0) {
                console.warn("[FIRESTORE] Some auxiliary documents could not be fetched or do not exist yet. Gracefully continuing with available data.", rejectedAuxResults.length);
              }

              const onboardingIDSnap = results[0].status === "fulfilled" ? results[0].value : null;
              const onboardingSubdocSnap = results[1].status === "fulfilled" ? results[1].value : null;
              const rewardsSnap = results[2].status === "fulfilled" ? results[2].value : null;
              const rewardsTopSnap = results[3].status === "fulfilled" ? results[3].value : null;
              const rankTopSnap = results[4].status === "fulfilled" ? results[4].value : null;
              const leaderboardTopSnap = results[5].status === "fulfilled" ? results[5].value : null;
              const statsMainSnap = results[6].status === "fulfilled" ? results[6].value : null;
              const statsTopSnap = results[7].status === "fulfilled" ? results[7].value : null;
              const plantSectionSnap = results[8].status === "fulfilled" ? results[8].value : null;
              const plantsTopSnap = results[9].status === "fulfilled" ? results[9].value : null;
              const libraryTopSnap = results[10].status === "fulfilled" ? results[10].value : null;
              const shopPurchasesTopSnap = results[11].status === "fulfilled" ? results[11].value : null;
              const shopTopSnap = results[12].status === "fulfilled" ? results[12].value : null;
              const userShopSnap = results[13].status === "fulfilled" ? results[13].value : null;
              const notebookSnap = results[14].status === "fulfilled" ? results[14].value : null;

              if (onboardingIDSnap?.exists()) {
                onboardingData = onboardingIDSnap.data();
              } else if (onboardingSubdocSnap?.exists()) {
                onboardingData = onboardingSubdocSnap.data();
              }

              if (rewardsSnap?.exists()) rewardsData = rewardsSnap.data();
              if (rewardsTopSnap?.exists()) rewardsTopData = rewardsTopSnap.data();
              if (rankTopSnap?.exists()) rankTopData = rankTopSnap.data();
              if (leaderboardTopSnap?.exists()) leaderboardTopData = leaderboardTopSnap.data();
              if (statsMainSnap?.exists()) statsMainData = statsMainSnap.data();
              if (statsTopSnap?.exists()) statsTopData = statsTopSnap.data();
              if (plantSectionSnap?.exists()) plantSectionData = plantSectionSnap.data();
              if (plantsTopSnap?.exists()) plantsTopData = plantsTopSnap.data();
              if (libraryTopSnap?.exists()) libraryTopData = libraryTopSnap.data();
              if (shopPurchasesTopSnap?.exists()) shopPurchasesTopData = shopPurchasesTopSnap.data();
              if (shopTopSnap?.exists()) shopTopData = shopTopSnap.data();
              if (userShopSnap?.exists()) userShopData = userShopSnap.data();

              if (notebookSnap?.exists()) {
                const nbData = notebookSnap.data();
                if (nbData) {
                  if (Array.isArray(nbData.notes)) {
                    nbData.notes.forEach((item: any) => {
                      if (!item) return;
                      // Categorize correctly into notes vs drawings
                      if (item.text || item.content || item.category || item.neuralInsight || item.title) {
                        notebookNotesList.push(item);
                      } else if (item.lines || item.strokes || item.imageData || item.type === 'drawing') {
                        notebookDrawingsList.push(item);
                      } else {
                        notebookNotesList.push(item);
                      }
                    });
                  }
                  if (Array.isArray(nbData.gratitudeEntries)) {
                    nbData.gratitudeEntries.forEach((item: any) => {
                      if (item && !notebookNotesList.some((n: any) => n.id === item.id)) {
                        notebookNotesList.push(item);
                      }
                    });
                  }
                  if (Array.isArray(nbData.drawings)) {
                    nbData.drawings.forEach((d: any) => { if (d) notebookDrawingsList.push(d); });
                  }
                }
              }
            } catch (pErr) {
              console.warn("[FIRESTORE] Warning reading subcollection/auxiliary documents:", pErr);
            }

            // Extract plantState and plantsProgress from plant_section document, plants collection, user doc, or settings
            const finalPlantState = getBestPlantState(
              plantsTopData?.plantState,
              plantSectionData?.plantState,
              docData.plantState,
              docData.settings?.plantState
            );

            const finalPlantsProgress = getMergedPlantsProgress(
              plantsTopData?.plantsProgress,
              plantSectionData?.plantsProgress,
              docData.plantsProgress,
              docData.settings?.plantsProgress
            );

            const finalPlantOnboardingCompleted = 
              (onboardingData?.plantSectionOnboardingCompleted === true) || 
              (plantSectionData?.plantOnboardingCompleted === true) ||
              (plantSectionData?.plantSectionOnboardingCompleted === true) ||
              (docData.plantOnboardingCompleted === true) || 
              (docData.plantSectionOnboardingCompleted === true) || 
              (docData.settings?.plantOnboardingCompleted === true) || 
              (docData.settings?.plantSectionOnboardingCompleted === true) || 
              (plantsTopData?.plantOnboardingCompleted === true) ||
              Boolean(finalPlantState && ((finalPlantState.stage || 0) > 0 || (finalPlantState.growthPoints || 0) > 0)) ||
              false;

            const finalOnboardingCompleted = isUserOnboardingCompleted(
              docData,
              onboardingData,
              docData.settings,
              currentUser.uid,
              plantSectionData,
              plantsTopData
            );
              
            const finalSpaceOnboardingCompleted = 
              (docData.spaceOnboardingCompleted === true) ||
              (docData.settings?.spaceOnboardingCompleted === true) ||
              false;

            const finalPurchasedEcosystemItemIds = Array.from(new Set([
              ...(plantSectionData?.purchasedEcosystemItemIds || []),
              ...(plantsTopData?.purchasedEcosystemItemIds || []),
              ...(docData.purchasedEcosystemItemIds || docData.settings?.purchasedEcosystemItemIds || []),
              ...(shopTopData?.purchasedEcosystemItemIds || []),
              ...(shopPurchasesTopData?.purchasedEcosystemItemIds || [])
            ].filter(Boolean)));

            const finalActiveEcosystemItemIds = Array.from(new Set([
              ...(plantSectionData?.activeEcosystemItemIds || []),
              ...(plantsTopData?.activeEcosystemItemIds || []),
              ...(docData.activeEcosystemItemIds || docData.settings?.activeEcosystemItemIds || [])
            ].filter(Boolean)));

            // Merge Shop inventory across all Firestore locations to ensure no items are lost
            const mergedInventoryMap = new Map();
            [
              ...(Array.isArray(docData.inventory) ? docData.inventory : []),
              ...(Array.isArray(docData.settings?.inventory) ? docData.settings.inventory : []),
              ...(shopPurchasesTopData?.inventory || []),
              ...(shopTopData?.inventory || []),
              ...(userShopData?.inventory || []),
              ...(libraryTopData?.inventory || [])
            ].forEach((item: any) => {
              if (item && (item.id || item.itemId || item.name)) {
                const key = item.id || item.itemId || item.name;
                mergedInventoryMap.set(key, item);
              }
            });
            let mergedInventory: any[] = Array.from(mergedInventoryMap.values());

            // Merge Shop purchasedItems across all Firestore collections
            const mergedPurchasedItems = Array.from(new Set([
              ...(Array.isArray(docData.purchasedItems) ? docData.purchasedItems : []),
              ...(Array.isArray(docData.settings?.purchasedItems) ? docData.settings.purchasedItems : []),
              ...(shopPurchasesTopData?.purchasedItems || []),
              ...(shopTopData?.purchasedItems || []),
              ...(userShopData?.purchasedItems || []),
              ...(libraryTopData?.purchasedItems || [])
            ].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean)));

            // Build set of itemIds currently present in inventory
            const existingInventoryKeys = new Set(
              mergedInventory.map((item: any) => item?.itemId || item?.id).filter(Boolean)
            );

            // Auto-restore inventory item for any purchased item that is missing from inventory
            mergedInventory = autoRestoreInventoryFromPurchased(mergedPurchasedItems, mergedInventory);

            const mergedSavedChallenges = Array.from(new Set([
              ...(docData.savedChallengeIds || docData.settings?.savedChallengeIds || []),
              ...(libraryTopData?.savedChallengeIds || [])
            ].filter(Boolean)));

            const mergedSavedVideos = Array.from(new Set([
              ...(docData.savedVideoIds || docData.settings?.savedVideoIds || []),
              ...(libraryTopData?.savedVideoIds || libraryTopData?.savedVideos || [])
            ].filter(Boolean)));

            const mergedSavedPosts = Array.from(new Set([
              ...(docData.savedPostIds || docData.settings?.savedPostIds || []),
              ...(libraryTopData?.savedPostIds || [])
            ].filter(Boolean)));

            const mergedHouseItemIds = Array.from(new Set([
              ...(docData.purchasedHouseItemIds || docData.settings?.purchasedHouseItemIds || []),
              ...(shopTopData?.purchasedHouseItemIds || []),
              ...(shopPurchasesTopData?.purchasedHouseItemIds || [])
            ].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean)));

            const allProfileDocs = [
              docData,
              docData?.settings,
              leaderboardTopData,
              rankTopData,
              rewardsData,
              rewardsTopData,
              statsMainData,
              statsTopData
            ].filter(Boolean);

            const mappedSettings = {
              ...DEFAULT_SETTINGS,
              ...(docData.settings || {}),
              
              pushupsGoal: docData.pushupsGoal ?? docData.settings?.pushupsGoal ?? DEFAULT_SETTINGS.pushupsGoal,
              waterGoal: docData.waterGoal ?? docData.settings?.waterGoal ?? DEFAULT_SETTINGS.waterGoal,
              reminderTime: docData.reminderTime ?? docData.settings?.reminderTime ?? DEFAULT_SETTINGS.reminderTime,
              reminderTime2: docData.reminderTime2 ?? docData.settings?.reminderTime2 ?? DEFAULT_SETTINGS.reminderTime2,
              motivationTime: docData.motivationTime ?? docData.settings?.motivationTime ?? DEFAULT_SETTINGS.motivationTime,
              maxNotificationsPerDay: docData.maxNotificationsPerDay ?? docData.settings?.maxNotificationsPerDay ?? DEFAULT_SETTINGS.maxNotificationsPerDay ?? 5,
              displayName: extractRealDisplayName(allProfileDocs, currentUser),
              age: docData.age ?? docData.settings?.age ?? DEFAULT_SETTINGS.age,
              gender: docData.gender ?? docData.settings?.gender,
              profilePic: extractRealProfilePic(allProfileDocs, currentUser, currentUser?.photoURL),
              themeColor: docData.themeColor ?? docData.settings?.themeColor ?? DEFAULT_SETTINGS.themeColor,
              soundEnabled: docData.soundEnabled ?? docData.settings?.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
              notificationsEnabled: docData.notificationsEnabled ?? docData.settings?.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled,
              showQuotes: docData.showQuotes ?? docData.settings?.showQuotes ?? DEFAULT_SETTINGS.showQuotes,
              pushMotivationEnabled: docData.pushMotivationEnabled ?? docData.settings?.pushMotivationEnabled ?? DEFAULT_SETTINGS.pushMotivationEnabled,
              unitSystem: docData.unitSystem ?? docData.settings?.unitSystem ?? DEFAULT_SETTINGS.unitSystem,
              purchasedItems: mergedPurchasedItems,
              savedChallengeIds: mergedSavedChallenges,
              savedTrophyIds: docData.savedTrophyIds ?? docData.settings?.savedTrophyIds ?? DEFAULT_SETTINGS.savedTrophyIds ?? [],
              savedVideoIds: mergedSavedVideos,
              savedPostIds: mergedSavedPosts,
              activeHat: docData.activeHat ?? docData.settings?.activeHat ?? DEFAULT_SETTINGS.activeHat,
              activeSkin: docData.activeSkin ?? docData.settings?.activeSkin ?? DEFAULT_SETTINGS.activeSkin,
              zenModeEnabled: docData.zenModeEnabled ?? docData.settings?.zenModeEnabled ?? DEFAULT_SETTINGS.zenModeEnabled,
              isPro: isUserProUnlocked(currentUser?.uid) || Boolean(docData.isPro ?? docData.settings?.isPro ?? docData.subscription?.active ?? DEFAULT_SETTINGS.isPro),
              proPlan: docData.proPlan ?? docData.settings?.proPlan ?? docData.subscription?.plan ?? (docData.isPro || docData.settings?.isPro ? (docData.proTestActive ? '4-Day Free Pro Test' : 'Yearly Master') : (isUserProUnlocked(currentUser?.uid) ? 'Lifetime Master' : DEFAULT_SETTINGS.proPlan)),
              proActivatedAt: parseTimestampIso(docData.proActivatedAt ?? docData.settings?.proActivatedAt ?? docData.subscription?.activatedAt),
              proExpiresAt: docData.proExpiresAt ?? docData.settings?.proExpiresAt ?? docData.subscription?.expiresAt ?? (docData.isPro ? 'Auto-Renewing' : null),
              performanceMode: docData.performanceMode ?? docData.settings?.performanceMode ?? DEFAULT_SETTINGS.performanceMode,
              lowPowerMode: docData.lowPowerMode ?? docData.settings?.lowPowerMode ?? DEFAULT_SETTINGS.lowPowerMode,
              onboardingCompleted: finalOnboardingCompleted,
              plantOnboardingCompleted: finalPlantOnboardingCompleted,
              spaceOnboardingCompleted: finalSpaceOnboardingCompleted,
              hasNewPlantItem: docData.hasNewPlantItem ?? docData.settings?.hasNewPlantItem ?? DEFAULT_SETTINGS.hasNewPlantItem,
              challengeCountGoal: docData.challengeCountGoal ?? docData.settings?.challengeCountGoal ?? DEFAULT_SETTINGS.challengeCountGoal,
              inventory: mergedInventory,
              isDogSoundPackActive: docData.isDogSoundPackActive ?? docData.settings?.isDogSoundPackActive ?? DEFAULT_SETTINGS.isDogSoundPackActive,
              league: docData.league ?? docData.settings?.league ?? DEFAULT_SETTINGS.league,
              location: extractRealLocation(allProfileDocs) || docData.location || docData.settings?.location || DEFAULT_SETTINGS.location,
              timezone: docData.timezone ?? docData.settings?.timezone ?? DEFAULT_SETTINGS.timezone,
              fcmToken: docData.fcmToken ?? docData.settings?.fcmToken,
              badgeSettings: docData.badgeSettings ?? docData.settings?.badgeSettings ?? DEFAULT_SETTINGS.badgeSettings,
              purchasedHouseItemIds: mergedHouseItemIds,
              placedHouseItems: docData.placedHouseItems ?? docData.settings?.placedHouseItems ?? DEFAULT_SETTINGS.placedHouseItems ?? [],
              spaceHouseUnlocked: docData.spaceHouseUnlocked ?? docData.settings?.spaceHouseUnlocked ?? DEFAULT_SETTINGS.spaceHouseUnlocked,
              activeSpaceRoom: docData.activeSpaceRoom ?? docData.settings?.activeSpaceRoom ?? DEFAULT_SETTINGS.activeSpaceRoom ?? 0,
              plantState: finalPlantState,
              plantsProgress: finalPlantsProgress,
              purchasedEcosystemItemIds: finalPurchasedEcosystemItemIds,
              activeEcosystemItemIds: finalActiveEcosystemItemIds,
              mascotSize: docData.mascotSize ?? docData.settings?.mascotSize ?? DEFAULT_SETTINGS.mascotSize,
              mascotPos: docData.mascotPos ?? docData.settings?.mascotPos ?? DEFAULT_SETTINGS.mascotPos,
              mascotPinnedItemId: docData.mascotPinnedItemId ?? docData.settings?.mascotPinnedItemId ?? DEFAULT_SETTINGS.mascotPinnedItemId,
              hasEnteredGarden: docData.hasEnteredGarden ?? docData.settings?.hasEnteredGarden ?? DEFAULT_SETTINGS.hasEnteredGarden,
              isReelsDisabled: docData.isReelsDisabled ?? docData.settings?.isReelsDisabled ?? DEFAULT_SETTINGS.isReelsDisabled,
              joinedCircleIds: docData.joinedCircleIds ?? docData.settings?.joinedCircleIds ?? DEFAULT_SETTINGS.joinedCircleIds ?? [],
              
              // Trial test fields
              proTestActive: Boolean(docData.proTestActive ?? docData.settings?.proTestActive ?? false),
              proTestStartedAt: parseTimestampIso(docData.proTestStartedAt ?? docData.settings?.proTestStartedAt),
              proTestExpiresAt: parseTimestampIso(docData.proTestExpiresAt ?? docData.settings?.proTestExpiresAt),
              proTestRemainingMs: typeof (docData.proTestRemainingMs ?? docData.settings?.proTestRemainingMs) === 'number' ? (docData.proTestRemainingMs ?? docData.settings?.proTestRemainingMs) : null,
              proTestLastUsedAt: parseTimestampIso(docData.proTestLastUsedAt ?? docData.settings?.proTestLastUsedAt),
              proTestCooldownUntil: parseTimestampIso(docData.proTestCooldownUntil ?? docData.settings?.proTestCooldownUntil),
              proTestLastCompletedAt: parseTimestampIso(docData.proTestLastCompletedAt ?? docData.settings?.proTestLastCompletedAt),
              proTestDay2Notified: Boolean(docData.proTestDay2Notified ?? docData.settings?.proTestDay2Notified ?? false),
              
              accountName: extractRealAccountName(allProfileDocs, currentUser),
              email: docData.email || (docData.settings?.email) || currentUser.email || "",
              time: docData.time || docData["Time"] || (docData.settings?.time) || new Date().toISOString()
            };
            
            const savedOrigStats = docData.originalStatsBeforeProTest || docData.settings?.originalStatsBeforeProTest;
            const testExpiresMs = parseTimestampMs(docData.proTestExpiresAt ?? docData.settings?.proTestExpiresAt);
            const isTestActive = Boolean(docData.proTestActive ?? docData.settings?.proTestActive) && Boolean(testExpiresMs) && testExpiresMs! > Date.now();
            const isPermanentUser = isUserProUnlocked(currentUser?.uid) || (Boolean(docData.isPro ?? docData.settings?.isPro) && docData.proPlan !== '4-Day Free Pro Test' && docData.settings?.proPlan !== '4-Day Free Pro Test' && docData.proPlan !== 'Free Tier' && docData.settings?.proPlan !== 'Free Tier');
            const isPausedTest = !isTestActive && typeof (docData.proTestRemainingMs ?? docData.settings?.proTestRemainingMs) === 'number' && (docData.proTestRemainingMs ?? docData.settings?.proTestRemainingMs) > 1000;
            const shouldRestoreStats = !isTestActive && !isPermanentUser && !isPausedTest && savedOrigStats && typeof savedOrigStats === "object";
            const localCacheStats = (isSameUser && !isUserSwitch) ? getCachedJson("nexora_stats", DEFAULT_STATS) : DEFAULT_STATS;

            let finalStreak: number;
            let finalBestStreak: number;
            let finalTotalPoints: number;
            let finalXP: number;
            let finalLevel: number;
            let finalCoins: number;
            let finalWeeklyPoints: number;
            let finalWeeklyXP: number;

            if (shouldRestoreStats) {
              // Pro test expired or inactive: restore true free tier stats!
              finalStreak = Math.max(0, Number(savedOrigStats.streak) || 0);
              finalBestStreak = Math.max(finalStreak, Number(savedOrigStats.bestStreak) || 0);
              finalTotalPoints = Math.max(0, Number(savedOrigStats.totalPoints ?? savedOrigStats.xp) || 0);
              finalXP = Math.max(0, Number(savedOrigStats.xp) || 0);
              finalLevel = Math.max(1, Number(savedOrigStats.level) || 1);
              finalCoins = Math.max(0, Number(savedOrigStats.coins) || 0);
              finalWeeklyPoints = Math.max(0, Number(savedOrigStats.weeklyPoints) || 0);
              finalWeeklyXP = Math.max(0, Number(savedOrigStats.weeklyXP) || 0);
            } else {
              // Fallback stats fields using max/fallback across all collections to ensure we never lose progress
              const maxOverallPoints = Math.max(
                docData.totalPoints || 0,
                docData.stats?.totalPoints || 0,
                docData.weeklyPoints || 0,
                docData.weeklyXP || 0,
                docData.xp || 0,
                rewardsData?.totalPoints || 0,
                rewardsData?.points || 0,
                rewardsTopData?.totalPoints || 0,
                rewardsTopData?.points || 0,
                rankTopData?.totalPoints || 0,
                rankTopData?.points || 0,
                rankTopData?.weeklyPoints || 0,
                rankTopData?.weeklyXP || 0,
                leaderboardTopData?.totalPoints || 0,
                leaderboardTopData?.points || 0,
                leaderboardTopData?.weeklyPoints || 0,
                leaderboardTopData?.weeklyXP || 0,
                statsMainData?.totalPoints || 0,
                statsTopData?.totalPoints || 0,
                DEFAULT_STATS.totalPoints
              );

              finalStreak = Math.max(docData.streak || 0, docData.stats?.streak || 0, rewardsData?.streak || 0, rewardsTopData?.streak || 0, rankTopData?.streak || 0, leaderboardTopData?.streak || 0, statsMainData?.streak || 0, statsTopData?.streak || 0, DEFAULT_STATS.streak);
              finalBestStreak = Math.max(docData.bestStreak || 0, docData.stats?.bestStreak || 0, rewardsData?.bestStreak || 0, rewardsTopData?.bestStreak || 0, rankTopData?.bestStreak || 0, leaderboardTopData?.bestStreak || 0, statsMainData?.bestStreak || 0, statsTopData?.bestStreak || 0, DEFAULT_STATS.bestStreak);
              finalTotalPoints = maxOverallPoints;
              finalXP = Math.max(docData.xp || 0, docData.stats?.xp || 0, rewardsData?.xp || 0, rewardsTopData?.xp || 0, rankTopData?.xp || 0, leaderboardTopData?.xp || 0, statsMainData?.xp || 0, statsTopData?.xp || 0, maxOverallPoints, DEFAULT_STATS.xp);
              finalLevel = Math.max(docData.level || 1, docData.stats?.level || 1, rewardsData?.level || 1, rewardsTopData?.level || 1, rankTopData?.level || 1, leaderboardTopData?.level || 1, statsMainData?.level || 1, statsTopData?.level || 1, DEFAULT_STATS.level || 1);
              finalCoins = Math.max(
                docData.coins || 0,
                docData.stats?.coins || 0,
                rewardsData?.coins || 0,
                rewardsData?.stats?.coins || 0,
                rewardsTopData?.coins || 0,
                statsMainData?.coins || 0,
                statsTopData?.coins || 0,
                userShopData?.coins || 0,
                shopPurchasesTopData?.coins || 0,
                shopTopData?.coins || 0,
                localCacheStats?.coins || 0,
                DEFAULT_STATS.coins
              );
              finalWeeklyPoints = Math.max(docData.weeklyPoints || 0, docData.stats?.weeklyPoints || 0, rewardsData?.weeklyPoints || 0, rewardsTopData?.weeklyPoints || 0, rankTopData?.weeklyPoints || 0, leaderboardTopData?.weeklyPoints || 0, statsMainData?.weeklyPoints || 0, statsTopData?.weeklyPoints || 0, maxOverallPoints, DEFAULT_STATS.weeklyPoints);
              finalWeeklyXP = Math.max(docData.weeklyXP || 0, docData.stats?.weeklyXP || 0, rewardsData?.weeklyXP || 0, rewardsTopData?.weeklyXP || 0, rankTopData?.weeklyXP || 0, leaderboardTopData?.weeklyXP || 0, statsMainData?.weeklyXP || 0, statsTopData?.weeklyXP || 0, finalXP, maxOverallPoints, DEFAULT_STATS.weeklyXP);
            }
            
            // For complex structures, use the one that is non-empty
            const finalTrophies = (rewardsData?.trophies?.length > 0) ? rewardsData.trophies : ((rewardsTopData?.trophies?.length > 0) ? rewardsTopData.trophies : ((statsMainData?.trophies?.length > 0) ? statsMainData.trophies : ((docData.stats?.trophies?.length > 0) ? docData.stats.trophies : (docData.trophies || []))));
            const finalUnlockedHats = (rewardsData?.unlockedHats?.length > 0) ? rewardsData.unlockedHats : ((statsMainData?.unlockedHats?.length > 0) ? statsMainData.unlockedHats : ((docData.stats?.unlockedHats?.length > 0) ? docData.stats.unlockedHats : (docData.unlockedHats || [])));
            
            // Merge Notebook Notes cleanly so notes are 100% preserved
            const rawNotes = [
              ...(Array.isArray(notebookNotesList) ? notebookNotesList : []),
              ...(Array.isArray(docData.gratitudeEntries) ? docData.gratitudeEntries : []),
              ...(Array.isArray(docData.stats?.gratitudeEntries) ? docData.stats.gratitudeEntries : []),
              ...(Array.isArray(statsMainData?.gratitudeEntries) ? statsMainData.gratitudeEntries : []),
              ...(Array.isArray(rewardsData?.gratitudeEntries) ? rewardsData.gratitudeEntries : [])
            ];
            const notesMap = new Map();
            rawNotes.forEach((n: any) => {
              if (n && (n.id || n.text || n.content)) {
                const key = n.id || `${n.title || ''}-${n.date || n.createdAt || ''}-${(n.text || n.content || '').substring(0, 15)}`;
                if (!notesMap.has(key)) notesMap.set(key, n);
              }
            });
            const finalGratitudeEntries = Array.from(notesMap.values());

            // Merge drawings separately
            const rawDrawings = [
              ...(Array.isArray(notebookDrawingsList) ? notebookDrawingsList : []),
              ...(Array.isArray(docData.drawings) ? docData.drawings : []),
              ...(Array.isArray(docData.stats?.drawings) ? docData.stats.drawings : []),
              ...(Array.isArray(statsMainData?.drawings) ? statsMainData.drawings : []),
              ...(Array.isArray(libraryTopData?.savedDrawings) ? libraryTopData.savedDrawings : [])
            ];
            const mergedDrawingsMap = new Map();
            rawDrawings.forEach((d: any) => {
              if (d && (d.id || d.title || d.lines || d.imageData)) {
                const key = d.id || `${d.title}-${d.createdAt || ''}`;
                if (!mergedDrawingsMap.has(key)) mergedDrawingsMap.set(key, d);
              }
            });
            const finalDrawings = Array.from(mergedDrawingsMap.values());

            const mappedStats = {
              ...DEFAULT_STATS,
              ...(docData.stats || {}),
              
              streak: finalStreak,
              bestStreak: finalBestStreak,
              totalPoints: finalTotalPoints,
              xp: finalXP,
              level: finalLevel,
              totalCompletedDays: docData.totalCompletedDays ?? docData.stats?.totalCompletedDays ?? rewardsData?.totalCompletedDays ?? rewardsTopData?.totalCompletedDays ?? DEFAULT_STATS.totalCompletedDays,
              lastCompletedDate: docData.lastCompletedDate ?? docData.stats?.lastCompletedDate ?? rewardsData?.lastCompletedDate ?? rewardsTopData?.lastCompletedDate ?? DEFAULT_STATS.lastCompletedDate ?? null,
              lastGiftDate: docData.lastGiftDate ?? docData.stats?.lastGiftDate ?? rewardsData?.lastGiftDate ?? DEFAULT_STATS.lastGiftDate ?? null,
              currentChallengeIndex: docData.currentChallengeIndex ?? docData.stats?.currentChallengeIndex ?? rewardsData?.currentChallengeIndex ?? DEFAULT_STATS.currentChallengeIndex ?? 0,
              coins: finalCoins,
              gems: docData.gems ?? docData.stats?.gems ?? rewardsData?.gems ?? DEFAULT_STATS.gems ?? 0,
              weeklyPoints: finalWeeklyPoints,
              weeklyXP: finalWeeklyXP,
              lastWeeklyReset: docData.lastWeeklyReset ?? docData.stats?.lastWeeklyReset ?? rewardsData?.lastWeeklyReset ?? DEFAULT_STATS.lastWeeklyReset ?? null,
              lastRankRewardClaimWeek: docData.lastRankRewardClaimWeek ?? docData.stats?.lastRankRewardClaimWeek ?? rewardsData?.lastRankRewardClaimWeek ?? DEFAULT_STATS.lastRankRewardClaimWeek ?? null,
              lastActiveDate: docData.lastActiveDate ?? docData.stats?.lastActiveDate ?? rewardsData?.lastActiveDate ?? DEFAULT_STATS.lastActiveDate ?? null,
              trophies: finalTrophies,
              pointsByCategory: docData.pointsByCategory ?? docData.stats?.pointsByCategory ?? rewardsData?.pointsByCategory ?? DEFAULT_STATS.pointsByCategory,
              drawings: finalDrawings.length > 0 ? finalDrawings : (docData.drawings ?? DEFAULT_STATS.drawings ?? []),
              unlockedHats: finalUnlockedHats,
              gratitudeEntries: finalGratitudeEntries,
              waterDrank: docData.waterDrank ?? docData.stats?.waterDrank ?? rewardsData?.waterDrank ?? DEFAULT_STATS.waterDrank,
              lifetimeWaterCompletions: docData.lifetimeWaterCompletions ?? docData.stats?.lifetimeWaterCompletions ?? rewardsData?.lifetimeWaterCompletions ?? DEFAULT_STATS.lifetimeWaterCompletions,
              hasClaimedXpChest: docData.hasClaimedXpChest ?? docData.stats?.hasClaimedXpChest ?? rewardsData?.hasClaimedXpChest ?? DEFAULT_STATS.hasClaimedXpChest,
            };
            
            const gardenCandidates = [
              plantsTopData?.gardenState,
              plantSectionData?.gardenState,
              docData.gardenState,
              docData.garden,
              docData.settings?.gardenState,
            ].filter(Boolean);

            let bestTiles = createInitialGardenState().tiles;
            let maxPlacedCount = -1;
            for (const gCandidate of gardenCandidates) {
              if (Array.isArray(gCandidate.tiles) && gCandidate.tiles.length > 0) {
                const placedCount = gCandidate.tiles.filter((t: any) => t.plantType || t.itemId || t.occupied).length;
                if (placedCount > maxPlacedCount || gCandidate.tiles.length > bestTiles.length) {
                  bestTiles = gCandidate.tiles;
                  maxPlacedCount = placedCount;
                }
              }
            }

            const mergedSeedInventory: Record<string, number> = {
              ...(createInitialGardenState().inventory || {}),
              ...(plantsTopData?.seedsInventory || {}),
              ...(plantsTopData?.inventory || {}),
            };
            for (const gCandidate of gardenCandidates) {
              if (gCandidate.inventory && typeof gCandidate.inventory === 'object') {
                for (const [seedId, count] of Object.entries(gCandidate.inventory)) {
                  mergedSeedInventory[seedId] = Math.max(
                    mergedSeedInventory[seedId] || 0,
                    typeof count === 'number' ? count : 0
                  );
                }
              }
            }

            const pendingLootSeed =
              plantsTopData?.lastLuckySeedDrop ??
              plantsTopData?.pendingLootSeed ??
              plantSectionData?.gardenState?.pendingLootSeed ??
              docData.gardenState?.pendingLootSeed ??
              null;

            const mappedGarden: GardenState = {
              ...createInitialGardenState(),
              ...(docData.garden || {}),
              ...(docData.gardenState || {}),
              ...(plantSectionData?.gardenState || {}),
              ...(plantsTopData?.gardenState || {}),
              tiles: bestTiles,
              inventory: mergedSeedInventory,
              pendingLootSeed: pendingLootSeed,
              streakSavers: Math.max(
                plantsTopData?.gardenState?.streakSavers || 0,
                plantSectionData?.gardenState?.streakSavers || 0,
                docData.gardenState?.streakSavers || 0,
                docData.garden?.streakSavers || 0
              ),
              lastSeedDropAt: Math.max(
                plantsTopData?.gardenState?.lastSeedDropAt || 0,
                plantSectionData?.gardenState?.lastSeedDropAt || 0,
                docData.gardenState?.lastSeedDropAt || 0
              ),
            };

            // Retrieve the absolute latest local storage changes (e.g. offline work or quick edits)
            const cachedUser = localStorage.getItem("nexora_cached_user");
            const hasLocalStorage = localStorage.getItem("nexora_settings") !== null;
            
            let resolvedSettings = mappedSettings;
            let resolvedStats = mappedStats;
            let resolvedGarden = mappedGarden;

            // Strict account isolation guard: only merge local storage if it was created by THIS exact user
            if (hasLocalStorage && isSameUser && !isUserSwitch) {
              console.log("[PERSISTENCE] Matching local cache found. Performing safe merge...");
              const latestLocalSettings = getCachedJson("nexora_settings", DEFAULT_SETTINGS);
              const latestLocalStats = getCachedJson("nexora_stats", DEFAULT_STATS);
              const latestLocalGarden = getCachedJson("nexora_garden", createInitialGardenState());

              resolvedSettings = mergeSettings(mappedSettings, latestLocalSettings, DEFAULT_SETTINGS, user?.uid);
              resolvedStats = mergeStats(mappedStats, latestLocalStats, DEFAULT_STATS);
              resolvedGarden = mergeGarden(mappedGarden, latestLocalGarden, createInitialGardenState());
            } else {
              console.log("[PERSISTENCE] Fresh login, different user, or empty local cache. Skipping merge and trusting Firestore 100%.");
            }
            
            rawSetSettings(resolvedSettings);
            rawSetStats(resolvedStats);
            rawSetGardenState(resolvedGarden);
            
            localStorage.setItem("nexora_settings", JSON.stringify(resolvedSettings));
            localStorage.setItem("nexora_stats", JSON.stringify(resolvedStats));
            localStorage.setItem("nexora_garden", JSON.stringify(resolvedGarden));
            localStorage.setItem("nexora_cached_user", currentUser.uid);
            
            hydratedStateRef.current = {
              s: resolvedSettings,
              st: resolvedStats,
              g: resolvedGarden
            };
            
            // Load Today's Progress if it exists
            const defaultProgress = {
              date: today,
              completed: false,
              pushupsDone: false,
              waterDrank: 0,
              breathingDone: false,
              drawingDone: false,
              footballDone: false,
              bubblesDone: false,
              completionsCount: 0,
              customPlanCompleted: false,
              nextRestorationTime: null,
            };

            let progressSnap: any = null;
            try {
              const progressRef = doc(db, "users", currentUser.uid, "progress", today);
              try {
                progressSnap = await getDoc(progressRef);
              } catch (onlineErr: any) {
                console.warn("[FIRESTORE] Online progress fetch failed, attempting cache fetch:", onlineErr?.message || onlineErr);
                try {
                  progressSnap = await getDocFromCache(progressRef);
                } catch (cacheErr) {
                  progressSnap = null;
                }
              }
              
              let resolvedProgress: DailyProgress = defaultProgress;
              if (progressSnap && progressSnap.exists && progressSnap.exists()) {
                resolvedProgress = progressSnap.data() as DailyProgress;
              }

              if (hasLocalStorage && isSameUser && !isUserSwitch) {
                const latestLocalProgress = getCachedJson("nexora_progress", defaultProgress);
                if (latestLocalProgress.date === today) {
                  resolvedProgress = mergeProgress(resolvedProgress, latestLocalProgress, defaultProgress);
                }
              }

              rawSetDailyProgress(resolvedProgress);
              localStorage.setItem("nexora_progress", JSON.stringify(resolvedProgress));

              // Set lastSyncedRef.current to the RAW database values.
              // If the resolved (merged) state is different (has local progress), 
              // background sync will immediately detect the difference and write it to Firestore!
              const hasSnap = progressSnap && progressSnap.exists && progressSnap.exists();
              lastSyncedRef.current = {
                s: mappedSettings,
                st: mappedStats,
                p: {
                  c: hasSnap ? (progressSnap.data() as DailyProgress).completed : false,
                  cc: hasSnap ? (progressSnap.data() as DailyProgress).completionsCount : 0,
                  d: today,
                },
                g: mappedGarden
              };
            } catch (pErr) {
              console.warn("[FIRESTORE] Handled error/offline status loading progress data:", pErr);
              const latestLocalProgress = (isSameUser && !isUserSwitch) ? getCachedJson("nexora_progress", defaultProgress) : defaultProgress;
              rawSetDailyProgress(latestLocalProgress);
            }
            
            const hasExistingProgress = Boolean(
              docData && (
                (docData.onboardingCompleted === true) ||
                (docData.settings?.onboardingCompleted === true) ||
                (finalTotalPoints > 0) ||
                (finalXP > 0) ||
                (finalStreak > 0) ||
                (finalCoins > 0) ||
                (finalLevel > 1) ||
                (finalPlantState?.stage && finalPlantState.stage > 0) ||
                (finalPurchasedEcosystemItemIds && finalPurchasedEcosystemItemIds.length > 0) ||
                (mergedPurchasedItems && mergedPurchasedItems.length > 0) ||
                (finalTrophies && finalTrophies.length > 0) ||
                (finalGratitudeEntries && finalGratitudeEntries.length > 0) ||
                (finalDrawings && finalDrawings.length > 0) ||
                (docData.totalPoints || 0) > 0 ||
                (docData.xp || 0) > 0 ||
                (docData.streak || 0) > 0 ||
                (docData.coins || 0) > 0
              )
            );
            hasExistingUserProgressRef.current = hasExistingProgress;
            if (isUserSwitch && hasExistingProgress) {
              setIsSyncingData(true);
            }

            setNeedsOnboarding(!finalOnboardingCompleted);
            if (finalOnboardingCompleted) {
              localStorage.setItem("nexora_onboarding_completed", "true");
              localStorage.setItem(`nexora_onboarding_completed_${currentUser.uid}`, "true");
            } else {
              localStorage.setItem("nexora_onboarding_completed", "false");
              localStorage.setItem(`nexora_onboarding_completed_${currentUser.uid}`, "false");
            }
          }
          
          dataLoadedFromFirestore.current = true;
          setIsHydrated(true);
          hasMatchedHydratedStateRef.current = true;
          setIsStateLoaded(true, "Auth state resolved with loaded Firestore data. Hydration completed successfully.");
          setIsStateHydrated(true);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          
          // Fallback to local storage if offline/error so app continues functioning with full user data
          console.warn("[PERSISTENCE] Critical fetch error. Activating Offline Cache Mode with Write Lock to protect user data.");
          try {
            const cachedSettings = getCachedJson("nexora_settings", DEFAULT_SETTINGS);
            const cachedStats = getCachedJson("nexora_stats", DEFAULT_STATS);
            const cachedGarden = getCachedJson("nexora_garden", createInitialGardenState());
            const cachedProgress = getCachedJson("nexora_progress", {
              date: today,
              completed: false,
              pushupsDone: false,
              waterDrank: 0,
              breathingDone: false,
              drawingDone: false,
              footballDone: false,
              bubblesDone: false,
              completionsCount: 0,
              customPlanCompleted: false,
              nextRestorationTime: null,
            });
            rawSetSettings(cachedSettings);
            rawSetStats(cachedStats);
            rawSetGardenState(cachedGarden);
            rawSetDailyProgress(cachedProgress);
          } catch (cacheRestoreErr) {
            console.warn("[PERSISTENCE] Cache recovery warning:", cacheRestoreErr);
          }
          blockAllWritesRef.current = true;
          dataLoadedFromFirestore.current = true;
          setIsHydrated(true);
          setIsStateLoaded(true, "Auth load failed, fallback to local cache");
          hasMatchedHydratedStateRef.current = true;
          setIsStateHydrated(true);
          setNeedsOnboarding(false);
        } finally {
          if (loadTimeout) clearTimeout(loadTimeout);
          if (!isTimeoutActive) {
            setAuthLoading(false);
            setIsDataReady(true);
            setLoading(false);
          }
          if (isFreshLogin && hasExistingUserProgressRef.current) {
            // Keep syncing spinners active for 1200ms on fresh login so the user sees clear feedback
            setTimeout(() => {
              setIsSyncingData(false);
              if (typeof window !== "undefined") sessionStorage.removeItem("nexora_fresh_login");
            }, 1200);
          } else {
            setIsSyncingData(false);
            if (typeof window !== "undefined") sessionStorage.removeItem("nexora_fresh_login");
          }
        }
      } else {
        // Double-check if auth.currentUser exists synchronously to guard against transient nulls during SDK setup or updates
        if (auth.currentUser) {
          console.log("[STARTUP] Transient auth null intercepted. auth.currentUser is active:", auth.currentUser.uid);
          isInitialAuthResolutionDone.current = true;
          setUser(auth.currentUser);
          return;
        }

        const cachedUserKey = localStorage.getItem("nexora_cached_user");
        if (cachedUserKey && !isInitialAuthResolutionDone.current) {
          console.log(`[STARTUP] Cached user session detected ('${cachedUserKey}'). Polling for Firebase Auth token restoration...`);
          let restoredUser = auth.currentUser;
          const startTime = Date.now();
          while (!restoredUser && Date.now() - startTime < 3000) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            restoredUser = auth.currentUser;
          }

          if (restoredUser) {
            console.log("[STARTUP] Firebase Auth session restored during grace period:", restoredUser.uid);
            isInitialAuthResolutionDone.current = true;
            setUser(restoredUser);
            return;
          }
        }
        isInitialAuthResolutionDone.current = true;

        console.log(`[STARTUP] AUTH STATE RESOLVED - No active user session.`);
        lastLoadedUserIdRef.current = null;
        setUser(null);
        setIsSyncingData(false);

        rawSetSettings(DEFAULT_SETTINGS);
        rawSetStats(DEFAULT_STATS);
        rawSetGardenState(createInitialGardenState());
        rawSetDailyProgress({
          date: today,
          completed: false,
          pushupsDone: false,
          waterDrank: 0,
          breathingDone: false,
          drawingDone: false,
          footballDone: false,
          bubblesDone: false,
          completionsCount: 0,
          customPlanCompleted: false,
          nextRestorationTime: null,
        });

        dataLoadedFromFirestore.current = false;
        setIsHydrated(false);
        setIsStateLoaded(false, "No user session");
        hasMatchedHydratedStateRef.current = false;
        setIsStateHydrated(false);
        setNeedsOnboarding(false);
        setAuthLoading(false);
        setIsDataReady(true);
        setLoading(false);
      }
    });
    return () => {
      unsubscribeAuth();
      if (loadTimeout) clearTimeout(loadTimeout);
    };
  }, []);

  // Background Sync Effect with Aggressive Throttling (Optimized)
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;
    if (!isStateLoadedRef.current || !hasMatchedHydratedStateRef.current) {
      console.log(`[PERSISTENCE AUDIT] State is not fully loaded/synchronized with Firestore yet. Skipping background sync for user UID: ${user.uid}`);
      return;
    }

    const syncData = async () => {
      if (blockAllWritesRef.current) {
        console.warn(`[PERSISTENCE FIX] Writes are strictly locked to prevent data loss. Initial user profile failed to load or timed out. Aborting syncData.`);
        return;
      }
      if (quotaExceededRef.current) return;

      const currentState = {
        s: settings,
        st: stats,
        p: {
          c: dailyProgress.completed,
          cc: dailyProgress.completionsCount,
          d: dailyProgress.date,
        },
        g: gardenState,
      };

      if (lastSyncedRef.current && deepEqual(currentState, lastSyncedRef.current)) return;

      setIsSyncingData(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const userSingularRef = doc(db, "user", user.uid);
        const progressRef = doc(db, "users", user.uid, "progress", today);
        const leaderboardRef = doc(db, "leaderboard", user.uid);

        console.log(`[PERSISTENCE AUDIT] AUTH UID ON SAVE: ${user.uid}`);
        console.log(`[PERSISTENCE AUDIT] FIRESTORE DOCUMENT PATH BEING WRITTEN: users/${user.uid}`);
        console.log(`[PERSISTENCE AUDIT] Target progress document path: ${progressRef.path}`);

        // 1. Check if core settings/stats/garden changed
        const lastSyncedData = lastSyncedRef.current;
        const coreChanged =
          !lastSyncedData ||
          !deepEqual(lastSyncedData.s, settings) ||
          !deepEqual(lastSyncedData.st, stats) ||
          !deepEqual(lastSyncedData.g, gardenState);

        if (coreChanged) {
          console.log(`[PERSISTENCE AUDIT] Core fields changed. Initiating write for core document...`);
          console.log(`[PERSISTENCE AUDIT] Exact Firestore path: ${userRef.path}`);
          
          try {
            console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${userRef.path}`);
            const preSnap = await getDocSafely(userRef);
            const dbData = preSnap.exists() ? preSnap.data() : null;
            console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${userRef.path}:`, dbData ? JSON.stringify(dbData) : "Document does not exist");
            
            // CRITICAL DEFENSIVE GUARD: Never let uninitialized/empty stats overwrite positive Firestore stats
            if (dbData) {
              const dbStats = {
                ...DEFAULT_STATS,
                ...(dbData.stats || {}),
                streak: dbData.streak ?? dbData.stats?.streak ?? DEFAULT_STATS.streak,
                bestStreak: dbData.bestStreak ?? dbData.stats?.bestStreak ?? DEFAULT_STATS.bestStreak,
                totalPoints: dbData.totalPoints ?? dbData.stats?.totalPoints ?? DEFAULT_STATS.totalPoints,
                xp: dbData.xp ?? dbData.stats?.xp ?? DEFAULT_STATS.xp,
                level: dbData.level ?? dbData.stats?.level ?? DEFAULT_STATS.level,
                coins: Math.max(dbData.coins || 0, dbData.stats?.coins || 0, DEFAULT_STATS.coins),
                weeklyPoints: dbData.weeklyPoints ?? dbData.stats?.weeklyPoints ?? DEFAULT_STATS.weeklyPoints,
                weeklyXP: dbData.weeklyXP ?? dbData.stats?.weeklyXP ?? DEFAULT_STATS.weeklyXP,
              };
              const dbGarden = {
                ...createInitialGardenState(),
                ...(dbData.garden || {}),
                tiles: dbData.garden?.tiles ?? dbData.tiles ?? createInitialGardenState().tiles,
                inventory: dbData.garden?.inventory ?? createInitialGardenState().inventory,
              };
              const dbSettings = {
                ...DEFAULT_SETTINGS,
                ...(dbData.settings || {}),
                displayName: dbData.displayName ?? dbData.name ?? dbData.settings?.displayName ?? DEFAULT_SETTINGS.displayName,
                onboardingCompleted: dbData.onboardingCompleted ?? dbData.settings?.onboardingCompleted ?? DEFAULT_SETTINGS.onboardingCompleted,
                plantState: dbData.plantState ?? dbData.settings?.plantState ?? DEFAULT_SETTINGS.plantState,
              };

              const dbHasProgress = (dbStats.xp > 0 || dbStats.coins > 0 || (dbStats.totalPoints || 0) > 0 || (dbStats.streak || 0) > 0);
              const dbHasGarden = (dbGarden.tiles && dbGarden.tiles.length > 0) || (dbGarden.inventory && Object.keys(dbGarden.inventory).length > 0);
              const dbHasSettings = (dbSettings.displayName && dbSettings.displayName !== "Nexora User" && dbSettings.displayName !== "Champion") || (dbSettings.plantState?.stage || 0) > 0 || (dbSettings.plantState?.growthPoints || 0) > 0;

              const localIsEmptyStats = (stats.xp === 0 && stats.coins === 0 && (stats.totalPoints || 0) === 0 && (stats.streak || 0) === 0);
              const localIsEmptyGarden = !gardenState.tiles || gardenState.tiles.length === 0;
              const localIsEmptySettings = (!settings.displayName || settings.displayName === "Nexora User" || settings.displayName === "Champion") && (settings.plantState?.stage || 0) === 0 && (settings.plantState?.growthPoints || 0) === 0;

              // STALENESS GUARD: If Firestore contains progress but local states are currently empty,
              // check if lastSyncedData has already captured non-empty values. If so, local state is just stale (React is flushing updates).
              // We must abort this sync pass immediately without triggering the emergency block or overwriting DB.
              const isLocalStateUnhydrated = 
                (lastSyncedData && lastSyncedData.st && ((lastSyncedData.st.xp || 0) > 0 || (lastSyncedData.st.coins || 0) > 0) && localIsEmptyStats) ||
                (lastSyncedData && lastSyncedData.s && (lastSyncedData.s.displayName && lastSyncedData.s.displayName !== "Nexora User" && lastSyncedData.s.displayName !== "Champion") && localIsEmptySettings) ||
                (lastSyncedData && lastSyncedData.g && (lastSyncedData.g.tiles && lastSyncedData.g.tiles.length > 0) && localIsEmptyGarden);

              if (isLocalStateUnhydrated) {
                console.log("[PERSISTENCE SYSTEM] Local React state has not yet updated to the hydrated Firestore values in syncData. Aborting sync pass.");
                return;
              }

              const streakOverwritten = localIsEmptyStats && (dbStats.streak > stats.streak && stats.streak <= 1 && dbStats.streak > 1);
              const plantOverwritten = (dbSettings.plantState?.type === settings.plantState?.type && (dbSettings.plantState?.stage || 0) > (settings.plantState?.stage || 0) && (settings.plantState?.stage || 0) <= 1 && (dbSettings.plantState?.stage || 0) > 1);

              if (
                (dbHasProgress && localIsEmptyStats) ||
                (dbHasGarden && localIsEmptyGarden) ||
                (dbHasSettings && localIsEmptySettings) ||
                streakOverwritten ||
                plantOverwritten
              ) {
                console.warn(`[PERSISTENCE SYSTEM] Auto-rehydrating local state from Firestore data in syncData. DB Stats Has Progress: ${dbHasProgress}, Local Is Empty Stats: ${localIsEmptyStats}. DB Garden Has Data: ${dbHasGarden}, Local Is Empty Garden: ${localIsEmptyGarden}. DB Settings Has Info: ${dbHasSettings}, Local Is Empty Settings: ${localIsEmptySettings}. Streak Overwritten: ${streakOverwritten}, Plant Overwritten: ${plantOverwritten}. Aborting write to protect data.`);
                
                // Trigger emergency recovery: update local state to match database
                if (dbData.stats || dbData.xp !== undefined || dbData.coins !== undefined) {
                  setStats({
                    ...DEFAULT_STATS,
                    ...dbData.stats,
                    streak: dbData.streak ?? dbData.stats?.streak ?? DEFAULT_STATS.streak,
                    bestStreak: dbData.bestStreak ?? dbData.stats?.bestStreak ?? DEFAULT_STATS.bestStreak,
                    totalPoints: dbData.totalPoints ?? dbData.stats?.totalPoints ?? DEFAULT_STATS.totalPoints,
                    xp: dbData.xp ?? dbData.stats?.xp ?? DEFAULT_STATS.xp,
                    level: dbData.level ?? dbData.stats?.level ?? DEFAULT_STATS.level,
                    coins: Math.max(dbData.coins || 0, dbData.stats?.coins || 0, DEFAULT_STATS.coins),
                    weeklyPoints: dbData.weeklyPoints ?? dbData.stats?.weeklyPoints ?? DEFAULT_STATS.weeklyPoints,
                    weeklyXP: dbData.weeklyXP ?? dbData.stats?.weeklyXP ?? DEFAULT_STATS.weeklyXP,
                    trophies: dbData.trophies ?? dbData.stats?.trophies ?? [],
                    drawings: dbData.drawings ?? dbData.stats?.drawings ?? [],
                    unlockedHats: dbData.unlockedHats ?? dbData.stats?.unlockedHats ?? [],
                    gratitudeEntries: dbData.gratitudeEntries ?? dbData.stats?.gratitudeEntries ?? [],
                    totalCompletedDays: dbData.totalCompletedDays ?? dbData.stats?.totalCompletedDays ?? DEFAULT_STATS.totalCompletedDays,
                    lastCompletedDate: dbData.lastCompletedDate ?? dbData.stats?.lastCompletedDate ?? DEFAULT_STATS.lastCompletedDate ?? null,
                    lastGiftDate: dbData.lastGiftDate ?? dbData.stats?.lastGiftDate ?? DEFAULT_STATS.lastGiftDate ?? null,
                    currentChallengeIndex: dbData.currentChallengeIndex ?? dbData.stats?.currentChallengeIndex ?? DEFAULT_STATS.currentChallengeIndex ?? 0,
                    gems: dbData.gems ?? dbData.stats?.gems ?? DEFAULT_STATS.gems ?? 0,
                    lastWeeklyReset: dbData.lastWeeklyReset ?? dbData.stats?.lastWeeklyReset ?? DEFAULT_STATS.lastWeeklyReset ?? null,
                    lastRankRewardClaimWeek: dbData.lastRankRewardClaimWeek ?? dbData.stats?.lastRankRewardClaimWeek ?? DEFAULT_STATS.lastRankRewardClaimWeek ?? null,
                    claimedRankRewards: dbData.claimedRankRewards ?? dbData.stats?.claimedRankRewards ?? DEFAULT_STATS.claimedRankRewards ?? {},
                    lastClaimedRank: dbData.lastClaimedRank ?? dbData.stats?.lastClaimedRank ?? DEFAULT_STATS.lastClaimedRank ?? undefined,
                    lowestRankSinceClaim: dbData.lowestRankSinceClaim ?? dbData.stats?.lowestRankSinceClaim ?? DEFAULT_STATS.lowestRankSinceClaim ?? undefined,
                    lastActiveDate: dbData.lastActiveDate ?? dbData.stats?.lastActiveDate ?? DEFAULT_STATS.lastActiveDate ?? null,
                    pointsByCategory: dbData.pointsByCategory ?? dbData.stats?.pointsByCategory ?? DEFAULT_STATS.pointsByCategory,
                    waterDrank: dbData.waterDrank ?? dbData.stats?.waterDrank ?? DEFAULT_STATS.waterDrank,
                    lifetimeWaterCompletions: dbData.lifetimeWaterCompletions ?? dbData.stats?.lifetimeWaterCompletions ?? DEFAULT_STATS.lifetimeWaterCompletions,
                    hasClaimedXpChest: dbData.hasClaimedXpChest ?? dbData.stats?.hasClaimedXpChest ?? DEFAULT_STATS.hasClaimedXpChest,
                  });
                }
                if (dbData.settings || dbData.displayName || dbData.onboardingCompleted !== undefined) {
                  setSettings((prev: any) => {
                    const dbSettings = dbData.settings || {};
                    const isPlantOnboardingDone = 
                      (dbData.plantOnboardingCompleted === true) || 
                      (dbData.plantSectionOnboardingCompleted === true) || 
                      (dbSettings.plantOnboardingCompleted === true) || 
                      (dbSettings.plantSectionOnboardingCompleted === true) || 
                      Boolean((dbData.plantState || dbSettings.plantState) && (((dbData.plantState?.stage || dbSettings.plantState?.stage) || 0) > 0 || ((dbData.plantState?.growthPoints || dbSettings.plantState?.growthPoints) || 0) > 0)) ||
                      Boolean(prev.plantOnboardingCompleted);

                    const isOnboardingDone = 
                      (dbData.onboardingCompleted === true) || 
                      (dbData.newUsersOnboardingCompleted === true) || 
                      (dbSettings.onboardingCompleted === true) || 
                      Boolean(prev.onboardingCompleted);

                    return {
                      ...DEFAULT_SETTINGS,
                      ...prev,
                      ...dbSettings,
                      displayName: extractRealDisplayName(dbData, user) || dbSettings.displayName || DEFAULT_SETTINGS.displayName,
                      profilePic: extractRealProfilePic(dbData, user) || dbSettings.profilePic || DEFAULT_SETTINGS.profilePic,
                      onboardingCompleted: isOnboardingDone,
                      plantOnboardingCompleted: isPlantOnboardingDone,
                      spaceOnboardingCompleted: dbData.spaceOnboardingCompleted ?? dbSettings.spaceOnboardingCompleted ?? DEFAULT_SETTINGS.spaceOnboardingCompleted,
                      purchasedItems: Array.from(new Set([...(prev.purchasedItems || []), ...(dbData.purchasedItems || []), ...(dbSettings.purchasedItems || [])].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean))),
                      inventory: autoRestoreInventoryFromPurchased(
                        Array.from(new Set([...(prev.purchasedItems || []), ...(dbData.purchasedItems || []), ...(dbSettings.purchasedItems || [])].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean))),
                        Array.from(new Map([...(prev.inventory || []), ...(dbData.inventory || []), ...(dbSettings.inventory || [])].map((item: any) => [item.id || item.itemId || item.name, item])).values())
                      ),
                      plantState: dbData.plantState ?? dbSettings.plantState ?? DEFAULT_SETTINGS.plantState,
                      plantsProgress: dbData.plantsProgress ?? dbSettings.plantsProgress ?? DEFAULT_SETTINGS.plantsProgress,
                      purchasedEcosystemItemIds: dbData.purchasedEcosystemItemIds ?? dbSettings.purchasedEcosystemItemIds ?? DEFAULT_SETTINGS.purchasedEcosystemItemIds,
                      activeEcosystemItemIds: dbData.activeEcosystemItemIds ?? dbSettings.activeEcosystemItemIds ?? DEFAULT_SETTINGS.activeEcosystemItemIds,
                      savedChallengeIds: dbData.savedChallengeIds ?? dbSettings.savedChallengeIds ?? DEFAULT_SETTINGS.savedChallengeIds,
                      savedTrophyIds: dbData.savedTrophyIds ?? dbSettings.savedTrophyIds ?? DEFAULT_SETTINGS.savedTrophyIds,
                      savedVideoIds: dbData.savedVideoIds ?? dbSettings.savedVideoIds ?? DEFAULT_SETTINGS.savedVideoIds,
                      savedPostIds: dbData.savedPostIds ?? dbSettings.savedPostIds ?? DEFAULT_SETTINGS.savedPostIds,
                      activeHat: dbData.activeHat ?? dbSettings.activeHat ?? DEFAULT_SETTINGS.activeHat,
                      activeSkin: dbData.activeSkin ?? dbSettings.activeSkin ?? DEFAULT_SETTINGS.activeSkin,
                      joinedCircleIds: dbData.joinedCircleIds ?? dbSettings.joinedCircleIds ?? DEFAULT_SETTINGS.joinedCircleIds,
                      purchasedHouseItemIds: dbData.purchasedHouseItemIds ?? dbSettings.purchasedHouseItemIds ?? DEFAULT_SETTINGS.purchasedHouseItemIds,
                      placedHouseItems: dbData.placedHouseItems ?? dbSettings.placedHouseItems ?? DEFAULT_SETTINGS.placedHouseItems,
                      spaceHouseUnlocked: dbData.spaceHouseUnlocked ?? dbSettings.spaceHouseUnlocked ?? DEFAULT_SETTINGS.spaceHouseUnlocked,
                      activeSpaceRoom: dbData.activeSpaceRoom ?? dbSettings.activeSpaceRoom ?? DEFAULT_SETTINGS.activeSpaceRoom,
                      isPro: isUserProUnlocked(user?.uid) || Boolean(dbData.isPro ?? dbSettings.isPro ?? dbData.subscription?.active ?? prev.isPro),
                      proPlan: dbData.proPlan ?? dbSettings.proPlan ?? dbData.subscription?.plan ?? (dbData.isPro || dbSettings.isPro ? 'Yearly Master' : prev.proPlan),
                      proActivatedAt: parseTimestampIso(dbData.proActivatedAt ?? dbSettings.proActivatedAt ?? dbData.subscription?.activatedAt ?? prev.proActivatedAt),
                      proExpiresAt: dbData.proExpiresAt ?? dbSettings.proExpiresAt ?? dbData.subscription?.expiresAt ?? prev.proExpiresAt,
                      proTestActive: Boolean(dbData.proTestActive ?? dbSettings.proTestActive ?? prev.proTestActive),
                      proTestStartedAt: parseTimestampIso(dbData.proTestStartedAt ?? dbSettings.proTestStartedAt ?? prev.proTestStartedAt),
                      proTestExpiresAt: parseTimestampIso(dbData.proTestExpiresAt ?? dbSettings.proTestExpiresAt ?? prev.proTestExpiresAt),
                      proTestRemainingMs: typeof (dbData.proTestRemainingMs ?? dbSettings.proTestRemainingMs ?? prev.proTestRemainingMs) === 'number' ? (dbData.proTestRemainingMs ?? dbSettings.proTestRemainingMs ?? prev.proTestRemainingMs) : null,
                      proTestLastUsedAt: parseTimestampIso(dbData.proTestLastUsedAt ?? dbSettings.proTestLastUsedAt ?? prev.proTestLastUsedAt),
                      proTestCooldownUntil: parseTimestampIso(dbData.proTestCooldownUntil ?? dbSettings.proTestCooldownUntil ?? prev.proTestCooldownUntil),
                      proTestLastCompletedAt: parseTimestampIso(dbData.proTestLastCompletedAt ?? dbSettings.proTestLastCompletedAt ?? prev.proTestLastCompletedAt),
                      proTestDay2Notified: Boolean(dbData.proTestDay2Notified ?? dbSettings.proTestDay2Notified ?? prev.proTestDay2Notified),
                      lastViewedRank: dbData.lastViewedRank ?? dbSettings.lastViewedRank ?? undefined,
                    };
                  });
                }
                if (dbData.garden || dbData.tiles !== undefined) {
                  setGardenState((prev: any) => ({
                    ...createInitialGardenState(),
                    ...prev,
                    ...(dbData.garden || {}),
                    tiles: dbData.garden?.tiles ?? dbData.tiles ?? prev.tiles ?? createInitialGardenState().tiles,
                    inventory: dbData.garden?.inventory ?? prev.inventory ?? createInitialGardenState().inventory,
                  }));
                }
                lastSyncedRef.current = {
                  st: JSON.parse(JSON.stringify(stats)),
                  s: JSON.parse(JSON.stringify(settings)),
                  dp: JSON.parse(JSON.stringify(dailyProgress)),
                  g: JSON.parse(JSON.stringify(gardenState))
                };
                return;
              }
            }

            const resolvedDisplayName = settings.displayName || user.displayName || 'Champion';
            const resolvedProfilePic = settings.profilePic || user.photoURL || '';
            const resolvedAccountName = settings.accountName || resolvedDisplayName;
            const resolvedLocation = settings.location || '';

            const writePayload = cleanPayload({
              name: resolvedDisplayName,
              displayName: resolvedDisplayName,
              ["Name"]: resolvedDisplayName,
              ["Account name"]: resolvedAccountName,
              accountName: resolvedAccountName,
              username: resolvedAccountName,
              photoFileName: resolvedProfilePic,
              profilePic: resolvedProfilePic,
              photoURL: resolvedProfilePic,
              ["Photo file name"]: resolvedProfilePic,
              ["Profile image"]: resolvedProfilePic,
              avatar: resolvedProfilePic,
              location: resolvedLocation,
              ["Location"]: resolvedLocation,
              time: new Date().toISOString(),
              ...settings,
              isPro: settings.isPro || false,
              proPlan: settings.proPlan || (settings.isPro ? 'Yearly Master' : 'Free Tier'),
              proActivatedAt: parseTimestampIso(settings.proActivatedAt) || null,
              proExpiresAt: settings.proExpiresAt || null,
              proTestActive: settings.proTestActive || false,
              proTestExpiresAt: parseTimestampIso(settings.proTestExpiresAt) || null,
              proTestStartedAt: parseTimestampIso(settings.proTestStartedAt) || null,
              proTestRemainingMs: settings.proTestRemainingMs !== undefined ? settings.proTestRemainingMs : null,
              proTestCooldownUntil: parseTimestampIso(settings.proTestCooldownUntil) || null,
              proTestLastCompletedAt: parseTimestampIso(settings.proTestLastCompletedAt) || null,
              proTestDay2Notified: settings.proTestDay2Notified || false,
              settings: {
                ...settings,
                displayName: resolvedDisplayName,
                profilePic: resolvedProfilePic,
                accountName: resolvedAccountName,
                photoFileName: resolvedProfilePic,
                photoURL: resolvedProfilePic,
                location: resolvedLocation,
                isPro: settings.isPro || false,
                proPlan: settings.proPlan || (settings.isPro ? 'Yearly Master' : 'Free Tier'),
                proActivatedAt: parseTimestampIso(settings.proActivatedAt) || null,
                proExpiresAt: settings.proExpiresAt || null,
                proTestActive: settings.proTestActive || false,
                proTestExpiresAt: parseTimestampIso(settings.proTestExpiresAt) || null,
                proTestStartedAt: parseTimestampIso(settings.proTestStartedAt) || null,
                proTestRemainingMs: settings.proTestRemainingMs !== undefined ? settings.proTestRemainingMs : null,
                proTestCooldownUntil: parseTimestampIso(settings.proTestCooldownUntil) || null,
                proTestLastCompletedAt: parseTimestampIso(settings.proTestLastCompletedAt) || null,
                proTestDay2Notified: settings.proTestDay2Notified || false,
              },
              uid: user.uid,
              email: user.email || `${user.uid}@nexora.app`,
              role: 'user',
              stats: stats,
              coins: stats.coins || 0,
              xp: stats.xp || 0,
              streak: stats.streak || 0,
              bestStreak: stats.bestStreak || 0,
              totalPoints: stats.totalPoints || 0,
              level: stats.level || 1,
              plantOnboardingCompleted: settings.plantOnboardingCompleted || false,
              plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
              garden: gardenState,
              isTodayCompleted: dailyProgress.completed,
              updatedAt: serverTimestamp(),
              onboardingCompleted: settings.onboardingCompleted || false,
            });

            const rewardsPayload = cleanPayload({
              uid: user.uid,
              userName: settings.displayName || user.displayName || 'Champion',
              streak: stats.streak || 0,
              bestStreak: stats.bestStreak || 0,
              xp: stats.xp || 0,
              coins: stats.coins || 0,
              weeklyPoints: stats.weeklyPoints || 0,
              weeklyXP: stats.weeklyXP || 0,
              totalPoints: stats.totalPoints || 0,
              trophies: stats.trophies || [],
              pointsByCategory: stats.pointsByCategory || { physical: 0, mental: 0, creative: 0 },
              updatedAt: serverTimestamp(),
              finishedAt: new Date().toISOString(),
            });

            const plantSectionPayload = cleanPayload({
              uid: user.uid,
              plantOnboardingCompleted: settings.plantOnboardingCompleted || false,
              plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
              plantState: settings.plantState || null,
              plantsProgress: settings.plantsProgress || {},
              gardenState: gardenState || null,
              purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
              activeEcosystemItemIds: settings.activeEcosystemItemIds || [],
              updatedAt: serverTimestamp(),
            });

            const onboardingPayload = cleanPayload({
              uid: user.uid,
              onboardingCompleted: settings.onboardingCompleted || false,
              newUsersOnboardingCompleted: settings.onboardingCompleted || false,
              appIntroductionOnboardingCompleted: settings.onboardingCompleted || false,
              plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
              plantOnboardingCompleted: settings.plantOnboardingCompleted || false,
              updatedAt: serverTimestamp(),
            });

            const rewardsDocRef = doc(db, "users", user.uid, "rewards", "main");
            const plantSectionDocRef = doc(db, "users", user.uid, "plant_section", "main");
            const onboardingDocRef = doc(db, "onboardingID", user.uid);
            const onboardingSubdocRef = doc(db, "users", user.uid, "onboarding", "main");

            console.log(`[PERSISTENCE AUDIT] Write payload for core document:`, JSON.stringify(writePayload));
            
            console.log("=== FIRESTORE WRITE DEBBUGGING LOGS ===");
            console.log("1. Current authenticated uid:", user?.uid);
            console.log("2. Current event: background sync");
            console.log("3. JSON.stringify(stats):", JSON.stringify(stats));
            console.log("4. JSON.stringify(lastSyncedRef.current?.st):", JSON.stringify(lastSyncedRef.current?.st));
            console.log("5. Whether stats equals DEFAULT_STATS:", deepEqual(stats, DEFAULT_STATS));
            console.log("6. Whether stats.xp == 0:", stats.xp === 0);
            console.log("7. Whether stats.coins == 0:", stats.coins === 0);
            console.log("8. Stack Trace:");
            console.trace("Trace for Firestore setDoc write");
            console.log("9. The exact writePayload being sent to Firestore:", JSON.stringify(writePayload));
            console.log("======================================");

            // Core Document Write
            await setDoc(userRef, writePayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote core document to: ${userRef.path}`);

            try {
              await setDoc(userSingularRef, writePayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote singular core document to: ${userSingularRef.path}`);
            } catch (uSingErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing singular user doc:`, uSingErr);
            }

            try {
              await setDoc(rewardsDocRef, rewardsPayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote rewards subdocument to: ${rewardsDocRef.path}`);
            } catch (rErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing rewards subdoc:`, rErr);
            }

            const statsMainDocRef = doc(db, "users", user.uid, "stats", "main");
            const statsMainPayload = cleanPayload({
              streak: stats.streak || 0,
              bestStreak: stats.bestStreak || 0,
              totalPoints: stats.totalPoints || 0,
              weeklyPoints: stats.weeklyPoints || 0,
              level: stats.level || 1,
              coins: stats.coins || 0,
              totalCompletedDays: stats.totalCompletedDays || 0,
              lastCompletedDate: stats.lastCompletedDate || "",
              currentChallengeIndex: stats.currentChallengeIndex || 0,
              pointsByCategory: stats.pointsByCategory || { physical: 0, mental: 0, creative: 0 },
              trophies: stats.trophies || [],
              achievements: stats.achievements || [],
              drawings: stats.drawings || []
            });
            try {
              await setDoc(statsMainDocRef, statsMainPayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote stats main subdocument to: ${statsMainDocRef.path}`);
            } catch (smErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing stats main subdoc:`, smErr);
            }

            try {
              await setDoc(plantSectionDocRef, plantSectionPayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote plant section subdocument to: ${plantSectionDocRef.path}`);
            } catch (psErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing plant section subdoc:`, psErr);
            }

            try {
              await setDoc(onboardingDocRef, onboardingPayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote onboarding subdocument to: ${onboardingDocRef.path}`);
            } catch (obErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing onboarding doc:`, obErr);
            }

            try {
              await setDoc(onboardingSubdocRef, onboardingPayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote onboarding subcollection document to: ${onboardingSubdocRef.path}`);
            } catch (obsErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing onboarding subdoc:`, obsErr);
            }
            
            // Top-level /rewards/{user.uid}
            try {
              const rewardsTopRef = doc(db, "rewards", user.uid);
              await setDoc(rewardsTopRef, rewardsPayload, { merge: true });
            } catch (rtErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing top rewards doc:`, rtErr);
            }

            // Top-level /rank/{user.uid} and /leaderboard/{user.uid}
            const rankDocRef = doc(db, "rank", user.uid);
            const currentMaxPoints = Math.max(
              stats.weeklyPoints || 0,
              stats.weeklyXP || 0,
              stats.totalPoints || 0,
              stats.xp || 0
            );
            const rankPayload = cleanPayload({
              uid: user.uid,
              userId: user.uid,
              name: settings.displayName || user.displayName || 'Champion',
              displayName: settings.displayName || user.displayName || 'Champion',
              photoFileName: settings.profilePic || user.photoURL || '',
              profilePic: settings.profilePic || user.photoURL || '',
              league: settings.league || 'Bronze',
              points: currentMaxPoints,
              weeklyPoints: currentMaxPoints,
              weeklyXP: stats.weeklyXP || stats.xp || currentMaxPoints,
              totalPoints: stats.totalPoints || currentMaxPoints,
              xp: stats.xp || currentMaxPoints,
              streak: stats.streak || 0,
              level: stats.level || 1,
              updatedAt: serverTimestamp(),
            });
            if (!settings.proTestActive) {
              try {
                await setDoc(rankDocRef, rankPayload, { merge: true });
              } catch (rkErr) {
                console.warn(`[PERSISTENCE AUDIT] Non-critical error writing rank doc:`, rkErr);
              }

              // Top-level /leaderboard/{user.uid}
              try {
                const leaderboardTopRef = doc(db, "leaderboard", user.uid);
                await setDoc(leaderboardTopRef, rankPayload, { merge: true });
                console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote leaderboard document to: ${leaderboardTopRef.path}`);
              } catch (lbErr: any) {
                console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write leaderboard document to: leaderboard/${user.uid}. Error:`, lbErr);
              }
            }

            // Top-level /notebooks/{user.uid}
            try {
              const notebookRef = doc(db, "notebooks", user.uid);
              await setDoc(notebookRef, cleanPayload({
                uid: user.uid,
                userId: user.uid,
                userName: settings.displayName || user.displayName || 'Champion',
                userEmail: user.email || `${user.uid}@nexora.app`,
                notes: stats.gratitudeEntries || [],
                gratitudeEntries: stats.gratitudeEntries || [],
                drawings: stats.drawings || [],
                updatedAt: serverTimestamp(),
              }), { merge: true });
            } catch (nbErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing notebooks doc:`, nbErr);
            }

            // Top-level /shop/{user.uid} and /shop_purchases/{user.uid}
            try {
              const shopDocRef = doc(db, "shop", user.uid);
              const shopPurchasesDocRef = doc(db, "shop_purchases", user.uid);
              const userShopDocRef = doc(db, "users", user.uid, "shop", "main");
              const shopPayload = cleanPayload({
                uid: user.uid,
                userId: user.uid,
                userName: settings.displayName || user.displayName || 'Champion',
                userEmail: user.email || `${user.uid}@nexora.app`,
                purchasedItems: settings.purchasedItems || [],
                inventory: settings.inventory || [],
                purchasedHouseItemIds: settings.purchasedHouseItemIds || [],
                purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
                updatedAt: serverTimestamp(),
              });
              await setDoc(shopDocRef, shopPayload, { merge: true });
              await setDoc(shopPurchasesDocRef, shopPayload, { merge: true });
              await setDoc(userShopDocRef, shopPayload, { merge: true });
            } catch (spErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing shop docs:`, spErr);
            }

            // 1. Plants Collection Sync
            try {
              const plantsDocRef = doc(db, "plants", user.uid);
              const plantsPayload = cleanPayload({
                userId: user.uid,
                userName: settings.displayName || user.displayName || 'Champion',
                userEmail: user.email || `${user.uid}@nexora.app`,
                plantState: settings.plantState || null,
                plantsProgress: settings.plantsProgress || {},
                gardenState: gardenState || null,
                seedsInventory: gardenState?.inventory || {},
                purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
                lastLuckySeedDrop: gardenState?.pendingLootSeed || null,
                updatedAt: serverTimestamp()
              });
              await setDoc(plantsDocRef, plantsPayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote plants collection to: ${plantsDocRef.path}`);
            } catch (plErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing plants doc:`, plErr);
            }

            // 2. Stats Collection Sync
            try {
              const statsDocRef = doc(db, "stats", user.uid);
              const statsPayload = cleanPayload({
                userId: user.uid,
                userName: settings.displayName || user.displayName || 'Champion',
                userEmail: user.email || `${user.uid}@nexora.app`,
                stats: stats,
                dailyProgress: dailyProgress,
                updatedAt: serverTimestamp()
              });
              await setDoc(statsDocRef, statsPayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote stats collection to: ${statsDocRef.path}`);
            } catch (stErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing stats collection doc:`, stErr);
            }

            // 3. Library Collection Sync
            try {
              const libraryDocRef = doc(db, "library", user.uid);
              const userLibraryDocRef = doc(db, "users", user.uid, "library", "main");
              const libraryPayload = cleanPayload({
                uid: user.uid,
                userId: user.uid,
                userName: settings.displayName || user.displayName || 'Champion',
                userEmail: user.email || `${user.uid}@nexora.app`,
                inventory: settings.inventory || [],
                purchasedItems: settings.purchasedItems || [],
                savedVideos: settings.savedVideoIds || [],
                savedVideoIds: settings.savedVideoIds || [],
                savedTrophyIds: settings.savedTrophyIds || [],
                savedDrawings: stats.drawings || [],
                savedChallengeIds: settings.savedChallengeIds || [],
                savedPostIds: settings.savedPostIds || [],
                updatedAt: serverTimestamp()
              });
              await setDoc(libraryDocRef, libraryPayload, { merge: true });
              await setDoc(userLibraryDocRef, libraryPayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote library collection to: ${libraryDocRef.path}`);
            } catch (libErr) {
              console.warn(`[PERSISTENCE AUDIT] Non-critical error writing library docs:`, libErr);
            }

            console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${userRef.path}`);
            const postSnap = await getDocSafely(userRef);
            console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${userRef.path}:`, postSnap.exists() ? JSON.stringify(postSnap.data()) : "Document does not exist");
          } catch (err: any) {
            handleFirestoreError(err, OperationType.WRITE, userRef.path);
            console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write core document to: ${userRef.path}. Error:`, err);
          }
        }

        // 2. Sync progress always attempts, or can be throttled too
        console.log(`[PERSISTENCE AUDIT] Initiating write for progress document...`);
        console.log(`[PERSISTENCE AUDIT] Exact Firestore path: ${progressRef.path}`);
        try {
          console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${progressRef.path}`);
          const preProgSnap = await getDocSafely(progressRef);
          const dbProg = preProgSnap.exists() ? preProgSnap.data() as DailyProgress : null;
          console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${progressRef.path}:`, dbProg ? JSON.stringify(dbProg) : "Document does not exist");
          
          if (dbProg) {
            const dbHasProgress = (
              dbProg.completed || 
              dbProg.pushupsDone || 
              dbProg.waterDrank > 0 || 
              dbProg.breathingDone || 
              dbProg.drawingDone || 
              dbProg.footballDone || 
              dbProg.bubblesDone || 
              dbProg.completionsCount > 0 || 
              dbProg.customPlanCompleted ||
              dbProg.dailyQuestDone ||
              dbProg.memoryDone ||
              dbProg.gratitudeDone ||
              dbProg.reactionDone ||
              dbProg.meditationDone ||
              dbProg.writingDone
            );
            const localIsEmptyProgress = !(
              dailyProgress.completed || 
              dailyProgress.pushupsDone || 
              dailyProgress.waterDrank > 0 || 
              dailyProgress.breathingDone || 
              dailyProgress.drawingDone || 
              dailyProgress.footballDone || 
              dailyProgress.bubblesDone || 
              dailyProgress.completionsCount > 0 || 
              dailyProgress.customPlanCompleted ||
              dailyProgress.dailyQuestDone ||
              dailyProgress.memoryDone ||
              dailyProgress.gratitudeDone ||
              dailyProgress.reactionDone ||
              dailyProgress.meditationDone ||
              dailyProgress.writingDone
            );

            if (dbHasProgress && localIsEmptyProgress) {
              console.warn(`[PERSISTENCE SYSTEM] Re-hydrating progress state from Firestore data in syncData. DB Progress: ${JSON.stringify(dbProg)}, Local Progress: ${JSON.stringify(dailyProgress)}. Aborting write to protect data.`);
              
              // Trigger emergency recovery: update local state to match database progress
              setDailyProgress(dbProg);
              return;
            }
          }

          console.log(`[PERSISTENCE AUDIT] Write payload for progress document:`, JSON.stringify(dailyProgress));
          await setDoc(progressRef, dailyProgress, { merge: true });
          console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote progress document to: ${progressRef.path}`);
          
          console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${progressRef.path}`);
          const postProgSnap = await getDocSafely(progressRef);
          console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${progressRef.path}:`, postProgSnap.exists() ? JSON.stringify(postProgSnap.data()) : "Document does not exist");
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, progressRef.path);
          console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write progress document to: ${progressRef.path}. Error:`, err);
        }

        // 3. Leaderboard sync (only if streak, points, name, photo, weekly points, or weekly XP changed)
        const lbChanged =
          !lastSyncedData ||
          lastSyncedData.st?.totalPoints !== stats.totalPoints ||
          lastSyncedData.st?.streak !== stats.streak ||
          lastSyncedData.st?.weeklyPoints !== stats.weeklyPoints ||
          lastSyncedData.st?.weeklyXP !== stats.weeklyXP ||
          lastSyncedData.s?.displayName !== settings.displayName ||
          lastSyncedData.s?.profilePic !== settings.profilePic;

        if (lbChanged && !settings.proTestActive) {
          console.log(`[PERSISTENCE AUDIT] Leaderboard relevant fields changed. Initiating write for leaderboard document...`);
          console.log(`[PERSISTENCE AUDIT] Exact Firestore path: ${leaderboardRef.path}`);
          try {
            console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${leaderboardRef.path}`);
            const preLbSnap = await getDocSafely(leaderboardRef);
            const preData = preLbSnap.exists() ? preLbSnap.data() : {};
            const rankDocRef = doc(db, "rank", user.uid);
            
            const maxPts = Math.max(
              preData.weeklyPoints || 0,
              preData.totalPoints || 0,
              preData.weeklyXP || 0,
              preData.points || 0,
              stats.weeklyPoints || 0,
              stats.totalPoints || 0,
              stats.weeklyXP || 0,
              stats.xp || 0
            );

            const writePayload = {
              uid: user.uid,
              userId: user.uid,
              displayName: settings.displayName || user.displayName || "Champion",
              name: settings.displayName || user.displayName || "Champion",
              photoURL: settings.profilePic || user.photoURL || "",
              photoFileName: settings.profilePic || user.photoURL || "",
              profilePic: settings.profilePic || user.photoURL || "",
              streak: Math.max(preData.streak || 0, stats.streak || 0),
              totalPoints: maxPts,
              points: maxPts,
              weeklyXP: maxPts,
              weeklyPoints: maxPts,
              xp: maxPts,
              level: Math.max(preData.level || 1, stats.level || 1),
              league: settings.league || preData.league || "Bronze",
            };
            console.log(`[PERSISTENCE AUDIT] Write payload for leaderboard document:`, JSON.stringify(writePayload));
            
            if (maxPts > 0) {
              await setDoc(leaderboardRef, writePayload, { merge: true });
              await setDoc(rankDocRef, writePayload, { merge: true });
              console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote leaderboard document to: ${leaderboardRef.path}`);
            }
          } catch (err: any) {
            handleFirestoreError(err, OperationType.WRITE, leaderboardRef.path);
            console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write leaderboard document to: ${leaderboardRef.path}. Error:`, err);
          }
        }

        lastSyncedRef.current = currentState;
        console.log("Hooks: Optimized Background Sync Complete ✅");
      } catch (e: any) {
        handleFirestoreError(e, OperationType.WRITE, user?.uid ? `users/${user.uid}` : 'users');
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Error syncing data for user UID: ${user?.uid}. Error:`, e);
        if (e.message?.includes("quota") || e.code === "resource-exhausted") {
          quotaExceededRef.current = true;
          showToast("Nexus Quota Reached. Local cache active. 🛡️", "info");
        } else {
          console.error("Sync error:", e);
        }
      } finally {
        setIsSyncingData(false);
      }
    };

    // Short debounce for ultra-fast background sync (Ensures user data syncs swiftly)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(syncData, 400);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [
    settings,
    stats,
    dailyProgress.completed,
    dailyProgress.completionsCount,
    dailyProgress.date,
    gardenState,
    user,
    isDataReady,
    needsOnboarding,
  ]);

  const onUpdateSettings = (
    update: Partial<UserSettings> | ((prev: UserSettings) => UserSettings),
  ) => {
    setSettings((prev) => {
      const next =
        typeof update === "function" ? update(prev) : { ...prev, ...update };
      try {
        localStorage.setItem("nexora_settings", JSON.stringify(next));
        if (user?.uid) {
          localStorage.setItem(`nexora_settings_${user.uid}`, JSON.stringify(next));
        }
        if (next.onboardingCompleted) {
          localStorage.setItem("nexora_onboarding_completed", "true");
          if (user?.uid) {
            localStorage.setItem(`nexora_onboarding_completed_${user.uid}`, "true");
          }
        }
        if (next.plantOnboardingCompleted) {
          localStorage.setItem("nexora_plant_onboarding_completed", "true");
          if (user?.uid) {
            localStorage.setItem(`nexora_plant_onboarding_completed_${user.uid}`, "true");
          }
        }
      } catch (e) {
        console.warn("Failed to cache settings:", e);
      }
      return next;
    });
  };

  const onUpdateStats = (
    update: Partial<UserStats> | ((prev: UserStats) => UserStats),
  ) => {
    setStats((prev) => {
      const next =
        typeof update === "function" ? update(prev) : { ...prev, ...update };
      try {
        localStorage.setItem("nexora_stats", JSON.stringify(next));
        if (user?.uid) {
          localStorage.setItem(`nexora_stats_${user.uid}`, JSON.stringify(next));
        }
      } catch (e) {
        console.warn("Failed to cache stats:", e);
      }
      return next;
    });
  };

  const onUpdateDailyProgress = (
    update: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress),
  ) => {
    setDailyProgress((prev) => {
      const next =
        typeof update === "function" ? update(prev) : { ...prev, ...update };
      try {
        const progData = { ...next, date: today };
        localStorage.setItem("nexora_progress", JSON.stringify(progData));
        if (user?.uid) {
          localStorage.setItem(`nexora_progress_${user.uid}`, JSON.stringify(progData));
        }
      } catch (e) {
        console.warn("Failed to cache progress:", e);
      }
      return next;
    });
  };

  const onUpdateGardenState = (
    update: Partial<GardenState> | ((prev: GardenState) => GardenState),
  ) => {
    setGardenState((prev) => {
      const next =
        typeof update === "function" ? update(prev) : { ...prev, ...update };
      try {
        localStorage.setItem("nexora_garden", JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to cache garden:", e);
      }
      return next;
    });
  };

  const forceSyncData = useCallback(async () => {
    if (blockAllWritesRef.current) {
      console.warn(`[PERSISTENCE FIX] Writes are strictly locked to prevent data loss. Initial user profile failed to load or timed out. Aborting forceSyncData.`);
      return;
    }
    if (!user || !auth.currentUser || !isDataReady || !dataLoadedFromFirestore.current) return;
    if (!isStateLoadedRef.current || !hasMatchedHydratedStateRef.current) {
      console.warn(`[PERSISTENCE AUDIT] forceSyncData called but hydration is not complete. Blocking write to prevent data loss.`);
      return;
    }
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    if (quotaExceededRef.current) return;
    setIsSyncingData(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const progressRef = doc(db, "users", user.uid, "progress", today);
      const leaderboardRef = doc(db, "leaderboard", user.uid);

      console.log(`[PERSISTENCE AUDIT] [WRITE START] Initiating FORCE SYNC for user UID: ${user.uid}`);
      console.log(`[PERSISTENCE AUDIT] Target user document path: ${userRef.path}`);
      console.log(`[PERSISTENCE AUDIT] Target progress document path: ${progressRef.path}`);

      // 1. Core Doc Force Write
      try {
        console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${userRef.path}`);
        const preSnap = await getDocSafely(userRef);
        const dbData = preSnap.exists() ? preSnap.data() : null;
        console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${userRef.path}:`, dbData ? JSON.stringify(dbData) : "Document does not exist");

        if (dbData) {
          const dbStats = {
            ...DEFAULT_STATS,
            ...(dbData.stats || {}),
            streak: dbData.streak ?? dbData.stats?.streak ?? DEFAULT_STATS.streak,
            bestStreak: dbData.bestStreak ?? dbData.stats?.bestStreak ?? DEFAULT_STATS.bestStreak,
            totalPoints: dbData.totalPoints ?? dbData.stats?.totalPoints ?? DEFAULT_STATS.totalPoints,
            xp: dbData.xp ?? dbData.stats?.xp ?? DEFAULT_STATS.xp,
            level: dbData.level ?? dbData.stats?.level ?? DEFAULT_STATS.level,
            coins: Math.max(dbData.coins || 0, dbData.stats?.coins || 0, DEFAULT_STATS.coins),
            weeklyPoints: dbData.weeklyPoints ?? dbData.stats?.weeklyPoints ?? DEFAULT_STATS.weeklyPoints,
            weeklyXP: dbData.weeklyXP ?? dbData.stats?.weeklyXP ?? DEFAULT_STATS.weeklyXP,
          };
          const dbGarden = {
            ...createInitialGardenState(),
            ...(dbData.garden || {}),
            tiles: dbData.garden?.tiles ?? dbData.tiles ?? createInitialGardenState().tiles,
            inventory: dbData.garden?.inventory ?? createInitialGardenState().inventory,
          };
          const dbSettings = {
            ...DEFAULT_SETTINGS,
            ...(dbData.settings || {}),
            displayName: dbData.displayName ?? dbData.name ?? dbData.settings?.displayName ?? DEFAULT_SETTINGS.displayName,
            onboardingCompleted: dbData.onboardingCompleted ?? dbData.settings?.onboardingCompleted ?? DEFAULT_SETTINGS.onboardingCompleted,
            plantState: dbData.plantState ?? dbData.settings?.plantState ?? DEFAULT_SETTINGS.plantState,
          };

          const dbHasProgress = (dbStats.xp > 0 || dbStats.coins > 0 || (dbStats.totalPoints || 0) > 0 || (dbStats.streak || 0) > 0);
          const dbHasGarden = (dbGarden.tiles && dbGarden.tiles.length > 0) || (dbGarden.inventory && Object.keys(dbGarden.inventory).length > 0);
          const dbHasSettings = (dbSettings.displayName && dbSettings.displayName !== "Nexora User" && dbSettings.displayName !== "Champion") || (dbSettings.plantState?.stage || 0) > 0 || (dbSettings.plantState?.growthPoints || 0) > 0;

          const localIsEmptyStats = (stats.xp === 0 && stats.coins === 0 && (stats.totalPoints || 0) === 0 && (stats.streak || 0) === 0);
          const localIsEmptyGarden = !gardenState.tiles || gardenState.tiles.length === 0;
          const localIsEmptySettings = (!settings.displayName || settings.displayName === "Nexora User" || settings.displayName === "Champion") && (settings.plantState?.stage || 0) === 0 && (settings.plantState?.growthPoints || 0) === 0;

          const lastSyncedData = lastSyncedRef.current;

          // STALENESS GUARD: If Firestore contains progress but local states are currently empty,
          // check if lastSyncedData has already captured non-empty values. If so, local state is just stale (React is flushing updates).
          // We must abort this sync pass immediately without triggering the emergency block or overwriting DB.
          const isLocalStateUnhydrated = 
            (lastSyncedData && lastSyncedData.st && ((lastSyncedData.st.xp || 0) > 0 || (lastSyncedData.st.coins || 0) > 0) && localIsEmptyStats) ||
            (lastSyncedData && lastSyncedData.s && (lastSyncedData.s.displayName && lastSyncedData.s.displayName !== "Nexora User" && lastSyncedData.s.displayName !== "Champion") && localIsEmptySettings) ||
            (lastSyncedData && lastSyncedData.g && (lastSyncedData.g.tiles && lastSyncedData.g.tiles.length > 0) && localIsEmptyGarden);

          if (isLocalStateUnhydrated) {
            console.log("[PERSISTENCE SYSTEM] Local React state has not yet updated to the hydrated Firestore values in forceSyncData. Aborting sync pass.");
            return;
          }

          const streakOverwritten = localIsEmptyStats && (dbStats.streak > stats.streak && stats.streak <= 1 && dbStats.streak > 1);
          const plantOverwritten = (dbSettings.plantState?.type === settings.plantState?.type && (dbSettings.plantState?.stage || 0) > (settings.plantState?.stage || 0) && (settings.plantState?.stage || 0) <= 1 && (dbSettings.plantState?.stage || 0) > 1);

          if (
            (dbHasProgress && localIsEmptyStats) ||
            (dbHasGarden && localIsEmptyGarden) ||
            (dbHasSettings && localIsEmptySettings) ||
            streakOverwritten ||
            plantOverwritten
          ) {
            console.warn(`[PERSISTENCE SYSTEM] Auto-rehydrating local state from Firestore data in forceSyncData. DB Stats Has Progress: ${dbHasProgress}, Local Is Empty Stats: ${localIsEmptyStats}. DB Garden Has Data: ${dbHasGarden}, Local Is Empty Garden: ${localIsEmptyGarden}. DB Settings Has Info: ${dbHasSettings}, Local Is Empty Settings: ${localIsEmptySettings}. Streak Overwritten: ${streakOverwritten}, Plant Overwritten: ${plantOverwritten}. Aborting write to protect data.`);
            
            // Trigger emergency recovery: update local state to match database
            if (dbData.stats || dbData.xp !== undefined || dbData.coins !== undefined) {
              setStats({
                ...DEFAULT_STATS,
                ...dbData.stats,
                streak: dbData.streak ?? dbData.stats?.streak ?? DEFAULT_STATS.streak,
                bestStreak: dbData.bestStreak ?? dbData.stats?.bestStreak ?? DEFAULT_STATS.bestStreak,
                totalPoints: dbData.totalPoints ?? dbData.stats?.totalPoints ?? DEFAULT_STATS.totalPoints,
                xp: dbData.xp ?? dbData.stats?.xp ?? DEFAULT_STATS.xp,
                level: dbData.level ?? dbData.stats?.level ?? DEFAULT_STATS.level,
                coins: Math.max(dbData.coins || 0, dbData.stats?.coins || 0, DEFAULT_STATS.coins),
                weeklyPoints: dbData.weeklyPoints ?? dbData.stats?.weeklyPoints ?? DEFAULT_STATS.weeklyPoints,
                weeklyXP: dbData.weeklyXP ?? dbData.stats?.weeklyXP ?? DEFAULT_STATS.weeklyXP,
                trophies: dbData.trophies ?? dbData.stats?.trophies ?? [],
                drawings: dbData.drawings ?? dbData.stats?.drawings ?? [],
                unlockedHats: dbData.unlockedHats ?? dbData.stats?.unlockedHats ?? [],
                gratitudeEntries: dbData.gratitudeEntries ?? dbData.stats?.gratitudeEntries ?? [],
                totalCompletedDays: dbData.totalCompletedDays ?? dbData.stats?.totalCompletedDays ?? DEFAULT_STATS.totalCompletedDays,
                lastCompletedDate: dbData.lastCompletedDate ?? dbData.stats?.lastCompletedDate ?? DEFAULT_STATS.lastCompletedDate ?? null,
                lastGiftDate: dbData.lastGiftDate ?? dbData.stats?.lastGiftDate ?? DEFAULT_STATS.lastGiftDate ?? null,
                currentChallengeIndex: dbData.currentChallengeIndex ?? dbData.stats?.currentChallengeIndex ?? DEFAULT_STATS.currentChallengeIndex ?? 0,
                gems: dbData.gems ?? dbData.stats?.gems ?? DEFAULT_STATS.gems ?? 0,
                lastWeeklyReset: dbData.lastWeeklyReset ?? dbData.stats?.lastWeeklyReset ?? DEFAULT_STATS.lastWeeklyReset ?? null,
                lastRankRewardClaimWeek: dbData.lastRankRewardClaimWeek ?? dbData.stats?.lastRankRewardClaimWeek ?? DEFAULT_STATS.lastRankRewardClaimWeek ?? null,
                lastActiveDate: dbData.lastActiveDate ?? dbData.stats?.lastActiveDate ?? DEFAULT_STATS.lastActiveDate ?? null,
                pointsByCategory: dbData.pointsByCategory ?? dbData.stats?.pointsByCategory ?? DEFAULT_STATS.pointsByCategory,
                waterDrank: dbData.waterDrank ?? dbData.stats?.waterDrank ?? DEFAULT_STATS.waterDrank,
                lifetimeWaterCompletions: dbData.lifetimeWaterCompletions ?? dbData.stats?.lifetimeWaterCompletions ?? DEFAULT_STATS.lifetimeWaterCompletions,
                hasClaimedXpChest: dbData.hasClaimedXpChest ?? dbData.stats?.hasClaimedXpChest ?? DEFAULT_STATS.hasClaimedXpChest,
              });
            }
            if (dbData.settings || dbData.displayName || dbData.onboardingCompleted !== undefined) {
              setSettings((prev: any) => {
                const dbSettings = dbData.settings || {};
                const isPlantOnboardingDone = 
                  (dbData.plantOnboardingCompleted === true) || 
                  (dbData.plantSectionOnboardingCompleted === true) || 
                  (dbSettings.plantOnboardingCompleted === true) || 
                  (dbSettings.plantSectionOnboardingCompleted === true) || 
                  Boolean((dbData.plantState || dbSettings.plantState) && (((dbData.plantState?.stage || dbSettings.plantState?.stage) || 0) > 0 || ((dbData.plantState?.growthPoints || dbSettings.plantState?.growthPoints) || 0) > 0)) ||
                  Boolean(prev.plantOnboardingCompleted);

                const isOnboardingDone = 
                  (dbData.onboardingCompleted === true) || 
                  (dbData.newUsersOnboardingCompleted === true) || 
                  (dbSettings.onboardingCompleted === true) || 
                  Boolean(prev.onboardingCompleted);

                return {
                  ...DEFAULT_SETTINGS,
                  ...prev,
                  ...dbSettings,
                  displayName: extractRealDisplayName(dbData, user) || dbSettings.displayName || DEFAULT_SETTINGS.displayName,
                  profilePic: extractRealProfilePic(dbData, user) || dbSettings.profilePic || DEFAULT_SETTINGS.profilePic,
                  onboardingCompleted: isOnboardingDone,
                  plantOnboardingCompleted: isPlantOnboardingDone,
                  spaceOnboardingCompleted: dbData.spaceOnboardingCompleted ?? dbSettings.spaceOnboardingCompleted ?? DEFAULT_SETTINGS.spaceOnboardingCompleted,
                  purchasedItems: Array.from(new Set([...(prev.purchasedItems || []), ...(dbData.purchasedItems || []), ...(dbSettings.purchasedItems || [])].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean))),
                  inventory: autoRestoreInventoryFromPurchased(
                    Array.from(new Set([...(prev.purchasedItems || []), ...(dbData.purchasedItems || []), ...(dbSettings.purchasedItems || [])].map((it: any) => typeof it === "string" ? it : (it?.itemId || it?.id || it?.name)).filter(Boolean))),
                    Array.from(new Map([...(prev.inventory || []), ...(dbData.inventory || []), ...(dbSettings.inventory || [])].map((item: any) => [item.id || item.itemId || item.name, item])).values())
                  ),
                  plantState: dbData.plantState ?? dbSettings.plantState ?? DEFAULT_SETTINGS.plantState,
                  plantsProgress: dbData.plantsProgress ?? dbSettings.plantsProgress ?? DEFAULT_SETTINGS.plantsProgress,
                  purchasedEcosystemItemIds: dbData.purchasedEcosystemItemIds ?? dbSettings.purchasedEcosystemItemIds ?? DEFAULT_SETTINGS.purchasedEcosystemItemIds,
                  activeEcosystemItemIds: dbData.activeEcosystemItemIds ?? dbSettings.activeEcosystemItemIds ?? DEFAULT_SETTINGS.activeEcosystemItemIds,
                  savedChallengeIds: dbData.savedChallengeIds ?? dbSettings.savedChallengeIds ?? DEFAULT_SETTINGS.savedChallengeIds,
                  savedTrophyIds: dbData.savedTrophyIds ?? dbSettings.savedTrophyIds ?? DEFAULT_SETTINGS.savedTrophyIds,
                  savedVideoIds: dbData.savedVideoIds ?? dbSettings.savedVideoIds ?? DEFAULT_SETTINGS.savedVideoIds,
                  savedPostIds: dbData.savedPostIds ?? dbSettings.savedPostIds ?? DEFAULT_SETTINGS.savedPostIds,
                  activeHat: dbData.activeHat ?? dbSettings.activeHat ?? DEFAULT_SETTINGS.activeHat,
                  activeSkin: dbData.activeSkin ?? dbSettings.activeSkin ?? DEFAULT_SETTINGS.activeSkin,
                  joinedCircleIds: dbData.joinedCircleIds ?? dbSettings.joinedCircleIds ?? DEFAULT_SETTINGS.joinedCircleIds,
                  purchasedHouseItemIds: dbData.purchasedHouseItemIds ?? dbSettings.purchasedHouseItemIds ?? DEFAULT_SETTINGS.purchasedHouseItemIds,
                  placedHouseItems: dbData.placedHouseItems ?? dbSettings.placedHouseItems ?? DEFAULT_SETTINGS.placedHouseItems,
                  spaceHouseUnlocked: dbData.spaceHouseUnlocked ?? dbSettings.spaceHouseUnlocked ?? DEFAULT_SETTINGS.spaceHouseUnlocked,
                  activeSpaceRoom: dbData.activeSpaceRoom ?? dbSettings.activeSpaceRoom ?? DEFAULT_SETTINGS.activeSpaceRoom,
                  isPro: isUserProUnlocked(user?.uid) || Boolean(dbData.isPro ?? dbSettings.isPro ?? dbData.subscription?.active ?? prev.isPro),
                  proPlan: dbData.proPlan ?? dbSettings.proPlan ?? dbData.subscription?.plan ?? (dbData.isPro || dbSettings.isPro ? 'Yearly Master' : prev.proPlan),
                  proActivatedAt: parseTimestampIso(dbData.proActivatedAt ?? dbSettings.proActivatedAt ?? dbData.subscription?.activatedAt ?? prev.proActivatedAt),
                  proExpiresAt: dbData.proExpiresAt ?? dbSettings.proExpiresAt ?? dbData.subscription?.expiresAt ?? prev.proExpiresAt,
                  proTestActive: Boolean(dbData.proTestActive ?? dbSettings.proTestActive ?? prev.proTestActive),
                  proTestStartedAt: parseTimestampIso(dbData.proTestStartedAt ?? dbSettings.proTestStartedAt ?? prev.proTestStartedAt),
                  proTestExpiresAt: parseTimestampIso(dbData.proTestExpiresAt ?? dbSettings.proTestExpiresAt ?? prev.proTestExpiresAt),
                  proTestRemainingMs: typeof (dbData.proTestRemainingMs ?? dbSettings.proTestRemainingMs ?? prev.proTestRemainingMs) === 'number' ? (dbData.proTestRemainingMs ?? dbSettings.proTestRemainingMs ?? prev.proTestRemainingMs) : null,
                  proTestLastUsedAt: parseTimestampIso(dbData.proTestLastUsedAt ?? dbSettings.proTestLastUsedAt ?? prev.proTestLastUsedAt),
                  proTestCooldownUntil: parseTimestampIso(dbData.proTestCooldownUntil ?? dbSettings.proTestCooldownUntil ?? prev.proTestCooldownUntil),
                  proTestLastCompletedAt: parseTimestampIso(dbData.proTestLastCompletedAt ?? dbSettings.proTestLastCompletedAt ?? prev.proTestLastCompletedAt),
                  proTestDay2Notified: Boolean(dbData.proTestDay2Notified ?? dbSettings.proTestDay2Notified ?? prev.proTestDay2Notified),
                  lastViewedRank: dbData.lastViewedRank ?? dbSettings.lastViewedRank ?? undefined,
                };
              });
            }
            if (dbData.garden || dbData.tiles !== undefined) {
              setGardenState((prev: any) => ({
                ...createInitialGardenState(),
                ...prev,
                ...(dbData.garden || {}),
                tiles: dbData.garden?.tiles ?? dbData.tiles ?? prev.tiles ?? createInitialGardenState().tiles,
                inventory: dbData.garden?.inventory ?? prev.inventory ?? createInitialGardenState().inventory,
              }));
            }
            return;
          }
        }

        const resolvedDisplayName = settings.displayName || user.displayName || 'Champion';
        const resolvedProfilePic = settings.profilePic || user.photoURL || '';
        const resolvedAccountName = settings.accountName || resolvedDisplayName;
        const resolvedLocation = settings.location || '';

        const writePayload = cleanPayload({
          name: resolvedDisplayName,
          displayName: resolvedDisplayName,
          ["Name"]: resolvedDisplayName,
          ["Account name"]: resolvedAccountName,
          accountName: resolvedAccountName,
          username: resolvedAccountName,
          photoFileName: resolvedProfilePic,
          profilePic: resolvedProfilePic,
          photoURL: resolvedProfilePic,
          ["Photo file name"]: resolvedProfilePic,
          ["Profile image"]: resolvedProfilePic,
          avatar: resolvedProfilePic,
          location: resolvedLocation,
          ["Location"]: resolvedLocation,
          time: new Date().toISOString(),
          ...settings,
          isPro: settings.isPro || false,
          proPlan: settings.proPlan || (settings.isPro ? 'Yearly Master' : 'Free Tier'),
          proActivatedAt: parseTimestampIso(settings.proActivatedAt) || null,
          proExpiresAt: settings.proExpiresAt || null,
          proTestActive: settings.proTestActive || false,
          proTestExpiresAt: parseTimestampIso(settings.proTestExpiresAt) || null,
          proTestStartedAt: parseTimestampIso(settings.proTestStartedAt) || null,
          proTestRemainingMs: settings.proTestRemainingMs !== undefined ? settings.proTestRemainingMs : null,
          proTestCooldownUntil: parseTimestampIso(settings.proTestCooldownUntil) || null,
          proTestLastCompletedAt: parseTimestampIso(settings.proTestLastCompletedAt) || null,
          proTestDay2Notified: settings.proTestDay2Notified || false,
          settings: {
            ...settings,
            displayName: resolvedDisplayName,
            profilePic: resolvedProfilePic,
            accountName: resolvedAccountName,
            photoFileName: resolvedProfilePic,
            photoURL: resolvedProfilePic,
            location: resolvedLocation,
            isPro: settings.isPro || false,
            proPlan: settings.proPlan || (settings.isPro ? 'Yearly Master' : 'Free Tier'),
            proActivatedAt: parseTimestampIso(settings.proActivatedAt) || null,
            proExpiresAt: settings.proExpiresAt || null,
            proTestActive: settings.proTestActive || false,
            proTestExpiresAt: parseTimestampIso(settings.proTestExpiresAt) || null,
            proTestStartedAt: parseTimestampIso(settings.proTestStartedAt) || null,
            proTestRemainingMs: settings.proTestRemainingMs !== undefined ? settings.proTestRemainingMs : null,
            proTestCooldownUntil: parseTimestampIso(settings.proTestCooldownUntil) || null,
            proTestLastCompletedAt: parseTimestampIso(settings.proTestLastCompletedAt) || null,
            proTestDay2Notified: settings.proTestDay2Notified || false,
          },
          uid: user.uid,
          email: user.email || `${user.uid}@nexora.app`,
          role: 'user',
          stats: stats,
          coins: stats.coins || 0,
          xp: stats.xp || 0,
          streak: stats.streak || 0,
          bestStreak: stats.bestStreak || 0,
          totalPoints: stats.totalPoints || 0,
          level: stats.level || 1,
          plantOnboardingCompleted: settings.plantOnboardingCompleted || false,
          plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
          garden: gardenState,
          isTodayCompleted: dailyProgress.completed,
          updatedAt: serverTimestamp(),
          onboardingCompleted: settings.onboardingCompleted || false,
        });

        const rewardsPayload = {
          uid: user.uid,
          userName: settings.displayName || user.displayName || 'Champion',
          streak: stats.streak || 0,
          bestStreak: stats.bestStreak || 0,
          xp: stats.xp || 0,
          coins: stats.coins || 0,
          weeklyPoints: stats.weeklyPoints || 0,
          weeklyXP: stats.weeklyXP || 0,
          totalPoints: stats.totalPoints || 0,
          trophies: stats.trophies || [],
          pointsByCategory: stats.pointsByCategory || { physical: 0, mental: 0, creative: 0 },
          updatedAt: serverTimestamp(),
          finishedAt: new Date().toISOString(),
        };

        const plantSectionPayload = {
          uid: user.uid,
          plantOnboardingCompleted: settings.plantOnboardingCompleted || false,
          plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
          plantState: settings.plantState || null,
          plantsProgress: settings.plantsProgress || {},
          gardenState: gardenState || null,
          purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
          activeEcosystemItemIds: settings.activeEcosystemItemIds || [],
          updatedAt: serverTimestamp(),
        };

        const onboardingPayload = {
          uid: user.uid,
          onboardingCompleted: settings.onboardingCompleted || false,
          newUsersOnboardingCompleted: settings.onboardingCompleted || false,
          appIntroductionOnboardingCompleted: settings.onboardingCompleted || false,
          plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
          plantOnboardingCompleted: settings.plantOnboardingCompleted || false,
          updatedAt: serverTimestamp(),
        };

        const rewardsDocRef = doc(db, "users", user.uid, "rewards", "main");
        const plantSectionDocRef = doc(db, "users", user.uid, "plant_section", "main");
        const onboardingDocRef = doc(db, "onboardingID", user.uid);
        const onboardingSubdocRef = doc(db, "users", user.uid, "onboarding", "main");

        console.log(`[PERSISTENCE AUDIT] Force sync payload for core document:`, JSON.stringify(writePayload));

        console.log("=== FIRESTORE WRITE DEBBUGGING LOGS ===");
        console.log("1. Current authenticated uid:", user?.uid);
        console.log("2. Current event: force sync");
        console.log("3. JSON.stringify(stats):", JSON.stringify(stats));
        console.log("4. JSON.stringify(lastSyncedRef.current?.st):", JSON.stringify(lastSyncedRef.current?.st));
        console.log("5. Whether stats equals DEFAULT_STATS:", deepEqual(stats, DEFAULT_STATS));
        console.log("6. Whether stats.xp == 0:", stats.xp === 0);
        console.log("7. Whether stats.coins == 0:", stats.coins === 0);
        console.log("8. Stack Trace:");
        console.trace("Trace for Firestore setDoc write");
        console.log("9. The exact writePayload being sent to Firestore:", JSON.stringify(writePayload));
        console.log("======================================");

        await setDoc(userRef, writePayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote core document to: ${userRef.path}`);

        await setDoc(rewardsDocRef, rewardsPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote rewards subdocument to: ${rewardsDocRef.path}`);

        await setDoc(plantSectionDocRef, plantSectionPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote plant section subdocument to: ${plantSectionDocRef.path}`);

        await setDoc(onboardingDocRef, onboardingPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote onboarding subdocument to: ${onboardingDocRef.path}`);

        await setDoc(onboardingSubdocRef, onboardingPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote onboarding subcollection document to: ${onboardingSubdocRef.path}`);

        // 1. Plants Collection Sync
        const plantsDocRef = doc(db, "plants", user.uid);
        const plantsPayload = {
          userId: user.uid,
          userName: settings.displayName || user.displayName || 'Champion',
          userEmail: user.email || `${user.uid}@nexora.app`,
          plantState: settings.plantState || null,
          plantsProgress: settings.plantsProgress || {},
          gardenState: gardenState || null,
          seedsInventory: gardenState?.inventory || {},
          purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
          lastLuckySeedDrop: gardenState?.pendingLootSeed || null,
          updatedAt: serverTimestamp()
        };
        await setDoc(plantsDocRef, plantsPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote plants collection to: ${plantsDocRef.path}`);

        // 2. Stats Collection Sync
        const statsDocRef = doc(db, "stats", user.uid);
        const statsPayload = {
          userId: user.uid,
          userName: settings.displayName || user.displayName || 'Champion',
          userEmail: user.email || `${user.uid}@nexora.app`,
          stats: stats,
          dailyProgress: dailyProgress,
          updatedAt: serverTimestamp()
        };
        await setDoc(statsDocRef, statsPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote stats collection to: ${statsDocRef.path}`);

        // 3. Library Collection Sync
        const libraryDocRef = doc(db, "library", user.uid);
        const userLibraryDocRef = doc(db, "users", user.uid, "library", "main");
        const libraryPayload = {
          userId: user.uid,
          userName: settings.displayName || user.displayName || 'Champion',
          userEmail: user.email || `${user.uid}@nexora.app`,
          inventory: settings.inventory || [],
          savedVideos: settings.savedVideoIds || [],
          savedDrawings: stats.drawings || [],
          savedChallengeIds: settings.savedChallengeIds || [],
          savedPostIds: settings.savedPostIds || [],
          updatedAt: serverTimestamp()
        };
        await setDoc(libraryDocRef, libraryPayload, { merge: true });
        await setDoc(userLibraryDocRef, libraryPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote library collection to: ${libraryDocRef.path}`);

        // 4. Notebook Collection Sync
        const notebookRef = doc(db, "notebooks", user.uid);
        await setDoc(notebookRef, {
          uid: user.uid,
          userId: user.uid,
          userName: settings.displayName || user.displayName || 'Champion',
          userEmail: user.email || `${user.uid}@nexora.app`,
          notes: stats.gratitudeEntries || [],
          drawings: stats.drawings || [],
          updatedAt: serverTimestamp(),
        }, { merge: true });

        // 5. Shop Collection Sync
        const shopDocRef = doc(db, "shop", user.uid);
        const shopPurchasesDocRef = doc(db, "shop_purchases", user.uid);
        const userShopDocRef = doc(db, "users", user.uid, "shop", "main");
        const shopPayload = {
          uid: user.uid,
          userId: user.uid,
          userName: settings.displayName || user.displayName || 'Champion',
          userEmail: user.email || `${user.uid}@nexora.app`,
          purchasedItems: settings.purchasedItems || [],
          inventory: settings.inventory || [],
          purchasedHouseItemIds: settings.purchasedHouseItemIds || [],
          purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
          updatedAt: serverTimestamp(),
        };
        await setDoc(shopDocRef, shopPayload, { merge: true });
        await setDoc(shopPurchasesDocRef, shopPayload, { merge: true });
        await setDoc(userShopDocRef, shopPayload, { merge: true });

        console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${userRef.path}`);
        const postSnap = await getDocSafely(userRef);
        console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${userRef.path}:`, postSnap.exists() ? JSON.stringify(postSnap.data()) : "Document does not exist");
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, userRef.path);
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed to write core document to: ${userRef.path}. Error:`, err);
      }

      // 2. Progress Doc Force Write
      try {
        console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${progressRef.path}`);
        const preProgSnap = await getDocSafely(progressRef);
        const dbProg = preProgSnap.exists() ? preProgSnap.data() as DailyProgress : null;
        console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${progressRef.path}:`, dbProg ? JSON.stringify(dbProg) : "Document does not exist");

        if (dbProg) {
          const dbHasProgress = (
            dbProg.completed || 
            dbProg.pushupsDone || 
            dbProg.waterDrank > 0 || 
            dbProg.breathingDone || 
            dbProg.drawingDone || 
            dbProg.footballDone || 
            dbProg.bubblesDone || 
            dbProg.completionsCount > 0 || 
            dbProg.customPlanCompleted ||
            dbProg.dailyQuestDone ||
            dbProg.memoryDone ||
            dbProg.gratitudeDone ||
            dbProg.reactionDone ||
            dbProg.meditationDone ||
            dbProg.writingDone
          );
          const localIsEmptyProgress = !(
            dailyProgress.completed || 
            dailyProgress.pushupsDone || 
            dailyProgress.waterDrank > 0 || 
            dailyProgress.breathingDone || 
            dailyProgress.drawingDone || 
            dailyProgress.footballDone || 
            dailyProgress.bubblesDone || 
            dailyProgress.completionsCount > 0 || 
            dailyProgress.customPlanCompleted ||
            dailyProgress.dailyQuestDone ||
            dailyProgress.memoryDone ||
            dailyProgress.gratitudeDone ||
            dailyProgress.reactionDone ||
            dailyProgress.meditationDone ||
            dailyProgress.writingDone
          );

          if (dbHasProgress && localIsEmptyProgress) {
            console.warn(`[PERSISTENCE SYSTEM] Re-hydrating progress state from Firestore data in forceSyncData. DB Progress: ${JSON.stringify(dbProg)}, Local Progress: ${JSON.stringify(dailyProgress)}. Aborting write to protect data.`);
            
            // Trigger emergency recovery: update local state to match database progress
            setDailyProgress(dbProg);
            return;
          }
        }

        console.log(`[PERSISTENCE AUDIT] Force sync payload for progress document:`, JSON.stringify(dailyProgress));
        await setDoc(progressRef, dailyProgress, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote progress document to: ${progressRef.path}`);

        console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${progressRef.path}`);
        const postProgSnap = await getDocSafely(progressRef);
        console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${progressRef.path}:`, postProgSnap.exists() ? JSON.stringify(postProgSnap.data()) : "Document does not exist");
      } catch (err: any) {
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed to write progress document to: ${progressRef.path}. Error:`, err);
      }

      // 3. Leaderboard Doc Force Write
      try {
        console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${leaderboardRef.path}`);
        const preLbSnap = await getDocSafely(leaderboardRef);
        console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${leaderboardRef.path}:`, preLbSnap.exists() ? JSON.stringify(preLbSnap.data()) : "Document does not exist");

        const writePayload = {
          uid: user.uid,
          displayName: settings.displayName || "Anonymous",
          photoURL: settings.profilePic || user.photoURL || "",
          streak: stats.streak || 0,
          totalPoints: stats.totalPoints || 0,
          weeklyXP: stats.weeklyXP || 0,
          weeklyPoints: stats.weeklyPoints || 0,
          level: stats.level || 1,
          league: settings.league || "Bronze",
        };
        console.log(`[PERSISTENCE AUDIT] Force sync payload for leaderboard document:`, JSON.stringify(writePayload));

        await setDoc(leaderboardRef, writePayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote leaderboard document to: ${leaderboardRef.path}`);

        console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${leaderboardRef.path}`);
        const postLbSnap = await getDocSafely(leaderboardRef);
        console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${leaderboardRef.path}:`, postLbSnap.exists() ? JSON.stringify(postLbSnap.data()) : "Document does not exist");
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, leaderboardRef.path);
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed to write leaderboard document to: ${leaderboardRef.path}. Error:`, err);
      }

      console.log("Hooks: Manual/Force Sync complete ✅");
    } catch (e: any) {
      handleFirestoreError(e, OperationType.WRITE, user?.uid ? `users/${user.uid}` : 'users');
      console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed for user UID: ${user?.uid}. Error:`, e);
      console.error("Hooks: Force sync failed", e);
    } finally {
      setIsSyncingData(false);
    }
  }, [user, isDataReady, settings, stats, dailyProgress, gardenState]);

  // Synchronize immediately when the tab is backgrounded, minimized, or when the phone screen is locked.
  // This is critical for mobile devices where immediate teardown or backgrounding is the primary exit vector.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        user &&
        isDataReady &&
        dataLoadedFromFirestore.current
      ) {
        console.log("Hooks: Tab backgrounded, flushing pending state to Firestore...");
        forceSyncData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, isDataReady, forceSyncData]);

  return {
    user,
    loading,
    authLoading,
    isDataReady,
    isStateHydrated,
    isSyncingData,
    settings,
    setSettings: onUpdateSettings,
    stats,
    setStats: onUpdateStats,
    dailyProgress,
    setDailyProgress: onUpdateDailyProgress,
    gardenState,
    setGardenState: onUpdateGardenState,
    needsOnboarding,
    setNeedsOnboarding,
    dataLoadedFromFirestore,
    loadError,
    forceSyncData,
  };
}
