import { useState, useEffect, useRef, useCallback } from "react";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  getDocFromCache,
  getDocsFromCache,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
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

const today = new Date().toISOString().split("T")[0];

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
  const [loading, setLoading] = useState(cachedUserId ? (cachedOnboarding ? false : true) : false);
  const [isDataReady, setIsDataReady] = useState(cachedUserId ? (cachedOnboarding ? true : false) : false);

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

  /*
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      console.log(`[STARTUP] AUTH STATE RESOLVED - User UID: ${currentUser?.uid || "null"}`);
      setUser(currentUser);

      if (currentUser) {
        // Run async load or create routine
        const loadOrCreateUser = async () => {
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
                email: currentUser.email || `${currentUser.uid}@nexora.app`,
                photoFileName: currentUser.photoURL || "",
                "Photo file name": currentUser.photoURL || "",
                profilePic: currentUser.photoURL || "",
                location: "",
                "Location": "",
                time: new Date().toISOString(),
                "Time": new Date().toISOString(),
                accountName: accountNameVal,
                "Account name": accountNameVal,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                role: "user",
                profilePrivacy: "private",
                settings: {
                  ...DEFAULT_SETTINGS,
                  profilePrivacy: "private"
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
              
              // If a user is already registered but isn't in the database, add them there when they log in. 
              // Add all necessary fields into their document: name, email, Photo file name, Location, Time, Account name.
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
              const mappedSettings = {
                ...DEFAULT_SETTINGS,
                ...(docData.settings || {}),
                displayName: docData.name || docData.displayName || (docData.settings?.displayName) || currentUser.displayName || "Champion",
                profilePic: docData.photoFileName || docData.profilePic || (docData.settings?.profilePic) || currentUser.photoURL || "",
                location: docData.location || docData["Location"] || (docData.settings?.location) || "",
                accountName: docData.accountName || docData["Account name"] || (docData.settings?.accountName) || currentUser.displayName || currentUser.email?.split('@')[0] || "Champion",
                email: docData.email || (docData.settings?.email) || currentUser.email || "",
                time: docData.time || docData["Time"] || (docData.settings?.time) || new Date().toISOString()
              };
              
              const mappedStats = {
                ...DEFAULT_STATS,
                ...(docData.stats || {}),
              };
              
              const mappedGarden = {
                ...createInitialGardenState(),
                ...(docData.garden || {}),
              };
              
              rawSetSettings(mappedSettings);
              rawSetStats(mappedStats);
              rawSetGardenState(mappedGarden);
              
              localStorage.setItem("nexora_settings", JSON.stringify(mappedSettings));
              localStorage.setItem("nexora_stats", JSON.stringify(mappedStats));
              localStorage.setItem("nexora_garden", JSON.stringify(mappedGarden));
              
              hydratedStateRef.current = {
                s: mappedSettings,
                st: mappedStats,
                g: mappedGarden
              };
              
              lastSyncedRef.current = {
                s: mappedSettings,
                st: mappedStats,
                p: {
                  c: dailyProgress.completed,
                  cc: dailyProgress.completionsCount,
                  d: dailyProgress.date,
                },
                g: mappedGarden
              };
            }
            
            dataLoadedFromFirestore.current = true;
            setIsHydrated(true);
            setIsStateLoaded(true, "Auth state resolved with loaded Firestore data");
            hasMatchedHydratedStateRef.current = true;
            setNeedsOnboarding(false);
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
            
            // Fallback to local storage if offline/error so app continues functioning
            dataLoadedFromFirestore.current = true;
            setIsHydrated(true);
            setIsStateLoaded(true, "Auth load failed, fallback to local cache");
            hasMatchedHydratedStateRef.current = true;
            setNeedsOnboarding(false);
          } finally {
            setAuthLoading(false);
            setIsDataReady(true);
            setLoading(false);
          }
        };
        
        loadOrCreateUser();
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

        dataLoadedFromFirestore.current = false;
        setIsHydrated(false);
        setIsStateLoaded(false, "No user session");
        hasMatchedHydratedStateRef.current = false;
        setNeedsOnboarding(false);
        setAuthLoading(false);
        setIsDataReady(true);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);
  */
  // Safe State Matching Gate: ensure React state matches the loaded/hydrated Firestore data
  // before unlocking the sync gate. This prevents empty default states from overwriting database records.
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;
    if (hasMatchedHydratedStateRef.current) return;

    if (isHydrated && hydratedStateRef.current) {
      const currentObj = {
        s: settings,
        st: stats,
        g: gardenState,
      };

      const dbObj = {
        s: hydratedStateRef.current.s,
        st: hydratedStateRef.current.st,
        g: hydratedStateRef.current.g,
      };

      if (deepEqual(currentObj, dbObj)) {
        console.log(`[PERSISTENCE AUDIT] Memory state matches hydrated database state perfectly. Unlocking sync gate safely.`);
        hasMatchedHydratedStateRef.current = true;
        setIsStateLoaded(true, "State matching complete");
      } else {
        console.log(`[PERSISTENCE AUDIT] Memory state does not match hydrated database state yet. Keeping sync gate locked.`);
      }
    }
  }, [isHydrated, user, isDataReady, settings, stats, gardenState]);

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
              const dbStats = dbData.stats || {};
              const dbGarden = dbData.garden || {};
              const dbSettings = dbData.settings || dbData;

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
                if (dbData.stats) setStats(dbData.stats);
                if (dbData.settings || dbData.displayName) {
                  setSettings({
                    ...DEFAULT_SETTINGS,
                    ...dbData,
                    ...dbData.settings,
                  });
                }
                if (dbData.garden) setGardenState(dbData.garden);
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
              uid: user.uid,
              email: user.email || `${user.uid}@nexora.app`,
              role: 'user',
              stats: stats,
              garden: gardenState,
              isTodayCompleted: dailyProgress.completed,
              updatedAt: serverTimestamp(),
              onboardingCompleted: true,
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
              appIntroductionOnboardingCompleted: settings.isWalkthroughCompleted || false,
              plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
              updatedAt: serverTimestamp(),
            };

            const rewardsDocRef = doc(db, "users", user.uid, "rewards", "main");
            const plantSectionDocRef = doc(db, "users", user.uid, "plant_section", "main");
            const onboardingDocRef = doc(db, "onboardingID", user.uid);

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
          console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${progressRef.path}:`, preProgSnap.exists() ? JSON.stringify(preProgSnap.data()) : "Document does not exist");
          
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

        // CRITICAL DEFENSIVE GUARD: Never let uninitialized/empty stats overwrite positive Firestore stats
        if (dbData) {
          const dbStats = dbData.stats || {};
          const dbGarden = dbData.garden || {};
          const dbSettings = dbData.settings || dbData;

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
            if (dbData.stats) setStats(dbData.stats);
            if (dbData.settings || dbData.displayName) {
              setSettings({
                ...DEFAULT_SETTINGS,
                ...dbData,
                ...dbData.settings,
              });
            }
            if (dbData.garden) setGardenState(dbData.garden);
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
          uid: user.uid,
          email: user.email || `${user.uid}@nexora.app`,
          role: 'user',
          stats: stats,
          garden: gardenState,
          isTodayCompleted: dailyProgress.completed,
          updatedAt: serverTimestamp(),
          onboardingCompleted: true,
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
          appIntroductionOnboardingCompleted: settings.isWalkthroughCompleted || false,
          plantSectionOnboardingCompleted: settings.plantOnboardingCompleted || false,
          updatedAt: serverTimestamp(),
        };

        const rewardsDocRef = doc(db, "users", user.uid, "rewards", "main");
        const plantSectionDocRef = doc(db, "users", user.uid, "plant_section", "main");
        const onboardingDocRef = doc(db, "onboardingID", user.uid);

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
        console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${progressRef.path}:`, preProgSnap.exists() ? JSON.stringify(preProgSnap.data()) : "Document does not exist");

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
