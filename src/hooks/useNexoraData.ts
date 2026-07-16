import { useState, useEffect, useRef, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
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
import { UserSettings, UserStats, DailyProgress } from "../types";
import { GardenState, createInitialGardenState } from "../types/garden";

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
    return obj.map(cleanPayload) as any;
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      cleaned[key] = cleanPayload(val);
    }
  }
  return cleaned;
}

const today = new Date().toISOString().split("T")[0];

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
    coins: Math.max(dbStats.coins || 0, localStats.coins || 0),
    gems: Math.max(dbStats.gems || 0, localStats.gems || 0),
    totalCompletedDays: Math.max(dbStats.totalCompletedDays || 0, localStats.totalCompletedDays || 0),
    weeklyPoints: Math.max(dbStats.weeklyPoints || 0, localStats.weeklyPoints || 0),
    weeklyXP: Math.max(dbStats.weeklyXP || 0, localStats.weeklyXP || 0),
    
    lastCompletedDate: (dbStats.lastCompletedDate || "") > (localStats.lastCompletedDate || "")
      ? dbStats.lastCompletedDate
      : localStats.lastCompletedDate,
    lastActiveDate: (dbStats.lastActiveDate || "") > (localStats.lastActiveDate || "")
      ? dbStats.lastActiveDate
      : localStats.lastActiveDate,
    lastGiftDate: (dbStats.lastGiftDate || "") > (localStats.lastGiftDate || "")
      ? dbStats.lastGiftDate
      : localStats.lastGiftDate,
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

  return merged;
}

