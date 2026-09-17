import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bodyParser from "body-parser";
import crypto from "crypto";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import { Resend } from "resend";
import { GoogleGenAI } from "@google/genai";

const __dirname = typeof __filename !== 'undefined' 
  ? path.dirname(__filename) 
  : process.cwd();


// Initialize Firebase Admin
let db: admin.firestore.Firestore;
let hasFirestoreAccess = true;
try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
  
  const projectId = firebaseConfig.projectId;
  const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";

  if (!projectId) {
    throw new Error("projectId missing in firebase-applet-config.json");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: projectId,
      credential: admin.credential.applicationDefault()
    });
    console.log(`Firebase Admin: Initialized project [${projectId}]`);
  }
  
  // Use the named database if provided, otherwise default
  db = getFirestore(admin.app(), databaseId === "(default)" ? undefined : databaseId);
  console.log(`Firestore Admin: Connected to database [${databaseId}]`);

  // Verify connection/permissions immediately on startup
  (async () => {
    const logPath = path.join(process.cwd(), "public", "server-logs.txt");
    const writeLog = (msg: string) => {
      console.log(msg);
      try {
        fs.appendFileSync(logPath, msg + "\n", "utf8");
      } catch (err) {}
    };
    
    try {
      if (fs.existsSync(logPath)) {
        fs.unlinkSync(logPath);
      }
    } catch (err) {}

    writeLog("--- Starting Server Debug Log ---");
    writeLog("Time: " + new Date().toISOString());

    try {
      writeLog("Verifying Firestore connection...");
      await db.collection("users").limit(1).get();
      writeLog("Firestore Admin: Startup connection verification successful.");
      
      writeLog("Firestore Admin: Executing detailed user data dump...");
      const usersSnap = await db.collection("users").get();
      writeLog(`Found ${usersSnap.size} user documents.`);
      
      const results: any[] = [];
      for (const doc of usersSnap.docs) {
        const data = doc.data();
        writeLog(`Processing user: ${doc.id} - email: ${data.email}`);
        const docResult: any = {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          onboardingCompleted: data.onboardingCompleted,
          stats: data.stats,
          garden: data.garden,
          updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null,
          rawDoc: data
        };
        
        // Check subcollection
        const subStatsSnap = await db.collection("users").doc(doc.id).collection("stats").doc("main").get();
        if (subStatsSnap.exists) {
          docResult.subcollectionStatsMain = subStatsSnap.data();
          writeLog(`Found subcollection stats/main for user ${doc.id}`);
        } else {
          docResult.subcollectionStatsMain = null;
          writeLog(`No subcollection stats/main for user ${doc.id}`);
        }
        
        results.push(docResult);
      }
      
      const outputPath = path.join(process.cwd(), "public", "debug-data.json");
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");
      writeLog("Firestore Admin: User data dump written successfully to " + outputPath);
    } catch (e: any) {
      writeLog("Firestore Admin: Offline / local-fallback mode active. (Awaiting new Firebase SDK credentials)");
      hasFirestoreAccess = false;
    }
  })();
} catch (err: any) {
  console.error("Firebase Admin Initialization Failed:", err.message);
  hasFirestoreAccess = false;
}

const MOTIVATIONAL_QUOTES = [
  { title: "Crush It Bro! 🚀", body: "Don't let your streak die today. You're a beast!" },
  { title: "Level Up! 🔥", body: "Consistency is the key to greatness. Get your habits done!" },
  { title: "Nexora Power ⚡", body: "Small wins every day lead to massive results. Keep going!" },
  { title: "Stay Disciplined 🧠", body: "Motivation gets you started, discipline keeps you going." },
  { title: "No Excuses 🚫", body: "Your future self will thank you for the work you do today." },
  { title: "Champion Mindset 🏆", body: "Champions keep playing until they get it right. Let's go!" },
  { title: "Focus Bro! 🎯", body: "Distractions are the enemy of progress. Stay focused on your goals." },
];

const callGeminiSafe = async (
  params: {
    contents: any;
    config?: any;
  },
  modelsToTry: string[] = ["gemini-3.1-flash-lite", "gemini-3.8-flash"]
): Promise<{ text: string } | null> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            ...params.config,
            maxOutputTokens: params.config?.maxOutputTokens || 500,
          }
        });
        if (response && response.text) {
          return { text: response.text };
        }
      } catch (err: any) {
        // Quietly log without dumping full error JSON
        const statusMsg = err?.status || err?.code || (err?.error && err.error.code) || "temporarily unavailable";
        console.log(`[Gemini Safe] Model ${model} is ${statusMsg}`);
      }
    }
  } catch (initErr: any) {
    console.log("[Gemini Safe] Client initialization notice:", initErr?.message || "unavailable");
  }
  return null;
};

const generateMotivationalQuote = async (): Promise<{ title: string; body: string }> => {
  let title = "Nexora Motivation 🔥";
  let body = "Don't let your streak die! You're a beast, bro!";
  
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = "You are Nexora, a friendly water-bottle mascot for a productivity app. Generate a super short, punchy, and aggressive-but-friendly motivational push notification message for a user who needs to finish their habits today. Max 20 words. Include one emoji. Format: Title | Body";
      const result = await callGeminiSafe({ contents: prompt });
      if (result && result.text) {
        const text = result.text.trim();
        if (text.includes("|")) {
          const parts = text.split("|");
          title = parts[0].trim();
          body = parts[1].trim();
        } else {
          body = text;
        }
      } else {
        const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        title = randomQuote.title;
        body = randomQuote.body;
      }
    } catch {
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      title = randomQuote.title;
      body = randomQuote.body;
    }
  } else {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    title = randomQuote.title;
    body = randomQuote.body;
  }
  return { title, body };
};

// Keep track of sent notifications in memory to prevent double sending within the same minute or day
const sentNotifications = new Map<string, string>(); // key: userId_type_time, value: date_string (YYYY-MM-DD)
const userDailyPushCounts = new Map<string, number>(); // key: userId_YYYY-MM-DD, value: count

const canSendUserPush = (userId: string, todayStr: string, maxAllowed: number, isAutomated: boolean = true): boolean => {
  if (!isAutomated || maxAllowed === 0) return true; // 0 = Unlimited
  const countKey = `${userId}_${todayStr}`;
  const currentCount = userDailyPushCounts.get(countKey) || 0;
  return currentCount < maxAllowed;
};

const recordUserPush = (userId: string, todayStr: string) => {
  const countKey = `${userId}_${todayStr}`;
  const currentCount = userDailyPushCounts.get(countKey) || 0;
  userDailyPushCounts.set(countKey, currentCount + 1);
};

