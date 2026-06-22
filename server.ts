import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bodyParser from "body-parser";
import crypto from "crypto";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import { Resend } from "resend";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

const __dirname = typeof __filename !== 'undefined' 
  ? path.dirname(__filename) 
  : process.cwd();


// Initialize Firebase Admin
let db: admin.firestore.Firestore;
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
    try {
      await db.collection("users").limit(1).get();
      console.log("Firestore Admin: Startup connection verification successful.");
    } catch (e: any) {
      console.error("Firestore Admin: Startup connection verification FAILED:", e.message);
    }
  })();
} catch (err: any) {
  console.error("Firebase Admin Initialization Failed:", err.message);
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

const generateMotivationalQuote = async (): Promise<{ title: string; body: string }> => {
  let title = "Nexora Motivation 🔥";
  let body = "Don't let your streak die! You're a beast, bro!";
  
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = "You are Nexora, a friendly water-bottle mascot for a productivity app. Generate a super short, punchy, and aggressive-but-friendly motivational push notification message for a user who needs to finish their habits today. Max 20 words. Include one emoji. Format: Title | Body";
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text.includes("|")) {
        const parts = text.split("|");
        title = parts[0].trim();
        body = parts[1].trim();
      } else {
        body = text;
      }
    } catch (aiErr) {
      console.error("AI Quote Generation failed, using static fallback:", aiErr);
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
    if (!db) return;
    
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
              const duolingoNotif = getDuolingoStyleNotification(streakVal);
              await sendPush(fcmToken, duolingoNotif.title, duolingoNotif.body);
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
            await sendPush(fcmToken, 'Streak at Risk! ⚠️', extremeMsg);
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
              await sendPush(fcmToken, 'Trophy Alert! 🧊', 'One of your trophies just turned to ICE! Complete a challenge now to save it, bro!');
            }
          } else if (hadBrokenTransition) {
            const rKey = `${userId}_trophy_broken_${todayStr}`;
            if (sentNotifications.get(rKey) !== todayStr) {
              sentNotifications.set(rKey, todayStr);
              await sendPush(fcmToken, 'Trophy Alert! 💔', 'Oh no! A trophy has BROKEN! Don\'t let more break, bro!');
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
                  await sendPush(fcmToken, 'Your Nexora Ecosystem has died... 🥀', 'Bro, your plants need discipline! Restore the room and try again.');
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
                    await sendPush(fcmToken, 'Water Needed! 💧', `Your ${type} is drying out, bro! Give it some water now!`);
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
              await sendPush(fcmToken, customPlanNotif.title, customPlanNotif.body);
            }
          }
        }

        // 6. MOTIVATIONAL SYSTEM
        const pushMotivationEnabled = settings.pushMotivationEnabled === true || userData.pushMotivationEnabled === true;
        const motivationTime = settings.motivationTime || userData.motivationTime || "09:00";
        if (pushMotivationEnabled && userTimeStr === motivationTime) {
          const mKey = `${userId}_motivation`;
          if (sentNotifications.get(mKey) !== todayStr) {
            sentNotifications.set(mKey, todayStr);
            try {
              const quote = await generateMotivationalQuote();
              await sendPush(fcmToken, quote.title, quote.body);
            } catch (quoteErr) {
              console.error("Failed to generate scheduler motivation:", quoteErr);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.message.includes("PERMISSION_DENIED")) {
        console.warn("[V3 Scheduler] Permission Denied. Skipping scheduler ticks.");
      } else {
        console.error("[V3 Scheduler] Unexpected Error:", error);
      }
    }
  }, 6000); // Check precisely every 1 minute
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
            await admin.messaging().sendEachForMulticast({
              tokens,
              notification: {
                title: `New Nexora Update! 🚀 v${newVersion}`,
                body: versionData.releaseNotes?.[0] || 'New features and bug fixes are ready for you, bro!',
              }
            });
          }
        }
        lastKnownVersion = newVersion;
      }
    } catch (error) {
      console.error("Version Watcher Error:", error);
    }
  }, 600000); // Check every 10 minutes
};

const sendPush = async (token: string, title: string, body: string) => {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } }
    });
  } catch (err) {
    // If token is invalid, we could remove it from DB
    console.error("Push Error for token:", token, err);
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
      if (db) {
        await db.collection("users").limit(1).get();
        firebaseStatus = "connected";
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
          await db.collection("users").doc(userId).update({
            isPro: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`Successfully updated user ${userId} to Pro.`);
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
            icon: '/nexora-mascot.png',
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
      const response = await admin.messaging().send(message as any);
      console.log("Successfully sent motivation message:", response);
      res.json({ success: true, messageId: response, quote: { title, body } });
    } catch (error: any) {
      console.error("Error sending motivation:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Push Notification Endpoint
  app.post("/api/send-notification", async (req, res) => {
    const { token, title, body, type, email } = req.body;

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

      // Push Notification
      const message = {
        notification: {
          title: title || "Nexora Alert",
          body: body || "You have a new message from Nexora!",
        },
        webpush: {
          notification: {
            icon: '/nexora-mascot.png',
            badge: '/nexora-mascot.png',
            vibrate: [200, 100, 200],
            tag: 'nexora-alert',
            renotify: true
          },
          fcmOptions: {
            link: 'https://ais-pre-fhmpooizvatwhyk3zv744s-317478625149.europe-west2.run.app'
          }
        },
        token: token,
      };

      console.log("Sending push notification:", message);
      const pushRes = await admin.messaging().send(message as any);
      res.json({ success: true, messageId: pushRes });
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("AI Service: GEMINI_API_KEY missing. Using simulated response.");
      return res.json({
        mood: "Calm & Reflective",
        neural_insight: "Writing down your ideas fosters cognitive stability and creative focus, bro.",
        biological_recommendation: "Take 3 deep breaths then write down your next target milestone."
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (!response || !response.text) {
        throw new Error("Empty response from Gemini API");
      }

      const cleanText = response.text.trim();
      res.json(JSON.parse(cleanText));
    } catch (error: any) {
      console.error("Server Note Analysis failed:", error);
      res.status(500).json({ error: "Neural link interrupted. Please try again, bro." });
    }
  });

  // Server-Side Gemini API Proxy for Habits Pattern Analysis
  app.post("/api/gemini/analyze-habits", async (req, res) => {
    const { stats, history } = req.body;
    if (!stats || !history) {
      return res.status(400).json({ error: "Stats and history are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("AI Service: GEMINI_API_KEY missing. Using simulated response.");
      return res.json({
        analysis: `NEXUS VISION PROTOCOL: SIMULATED ANALYSIS.
        
BIOLOGICAL STATUS: ASCENDING.

PATTERN INSIGHT: YOUR MOMENTUM INDICATES HIGH NEURAL PLASTICITY. STREAK OF ${stats.streak || 0} IS OPTIMAL.

OVERRIDE PROTOCOL: INCREASE HYDRATION FREQUENCY TO MAINTAIN COGNITIVE FLOW.`
      });
    }

    try {
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

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      if (!response || !response.text) {
        throw new Error("Empty response from Gemini API");
      }

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Server Habit Analysis failed:", error);
      res.status(500).json({ error: "Neural link interrupted. Please try again, bro." });
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