function mergeSettings(dbSettings: UserSettings, localSettings: UserSettings, defaultSettings: UserSettings): UserSettings {
  const localHasSettings = (localSettings.displayName && localSettings.displayName !== "Nexora User" && localSettings.displayName !== "Champion") || localSettings.onboardingCompleted;
  if (!localHasSettings) {
    return { ...defaultSettings, ...dbSettings };
  }

  const merged: UserSettings = {
    ...defaultSettings,
    ...localSettings,
    ...dbSettings, // dbSettings wins by default for general/unhandled settings

    onboardingCompleted: dbSettings.onboardingCompleted || localSettings.onboardingCompleted || false,
    plantOnboardingCompleted: dbSettings.plantOnboardingCompleted || localSettings.plantOnboardingCompleted || false,
    spaceOnboardingCompleted: dbSettings.spaceOnboardingCompleted || localSettings.spaceOnboardingCompleted || false,
    spaceHouseUnlocked: dbSettings.spaceHouseUnlocked || localSettings.spaceHouseUnlocked || false,
    hasEnteredGarden: dbSettings.hasEnteredGarden || localSettings.hasEnteredGarden || false,
    isPro: dbSettings.isPro || localSettings.isPro || false,
    feedbackSubmitted: dbSettings.feedbackSubmitted || localSettings.feedbackSubmitted || false,
  };

  // Merge arrays uniquely
  merged.joinedCircleIds = Array.from(new Set([...(dbSettings.joinedCircleIds || []), ...(localSettings.joinedCircleIds || [])]));
  merged.notifEnabledCircleIds = Array.from(new Set([...(dbSettings.notifEnabledCircleIds || []), ...(localSettings.notifEnabledCircleIds || [])]));
  merged.purchasedEcosystemItemIds = Array.from(new Set([...(dbSettings.purchasedEcosystemItemIds || []), ...(localSettings.purchasedEcosystemItemIds || [])]));
  merged.activeEcosystemItemIds = Array.from(new Set([...(dbSettings.activeEcosystemItemIds || []), ...(localSettings.activeEcosystemItemIds || [])]));
  merged.purchasedHouseItemIds = Array.from(new Set([...(dbSettings.purchasedHouseItemIds || []), ...(localSettings.purchasedHouseItemIds || [])]));
  merged.readBookIds = Array.from(new Set([...(dbSettings.readBookIds || []), ...(localSettings.readBookIds || [])]));

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

  // Merge plantState - if one is empty but the other has progress, use the one with progress.
  // Growth stage and points indicate progress.
  // Special rule: if one is alive (isDead === false) and the other is dead (isDead === true), ALWAYS prefer the alive one!
  const dbPlant = dbSettings.plantState;
  const localPlant = localSettings.plantState;
  if (dbPlant && localPlant) {
    const dbIsDead = !!dbPlant.isDead;
    const localIsDead = !!localPlant.isDead;
    if (dbIsDead !== localIsDead) {
      merged.plantState = !localIsDead ? localPlant : dbPlant;
    } else {
      const dbProgress = (dbPlant.stage || 0) * 1000 + (dbPlant.growthPoints || 0);
      const localProgress = (localPlant.stage || 0) * 1000 + (localPlant.growthPoints || 0);
      merged.plantState = localProgress >= dbProgress ? localPlant : dbPlant;
    }
  } else {
    merged.plantState = dbPlant || localPlant;
  }

  // Merge plantsProgress
  const dbPlantsProgress = dbSettings.plantsProgress || {};
  const localPlantsProgress = localSettings.plantsProgress || {};
  const mergedPlantsProgress: any = { ...dbPlantsProgress };
  for (const key of Object.keys(localPlantsProgress)) {
    const localProg = localPlantsProgress[key as any];
    const dbProg = dbPlantsProgress[key as any];
    if (localProg && dbProg) {
      const dbIsDead = !!dbProg.isDead;
      const localIsDead = !!localProg.isDead;
      if (dbIsDead !== localIsDead) {
        mergedPlantsProgress[key] = !localIsDead ? localProg : dbProg;
      } else {
        const localProgVal = (localProg.stage || 0) * 1000 + (localProg.growthPoints || 0);
        const dbProgVal = (dbProg.stage || 0) * 1000 + (dbProg.growthPoints || 0);
        mergedPlantsProgress[key] = localProgVal >= dbProgVal ? localProg : dbProg;
      }
    } else {
      mergedPlantsProgress[key] = dbProg || localProg;
    }
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

  const cachedOnboarding =
    localStorage.getItem("nexora_onboarding_completed") === "true";
  const cachedUserId = localStorage.getItem("nexora_cached_user") || null;

  const [user, setUser] = useState<FirebaseUser | null>(
    cachedUserId ? ({ uid: cachedUserId } as FirebaseUser) : null,
  );

  // If the user has completed onboarding and we have a cached session, we immediately skip the splash loader.
  // This provides instant 100ms startup and bulletproof offline support.
  // Otherwise, we keep the splash loader active (loading = true) until we resolve user state from Firestore,
  // preventing user onboarding flashes/redirection glitches on slow connections.
  const [loading, setLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isStateHydrated, setIsStateHydrated] = useState(false);

  const cachedSettings = getCachedJson("nexora_settings", DEFAULT_SETTINGS);
  const cachedStats = getCachedJson("nexora_stats", DEFAULT_STATS);
  const cachedProgress = getCachedJson("nexora_progress", null);
  
  const rawCachedGarden = getCachedJson("nexora_garden", createInitialGardenState());
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
    cachedProgress?.date === today
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

  const [needsOnboarding, rawSetNeedsOnboarding] = useState(!cachedOnboarding);

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
  const [isHydrated, setIsHydrated] = useState(false);
  const dataLoadedFromFirestore = useRef(false);

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

  useEffect(() => {
    let loadTimeout: any = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log(`[STARTUP] AUTH STATE RESOLVED - User UID: ${currentUser?.uid || "null"}`);
      setUser(currentUser);

      if (currentUser) {
        localStorage.setItem("nexora_cached_user", currentUser.uid);
        setLoading(true);
        setIsDataReady(false);
        setIsStateHydrated(false);
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
          let userDocSnap = await getDoc(userDocRef);
          
          let docData: any = null;
          
          if (!userDocSnap.exists()) {
            console.log(`[FIRESTORE] User not found at '${userDocRef.path}'. Checking fallback '${userSingularDocRef.path}'...`);
            const userSingularSnap = await getDoc(userSingularDocRef);
            if (userSingularSnap.exists()) {
              console.log(`[FIRESTORE] User document found in Legacy '/user' path! Restoring profile from fallback...`);
              userDocSnap = userSingularSnap;
              docData = userSingularSnap.data();
              // Backfill the '/users' collection immediately
              await setDoc(userDocRef, docData);
            }
          }
          
          if (!userDocSnap.exists()) {
            console.log(`[FIRESTORE] User not found in DB. Creating new user document at ${userDocRef.path} and ${userSingularDocRef.path}`);
            
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
            await setDoc(userSingularDocRef, newUserData);
            docData = newUserData;
          } else {
            docData = userDocSnap.data();
            console.log(`[FIRESTORE] Loaded existing user document data:`, docData);
            
            // Backfill profile fields if missing
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
              console.log(`[FIRESTORE] Backfilling missing profile fields for existing user doc:`, updates);
              await setDoc(userDocRef, updates, { merge: true });
              await setDoc(userSingularDocRef, updates, { merge: true });
              docData = { ...docData, ...updates };
            }
          }
          
          if (docData) {
            // Robust multi-layered parallel fetch of all auxiliary documents/subcollections
            let onboardingData: any = null;
            let rewardsData: any = null;
            let plantSectionData: any = null;
            let notebookNotes: any[] = [];

            try {
              const onboardingIDRef = doc(db, "onboardingID", currentUser.uid);
              const onboardingSubdocRef = doc(db, "users", currentUser.uid, "onboarding", "main");
              const rewardsDocRef = doc(db, "users", currentUser.uid, "rewards", "main");
              const plantSectionDocRef = doc(db, "users", currentUser.uid, "plant_section", "main");
              const notebookRef = doc(db, "notebooks", currentUser.uid);

              const [
                onboardingIDSnap,
                onboardingSubdocSnap,
                rewardsSnap,
                plantSectionSnap,
                notebookSnap
              ] = await Promise.all([
                getDoc(onboardingIDRef),
                getDoc(onboardingSubdocRef),
                getDoc(rewardsDocRef),
                getDoc(plantSectionDocRef),
                getDoc(notebookRef)
              ]);

              if (onboardingIDSnap.exists()) {
                onboardingData = onboardingIDSnap.data();
                console.log(`[FIRESTORE] Loaded dedicated onboardingID data:`, onboardingData);
              } else if (onboardingSubdocSnap.exists()) {
                onboardingData = onboardingSubdocSnap.data();
                console.log(`[FIRESTORE] Loaded users/${currentUser.uid}/onboarding/main data:`, onboardingData);
              }

              if (rewardsSnap.exists()) {
                rewardsData = rewardsSnap.data();
                console.log(`[FIRESTORE] Loaded dedicated rewards/main data:`, rewardsData);
              }

              if (plantSectionSnap.exists()) {
                plantSectionData = plantSectionSnap.data();
                console.log(`[FIRESTORE] Loaded dedicated plant_section/main data:`, plantSectionData);
              }

              if (notebookSnap.exists()) {
                const nbData = notebookSnap.data();
                if (nbData && Array.isArray(nbData.notes)) {
                  notebookNotes = nbData.notes;
                  console.log(`[FIRESTORE] Loaded dedicated notebooks notes:`, notebookNotes.length);
                }
              }
            } catch (pErr) {
              console.error("[FIRESTORE] Error reading subcollection/auxiliary documents:", pErr);
            }

            const finalOnboardingCompleted = 
              (onboardingData?.newUsersOnboardingCompleted === true) || 
              (docData.onboardingCompleted === true) || 
              (docData.settings?.onboardingCompleted === true) || 
              false;
              
            const finalPlantOnboardingCompleted = 
              (onboardingData?.plantSectionOnboardingCompleted === true) || 
              (plantSectionData?.plantOnboardingCompleted === true) ||
              (docData.plantOnboardingCompleted === true) || 
              (docData.settings?.plantOnboardingCompleted === true) || 
              false;
              
            const finalSpaceOnboardingCompleted = 
              (docData.spaceOnboardingCompleted === true) ||
              (docData.settings?.spaceOnboardingCompleted === true) ||
              false;

            // Extract plantState and plantsProgress from plant_section document, user doc, or settings
            const finalPlantState = plantSectionData?.plantState ?? docData.plantState ?? docData.settings?.plantState ?? DEFAULT_SETTINGS.plantState;
            const finalPlantsProgress = plantSectionData?.plantsProgress ?? docData.plantsProgress ?? docData.settings?.plantsProgress ?? DEFAULT_SETTINGS.plantsProgress ?? {};
            const finalPurchasedEcosystemItemIds = plantSectionData?.purchasedEcosystemItemIds ?? docData.purchasedEcosystemItemIds ?? docData.settings?.purchasedEcosystemItemIds ?? DEFAULT_SETTINGS.purchasedEcosystemItemIds ?? [];
            const finalActiveEcosystemItemIds = plantSectionData?.activeEcosystemItemIds ?? docData.activeEcosystemItemIds ?? docData.settings?.activeEcosystemItemIds ?? DEFAULT_SETTINGS.activeEcosystemItemIds ?? [];

            const mappedSettings = {
              ...DEFAULT_SETTINGS,
              ...(docData.settings || {}),
              
              // Fallback to flat/root values, settings subfields, or plantSectionData for EVERY single field in UserSettings:
              pushupsGoal: docData.pushupsGoal ?? docData.settings?.pushupsGoal ?? DEFAULT_SETTINGS.pushupsGoal,
              waterGoal: docData.waterGoal ?? docData.settings?.waterGoal ?? DEFAULT_SETTINGS.waterGoal,
              reminderTime: docData.reminderTime ?? docData.settings?.reminderTime ?? DEFAULT_SETTINGS.reminderTime,
              reminderTime2: docData.reminderTime2 ?? docData.settings?.reminderTime2 ?? DEFAULT_SETTINGS.reminderTime2,
              motivationTime: docData.motivationTime ?? docData.settings?.motivationTime ?? DEFAULT_SETTINGS.motivationTime,
              displayName: docData.displayName || docData.name || docData.settings?.displayName || currentUser.displayName || "Champion",
              age: docData.age ?? docData.settings?.age ?? DEFAULT_SETTINGS.age,
              gender: docData.gender ?? docData.settings?.gender,
              profilePic: docData.profilePic || docData.photoFileName || docData.settings?.profilePic || currentUser.photoURL || "",
              themeColor: docData.themeColor ?? docData.settings?.themeColor ?? DEFAULT_SETTINGS.themeColor,
              soundEnabled: docData.soundEnabled ?? docData.settings?.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
              notificationsEnabled: docData.notificationsEnabled ?? docData.settings?.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled,
              showQuotes: docData.showQuotes ?? docData.settings?.showQuotes ?? DEFAULT_SETTINGS.showQuotes,
              pushMotivationEnabled: docData.pushMotivationEnabled ?? docData.settings?.pushMotivationEnabled ?? DEFAULT_SETTINGS.pushMotivationEnabled,
              unitSystem: docData.unitSystem ?? docData.settings?.unitSystem ?? DEFAULT_SETTINGS.unitSystem,
              purchasedItems: docData.purchasedItems ?? docData.settings?.purchasedItems ?? DEFAULT_SETTINGS.purchasedItems ?? [],
              savedChallengeIds: docData.savedChallengeIds ?? docData.settings?.savedChallengeIds ?? DEFAULT_SETTINGS.savedChallengeIds ?? [],
              savedTrophyIds: docData.savedTrophyIds ?? docData.settings?.savedTrophyIds ?? DEFAULT_SETTINGS.savedTrophyIds ?? [],
              savedVideoIds: docData.savedVideoIds ?? docData.settings?.savedVideoIds ?? DEFAULT_SETTINGS.savedVideoIds ?? [],
              savedPostIds: docData.savedPostIds ?? docData.settings?.savedPostIds ?? DEFAULT_SETTINGS.savedPostIds ?? [],
              activeHat: docData.activeHat ?? docData.settings?.activeHat ?? DEFAULT_SETTINGS.activeHat,
              activeSkin: docData.activeSkin ?? docData.settings?.activeSkin ?? DEFAULT_SETTINGS.activeSkin,
              zenModeEnabled: docData.zenModeEnabled ?? docData.settings?.zenModeEnabled ?? DEFAULT_SETTINGS.zenModeEnabled,
              isPro: docData.isPro ?? docData.settings?.isPro ?? DEFAULT_SETTINGS.isPro,
              performanceMode: docData.performanceMode ?? docData.settings?.performanceMode ?? DEFAULT_SETTINGS.performanceMode,
              lowPowerMode: docData.lowPowerMode ?? docData.settings?.lowPowerMode ?? DEFAULT_SETTINGS.lowPowerMode,
              onboardingCompleted: finalOnboardingCompleted,
              plantOnboardingCompleted: finalPlantOnboardingCompleted,
              spaceOnboardingCompleted: finalSpaceOnboardingCompleted,
              hasNewPlantItem: docData.hasNewPlantItem ?? docData.settings?.hasNewPlantItem ?? DEFAULT_SETTINGS.hasNewPlantItem,
              challengeCountGoal: docData.challengeCountGoal ?? docData.settings?.challengeCountGoal ?? DEFAULT_SETTINGS.challengeCountGoal,
              inventory: docData.inventory ?? docData.settings?.inventory ?? DEFAULT_SETTINGS.inventory ?? [],
              isDogSoundPackActive: docData.isDogSoundPackActive ?? docData.settings?.isDogSoundPackActive ?? DEFAULT_SETTINGS.isDogSoundPackActive,
              league: docData.league ?? docData.settings?.league ?? DEFAULT_SETTINGS.league,
              location: docData.location ?? docData.settings?.location ?? DEFAULT_SETTINGS.location,
              timezone: docData.timezone ?? docData.settings?.timezone ?? DEFAULT_SETTINGS.timezone,
              fcmToken: docData.fcmToken ?? docData.settings?.fcmToken,
              badgeSettings: docData.badgeSettings ?? docData.settings?.badgeSettings ?? DEFAULT_SETTINGS.badgeSettings,
              purchasedHouseItemIds: docData.purchasedHouseItemIds ?? docData.settings?.purchasedHouseItemIds ?? DEFAULT_SETTINGS.purchasedHouseItemIds ?? [],
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
              proTestActive: docData.proTestActive ?? docData.settings?.proTestActive ?? false,
              proTestStartedAt: docData.proTestStartedAt ?? docData.settings?.proTestStartedAt ?? null,
              proTestExpiresAt: docData.proTestExpiresAt ?? docData.settings?.proTestExpiresAt ?? null,
              proTestLastUsedAt: docData.proTestLastUsedAt ?? docData.settings?.proTestLastUsedAt ?? null,
              
              accountName: docData.accountName || docData["Account name"] || (docData.settings?.accountName) || currentUser.displayName || currentUser.email?.split('@')[0] || "Champion",
              email: docData.email || (docData.settings?.email) || currentUser.email || "",
              time: docData.time || docData["Time"] || (docData.settings?.time) || new Date().toISOString()
            };
            
            // Fallback stats fields using max/fallback to ensure we never lose progress
            const finalStreak = Math.max(docData.streak || 0, docData.stats?.streak || 0, rewardsData?.streak || 0, DEFAULT_STATS.streak);
            const finalBestStreak = Math.max(docData.bestStreak || 0, docData.stats?.bestStreak || 0, rewardsData?.bestStreak || 0, DEFAULT_STATS.bestStreak);
            const finalTotalPoints = Math.max(docData.totalPoints || 0, docData.stats?.totalPoints || 0, rewardsData?.totalPoints || 0, DEFAULT_STATS.totalPoints);
            const finalXP = Math.max(docData.xp || 0, docData.stats?.xp || 0, rewardsData?.xp || 0, DEFAULT_STATS.xp);
            const finalLevel = Math.max(docData.level || 1, docData.stats?.level || 1, rewardsData?.level || 1, DEFAULT_STATS.level || 1);
            const finalCoins = Math.max(docData.coins || 0, docData.stats?.coins || 0, rewardsData?.coins || 0, DEFAULT_STATS.coins);
            const finalWeeklyPoints = Math.max(docData.weeklyPoints || 0, docData.stats?.weeklyPoints || 0, rewardsData?.weeklyPoints || 0, DEFAULT_STATS.weeklyPoints);
            const finalWeeklyXP = Math.max(docData.weeklyXP || 0, docData.stats?.weeklyXP || 0, rewardsData?.weeklyXP || 0, DEFAULT_STATS.weeklyXP);
            
            // For complex structures, use the one that is non-empty
            const finalTrophies = (rewardsData?.trophies?.length > 0) ? rewardsData.trophies : ((docData.stats?.trophies?.length > 0) ? docData.stats.trophies : (docData.trophies || []));
            const finalUnlockedHats = (rewardsData?.unlockedHats?.length > 0) ? rewardsData.unlockedHats : ((docData.stats?.unlockedHats?.length > 0) ? docData.stats.unlockedHats : (docData.unlockedHats || []));
            const finalGratitudeEntries = (rewardsData?.gratitudeEntries?.length > 0) ? rewardsData.gratitudeEntries : ((docData.stats?.gratitudeEntries?.length > 0) ? docData.stats.gratitudeEntries : ((docData.gratitudeEntries?.length > 0) ? docData.gratitudeEntries : notebookNotes));

            const mappedStats = {
              ...DEFAULT_STATS,
              ...(docData.stats || {}),
              
              streak: finalStreak,
              bestStreak: finalBestStreak,
              totalPoints: finalTotalPoints,
              xp: finalXP,
              level: finalLevel,
              totalCompletedDays: docData.totalCompletedDays ?? docData.stats?.totalCompletedDays ?? rewardsData?.totalCompletedDays ?? DEFAULT_STATS.totalCompletedDays,
              lastCompletedDate: docData.lastCompletedDate ?? docData.stats?.lastCompletedDate ?? rewardsData?.lastCompletedDate ?? DEFAULT_STATS.lastCompletedDate,
              lastGiftDate: docData.lastGiftDate ?? docData.stats?.lastGiftDate ?? rewardsData?.lastGiftDate ?? DEFAULT_STATS.lastGiftDate,
              currentChallengeIndex: docData.currentChallengeIndex ?? docData.stats?.currentChallengeIndex ?? rewardsData?.currentChallengeIndex ?? DEFAULT_STATS.currentChallengeIndex,
              coins: finalCoins,
              gems: docData.gems ?? docData.stats?.gems ?? rewardsData?.gems ?? DEFAULT_STATS.gems,
              weeklyPoints: finalWeeklyPoints,
              weeklyXP: finalWeeklyXP,
              lastWeeklyReset: docData.lastWeeklyReset ?? docData.stats?.lastWeeklyReset ?? rewardsData?.lastWeeklyReset ?? DEFAULT_STATS.lastWeeklyReset,
              lastRankRewardClaimWeek: docData.lastRankRewardClaimWeek ?? docData.stats?.lastRankRewardClaimWeek ?? rewardsData?.lastRankRewardClaimWeek ?? DEFAULT_STATS.lastRankRewardClaimWeek,
              lastActiveDate: docData.lastActiveDate ?? docData.stats?.lastActiveDate ?? rewardsData?.lastActiveDate ?? DEFAULT_STATS.lastActiveDate,
              trophies: finalTrophies,
              pointsByCategory: docData.pointsByCategory ?? docData.stats?.pointsByCategory ?? rewardsData?.pointsByCategory ?? DEFAULT_STATS.pointsByCategory,
              drawings: docData.drawings ?? docData.stats?.drawings ?? rewardsData?.drawings ?? DEFAULT_STATS.drawings ?? [],
              unlockedHats: finalUnlockedHats,
              gratitudeEntries: finalGratitudeEntries,
              waterDrank: docData.waterDrank ?? docData.stats?.waterDrank ?? rewardsData?.waterDrank ?? DEFAULT_STATS.waterDrank,
              lifetimeWaterCompletions: docData.lifetimeWaterCompletions ?? docData.stats?.lifetimeWaterCompletions ?? rewardsData?.lifetimeWaterCompletions ?? DEFAULT_STATS.lifetimeWaterCompletions,
              hasClaimedXpChest: docData.hasClaimedXpChest ?? docData.stats?.hasClaimedXpChest ?? rewardsData?.hasClaimedXpChest ?? DEFAULT_STATS.hasClaimedXpChest,
            };
            
            const finalGardenStateFromPlantSection = plantSectionData?.gardenState ?? {};
            
            const mappedGarden = {
              ...createInitialGardenState(),
              ...(docData.garden || {}),
              ...finalGardenStateFromPlantSection,
              
              tiles: docData.tiles ?? docData.garden?.tiles ?? finalGardenStateFromPlantSection.tiles ?? createInitialGardenState().tiles,
              inventory: docData.inventory ?? docData.garden?.inventory ?? finalGardenStateFromPlantSection.inventory ?? createInitialGardenState().inventory,
              streakSavers: docData.streakSavers ?? docData.garden?.streakSavers ?? finalGardenStateFromPlantSection.streakSavers ?? createInitialGardenState().streakSavers ?? 0,
            };

            // Retrieve the absolute latest local storage changes (e.g. offline work or quick edits)
            const cachedUser = localStorage.getItem("nexora_cached_user");
            const hasLocalStorage = localStorage.getItem("nexora_settings") !== null;
            
            let resolvedSettings = mappedSettings;
            let resolvedStats = mappedStats;
            let resolvedGarden = mappedGarden;

            if (hasLocalStorage && cachedUser === currentUser.uid) {
              console.log("[PERSISTENCE] Matching local cache found. Performing safe merge...");
              const latestLocalSettings = getCachedJson("nexora_settings", DEFAULT_SETTINGS);
              const latestLocalStats = getCachedJson("nexora_stats", DEFAULT_STATS);
              const latestLocalGarden = getCachedJson("nexora_garden", createInitialGardenState());

              resolvedSettings = mergeSettings(mappedSettings, latestLocalSettings, DEFAULT_SETTINGS);
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
            try {
              const progressRef = doc(db, "users", currentUser.uid, "progress", today);
              const progressSnap = await getDoc(progressRef);
              
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

              let resolvedProgress: DailyProgress = defaultProgress;
              if (progressSnap.exists()) {
                resolvedProgress = progressSnap.data() as DailyProgress;
              }

              if (hasLocalStorage && cachedUser === currentUser.uid) {
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
              lastSyncedRef.current = {
                s: mappedSettings,
                st: mappedStats,
                p: {
                  c: progressSnap.exists() ? (progressSnap.data() as DailyProgress).completed : false,
                  cc: progressSnap.exists() ? (progressSnap.data() as DailyProgress).completionsCount : 0,
                  d: today,
                },
                g: mappedGarden
              };
            } catch (pErr) {
              console.error("[FIRESTORE] Error loading progress data:", pErr);
            }
            
            setNeedsOnboarding(!finalOnboardingCompleted);
            if (finalOnboardingCompleted) {
              localStorage.setItem("nexora_onboarding_completed", "true");
            } else {
              localStorage.removeItem("nexora_onboarding_completed");
            }
          }
          
          dataLoadedFromFirestore.current = true;
          setIsHydrated(true);
          setIsStateLoaded(false, "Auth state resolved with loaded Firestore data. Waiting for state matching.");
          hasMatchedHydratedStateRef.current = false;
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          
          // Fallback to local storage if offline/error so app continues functioning
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
        }
      } else {
        console.log(`[STARTUP] AUTH STATE RESOLVED - User logged out. Resetting local state.`);
        setUser(null);
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
        localStorage.removeItem("nexora_settings");
        localStorage.removeItem("nexora_stats");
        localStorage.removeItem("nexora_garden");
        localStorage.removeItem("nexora_progress");
        localStorage.removeItem("nexora_cached_user");
        localStorage.removeItem("nexora_onboarding_completed");

        dataLoadedFromFirestore.current = false;
        setIsHydrated(false);
        setIsStateLoaded(false, "No user session");
        hasMatchedHydratedStateRef.current = false;
        setIsStateHydrated(false);
        setNeedsOnboarding(true);
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
  // Safe State Matching Gate: ensure React state matches the loaded/hydrated Firestore data
  // before unlocking the sync gate. This prevents empty default states from overwriting database records.
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;
    if (hasMatchedHydratedStateRef.current) return;

    if (isHydrated && hydratedStateRef.current) {
      console.log(`[PERSISTENCE AUDIT] Firestore data hydrated successfully. Unlocking sync gate safely.`);
      hasMatchedHydratedStateRef.current = true;
      setIsStateLoaded(true, "State matching complete");
      setIsStateHydrated(true);
    }
  }, [isHydrated, user, isDataReady]);

  // Background Sync Effect with Aggressive Throttling (Optimized)
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;
    if (!isStateLoadedRef.current) {
      console.log(`[PERSISTENCE AUDIT] State is not fully loaded/synchronized with Firestore yet. Skipping background sync for user UID: ${user.uid}`);
      return;
    }
    if (!hasMatchedHydratedStateRef.current) {
      console.log(`[PERSISTENCE AUDIT] Stale memory state detected (React has not yet flushed hydrated state from Firestore). Skipping background sync to avoid data loss.`);
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
            const preSnap = await getDoc(userRef);
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
                coins: dbData.coins ?? dbData.stats?.coins ?? DEFAULT_STATS.coins,
                weeklyPoints: dbData.weeklyPoints ?? dbData.stats?.weeklyPoints ?? DEFAULT_STATS.weeklyPoints,
                weeklyXP: dbData.weeklyXP ?? dbData.stats?.weeklyXP ?? DEFAULT_STATS.weeklyXP,
              };
              const dbGarden = {
                ...createInitialGardenState(),
                ...(dbData.garden || {}),
                tiles: dbData.tiles ?? dbData.garden?.tiles ?? createInitialGardenState().tiles,
                inventory: dbData.inventory ?? dbData.garden?.inventory ?? createInitialGardenState().inventory,
              };
              const dbSettings = {
                ...DEFAULT_SETTINGS,
                ...(dbData.settings || {}),
                displayName: dbData.displayName ?? dbData.name ?? dbData.settings?.displayName ?? DEFAULT_SETTINGS.displayName,
                onboardingCompleted: dbData.onboardingCompleted ?? dbData.settings?.onboardingCompleted ?? DEFAULT_SETTINGS.onboardingCompleted,
              };

              const dbHasProgress = (dbStats.xp > 0 || dbStats.coins > 0 || (dbStats.totalPoints || 0) > 0 || (dbStats.streak || 0) > 0);
              const dbHasGarden = (dbGarden.tiles && dbGarden.tiles.length > 0) || (dbGarden.inventory && Object.keys(dbGarden.inventory).length > 0);
              const dbHasSettings = (dbSettings.displayName && dbSettings.displayName !== "Nexora User" && dbSettings.displayName !== "Champion");

              const localIsEmptyStats = (stats.xp === 0 && stats.coins === 0 && (stats.totalPoints || 0) === 0 && (stats.streak || 0) === 0);
              const localIsEmptyGarden = !gardenState.tiles || gardenState.tiles.length === 0;
              const localIsEmptySettings = !settings.displayName || settings.displayName === "Nexora User" || settings.displayName === "Champion";

              if (
                (dbHasProgress && localIsEmptyStats) ||
                (dbHasGarden && localIsEmptyGarden) ||
                (dbHasSettings && localIsEmptySettings)
              ) {
                console.error(`[CRITICAL BLOCKED WRITE] Emergency block triggered in syncData! Attempted to overwrite positive Firestore data with empty local states. DB Stats Has Progress: ${dbHasProgress}, Local Is Empty Stats: ${localIsEmptyStats}. DB Garden Has Data: ${dbHasGarden}, Local Is Empty Garden: ${localIsEmptyGarden}. DB Settings Has Info: ${dbHasSettings}, Local Is Empty Settings: ${localIsEmptySettings}. Aborting write to prevent data loss.`);
                
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
                    coins: dbData.coins ?? dbData.stats?.coins ?? DEFAULT_STATS.coins,
                    weeklyPoints: dbData.weeklyPoints ?? dbData.stats?.weeklyPoints ?? DEFAULT_STATS.weeklyPoints,
                    weeklyXP: dbData.weeklyXP ?? dbData.stats?.weeklyXP ?? DEFAULT_STATS.weeklyXP,
                    trophies: dbData.trophies ?? dbData.stats?.trophies ?? [],
                    drawings: dbData.drawings ?? dbData.stats?.drawings ?? [],
                    unlockedHats: dbData.unlockedHats ?? dbData.stats?.unlockedHats ?? [],
                    gratitudeEntries: dbData.gratitudeEntries ?? dbData.stats?.gratitudeEntries ?? [],
                  });
                }
                if (dbData.settings || dbData.displayName || dbData.onboardingCompleted !== undefined) {
                  setSettings({
                    ...DEFAULT_SETTINGS,
                    ...(dbData.settings || {}),
                    displayName: dbData.displayName ?? dbData.name ?? dbData.settings?.displayName ?? DEFAULT_SETTINGS.displayName,
                    onboardingCompleted: dbData.onboardingCompleted ?? dbData.settings?.onboardingCompleted ?? DEFAULT_SETTINGS.onboardingCompleted,
                    plantOnboardingCompleted: dbData.plantOnboardingCompleted ?? dbData.settings?.plantOnboardingCompleted ?? DEFAULT_SETTINGS.plantOnboardingCompleted,
                    spaceOnboardingCompleted: dbData.spaceOnboardingCompleted ?? dbData.settings?.spaceOnboardingCompleted ?? DEFAULT_SETTINGS.spaceOnboardingCompleted,
                    purchasedItems: dbData.purchasedItems ?? dbData.settings?.purchasedItems ?? DEFAULT_SETTINGS.purchasedItems,
                    inventory: dbData.inventory ?? dbData.settings?.inventory ?? DEFAULT_SETTINGS.inventory,
                  });
                }
                if (dbData.garden || dbData.tiles !== undefined) {
                  setGardenState({
                    ...createInitialGardenState(),
                    ...(dbData.garden || {}),
                    tiles: dbData.tiles ?? dbData.garden?.tiles ?? createInitialGardenState().tiles,
                    inventory: dbData.inventory ?? dbData.garden?.inventory ?? createInitialGardenState().inventory,
                  });
                }
                return;
              }
            }

            const writePayload = {
              name: settings.displayName || user.displayName || 'Champion',
              displayName: settings.displayName || user.displayName || 'Champion',
              photoFileName: settings.profilePic || user.photoURL || '',
              profilePic: settings.profilePic || user.photoURL || '',
              location: settings.location || '',
              time: new Date().toISOString(),
              ...settings,
              settings: settings,
              uid: user.uid,
              email: user.email || `${user.uid}@nexora.app`,
              role: 'user',
              stats: stats,
              garden: gardenState,
              isTodayCompleted: dailyProgress.completed,
              updatedAt: serverTimestamp(),
              onboardingCompleted: settings.onboardingCompleted || false,
            };

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
              plantState: settings.plantState || null,
              gardenState: gardenState || null,
              purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
              updatedAt: serverTimestamp(),
            };

            const onboardingPayload = {
              uid: user.uid,
              newUsersOnboardingCompleted: settings.onboardingCompleted || false,
              plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
              updatedAt: serverTimestamp(),
            };

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

            await setDoc(userRef, writePayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote core document to: ${userRef.path}`);

            await setDoc(userSingularRef, writePayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote singular core document to: ${userSingularRef.path}`);

            await setDoc(rewardsDocRef, rewardsPayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote rewards subdocument to: ${rewardsDocRef.path}`);

            await setDoc(plantSectionDocRef, plantSectionPayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote plant section subdocument to: ${plantSectionDocRef.path}`);

            await setDoc(onboardingDocRef, onboardingPayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote onboarding subdocument to: ${onboardingDocRef.path}`);

            await setDoc(onboardingSubdocRef, onboardingPayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote onboarding subcollection document to: ${onboardingSubdocRef.path}`);
            
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
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote plants collection to: ${plantsDocRef.path}`);

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
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote stats collection to: ${statsDocRef.path}`);

            // 3. Library Collection Sync
            const libraryDocRef = doc(db, "library", user.uid);
            const libraryPayload = {
              userId: user.uid,
              userName: settings.displayName || user.displayName || 'Champion',
              userEmail: user.email || `${user.uid}@nexora.app`,
              inventory: settings.inventory || [],
              savedVideos: [],
              savedDrawings: stats.drawings || [],
              savedChallengeIds: settings.savedChallengeIds || [],
              updatedAt: serverTimestamp()
            };
            await setDoc(libraryDocRef, libraryPayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote library collection to: ${libraryDocRef.path}`);

            console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${userRef.path}`);
            const postSnap = await getDoc(userRef);
            console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${userRef.path}:`, postSnap.exists() ? JSON.stringify(postSnap.data()) : "Document does not exist");
          } catch (err: any) {
            console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write core document to: ${userRef.path}. Error:`, err);
          }
        }

        // 2. Sync progress always attempts, or can be throttled too
        console.log(`[PERSISTENCE AUDIT] Initiating write for progress document...`);
        console.log(`[PERSISTENCE AUDIT] Exact Firestore path: ${progressRef.path}`);
        try {
          console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${progressRef.path}`);
          const preProgSnap = await getDoc(progressRef);
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
              console.error(`[CRITICAL BLOCKED WRITE] Emergency block triggered in syncData for progress! Attempted to overwrite positive/completed Firestore progress with empty local state. DB Progress: ${JSON.stringify(dbProg)}, Local Progress: ${JSON.stringify(dailyProgress)}. Aborting write to prevent data loss.`);
              
              // Trigger emergency recovery: update local state to match database progress
              setDailyProgress(dbProg);
              return;
            }
          }

          console.log(`[PERSISTENCE AUDIT] Write payload for progress document:`, JSON.stringify(dailyProgress));
          await setDoc(progressRef, dailyProgress, { merge: true });
          console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote progress document to: ${progressRef.path}`);
          
          console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${progressRef.path}`);
          const postProgSnap = await getDoc(progressRef);
          console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${progressRef.path}:`, postProgSnap.exists() ? JSON.stringify(postProgSnap.data()) : "Document does not exist");
        } catch (err: any) {
          console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write progress document to: ${progressRef.path}. Error:`, err);
        }

        // 3. Leaderboard sync (only if streak, points, name or photo changed)
        const lbChanged =
          !lastSyncedData ||
          lastSyncedData.st?.totalPoints !== stats.totalPoints ||
          lastSyncedData.st?.streak !== stats.streak ||
          lastSyncedData.s?.displayName !== settings.displayName ||
          lastSyncedData.s?.profilePic !== settings.profilePic;

        if (lbChanged) {
          console.log(`[PERSISTENCE AUDIT] Leaderboard relevant fields changed. Initiating write for leaderboard document...`);
          console.log(`[PERSISTENCE AUDIT] Exact Firestore path: ${leaderboardRef.path}`);
          try {
            console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${leaderboardRef.path}`);
            const preLbSnap = await getDoc(leaderboardRef);
            console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${leaderboardRef.path}:`, preLbSnap.exists() ? JSON.stringify(preLbSnap.data()) : "Document does not exist");
            
            const writePayload = {
              uid: user.uid,
              displayName: settings.displayName || "Anonymous",
              photoURL: settings.profilePic || user.photoURL || "",
              streak: stats.streak || 0,
              totalPoints: stats.totalPoints || 0,
              weeklyXP: stats.weeklyXP || 0,
              weeklyPoints: stats.weeklyPoints || 0,
              level: stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1,
              league: settings.league || "Bronze",
            };
            console.log(`[PERSISTENCE AUDIT] Write payload for leaderboard document:`, JSON.stringify(writePayload));
            
            await setDoc(leaderboardRef, writePayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote leaderboard document to: ${leaderboardRef.path}`);
            
            console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${leaderboardRef.path}`);
            const postLbSnap = await getDoc(leaderboardRef);
            console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${leaderboardRef.path}:`, postLbSnap.exists() ? JSON.stringify(postLbSnap.data()) : "Document does not exist");
          } catch (err: any) {
            console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write leaderboard document to: ${leaderboardRef.path}. Error:`, err);
          }
        }

        lastSyncedRef.current = currentState;
        console.log("Hooks: Optimized Background Sync Complete ✅");
      } catch (e: any) {
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Error syncing data for user UID: ${user?.uid}. Error:`, e);
        if (e.message?.includes("quota") || e.code === "resource-exhausted") {
          quotaExceededRef.current = true;
          showToast("Nexus Quota Reached. Local cache active. 🛡️", "info");
        } else {
          console.error("Sync error:", e);
        }
      }
    };

    // 1-second debounce for faster background sync (Ensures no data loss on immediate exits)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(syncData, 1000);

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
        if (next.onboardingCompleted) {
          localStorage.setItem("nexora_onboarding_completed", "true");
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
        localStorage.setItem(
          "nexora_progress",
          JSON.stringify({ ...next, date: today }),
        );
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
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;
    if (!isStateLoadedRef.current || !hasMatchedHydratedStateRef.current) {
      console.warn(`[PERSISTENCE AUDIT] forceSyncData called but hydration is not complete. Blocking write to prevent data loss.`);
      return;
    }
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    if (quotaExceededRef.current) return;
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
        const preSnap = await getDoc(userRef);
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
            coins: dbData.coins ?? dbData.stats?.coins ?? DEFAULT_STATS.coins,
            weeklyPoints: dbData.weeklyPoints ?? dbData.stats?.weeklyPoints ?? DEFAULT_STATS.weeklyPoints,
            weeklyXP: dbData.weeklyXP ?? dbData.stats?.weeklyXP ?? DEFAULT_STATS.weeklyXP,
          };
          const dbGarden = {
            ...createInitialGardenState(),
            ...(dbData.garden || {}),
            tiles: dbData.tiles ?? dbData.garden?.tiles ?? createInitialGardenState().tiles,
            inventory: dbData.inventory ?? dbData.garden?.inventory ?? createInitialGardenState().inventory,
          };
          const dbSettings = {
            ...DEFAULT_SETTINGS,
            ...(dbData.settings || {}),
            displayName: dbData.displayName ?? dbData.name ?? dbData.settings?.displayName ?? DEFAULT_SETTINGS.displayName,
            onboardingCompleted: dbData.onboardingCompleted ?? dbData.settings?.onboardingCompleted ?? DEFAULT_SETTINGS.onboardingCompleted,
          };

          const dbHasProgress = (dbStats.xp > 0 || dbStats.coins > 0 || (dbStats.totalPoints || 0) > 0 || (dbStats.streak || 0) > 0);
          const dbHasGarden = (dbGarden.tiles && dbGarden.tiles.length > 0) || (dbGarden.inventory && Object.keys(dbGarden.inventory).length > 0);
          const dbHasSettings = (dbSettings.displayName && dbSettings.displayName !== "Nexora User" && dbSettings.displayName !== "Champion");

          const localIsEmptyStats = (stats.xp === 0 && stats.coins === 0 && (stats.totalPoints || 0) === 0 && (stats.streak || 0) === 0);
          const localIsEmptyGarden = !gardenState.tiles || gardenState.tiles.length === 0;
          const localIsEmptySettings = !settings.displayName || settings.displayName === "Nexora User" || settings.displayName === "Champion";

          if (
            (dbHasProgress && localIsEmptyStats) ||
            (dbHasGarden && localIsEmptyGarden) ||
            (dbHasSettings && localIsEmptySettings)
          ) {
            console.error(`[CRITICAL BLOCKED WRITE] Emergency block triggered in forceSyncData! Attempted to overwrite positive Firestore data with empty local states. DB Stats Has Progress: ${dbHasProgress}, Local Is Empty Stats: ${localIsEmptyStats}. DB Garden Has Data: ${dbHasGarden}, Local Is Empty Garden: ${localIsEmptyGarden}. DB Settings Has Info: ${dbHasSettings}, Local Is Empty Settings: ${localIsEmptySettings}. Aborting write to prevent data loss.`);
            
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
                coins: dbData.coins ?? dbData.stats?.coins ?? DEFAULT_STATS.coins,
                weeklyPoints: dbData.weeklyPoints ?? dbData.stats?.weeklyPoints ?? DEFAULT_STATS.weeklyPoints,
                weeklyXP: dbData.weeklyXP ?? dbData.stats?.weeklyXP ?? DEFAULT_STATS.weeklyXP,
                trophies: dbData.trophies ?? dbData.stats?.trophies ?? [],
                drawings: dbData.drawings ?? dbData.stats?.drawings ?? [],
                unlockedHats: dbData.unlockedHats ?? dbData.stats?.unlockedHats ?? [],
                gratitudeEntries: dbData.gratitudeEntries ?? dbData.stats?.gratitudeEntries ?? [],
              });
            }
            if (dbData.settings || dbData.displayName || dbData.onboardingCompleted !== undefined) {
              setSettings({
                ...DEFAULT_SETTINGS,
                ...(dbData.settings || {}),
                displayName: dbData.displayName ?? dbData.name ?? dbData.settings?.displayName ?? DEFAULT_SETTINGS.displayName,
                onboardingCompleted: dbData.onboardingCompleted ?? dbData.settings?.onboardingCompleted ?? DEFAULT_SETTINGS.onboardingCompleted,
                plantOnboardingCompleted: dbData.plantOnboardingCompleted ?? dbData.settings?.plantOnboardingCompleted ?? DEFAULT_SETTINGS.plantOnboardingCompleted,
                spaceOnboardingCompleted: dbData.spaceOnboardingCompleted ?? dbData.settings?.spaceOnboardingCompleted ?? DEFAULT_SETTINGS.spaceOnboardingCompleted,
                purchasedItems: dbData.purchasedItems ?? dbData.settings?.purchasedItems ?? DEFAULT_SETTINGS.purchasedItems,
                inventory: dbData.inventory ?? dbData.settings?.inventory ?? DEFAULT_SETTINGS.inventory,
              });
            }
            if (dbData.garden || dbData.tiles !== undefined) {
              setGardenState({
                ...createInitialGardenState(),
                ...(dbData.garden || {}),
                tiles: dbData.tiles ?? dbData.garden?.tiles ?? createInitialGardenState().tiles,
                inventory: dbData.inventory ?? dbData.garden?.inventory ?? createInitialGardenState().inventory,
              });
            }
            return;
          }
        }

        const writePayload = {
          name: settings.displayName || user.displayName || 'Champion',
          displayName: settings.displayName || user.displayName || 'Champion',
          photoFileName: settings.profilePic || user.photoURL || '',
          profilePic: settings.profilePic || user.photoURL || '',
          location: settings.location || '',
          time: new Date().toISOString(),
          ...settings,
          settings: settings,
          uid: user.uid,
          email: user.email || `${user.uid}@nexora.app`,
          role: 'user',
          stats: stats,
          garden: gardenState,
          isTodayCompleted: dailyProgress.completed,
          updatedAt: serverTimestamp(),
          onboardingCompleted: settings.onboardingCompleted || false,
        };

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
          plantState: settings.plantState || null,
          gardenState: gardenState || null,
          purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
          updatedAt: serverTimestamp(),
        };

        const onboardingPayload = {
          uid: user.uid,
          newUsersOnboardingCompleted: settings.onboardingCompleted || false,
          plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
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
        const libraryPayload = {
          userId: user.uid,
          userName: settings.displayName || user.displayName || 'Champion',
          userEmail: user.email || `${user.uid}@nexora.app`,
          inventory: settings.inventory || [],
          savedVideos: [],
          savedDrawings: stats.drawings || [],
          savedChallengeIds: settings.savedChallengeIds || [],
          updatedAt: serverTimestamp()
        };
        await setDoc(libraryDocRef, libraryPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote library collection to: ${libraryDocRef.path}`);

        console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${userRef.path}`);
        const postSnap = await getDoc(userRef);
        console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${userRef.path}:`, postSnap.exists() ? JSON.stringify(postSnap.data()) : "Document does not exist");
      } catch (err: any) {
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed to write core document to: ${userRef.path}. Error:`, err);
      }

      // 2. Progress Doc Force Write
      try {
        console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${progressRef.path}`);
        const preProgSnap = await getDoc(progressRef);
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
            console.error(`[CRITICAL BLOCKED WRITE] Emergency block triggered in forceSyncData for progress! Attempted to overwrite positive/completed Firestore progress with empty local state. DB Progress: ${JSON.stringify(dbProg)}, Local Progress: ${JSON.stringify(dailyProgress)}. Aborting write to prevent data loss.`);
            
            // Trigger emergency recovery: update local state to match database progress
            setDailyProgress(dbProg);
            return;
          }
        }

        console.log(`[PERSISTENCE AUDIT] Force sync payload for progress document:`, JSON.stringify(dailyProgress));
        await setDoc(progressRef, dailyProgress, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote progress document to: ${progressRef.path}`);

        console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${progressRef.path}`);
        const postProgSnap = await getDoc(progressRef);
        console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${progressRef.path}:`, postProgSnap.exists() ? JSON.stringify(postProgSnap.data()) : "Document does not exist");
      } catch (err: any) {
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed to write progress document to: ${progressRef.path}. Error:`, err);
      }

      // 3. Leaderboard Doc Force Write
      try {
        console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${leaderboardRef.path}`);
        const preLbSnap = await getDoc(leaderboardRef);
        console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${leaderboardRef.path}:`, preLbSnap.exists() ? JSON.stringify(preLbSnap.data()) : "Document does not exist");

        const writePayload = {
          uid: user.uid,
          displayName: settings.displayName || "Anonymous",
          photoURL: settings.profilePic || user.photoURL || "",
          streak: stats.streak || 0,
          totalPoints: stats.totalPoints || 0,
          weeklyXP: stats.weeklyXP || 0,
          weeklyPoints: stats.weeklyPoints || 0,
          level: stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1,
          league: settings.league || "Bronze",
        };
        console.log(`[PERSISTENCE AUDIT] Force sync payload for leaderboard document:`, JSON.stringify(writePayload));

        await setDoc(leaderboardRef, writePayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote leaderboard document to: ${leaderboardRef.path}`);

        console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${leaderboardRef.path}`);
        const postLbSnap = await getDoc(leaderboardRef);
        console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${leaderboardRef.path}:`, postLbSnap.exists() ? JSON.stringify(postLbSnap.data()) : "Document does not exist");
      } catch (err: any) {
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed to write leaderboard document to: ${leaderboardRef.path}. Error:`, err);
      }

      console.log("Hooks: Manual/Force Sync complete ✅");
    } catch (e: any) {
      console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed for user UID: ${user?.uid}. Error:`, e);
      console.error("Hooks: Force sync failed", e);
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