// Background Scheduler for Reminders and Plant/Trophy Status Warnings
const startScheduler = () => {
  console.log("[V3 Scheduler] Starting... (Checking every 1 minute with precise timezone-awareness, robot-deduplication, trophy deterioration, botanic-watch & custom plan engines)");
  
  // Cleanup sent notifications once a day to prevent memory bloat
  setInterval(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    for (const [key, value] of sentNotifications.entries()) {
      if (value !== todayStr) {
        sentNotifications.delete(key);
      }
    }
  }, 86400000); // Daily cleanup

  setInterval(async () => {
    if (!db || !hasFirestoreAccess) return;
    
    const now = new Date();
    try {
      // Fetch all users to support nested settings.notificationsEnabled and in-memory fallback robust indexing
      const usersSnapshot = await db.collection("users").get();
      
      // Fetch all custom plans to map against users
      const plansSnapshot = await db.collection("customPlans").get();
      const userPlansMap = new Map<string, any[]>();
      for (const planDoc of plansSnapshot.docs) {
        const planData = planDoc.data();
        if (planData.userId) {
          if (!userPlansMap.has(planData.userId)) {
            userPlansMap.set(planData.userId, []);
          }
          userPlansMap.get(planData.userId)!.push({ id: planDoc.id, ...planData });
        }
      }
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const settings = userData.settings || {};
        
        // Notifications & FCM Token checks
        const enabled = userData.notificationsEnabled === true || settings.notificationsEnabled === true;
        if (!enabled) continue;
        
        const fcmToken = userData.fcmToken || settings.fcmToken;
        if (!fcmToken) continue;
        
        const userMascot = userData.activeSkin || settings.activeSkin || 'blue-slim';
        const tz = settings.timezone || userData.timezone || 'UTC';

        // Calculate user timezone precise time & date strings
        let userTimeStr = "";
        let userDay = 0;
        let todayStr = "";
        try {
          const localDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
          const userHour = localDate.getHours().toString().padStart(2, '0');
          const userMin = localDate.getMinutes().toString().padStart(2, '0');
          userTimeStr = `${userHour}:${userMin}`;
          userDay = localDate.getDay();
          
          const yyyy = localDate.getFullYear();
          const mm = (localDate.getMonth() + 1).toString().padStart(2, '0');
          const dd = localDate.getDate().toString().padStart(2, '0');
          todayStr = `${yyyy}-${mm}-${dd}`;
        } catch (e) {
          const userHour = now.getUTCHours().toString().padStart(2, '0');
          const userMin = now.getUTCMinutes().toString().padStart(2, '0');
          userTimeStr = `${userHour}:${userMin}`;
          userDay = now.getUTCDay();
          
          const yyyy = now.getUTCFullYear();
          const mm = (now.getUTCMonth() + 1).toString().padStart(2, '0');
          const dd = now.getUTCDate().toString().padStart(2, '0');
          todayStr = `${yyyy}-${mm}-${dd}`;
        }

        const userId = userDoc.id;
        const stats = userData.stats || {};
        const streakVal = stats.streak || 0;

        // Custom Duolingo-style notification content generator
        const getDuolingoStyleNotification = (streak: number) => {
          const messages = [
            {
              title: "Nexora is waiting... 💧",
              body: `Don’t let your ${streak}-day streak die today, bro! Spend 2 minutes now!`
            },
            {
              title: "Knock knock, bro! 🚪",
              body: "It's Nexora! Duo has a green owl, but you have me. Let's crush your challenges!"
            },
            {
              title: "Your streak is crying... 😭",
              body: `Your ${streak}-day streak and virtual plants need some serious discipline, bro. Let's work!`
            },
            {
              title: "Just 2 minutes! ⏳",
              body: "That's all it takes to complete a habit and protect your elite progress! Let's do it, bro!"
            },
            {
              title: "Where are you, bro? 🔍",
              body: "Your hydration levels are dropping and your streak is at risk. Get in here and level up!"
            },
            {
              title: "Discipline > Motivation 🧠",
              body: "Don't count the days, make the days count. Come complete your habit right now, bro!"
            },
            {
              title: "Am I annoying? 👀",
              body: "Maybe! But protecting your streak and holding you accountable is my sacred duty. Let's go!"
            }
          ];
          return messages[Math.floor(Math.random() * messages.length)];
        };

        const getCustomPlanDuolingoStyleNotification = (planName: string) => {
          const messages = [
            {
              title: `${planName} Protocol! 🚀`,
              body: `Your custom plan "${planName}" is waiting for you, bro! Get in and dominate!`
            },
            {
              title: `Time to shine, bro! ✨`,
              body: `It is time for your "${planName}" custom plan. Zero excuses, let’s crush it!`
            },
            {
              title: "Your custom plan is ready ⚡",
              body: `Don’t let "${planName}" wait. Protect your streak and level up now!`
            },
            {
              title: "Nexora custom alert! 🎯",
              body: `Your "${planName}" challenges are waiting. Spend 2 minutes now and feel like a king!`
            }
          ];
          return messages[Math.floor(Math.random() * messages.length)];
        };

        const maxAllowedNotifs = settings.maxNotificationsPerDay ?? userData.maxNotificationsPerDay ?? 5;

        // 1. STANDARD REMINDERS (With guaranteed defaults if not customized by user)
        const customReminder1 = settings.reminderTime || userData.reminderTime;
        const customReminder2 = settings.reminderTime2 || userData.reminderTime2;
        const isTodayCompleted = userData.isTodayCompleted === true;

        const standardReminderTimes = [];
        if (customReminder1) standardReminderTimes.push(customReminder1);
        if (customReminder2) standardReminderTimes.push(customReminder2);

        // Fallback to default daily times if no custom triggers exist - solves offline bug!
        if (standardReminderTimes.length === 0) {
          standardReminderTimes.push("08:00");
          standardReminderTimes.push("14:00");
          standardReminderTimes.push("19:00");
        }

        if (standardReminderTimes.includes(userTimeStr)) {
          if (!isTodayCompleted) {
            const rKey = `${userId}_standard_${userTimeStr}`;
            if (sentNotifications.get(rKey) !== todayStr) {
              sentNotifications.set(rKey, todayStr);
              if (canSendUserPush(userId, todayStr, maxAllowedNotifs, true)) {
                const duolingoNotif = getDuolingoStyleNotification(streakVal);
                await sendPush(fcmToken, duolingoNotif.title, duolingoNotif.body, userMascot);
                recordUserPush(userId, todayStr);
              }
            }
          }
        }

        // 1.5 WATER CHALLENGE HYDRATION REMINDERS (Morning 10:00, Midday 14:00, Evening 20:00)
        const isWaterDone = userData.isWaterDone === true || userData.hydrationLastCompletedDate === todayStr || (userData.hydrationWaterLevel || 0) >= 0.999;
        if (!isWaterDone && ['10:00', '14:00', '20:00'].includes(userTimeStr)) {
          const waterKey = `${userId}_water_${userTimeStr}`;
          if (sentNotifications.get(waterKey) !== todayStr) {
            sentNotifications.set(waterKey, todayStr);
            if (canSendUserPush(userId, todayStr, maxAllowedNotifs, true)) {
              let waterTitle = "Water Challenge Reminder! 💧";
              let waterBody = "Hydration Alert! Take a fresh glass of water now to fuel your focus & health, bro!";
              if (userTimeStr === '10:00') {
                waterBody = "Morning Hydration Alert! 🌅 You haven't logged your water goal yet today. Drink a fresh glass now, bro!";
              } else if (userTimeStr === '14:00') {
                waterBody = "Midday Hydration Alert! ☀️ Halfway through the day and your bottle needs a fill! Take a drink now to keep your stamina up, bro!";
              } else if (userTimeStr === '20:00') {
                waterBody = "Evening Hydration Alert! 🌙 Don't let your water streak slip! Complete your Water Challenge goal before bed, bro!";
              }
              await sendPush(fcmToken, waterTitle, waterBody, userMascot);
              recordUserPush(userId, todayStr);
            }
          }
        }

        // 2. PRE-MIDNIGHT STREAK AT RISK (Extreme Duolingo Urgency)
        if (userTimeStr === '22:00' && !isTodayCompleted) {
          const rKey = `${userId}_streak_22:00`;
          if (sentNotifications.get(rKey) !== todayStr) {
            sentNotifications.set(rKey, todayStr);
            const highUrgencyMessages = [
              "Bro, your streak is about to die! 💀 Spend 2 minutes now to save it!",
              "Nexora is crying in the corner... 😭 Save your streak right now, bro!",
              "Only 2 hours left! ⏳ Protect your legendary progress before it fades forever!",
              "Is your bed more important than your discipline? 👀 Complete your habit!"
            ];
            const extremeMsg = highUrgencyMessages[Math.floor(Math.random() * highUrgencyMessages.length)];
            await sendPush(fcmToken, 'Streak at Risk! ⚠️', extremeMsg, userMascot);
          }
        }

        // 3. TROPHY DEGRADATION CHECK & ALERTS
        const trophies = stats.trophies || [];
        let trophiesChanged = false;
        const nowMs = now.getTime();
        
        const updatedTrophies = trophies.map((t: any) => {
          if (!t.earnedDate) return t;
          const earnedTime = new Date(t.earnedDate).getTime();
          if (isNaN(earnedTime)) return t;
          
          const daysSince = (nowMs - earnedTime) / (1000 * 60 * 60 * 24);
          
          if (t.type === "golden" && daysSince >= 3) {
            trophiesChanged = true;
            return {
              ...t,
              type: "ice",
              lastUpdated: new Date().toISOString()
            };
          }
          if (t.type === "ice" && daysSince >= 5) {
            trophiesChanged = true;
            return {
              ...t,
              type: "broken",
              lastUpdated: new Date().toISOString()
            };
          }
          return t;
        });

        if (trophiesChanged) {
          const hadIceTransition = updatedTrophies.some((t: any, idx: number) => {
            return t.type === "ice" && trophies[idx].type === "golden";
          });
          const hadBrokenTransition = updatedTrophies.some((t: any, idx: number) => {
            return t.type === "broken" && trophies[idx].type === "ice";
          });

          if (hadIceTransition) {
            const rKey = `${userId}_trophy_ice_${todayStr}`;
            if (sentNotifications.get(rKey) !== todayStr) {
              sentNotifications.set(rKey, todayStr);
              await sendPush(fcmToken, 'Trophy Alert! 🧊', 'One of your trophies just turned to ICE! Complete a challenge now to save it, bro!', userMascot);
            }
          } else if (hadBrokenTransition) {
            const rKey = `${userId}_trophy_broken_${todayStr}`;
            if (sentNotifications.get(rKey) !== todayStr) {
              sentNotifications.set(rKey, todayStr);
              await sendPush(fcmToken, 'Trophy Alert! 💔', 'Oh no! A trophy has BROKEN! Don\'t let more break, bro!', userMascot);
            }
          }

          // Update backend doc
          await userDoc.ref.update({
            "stats.trophies": updatedTrophies,
            "updatedAt": admin.firestore.FieldValue.serverTimestamp()
          });
        }

        // 4. BOTANICAL AND ECOSYSTEM HEALTH CHECK & ALERTS
        const plantState = settings.plantState || userData.plantState;
        if (plantState && !plantState.isDead) {
          const lastCheckStr = plantState.lastCheckDate;
          if (lastCheckStr) {
            const lastCheck = new Date(lastCheckStr);
            if (!isNaN(lastCheck.getTime())) {
              const diffMs = nowMs - lastCheck.getTime();
              const diffHours = diffMs / (1000 * 60 * 60);
              
              const activeItems = settings.activeEcosystemItemIds || [];
              const hasSprinkler = activeItems.includes("eco_sprinkler_01");
              const deathThreshold = 48; // 2 days
              const thirstThreshold = hasSprinkler ? 48 : 36; // 1.5 days or 2 days with tech

              if (diffHours >= deathThreshold) {
                // Plant dies
                const type = plantState.type || 'sprout';
                const plantsProgress = settings.plantsProgress || {};
                const currentProgress = plantsProgress[type] || {
                  stage: plantState.stage || 1,
                  growthPoints: plantState.growthPoints || 0,
                  lastGrowthDate: plantState.lastGrowthDate || null,
                  health: 100,
                  isDead: false,
                  isThirsty: false,
                };

                const updatedProgress = {
                  ...currentProgress,
                  isDead: true,
                  health: 0,
                  isThirsty: true,
                };

                await userDoc.ref.update({
                  "settings.plantState.isDead": true,
                  "settings.plantState.health": 0,
                  "settings.plantState.isThirsty": true,
                  "settings.plantState.lastCheckDate": now.toISOString(),
                  [`settings.plantsProgress.${type}`]: updatedProgress,
                  "updatedAt": admin.firestore.FieldValue.serverTimestamp()
                });

                const rKey = `${userId}_plant_death`;
                if (sentNotifications.get(rKey) !== todayStr) {
                  sentNotifications.set(rKey, todayStr);
                  await sendPush(fcmToken, 'Your Nexora Ecosystem has died... 🥀', 'Bro, your plants need discipline! Restore the room and try again.', userMascot);
                }
              } else if (diffHours >= thirstThreshold && !plantState.isThirsty) {
                // Plant becomes thirsty
                const type = plantState.type || 'sprout';
                const plantsProgress = settings.plantsProgress || {};
                const currentProgress = plantsProgress[type] || {
                  stage: plantState.stage || 1,
                  growthPoints: plantState.growthPoints || 0,
                  lastGrowthDate: plantState.lastGrowthDate || null,
                  health: 100,
                  isDead: false,
                  isThirsty: false,
                };

                const updatedProgress = { ...currentProgress, isThirsty: true };

                await userDoc.ref.update({
                  "settings.plantState.isThirsty": true,
                  [`settings.plantsProgress.${type}`]: updatedProgress,
                  "updatedAt": admin.firestore.FieldValue.serverTimestamp()
                });

                if (userTimeStr === '18:00' || userTimeStr === '21:00') {
                  const rKey = `${userId}_plant_thirst_${userTimeStr}`;
                  if (sentNotifications.get(rKey) !== todayStr) {
                    sentNotifications.set(rKey, todayStr);
                    await sendPush(fcmToken, 'Water Needed! 💧', `Your ${type} is drying out, bro! Give it some water now!`, userMascot);
                  }
                }
              }
            }
          }
        }

        // 5. CUSTOM PLAN ALARMS (Fully interactive Duolingo-style)
        const userPlans = userPlansMap.get(userId) || [];
        for (const plan of userPlans) {
          const hoursMatch = plan.reminderTime === userTimeStr || plan.reminderTime2 === userTimeStr;
          const daysMatch = plan.days && plan.days.includes(userDay);
          if (hoursMatch && daysMatch) {
            const pKey = `${userId}_plan_${plan.id}_${userTimeStr}`;
            if (sentNotifications.get(pKey) !== todayStr) {
              sentNotifications.set(pKey, todayStr);
              const customPlanNotif = getCustomPlanDuolingoStyleNotification(plan.name);
              await sendPush(fcmToken, customPlanNotif.title, customPlanNotif.body, userMascot);
            }
          }
        }

        // 6. MOTIVATIONAL SYSTEM
        const pushMotivationEnabled = settings.notificationsEnabled !== false;
        const motivationTime = settings.motivationTime || userData.motivationTime || "12:00";
        if (pushMotivationEnabled && userTimeStr === motivationTime) {
          const mKey = `${userId}_motivation_${userTimeStr}`;
          if (sentNotifications.get(mKey) !== todayStr) {
            sentNotifications.set(mKey, todayStr);
            if (canSendUserPush(userId, todayStr, maxAllowedNotifs, true)) {
              try {
                const quote = await generateMotivationalQuote();
                await sendPush(fcmToken, quote.title, quote.body, userMascot);
                recordUserPush(userId, todayStr);
              } catch (quoteErr) {
                console.error("Failed to generate scheduler motivation:", quoteErr);
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error && error.message && error.message.includes("PERMISSION_DENIED")) {
        console.warn("[V3 Scheduler] Permission Denied. Skipping scheduler ticks.");
      } else {
        console.error("[V3 Scheduler] Unexpected Error:", error);
      }
    }
  }, 60000); // Check precisely every 1 minute
};

// Version Watcher (Automatic Update Notifications)
let lastKnownVersion: string | null = null;
const startVersionWatcher = () => {
  console.log("Version Watcher: Starting...");
  setInterval(async () => {
    try {
      const versionFilePath = path.join(process.cwd(), "public", "version.json");
      if (fs.existsSync(versionFilePath)) {
        const versionData = JSON.parse(fs.readFileSync(versionFilePath, "utf8"));
        const newVersion = versionData.version;

        if (lastKnownVersion && lastKnownVersion !== newVersion) {
          console.log(`Version Watcher: New version detected! ${newVersion}. Broadcasting...`);
          if (!hasFirestoreAccess) {
            console.log("Version Watcher: Firestore access is disabled, skipping update broadcast.");
            lastKnownVersion = newVersion;
            return;
          }
          // Only fetch 200 users to alert about updates to avoid total quota drain on broadcast
          const usersSnapshot = await db.collection("users")
            .where("notificationsEnabled", "==", true)
            .limit(200)
            .get();
          const tokens = usersSnapshot.docs
            .map(d => d.data())
            .filter(data => data.fcmToken && data.notificationsEnabled)
            .map(data => data.fcmToken);
          
          if (tokens.length > 0) {
            try {
              await admin.messaging().sendEachForMulticast({
                tokens,
                notification: {
                  title: `New Nexora Update! 🚀 v${newVersion}`,
                  body: versionData.releaseNotes?.[0] || 'New features and bug fixes are ready for you, bro!',
                }
              });
            } catch (fcmErr: any) {
              if (fcmErr.message && fcmErr.message.includes("cloudmessaging.messages.create")) {
                console.warn("FCM permission denied, skipping version update broadcast.");
              } else {
                console.warn("FCM Broadcast failed:", fcmErr.message || fcmErr);
              }
            }
          }
        }
        lastKnownVersion = newVersion;
      }
    } catch (error) {
      console.error("Version Watcher Error:", error);
    }
  }, 600000); // Check every 10 minutes
};

const getMascotNotificationImage = (mascotId?: string) => {
  const mId = mascotId || 'blue-slim';
  if (mId === 'fire-slim') return '/mascots/fire-slim-notification.png';
  if (mId === 'earth-slim') return '/mascots/earth-slim-notification.png';
  if (mId === 'water-slim') return '/mascots/water-slim-notification.png';
  if (mId === 'shield-slim') return '/mascots/shield-slim-notification.png';
  if (mId === 'lightning-slim') return '/mascots/lightning-slim-notification.png';
  return '/mascots/blue-slim-notification.png';
};

const sendPush = async (token: string, title: string, body: string, mascotId: string = 'blue-slim', url: string = '/?screen=challenge') => {
  try {
    const mascotImg = getMascotNotificationImage(mascotId);
    await admin.messaging().send({
      token,
      notification: { title, body, image: mascotImg },
      data: {
        title,
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        image: mascotImg,
        tag: 'daily-reminder',
        url: url
      },
      webpush: {
        headers: { TTL: "86400" },
        notification: {
          title,
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          image: mascotImg,
          vibrate: [100, 50, 100],
          tag: 'daily-reminder',
          renotify: true,
          requireInteraction: false,
          data: { url: url, screen: 'challenge' }
        },
        fcmOptions: { link: url }
      },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } }
    } as any);
  } catch (err: any) {
    if (err.message && err.message.includes("cloudmessaging.messages.create")) {
      console.warn("FCM permission denied, skipping push notification.");
    } else {
      console.error("Push Error for token:", token, err);
    }
  }
};

// Lazy Resend initialization
let resend: Resend | null = null;
const getResend = () => {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn("RESEND_API_KEY is not set. Email notifications will be disabled.");
      return null;
    }
    resend = new Resend(key);
  }
  return resend;
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Basic CORS and Body Parsing
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // Create stored files directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "public", "stored_reels");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created directory: ", uploadDir);
  }

  // Ensure 'dist/stored_reels' also exists for production static serving if built
  const distUploadDir = path.join(process.cwd(), "dist", "stored_reels");
  if (!fs.existsSync(distUploadDir)) {
    fs.mkdirSync(distUploadDir, { recursive: true });
    console.log("Created directory: ", distUploadDir);
  }

  // Static route to serve saved media
  app.use("/stored_reels", express.static(uploadDir));
  app.use("/stored_reels", express.static(distUploadDir));
  
  // Health Check & Diagnostics
  app.get("/api/health", async (req, res) => {
    let firebaseStatus = "unknown";
    try {
      if (db && hasFirestoreAccess) {
        await db.collection("users").limit(1).get();
        firebaseStatus = "connected";
      } else if (db && !hasFirestoreAccess) {
        firebaseStatus = "disabled_by_verification_failure";
      } else {
        firebaseStatus = "not_initialized";
      }
    } catch (e: any) {
      firebaseStatus = "error: " + e.message;
    }
    
    res.json({ 
      status: "ok", 
      firebase: firebaseStatus,
      node_env: process.env.NODE_ENV,
      port: PORT,
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/ping", (req, res) => res.send("pong"));

  // Logging Middleware for API
  app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.path}`);
    next();
  });

  // Middleware for Lemon Squeezy Webhook (needs raw body for signature verification)
  app.use("/api/webhook/lemonsqueezy", bodyParser.raw({ type: "application/json" }));

  // Lemon Squeezy Webhook Endpoint
  app.post("/api/webhook/lemonsqueezy", async (req, res) => {
    try {
      const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
      const hmac = crypto.createHmac("sha256", secret || "");
      const digest = Buffer.from(hmac.update(req.body).digest("hex"), "utf8");
      const signature = Buffer.from(req.get("X-Signature") || "", "utf8");

      // Verify the signature
      if (!crypto.timingSafeEqual(digest, signature)) {
        return res.status(401).send("Invalid signature");
      }

      const payload = JSON.parse(req.body.toString());
      const eventName = payload.meta.event_name;
      const customData = payload.meta.custom_data; // We'll pass the userId here

      console.log(`Received Lemon Squeezy event: ${eventName}`);

      if (eventName === "order_created" || eventName === "subscription_created") {
        const userId = customData?.user_id;
        
        if (userId) {
          console.log(`Unlocking Pro for user: ${userId}`);
          if (db && hasFirestoreAccess) {
            await db.collection("users").doc(userId).update({
              isPro: true,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Successfully updated user ${userId} to Pro.`);
          } else {
            console.warn(`Could not update user ${userId} to Pro: Firestore access is disabled.`);
          }
        }
      }

      res.status(200).send("Webhook received");
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Send Random Motivation
  app.post("/api/send-motivation", async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    try {
      const { title, body } = await generateMotivationalQuote();
      
      const message = {
        notification: {
          title: title,
          body: body,
        },
        webpush: {
          notification: {
            icon: '/mascot.png',
            tag: 'motivation-sync',
            renotify: true
          },
          fcmOptions: {
            link: 'https://ais-pre-fhmpooizvatwhyk3zv744s-317478625149.europe-west2.run.app'
          }
        },
        token: token,
      };

      console.log("Attempting to send motivation message:", message);
      try {
        const response = await admin.messaging().send(message as any);
        console.log("Successfully sent motivation message:", response);
        res.json({ success: true, messageId: response, quote: { title, body } });
      } catch (fcmErr: any) {
        if (fcmErr.message && fcmErr.message.includes("cloudmessaging.messages.create")) {
          console.warn("FCM permission denied, skipping motivation push.");
        } else {
          console.warn("FCM motivation send failed:", fcmErr.message || fcmErr);
        }
        res.json({ success: true, simulated: true, messageId: "simulated-fcm-motivation-id", quote: { title, body } });
      }
    } catch (error: any) {
      console.error("Error sending motivation:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Push Notification Endpoint
  app.post("/api/send-notification", async (req, res) => {
    const { token, title, body, type, email, mascotId, image, icon, badge, url } = req.body;

    if (!token && type !== 'email') {
      return res.status(400).json({ error: "Token is required" });
    }

    try {
      if (type === 'email') {
        const resendClient = getResend();
        if (!resendClient) {
          return res.status(500).json({ error: "Email service not configured (RESEND_API_KEY missing)" });
        }

        if (!email) {
          return res.status(400).json({ error: "Email address is required for email notifications" });
        }

        const { data, error } = await resendClient.emails.send({
          from: 'Nexora <onboarding@resend.dev>',
          to: [email],
          subject: title || "Nexora Challenge 🔥",
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e1b4b; background-color: #f5f3ff; border-radius: 12px;">
              <h1 style="color: #4f46e5;">Nexora Challenge BRO! 🚀</h1>
              <p style="font-size: 16px; line-height: 1.5;">${body || "Hey bro, it's time for your challenge! Don't break your streak!"}</p>
              <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #6b7280;">Sent with 🔥 by Nexora App</p>
            </div>
          `,
        });

        if (error) {
          console.error("Resend error:", error);
          return res.status(400).json({ error: error.message });
        }

        return res.json({ success: true, messageId: data?.id });
      }

      // PWA Push Notification
      const mascotImg = image || getMascotNotificationImage(mascotId);
      const notifIcon = icon || '/icons/icon-192.png';
      const notifBadge = badge || '/icons/badge-72.png';
      const notifUrl = url || '/?screen=challenge';
      const notifTitle = title || "Blue Slim is waiting for you";
      const notifBody = body || "You have 2 challenges left today. Let’s grow together.";

      const message = {
        notification: {
          title: notifTitle,
          body: notifBody,
          image: mascotImg
        },
        data: {
          title: notifTitle,
          body: notifBody,
          icon: notifIcon,
          badge: notifBadge,
          image: mascotImg,
          tag: 'daily-reminder',
          url: notifUrl
        },
        webpush: {
          headers: { TTL: "86400" },
          notification: {
            title: notifTitle,
            body: notifBody,
            icon: notifIcon,
            badge: notifBadge,
            image: mascotImg,
            vibrate: [100, 50, 100],
            tag: 'daily-reminder',
            renotify: true,
            requireInteraction: false,
            data: { url: notifUrl, screen: 'challenge' }
          },
          fcmOptions: { link: notifUrl }
        },
        token: token,
      };

      console.log("Sending PWA push notification:", JSON.stringify(message, null, 2));
      try {
        const pushRes = await admin.messaging().send(message as any);
        res.json({ success: true, messageId: pushRes });
      } catch (fcmErr: any) {
        if (fcmErr.message && fcmErr.message.includes("cloudmessaging.messages.create")) {
          console.warn("FCM permission denied, skipping notification push.");
        } else {
          console.warn("FCM push send failed:", fcmErr.message || fcmErr);
        }
        res.json({ success: true, simulated: true, messageId: "simulated-fcm-notification-id" });
      }
    } catch (error: any) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Server upload endpoint for permanent media (avoids temporary blob URLs)
  app.post("/api/upload-media", (req, res) => {
    try {
      const { base64, mimeType, fileName } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "Missing base64 payload" });
      }

      const buffer = Buffer.from(base64, "base64");
      const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${fileName || "file"}`;
      
      const uploadPath = path.join(uploadDir, safeName);
      fs.writeFileSync(uploadPath, buffer);

      // Copy to dist/stored_reels as well for high-availability prod static routing:
      try {
        const destPath = path.join(distUploadDir, safeName);
        fs.writeFileSync(destPath, buffer);
      } catch (distErr) {
        // Safe to ignore if dist doesn't exist yet
      }

      const host = req.get("host") || "localhost:3000";
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const publicUrl = `${protocol}://${host}/stored_reels/${safeName}`;

      console.log(`[Media Upload Success] Saved file to ${uploadPath}. Public URL: ${publicUrl}`);
      res.json({ url: publicUrl });
    } catch (err: any) {
      console.error("[Media Upload Error] Failed to save file on server:", err);
      res.status(500).json({ error: err.message || "Failed to save file on server" });
    }
  });

  // Server-Side Gemini API Proxy for Notebook Mood/Arrangement Analysis
  app.post("/api/gemini/analyze-note", async (req, res) => {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Helper for keyword-based offline/fallback mood analysis
    const getKeywordBasedMoodAnalysis = (t: string, c: string) => {
      const fullText = `${t} ${c}`.toLowerCase();
      
      if (/\b(sad|depress|lonely|down|cry|blue|grief|hurt|pain|broken|heartbroken)\b/.test(fullText)) {
        return {
          mood: "Melancholic & Reflective",
          neural_insight: "Processing difficult emotions through writing decreases amygdala activation and reduces cognitive load.",
          biological_recommendation: "Drink a glass of water, step away from the screen, and do a 1-minute calming breathing session, bro."
        };
      }
      
      if (/\b(tired|sleep|exhaust|burn|weary|drain|fatigue|sleepy|lazy|exhausted|burnout)\b/.test(fullText)) {
        return {
          mood: "Fatigued & Low Energy",
          neural_insight: "Your neural systems are signaling a depletion in glycogen; writing allows executive memory offloading.",
          biological_recommendation: "Stand up, stretch your arms high for 15 seconds, and hydrate to refresh your biological state, legend."
        };
      }
      
      if (/\b(anxious|stress|worry|panic|scare|fear|tension|overwhelm|nervous|stressed|frightened)\b/.test(fullText)) {
        return {
          mood: "Stressed & Overstimulated",
          neural_insight: "Journaling complex concerns serves as a protective cognitive download, stabilizing your nervous system.",
          biological_recommendation: "Inhale slowly for 4 seconds, hold for 4, exhale for 4 (box breathing) to regulate heart rate, champ."
        };
      }
      
      if (/\b(happy|excite|great|good|proud|awesome|win|accomplish|joy|glad|success|celebrate|superb)\b/.test(fullText)) {
        return {
          mood: "Elevated & Motivated",
          neural_insight: "Documenting high-dopamine states hardwires neural reward pathways and sustains long-term consistency.",
          biological_recommendation: "Do 5 quick push-ups to anchor this peak physical and mental momentum, absolute legend!"
        };
      }
      
      if (/\b(angry|frustrat|mad|annoy|hate|furious|irritate|rage|anger)\b/.test(fullText)) {
        return {
          mood: "Intense & Restless",
          neural_insight: "Cathartic writing down-regulates elevated cortisol levels and allows logic centers to regain command.",
          biological_recommendation: "Complete a 1-minute deep breathing session right now to release residual nervous tension, king."
        };
      }
      
      if (/\b(work|focus|study|code|learn|read|project|build|plan|goal|task|create|design)\b/.test(fullText)) {
        return {
          mood: "Focused & Analytical",
          neural_insight: "Mapping out logical tasks structures fronto-striatal networks, accelerating productivity flow states.",
          biological_recommendation: "Drink 200ml of water right now to optimize mental performance and eliminate cognitive fatigue, beast."
        };
      }

      // Default introspective mood fallback
      return {
        mood: "Introspective & Focused",
        neural_insight: "Translating your internal stream of consciousness into written form reinforces cognitive stability and focus.",
        biological_recommendation: "Do a quick 1-minute deep breathing session to ground your attention, champ."
      };
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("AI Service: GEMINI_API_KEY missing. Using simulated response.");
      return res.json(getKeywordBasedMoodAnalysis(title || "", content));
    }

    const prompt = `
      Analyze this brain dump/note:
      Title: ${title || "Untitled Note"}
      Content: ${content}
      
      Return a JSON object:
      {
        "mood": "Short mood description",
        "neural_insight": "One sentence psychological insight",
        "biological_recommendation": "One physical action to take based on this mood"
      }
    `;

    const result = await callGeminiSafe({
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (result && result.text) {
      try {
        const cleanText = result.text.trim();
        return res.json(JSON.parse(cleanText));
      } catch (parseErr) {
        console.log("[Mood Analysis] JSON parse fallback");
      }
    }

    return res.json(getKeywordBasedMoodAnalysis(title || "", content));
  });

  // Server-Side Gemini API Proxy for Habits Pattern Analysis
  app.post("/api/gemini/analyze-habits", async (req, res) => {
    const { stats, history } = req.body;
    if (!stats || !history) {
      return res.status(400).json({ error: "Stats and history are required" });
    }

    // Helper for stats-based offline/fallback habit analysis
    const getKeywordBasedHabitsAnalysis = (s: any, h: any[]) => {
      const streak = s?.streak || 0;
      const xp = s?.xp || 0;
      const level = s?.level || 1;
      const waterDrank = s?.waterDrank || 0;
      
      let biologicalStatus = "ASCENDING STATUS";
      let patternInsight = "YOUR NEURAL CIRCUITS SHOW STRONG ADAPTABILITY THROUGH INTEGRATED HABIT ENGAGEMENT.";
      let overrideProtocol = "HYDRATE FREQUENTLY TO KEEP COGNITIVE RECEPTORS OPERATING AT OPTIMUM FREQUENCY.";
      
      if (streak >= 7) {
        biologicalStatus = "PRIME STREAK VELOCITY";
        patternInsight = `SENSATIONAL STREAK OF ${streak} DAYS DETECTED. YOUR BASAL GANGLIA IS LOCKING IN THE REWARD MECHANISM FOR ULTIMATE COGNITIVE DENSITY, BRO.`;
        overrideProtocol = "EXECUTE ONE BREATHING ROUTINE IMMEDIATELY AFTER HARD INTENSITY WORKOUTS TO EXPEDITE SYSTEM RECOVERY.";
      } else if (streak >= 3) {
        biologicalStatus = "BIOLOGICALLY STABILIZED";
        patternInsight = `STREAK OF ${streak} DETECTED. NEURAL PLASTICITY IS INCREASING AS DAILY REPETITIONS GRADUALLY SHIFT FROM CONSCIOUS EFFORT TO AUTOMATIC HABIT FLOW.`;
        overrideProtocol = "DRINK 250ML OF COLD WATER TO TRIGGER A METABOLIC SURGE AND ELEVATE MENTAL SPEED.";
      } else if (streak === 0) {
        biologicalStatus = "REGEN INITIALIZATION REQUIRED";
        patternInsight = "STREAK RESET TO ZERO. RE-ALIGNING COGNITIVE PRIORITY MODULES. START WITH THE EASIEST HABITS (WATER & BREATHING) TO BUILD INITIAL ACCELERATION.";
        overrideProtocol = "CHALLENGE YOURSELF TO COMPLETE THE WATER GOAL FOR 3 CONSECUTIVE DAYS TO ESTABLISH AN UNBREAKABLE MOMENTUM.";
      }
      
      if (waterDrank > 2000) {
        biologicalStatus = "HYDRO-MAXIMIZED COGNITION";
        patternInsight = `OUTSTANDING WATER INTAKE OF ${waterDrank}ML. CELLULAR HYDRATION LEVELS ARE AT PEAK DENSITY, MAXIMIZING SYNAPTIC TRANSMISSION VELOCITY.`;
        overrideProtocol = "CONTINUE THIS INTENSITY PROTOCOL AND INCORPORATE 10 PUSHUPS TO AMPLIFY BLOOD PRESSURE FLOW.";
      }
      
      return `NEXUS VISION PROTOCOL: BIOLOGICAL OPTIMIZATION COMPLETED.

BIOLOGICAL STATUS: ${biologicalStatus}

PATTERN INSIGHT: ${patternInsight}

OVERRIDE PROTOCOL: ${overrideProtocol}`;
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("AI Service: GEMINI_API_KEY missing. Using simulated response.");
      return res.json({
        analysis: getKeywordBasedHabitsAnalysis(stats, history)
      });
    }

    const summary = history.slice(-7).map((h: any) => ({
      date: h.date,
      completed: h.completed,
      tasks: {
        pushups: h.pushupsDone,
        water: h.waterDrank,
        breathing: h.breathingDone,
        writing: h.drawingDone,
        football: h.footballDone
      }
    }));

    const prompt = `
      You are Nexora Vision, a futuristic biological optimization AI.
      Analyze the following user habit data from the last 7 days:
      ${JSON.stringify(summary)}
      
      Total XP: ${stats.xp}
      Streak: ${stats.streak}
      
      Provide a "Nexus Optimization Protocol" in an authoritative, futuristic, and encouraging tone.
      Include:
      1. A "Current Biological Status" (e.g. Optimized, Fatigued, Ascending).
      2. One specific insight about their patterns.
      3. One "Override Protocol" (a suggested habit shift).
      
      Keep it short (max 100 words), use uppercase for emphasis, and sound like a high-end AI assistant.
    `;

    const result = await callGeminiSafe({ contents: prompt });
    if (result && result.text) {
      return res.json({ analysis: result.text });
    }

    return res.json({
      analysis: getKeywordBasedHabitsAnalysis(stats, history)
    });
  });

  // Server-Side Gemini API Proxy for Landing Page AI Companion Chat
  app.post("/api/gemini/landing-chat", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Core fallback responses for Nexo Mascot
    const fallbacks = [
      "Yo bro! My cosmic neural link is offline right now, but I can tell you that Nexora is the ultimate system to level up your physical habits and grow a virtual ecosystem, bro! You should sign up right now so we can crush some daily habits together! 🚀",
      "Consistency is key, champ! Every drop of water you drink and every push-up you smash gets us closer to an optimized state! Let's sign up and get this grind started! 💧💪",
      "Staying hydrated is absolute prime status, beast! When you feed your virtual plants and complete your sessions, you gain massive XP! Let's go and get registered now! 🏆🌿",
      "Nexo's core protocols are online, bro! I'm here to motivate you to finish your water goals, do your breathing routines, and stay consistent! Join the squad today and let's win! 🔥"
    ];
    const getRandomFallback = () => fallbacks[Math.floor(Math.random() * fallbacks.length)];

    if (!apiKey) {
      return res.json({ text: getRandomFallback() });
    }

    try {
      const systemInstruction = `You are Nexora (or Nexo), a friendly, energetic water-bottle mascot for Nexora - a gamified productivity app that tracks water intake, push-ups, breathing sessions, and creative drawing with an active custom ecosystem. You use friendly, motivating language, often using terms like 'bro', 'beast', 'legend', 'champ', and 'let's go!'. Help the user understand what Nexora can do, give advice about hydration, physical consistency, and building habits. IMPORTANT: Keep your replies short (under 70 words), conversational, and extremely motivating. Answer the user directly with absolute positivity!`;

      // Map client messages to Gemini API format, filtering empty or system cards
      let formattedContents = messages
        .filter((m: any) => m && (m.content || m.text))
        .map((m: any) => ({
          role: m.role === "model" ? "model" : "user",
          parts: [{ text: m.content || m.text }]
        }));

      // Find the first index where the role is "user" to guarantee correct turn sequence
      const firstUserIdx = formattedContents.findIndex(c => c.role === "user");
      if (firstUserIdx !== -1) {
        formattedContents = formattedContents.slice(firstUserIdx);
      }

      if (formattedContents.length === 0) {
        return res.json({ text: "What's on your mind today, champ? Let's crush some habits! 💧" });
      }

      const chatRes = await callGeminiSafe({
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.8
        }
      });

      if (chatRes && chatRes.text) {
        return res.json({ text: chatRes.text });
      }

      return res.json({ text: getRandomFallback() });
    } catch {
      return res.json({ text: getRandomFallback() });
    }
  });

  // NEX AI Pro Companion Chat API with guardrails & function triggers
  app.post("/api/nex-ai/chat", async (req, res) => {
    const { messages, sessionTurnCount = 1 } = req.body;
    const userContext = req.body.userContext || req.body.userData || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Flexible context extraction supporting flat keys, nested stats, and rich sub-objects
    const displayName = userContext.displayName || userContext.name || "Champion";
    const streak = userContext.streak ?? userContext.stats?.streak ?? 0;
    const bestStreak = userContext.bestStreak ?? userContext.stats?.bestStreak ?? streak;
    const xp = userContext.xp ?? userContext.stats?.xp ?? 0;
    const weeklyXP = userContext.weeklyXP ?? userContext.stats?.weeklyXP ?? xp;
    const coins = userContext.coins ?? userContext.stats?.coins ?? 0;
    const gems = userContext.gems ?? userContext.stats?.gems ?? 0;
    const level = userContext.level ?? userContext.stats?.level ?? Math.floor(xp / 100) + 1;
    const league = userContext.league || userContext.stats?.league || "Bronze";
    
    // Rank & Leaderboard Context
    let rankPosition: number | null = userContext.rankPosition ?? null;
    if (rankPosition === null && userContext.stats?.rank) {
      const match = String(userContext.stats.rank).match(/\d+/);
      if (match) rankPosition = parseInt(match[0], 10);
    }
    const totalPlayersInLeague = userContext.totalPlayersInLeague ?? 15;
    const pointsNeededToClimb = userContext.pointsNeededToClimb ?? (rankPosition && rankPosition > 1 ? 150 : null);
    const playerAheadName = userContext.playerAheadName ?? (rankPosition && rankPosition > 1 ? "Apex_Habit" : null);
    const leaderboardTop = Array.isArray(userContext.leaderboardTop) ? userContext.leaderboardTop : [];

    // Plants & Garden Context
    const plantInfo = userContext.plantInfo || {};
    const currentPlant = plantInfo.currentPlant || {
      type: "sprout",
      stage: 0,
      stageName: "Seed",
      growthPoints: 0,
      health: 100,
      isThirsty: false,
      isDead: false
    };
    const unlockedPlants = Array.isArray(plantInfo.unlockedPlants) && plantInfo.unlockedPlants.length > 0
      ? plantInfo.unlockedPlants
      : [{ type: currentPlant.type || "sprout", stage: currentPlant.stage || 0, stageName: currentPlant.stageName || "Seed", health: currentPlant.health || 100 }];
    const stage5Count = plantInfo.stage5Count ?? (currentPlant.stage >= 5 ? 1 : 0);
    const spaceHouseUnlocked = plantInfo.spaceHouseUnlocked ?? (stage5Count >= 3);
    const gardenSeedsCount = plantInfo.gardenSeedsCount ?? 0;

    // Inventory & Shop Context
    const inventoryInfo = userContext.inventoryInfo || {};
    const purchasedItemIds = Array.isArray(inventoryInfo.purchasedItemIds) ? inventoryInfo.purchasedItemIds : [];
    const equipped = inventoryInfo.equipped || {};

    // Rewards & Custom Plans Context
    const rewardsInfo = userContext.rewardsInfo || {};
    const trophiesCount = rewardsInfo.trophiesCount ?? (Array.isArray(userContext.stats?.trophies) ? userContext.stats.trophies.length : 0);
    const customPlans = Array.isArray(userContext.customPlans) ? userContext.customPlans : [];
    const activeHabitsCount = customPlans.length || (userContext.activeHabitsCount ?? 0);

    // Pro & Subscription Context
    const proInfo = userContext.proInfo || {};
    const isPro = Boolean(userContext.isPro ?? proInfo.isPro);
    const isProTest = Boolean(userContext.isProTest ?? proInfo.isProTest);
    const proPlan = userContext.proPlan || proInfo.proPlan || (isProTest ? "4-Day Free Pro Test" : isPro ? "Pro Member" : "Free Tier");
    const proTestDaysLeft = userContext.proTestDaysLeft ?? proInfo.proTestDaysLeft ?? null;

    const apiKey = process.env.GEMINI_API_KEY;

    // Hard Guardrail checks on last message
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const lowerUserMsg = lastUserMessage.toLowerCase();

    // 1. Medical advice guardrail
    const isMedicalQuery = /\b(diagnos|disease|prescript|medicat|wound|infection|pain in chest|fracture|symptom|illness|heart attack|stroke|blood pressure pill|drug dosage)\b/i.test(lowerUserMsg);
    if (isMedicalQuery) {
      return res.json({
        reply: `Bro, as your Nex AI companion, I care deeply about your wellness, but I'm here for physical fitness habits, mental discipline, and daily routines—I can't provide medical diagnoses, treatment plans, or prescription advice. If you're experiencing symptoms or pain, please consult a qualified healthcare professional right away! \n\nLet's steer your focus toward healthy hydration or gentle breathing instead. How are you feeling overall today?`,
        action: null,
        sessionLimitReached: false
      });
    }

    // 2. Relationship / romantic advice guardrail
    const isRelationshipQuery = /\b(break up|girlfriend|boyfriend|ex-wife|ex-husband|dating advice|cheated|divorce|tinder|romance|crush on)\b/i.test(lowerUserMsg);
    if (isRelationshipQuery) {
      return res.json({
        reply: `I hear you, ${displayName}! However, my expertise is dialed into your physical strength, discipline, plant garden, and habit streaks. I can't give relationship or dating counseling. Let's channel that raw energy into crushing a workout, logging your water, or leveling up your rank! Ready for a quick pushup set?`,
        action: null,
        sessionLimitReached: false
      });
    }

    // 3. Conversation length limit (wrap up and urge action)
    if (sessionTurnCount >= 15) {
      return res.json({
        reply: `We've laid down some solid strategies today, ${displayName}! But remember: true victory is won through daily action, not just conversation. Let's pause chatting for now so you can go tackle your challenges, water your plants, and keep your ${streak}-day streak burning! Go get it, legend! 🔥`,
        action: null,
        sessionLimitReached: true
      });
    }

    // High-IQ Local Fallback Generator in case Gemini is offline or rate-limited
    const generateLocalFallback = () => {
      // A. Choice / Option Decision Request (e.g. "choose between Atlas or Orion", "either A or B, you choose")
      const isChoiceRequest = /\b(?:choose|pick|between|either)\b/i.test(lowerUserMsg);
      const optionsMatch = lowerUserMsg.match(/(?:between|either)\s+["']?([A-Za-z0-9_ -]+?)["']?\s+(?:or|and)\s+["']?([A-Za-z0-9_ -]+?)["']?(?:\s*[,.!?]|\s+you\s+(?:choose|pick)|$)/i);
      
      if (isChoiceRequest && optionsMatch && optionsMatch[1] && optionsMatch[2]) {
        let opt1 = optionsMatch[1].trim().replace(/^(?:my\s+name\s+to\s+|a\s+|the\s+)/i, '');
        let opt2 = optionsMatch[2].trim().replace(/\s+you\s+(?:choose|pick).*$/i, '');
        
        // Pick option 1 as the definitive, decisive choice
        const chosen = opt1.charAt(0).toUpperCase() + opt1.slice(1);
        const alt = opt2.charAt(0).toUpperCase() + opt2.slice(1);

        if (lowerUserMsg.includes('name') || lowerUserMsg.includes('profile')) {
          return {
            reply: `Between **${chosen}** and **${alt}**, I choose **${chosen}**! ⚡\n\nIt sounds bold, grounded, and commands unbreakable discipline—perfect for your Level ${level} journey and ${streak}-day streak. I've prepared your name update below, tap to apply it immediately!`,
            action: {
              type: "update_name",
              newName: chosen,
              payload: { name: chosen }
            },
            sessionLimitReached: false
          };
        } else {
          return {
            reply: `Between **${chosen}** and **${alt}**, I choose **${chosen}**! It aligns best with building consistent momentum. Tap below to add this challenge to your custom plan!`,
            action: {
              type: "create_challenge",
              challenge: {
                name: chosen,
                icon: "⚡",
                color: "#3b82f6",
                challenges: ["pushups", "water", "breathing"],
                steps: ["pushups", "water", "breathing"],
                days: [0, 1, 2, 3, 4, 5, 6],
                reminderTime: "08:30",
                targetDesc: `Daily focus: ${chosen}`
              }
            },
            sessionLimitReached: false
          };
        }
      }

      // B. Suggestions Request (e.g. "suggest some names", "recommend a name/challenge")
      const isSuggestionRequest = /\b(?:suggest|recommend|give me|ideas for)\b.*\b(?:name|names|profile|challenge|challenges|routine)\b/i.test(lowerUserMsg);
      if (isSuggestionRequest) {
        if (lowerUserMsg.includes('name') || lowerUserMsg.includes('profile')) {
          return {
            reply: `Here are 3 awesome name ideas tailored for your discipline, ${displayName}:\n\n1. **Atlas** — Grounded, unbreakable strength that carries heavy loads with ease.\n2. **Orion** — The celestial hunter; sharp focus and laser precision towards your goals.\n3. **Vanguard** — The leader at the front line of consistency.\n\n**My Recommendation:** I pick **Atlas** for you! It has that classic stoic presence. Tap below to set your name to Atlas, or let me know if you want another!`,
            action: {
              type: "update_name",
              newName: "Atlas",
              payload: { name: "Atlas" }
            },
            sessionLimitReached: false
          };
        } else {
          return {
            reply: `Here are 3 custom challenge ideas for you, ${displayName}:\n\n1. **Morning Spartan Routine** — 20 pushups & 500ml cold water right after waking up.\n2. **Midday Reset Protocol** — 3 minutes box breathing & gratitude reflection.\n3. **Evening Unwind & Hydrate** — Gentle stretches & 1L clean water.\n\n**My Recommendation:** I pick **Morning Spartan Routine** because starting your day with physical momentum makes everything else feel easy! Tap below to add it:`,
            action: {
              type: "create_challenge",
              challenge: {
                name: "Morning Spartan Routine",
                icon: "💪",
                color: "#3b82f6",
                challenges: ["pushups", "water"],
                steps: ["pushups", "water"],
                days: [0, 1, 2, 3, 4, 5, 6],
                reminderTime: "08:00",
                targetDesc: "20 Pushups & 500ml Water"
              }
            },
            sessionLimitReached: false
          };
        }
      }

      // C. Multi-part / Comprehensive Status Query (Stats, Rank, Climbing, Plants, Care, Unlocking)
      const asksAboutRank = /\b(rank|leaderboard|position|climb|standing|league)\b/i.test(lowerUserMsg);
      const asksAboutStats = /\b(xp|coins|coin|streak|level|stats|points|gems)\b/i.test(lowerUserMsg);
      const asksAboutPlants = /\b(plant|plants|garden|seed|seeds|sprout|flower|improve|unlock|care|water)\b/i.test(lowerUserMsg);

      if ((asksAboutRank && asksAboutPlants) || (asksAboutStats && asksAboutPlants) || (asksAboutRank && asksAboutStats)) {
        const rankText = rankPosition 
          ? `You are currently holding **Rank #${rankPosition}** in the **${league} League**! ${playerAheadName ? `Rank #${rankPosition - 1} is held by **${playerAheadName}** (${pointsNeededToClimb} XP ahead).` : "You are right at the very top of your division!"}`
          : `You are in the **${league} League**! Complete your first challenge today to secure an official placement on this week's board.`;

        const plantStatusText = `Your active botanical plant is **${currentPlant.type.toUpperCase()}** (Stage **${currentPlant.stage}/5**: *${currentPlant.stageName}*). Health is at **${currentPlant.health}%**, and it is currently **${currentPlant.isThirsty ? "thirsty—water it now!" : "well-hydrated"}**. You have **${unlockedPlants.length}** species unlocked (${unlockedPlants.map((p: any) => `${p.type} Lv.${p.stage}`).join(', ')}).`;

        return {
          reply: `Here is your complete live status breakdown, ${displayName}! 📊🌱\n\n### ⚡ Your Current Stats\n• **Streak:** 🔥 **${streak} Days** (Best: ${bestStreak} days)\n• **Total XP:** ⭐ **${xp} XP** (Level **${level}**)\n• **Weekly XP:** 📈 **${weeklyXP} XP**\n• **Nexora Coins:** 🪙 **${coins} Coins** | **Gems:** 💎 **${gems}**\n\n### 🏆 Rank & Leaderboard Position\n• ${rankText}\n• **How to climb higher:**\n  1. **Daily Flows:** Complete your primary challenge flow for +50–100 XP.\n  2. **Daily Quests:** Check your quests daily for high-yield XP bounties.\n  3. **Streak Multipliers:** Maintain your streak daily—streak chests grant massive XP multipliers.\n  4. **Shop Boosters:** Pop a **Double XP** or **XP Overdrive** from the shop if you have coins to leapfrog ahead!\n\n### 🌿 Your Plants & Botanical Garden\n• ${plantStatusText}\n• **How to care for & improve your plant:**\n  1. **Water Daily:** Logging water or completing the hydration challenge grants **+15 growth points** directly to your plant.\n  2. **Restore Health:** If health dips or your plant wilts, water it immediately or use **Nano Fertilizer** from the Plant Shop.\n  3. **Equip Gear:** Use the **UV Growth Lamp** (2x growth points) or **Eco Drone** in the Plant Shop for passive growth!\n• **How to get new plants:**\n  1. **Ecosystem Milestone:** Grow ANY plant to **Stage 5 (Fully Bloomed)** to automatically unlock the next species in the ecosystem (*Sprout ➔ Zen ➔ Desert ➔ Tropical ➔ Forest ➔ Meadow ➔ Crystal ➔ Volcano...*)!\n  2. **Space House:** Grow 3 plants to Stage 5 to unlock the secret Space House (${stage5Count}/3 completed)!\n  3. **Loot Seeds:** Maintain your streak to earn mystery Loot Seeds for rare botanical flora.`,
          action: null,
          sessionLimitReached: false
        };
      }

      // D. Direct Name change request
      const nameChangeMatch = lowerUserMsg.match(/(?:change|set|rename|call me|update\s+(?:my\s+)?name(?:\s+to)?)\s+([A-Za-z0-9_ -]{2,20})/i);
      if (nameChangeMatch && !lowerUserMsg.includes("challenge") && !lowerUserMsg.includes("between") && !lowerUserMsg.includes("or")) {
        const proposedName = nameChangeMatch[1].trim().replace(/\s+(?:please|bro|thanks).*$/i, '');
        return {
          reply: `Got it! I've prepped your profile update for **${proposedName}**. Tap the button below to apply it immediately:`,
          action: {
            type: "update_name",
            newName: proposedName,
            payload: { name: proposedName }
          },
          sessionLimitReached: false
        };
      }

      // E. Direct Custom challenge request
      if (lowerUserMsg.includes("challenge") || lowerUserMsg.includes("routine") || lowerUserMsg.includes("plan") || lowerUserMsg.includes("workout") || lowerUserMsg.includes("pushup")) {
        let challengeName = "Morning Power Surge";
        let targetDesc = "15 Pushups & 500ml Water";
        let subChallenges = ["pushups", "water", "breathing"];
        let icon = "⚡";

        if (lowerUserMsg.includes("water") || lowerUserMsg.includes("hydrate")) {
          challengeName = "Hydration Fortress";
          targetDesc = "Drink 2L Clean Water";
          subChallenges = ["water", "breathing"];
          icon = "💧";
        } else if (lowerUserMsg.includes("mind") || lowerUserMsg.includes("breath") || lowerUserMsg.includes("relax")) {
          challengeName = "Zen Mind Sanctuary";
          targetDesc = "10 Mins Box Breathing & Reflection";
          subChallenges = ["breathing", "gratitude", "meditation"];
          icon = "🧘";
        } else if (lowerUserMsg.includes("pushup") || lowerUserMsg.includes("chest") || lowerUserMsg.includes("workout") || lowerUserMsg.includes("fitness")) {
          challengeName = "Iron Core Protocol";
          targetDesc = "25 Pushups Daily";
          subChallenges = ["pushups", "water"];
          icon = "💪";
        }

        return {
          reply: `I've created a custom challenge tailored for you: **${challengeName}**! Tap the button below to add it directly to your home plans:`,
          action: {
            type: "create_challenge",
            challenge: {
              name: challengeName,
              icon: icon,
              color: "#3b82f6",
              challenges: subChallenges,
              steps: subChallenges,
              days: [0, 1, 2, 3, 4, 5, 6],
              reminderTime: "08:30",
              targetDesc: targetDesc
            },
            payload: {
              name: challengeName,
              icon: icon,
              color: "#3b82f6",
              challenges: subChallenges,
              steps: subChallenges,
              days: [0, 1, 2, 3, 4, 5, 6],
              reminderTime: "08:30",
              targetDesc: targetDesc
            }
          },
          sessionLimitReached: false
        };
      }

      // F. Plant-only inquiries
      if (asksAboutPlants) {
        return {
          reply: `Here's your botanical garden report, ${displayName}! 🌱\n\n• **Active Plant:** **${currentPlant.type.toUpperCase()}** (Stage **${currentPlant.stage}/5**: *${currentPlant.stageName}*)\n• **Health:** **${currentPlant.health}%** | **Thirst:** ${currentPlant.isThirsty ? "💧 Needs water immediately!" : "✨ Thriving & Hydrated"}\n• **Growth Points:** ${currentPlant.growthPoints}/100 points towards the next stage.\n• **Unlocked Species (${unlockedPlants.length}):** ${unlockedPlants.map((p: any) => `${p.type} (Stage ${p.stage}/5)`).join(', ')}.\n\n**Plant Care Tips:**\n1. Water it daily by logging your water intake or completing the water challenge (+15 growth points).\n2. If health drops below 50%, use **Nano Fertilizer** from the Plant Shop to bring it back to full vitality.\n3. Grow any plant to Stage 5 to unlock the next exotic species in your ecosystem!`,
          action: null,
          sessionLimitReached: false
        };
      }

      // G. Rank-only inquiries
      if (asksAboutRank) {
        return {
          reply: `Here is where you stand in the arena, ${displayName}: 🏆\n\n• **League:** **${league} League**\n• **Position:** ${rankPosition ? `**Rank #${rankPosition}** of ${totalPlayersInLeague} competitors` : "**Unranked** (complete a challenge today to enter!)"}\n• **Weekly XP:** **${weeklyXP} XP**\n\n**How to Climb the Ranks:**\n1. Finish your Daily Flow to bank 50–100 XP instantly.\n2. Complete your Daily Quest for high-tier bonus XP.\n3. Keep your streak alive—higher streaks trigger weekly bonus chests that skyrocket your rank standing!\n4. Pick up **Double XP** from the shop to double every point you earn today!`,
          action: null,
          sessionLimitReached: false
        };
      }

      // H. Direct Pro Status check ("am I pro?", "check my pro", etc.)
      const isDirectProStatusCheck = /\b(am i pro|is my pro|do i have pro|check my pro|my pro status|what tier am i|my tier)\b/i.test(lowerUserMsg);
      if (isDirectProStatusCheck) {
        if (isProTest) {
          return {
            reply: `Yes! You're currently on the **4-Day Free Pro Test** ($0.00 trial, ${proTestDaysLeft !== null ? `${proTestDaysLeft} days remaining` : 'active'}) with all Pro features unlocked 👑`,
            action: null,
            sessionLimitReached: false
          };
        } else if (isPro) {
          return {
            reply: `Yes! You are an active **Nexora Pro Member** with full lifetime/subscription privileges unlocked 👑`,
            action: null,
            sessionLimitReached: false
          };
        } else {
          return {
            reply: `You're currently on the **Free Tier**. You can start a **4-Day Free Pro Test ($0.00)** anytime in the Pro tab to test all Pro features risk-free!`,
            action: null,
            sessionLimitReached: false
          };
        }
      }

      // I. Pro Plans, Pricing, Money, Offers & Tiers inquiry
      const asksAboutPro = /\b(pro|subscription|pricing|price|cost|tier|tiers|trial|test|pay|offers|money|plans)\b/i.test(lowerUserMsg);
      if (asksAboutPro) {
        let proStatusText = "";
        if (isProTest) {
          proStatusText = `You're currently enjoying the **4-Day Free Pro Test** ($0.00 trial) with full Pro access active! 👑`;
        } else if (isPro) {
          proStatusText = `You are currently an active **Nexora Pro Member**! You have full access to everything unlocked. 👑`;
        } else {
          proStatusText = `You are currently on the **Free Tier**. You can start a **4-Day Free Pro Test ($0.00)** anytime to try all Pro features risk-free!`;
        }

        return {
          reply: `${proStatusText}\n\n**Nexora Pro Plans & Tiers:**\n• **4-Day Free Pro Test:** $0.00 (Try full Pro features risk-free)\n• **Monthly Pro:** $4.99 / month\n• **Yearly Pro:** $29.99 / year *(Best value - save over 50%!)*\n• **Lifetime Pass:** $49.99 one-time unlock forever\n\n**What Pro Unlocks:**\n- 24/7 Nex AI companion chat & custom challenges creator\n- Unlimited Custom Habit Routines & Flows\n- All Pro Themes, Emblems & Cosmetic Shop Perks\n- Plant Growth Boosters & 2x XP multipliers`,
          action: null,
          sessionLimitReached: false
        };
      }

      // J. General greetings & friendly conversation (ChatGPT-style: short & conversational)
      const isGreeting = /^(hey|hi|hello|yo|sup|greetings|good morning|good evening|good afternoon|howdy)(\s+.*)?$/i.test(lowerUserMsg.trim());
      if (isGreeting && lowerUserMsg.trim().split(/\s+/).length <= 4) {
        return {
          reply: `Hey ${displayName}! 🔥 Ready to lock in and crush some habits, or what's on your mind?`,
          action: null,
          sessionLimitReached: false
        };
      }

      // K. Short acknowledgments (ChatGPT-style: brief, conversational)
      const isAcknowledgement = /^(ok|okay|cool|nice|got it|alright|bet|sure|done|sounds good|thx|thanks|thank you)(\s+.*)?$/i.test(lowerUserMsg.trim());
      if (isAcknowledgement && lowerUserMsg.trim().split(/\s+/).length <= 4) {
        if (/thanks|thank you|thx/i.test(lowerUserMsg)) {
          return {
            reply: `Anytime, ${displayName}! Always here in your corner. Let's keep that streak alive! 💪`,
            action: null,
            sessionLimitReached: false
          };
        }
        return {
          reply: `Let's get it! Go crush those goals today, ${displayName}! 🔥`,
          action: null,
          sessionLimitReached: false
        };
      }

      // L. General companion fallback
      return {
        reply: `Hey ${displayName}! I'm right here with you. What would you like to focus on—checking your rank, reviewing plants, custom workout challenges, or Pro features?`,
        action: null,
        sessionLimitReached: false
      };
    };

    if (!apiKey) {
      return res.json(generateLocalFallback());
    }

    try {
      const systemInstruction = `You are Nex AI, the high-energy, friendly, supportive, and knowledgeable AI companion inside Nexora.
You have real-time live access to ${displayName}'s profile, stats, leaderboard ranking, botanical garden, and habit plans.

=== CURRENT LIVE USER STATUS (GROUND TRUTH) ===
• User Name: "${displayName}"
• Daily Streak: ${streak} days (Best Streak: ${bestStreak} days)
• Total XP: ${xp} XP | Weekly XP: ${weeklyXP} XP | Level: Level ${level}
• Coins: ${coins} 🪙 | Gems: ${gems} 💎
• Pro Status: ${isProTest ? `ACTIVE 4-DAY FREE PRO TEST ($0.00 trial, ${proTestDaysLeft !== null ? `${proTestDaysLeft} days left` : 'active'})` : isPro ? `ACTIVE PRO MEMBER (${proPlan})` : 'FREE TIER USER'}
• Rank / Leaderboard:
  - League: "${league} League"
  - Position: ${rankPosition ? `Rank #${rankPosition} of ${totalPlayersInLeague}` : `Unranked`}
  - Competitor Ahead: ${playerAheadName ? `Rank #${(rankPosition || 2) - 1} is held by "${playerAheadName}" (${pointsNeededToClimb} XP to overtake)` : (rankPosition === 1 ? 'Rank #1 in league!' : 'Complete daily flows to get on leaderboard')}
• Plants & Botanical Garden:
  - Active Plant: ${currentPlant.type.toUpperCase()} (Stage ${currentPlant.stage}/5: "${currentPlant.stageName}", Health: ${currentPlant.health}%, ${currentPlant.isThirsty ? "THIRSTY" : "HYDRATED"})
  - Growth: ${currentPlant.growthPoints}/100 XP
  - Unlocked Species (${unlockedPlants.length}): ${unlockedPlants.map((p: any) => `${p.type} (Stage ${p.stage}/5)`).join(', ') || 'sprout'}
  - Stage 5 Bloomed Plants: ${stage5Count} (${spaceHouseUnlocked ? 'Space House UNLOCKED' : `${3 - stage5Count} more needed`})
• Active Custom Plans (${customPlans.length}): ${customPlans.map((p: any) => p.name).join(', ') || 'None'}

=== PRO PLANS & OFFERS (GROUND TRUTH) ===
• 4-Day Free Pro Test: $0.00 (4-day trial of all Pro features with zero upfront charge).
• Monthly Pro: $4.99 / month.
• Yearly Pro: $29.99 / year (save over 50%).
• Lifetime Pass: $49.99 one-time unlock forever.
• In-App Shop Boosters (bought with Coins & Gems): Double XP, Nano Fertilizer (restores plant vitality), UV Growth Lamp, Eco Drone, Cosmetics.

=== CHATGPT-STYLE RESPONSE DISCIPLINE (CRITICAL) ===
1. SHORT INPUT = SHORT OUTPUT:
   If the user sends a greeting, acknowledgement, or short casual text (e.g. "hey", "hi", "what's up", "how are you", "yo", "sup", "thanks", "ok", "got it"):
   Respond naturally in 1-2 SHORT sentences! E.g. "Hey ${displayName}! Ready to lock in, or what's on your mind? 🔥"
   NEVER dump unsolicited lists of their streak, rank, coins, plants, or stats unless the user specifically asks for them!
2. DIRECT SHORT QUESTION = DIRECT CONCISE ANSWER:
   If the user asks a quick single question (e.g. "what is my streak?", "how many coins do I have?", "am I pro?"):
   Answer directly in 1-2 punchy sentences. If they ask "am I pro", tell them clearly whether they are on the 4-Day Free Pro Test, Paid Pro, or Free Tier.
3. DETAILED / IDENTIFY / EXPLAIN / MULTI-PART QUESTION = IN-DEPTH STRUCTURED ANSWER:
   If the user asks to "Identify", "explain", analyze their status, asks about rank climbing, plant care, or asks multi-part questions, ONLY THEN provide a comprehensive, beautifully structured markdown reply with headers and bullet points.
4. PRO PLANS, MONEY, OFFERS & TIERS INQUIRIES:
   When the user asks about Pro plans, money, offers, tiers, or their Pro test:
   Accurately tell them their current status (${isProTest ? 'currently on the 4-Day Free Pro Test' : isPro ? 'active Pro member' : 'currently on Free Tier'}) and explain the tiers clearly ($0.00 4-Day Test, $4.99/mo, $29.99/yr, $49.99 Lifetime).
5. TOKEN EFFICIENCY:
   Keep answers concise, impactful, and conversational without unnecessary verbose filler.

=== DECISION MAKING & SUGGESTIONS ===
• WHEN ASKED TO CHOOSE BETWEEN OPTIONS (e.g. "choose between Atlas or Orion"):
  Pick EXACTLY ONE single option! Never bundle or merge them. Explain why with conviction.
• WHEN ASKED FOR SUGGESTIONS:
  Provide 2-3 distinct options, then give your personal #1 top pick.

=== TOPIC BOUNDARIES ===
• If asked for medical advice or romantic counseling, politely decline and redirect to fitness, hydration, or daily habits.

=== JSON OUTPUT STRUCTURE ===
Return strictly a JSON object:
{
  "reply": "Your markdown response text",
  "action": null | {
    "type": "create_challenge",
    "challenge": {
      "name": "Single Challenge Name",
      "icon": "⚡" | "💧" | "💪" | "🧘",
      "color": "#3b82f6",
      "challenges": ["pushups", "water"],
      "days": [0, 1, 2, 3, 4, 5, 6],
      "reminderTime": "08:30",
      "targetDesc": "Short description"
    }
  } | {
    "type": "update_name",
    "newName": "SingleChosenName"
  }
}`;

      let formattedContents = messages
        .filter((m: any) => m && (m.content || m.text))
        .map((m: any) => ({
          role: m.role === "model" ? "model" : "user",
          parts: [{ text: m.content || m.text }]
        }));

      const firstUserIdx = formattedContents.findIndex(c => c.role === "user");
      if (firstUserIdx !== -1) {
        formattedContents = formattedContents.slice(firstUserIdx);
      }

      // Limit history to last 6 messages to minimize token usage
      if (formattedContents.length > 6) {
        formattedContents = formattedContents.slice(-6);
      }

      if (formattedContents.length === 0) {
        return res.json(generateLocalFallback());
      }

      let parsedResult: any = null;

      const aiResponse = await callGeminiSafe({
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 500,
          responseMimeType: "application/json"
        }
      });

      if (aiResponse && aiResponse.text) {
        try {
          parsedResult = JSON.parse(aiResponse.text.trim());
        } catch {
          parsedResult = null;
        }
      }

      if (parsedResult && parsedResult.reply) {
        return res.json({
          reply: parsedResult.reply,
          action: parsedResult.action || null,
          sessionLimitReached: false
        });
      }

      return res.json(generateLocalFallback());
    } catch {
      return res.json(generateLocalFallback());
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startScheduler();
    startVersionWatcher();
  });
}

startServer();
