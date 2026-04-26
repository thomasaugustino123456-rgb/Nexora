import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import crypto from "crypto";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import { Resend } from "resend";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let db: admin.firestore.Firestore;
try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
  
  const projectId = firebaseConfig.projectId || process.env.GOOGLE_CLOUD_PROJECT;
  const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";

  console.log("Firebase Debug: GOOGLE_APPLICATION_CREDENTIALS =", process.env.GOOGLE_APPLICATION_CREDENTIALS || "not set");
  console.log("Firebase Debug: GOOGLE_CLOUD_PROJECT =", process.env.GOOGLE_CLOUD_PROJECT || "not set");

  if (!admin.apps.length) {
    try {
      // Try default initialization first
      admin.initializeApp();
      console.log("Firebase Admin: Initialized with default settings");
    } catch (e) {
      // Fallback to explicit config if default fails
      admin.initializeApp({
        projectId: projectId,
        credential: admin.credential.applicationDefault()
      });
      console.log(`Firebase Admin: Initialized project [${projectId}] via explicit config`);
    }
  }
  
  // Use the named database if provided, otherwise default
  try {
    db = getFirestore(admin.app(), databaseId === "(default)" ? undefined : databaseId);
    console.log(`Firestore Admin: Connected to database [${databaseId}]`);

    // Verify connection/permissions immediately on startup
    (async () => {
      try {
        await db.collection("users").limit(1).get();
        console.log("Firestore Admin: Startup connection verification successful.");
      } catch (e: any) {
        console.error("Firestore Admin: Startup connection verification FAILED:", e.message);
        
        // If the named database failed with permission denied or not found, try falling back to (default)
        if (databaseId !== "(default)" && (e.message.includes("PERMISSION_DENIED") || e.message.includes("NOT_FOUND") || e.message.includes("not found"))) {
          console.warn(`Firestore Admin: Falling back to (default) database because [${databaseId}] failed.`);
          db = getFirestore(admin.app(), undefined);
          try {
             await db.collection("users").limit(1).get();
             console.log("Firestore Admin: Fallback to (default) successful.");
          } catch (ee: any) {
             console.error("Firestore Admin: Fallback to (default) also FAILED:", ee.message);
          }
        }
      }
    })();
  } catch (err: any) {
    console.error("Firestore Admin initialization failed at call site:", err.message);
  }
} catch (err: any) {
  console.error("Firebase Admin Initialization Failed:", err.message);
}

// Background Scheduler for Reminders
const startScheduler = () => {
  console.log("Notification Scheduler: Starting... (Checking every minute)");
  setInterval(async () => {
    if (!db) {
      console.warn("Scheduler: Firestore DB not initialized, skipping tick.");
      return;
    }
    
    const now = new Date();
    console.log(`Notification Scheduler: Universal Tick at ${now.toISOString()}`);

    try {
      // Periodic connectivity check - if it fails, the catch block will handle it
      // 1. Get all users with notifications enabled
      let usersSnapshot;
      try {
        usersSnapshot = await db.collection("users").get();
      } catch (e: any) {
        console.error("Scheduler Error (Fetching Users):", e.message);
        if (e.message.includes("PERMISSION_DENIED") || e.message.includes("not found")) {
           console.warn("Scheduler: Detected permission/connectivity error, attempting to re-verify DB identity...");
           // This will be caught by the outer catch and the next tick might work if we fixed db in init
        }
        throw e;
      }
      
      const usersToNotify = usersSnapshot.docs.filter((doc: any) => {
        const data = doc.data();
        const hasToken = data.fcmToken || (data.settings && data.settings.fcmToken);
        const hasEnabled = data.notificationsEnabled || (data.settings && data.settings.notificationsEnabled);
        return hasToken && hasEnabled;
      });

      if (usersToNotify.length > 0) {
        console.log(`Notification Scheduler: Found ${usersToNotify.length} users with tokens.`);
      }
      
      for (const userDoc of usersToNotify) {
        const userData = userDoc.data();
        const fcmToken = userData.fcmToken || (userData.settings && userData.settings.fcmToken);
        const tz = userData.timezone || 'UTC';

        // Get user's local time string "HH:mm"
        let userTimeStr = "";
        try {
          const localDate = new Date(now.toLocaleString("en-US", {timeZone: tz}));
          const userHour = localDate.getHours().toString().padStart(2, '0');
          const userMin = localDate.getMinutes().toString().padStart(2, '0');
          userTimeStr = `${userHour}:${userMin}`;
          console.log(`Scheduler Debug: User ${userDoc.id} local time is ${userTimeStr} (${tz})`);
        } catch (e) {
          // Fallback to UTC
          const userHour = now.getUTCHours().toString().padStart(2, '0');
          const userMin = now.getUTCMinutes().toString().padStart(2, '0');
          userTimeStr = `${userHour}:${userMin}`;
        }

        // 1. Task Reminders (Main & Streak Protection)
        const currentHour = parseInt(userTimeStr.split(':')[0]);
        const currentMin = parseInt(userTimeStr.split(':')[1]);

        if (userTimeStr === userData.reminderTime || userTimeStr === userData.reminderTime2) {
          if (!userData.isTodayCompleted) {
            await sendPush(fcmToken, 'Nexora 🔥', 'Hey 👋 Ready for today’s challenge? Don\'t let that streak die!');
          }
        }

        // Streak Protection Check at 10:00 PM (22:00)
        if (userTimeStr === '22:00' && !userData.isTodayCompleted) {
          await sendPush(fcmToken, 'Streak at Risk! ⚠️', 'Bro, your streak is about to die! 💀 Spend 2 minutes now to save it!');
        }

        // 2. Plant Status Alerts (Dynamic)
        const plantState = userData.plantState;
        if (plantState && !plantState.isDead) {
          // Thirsty Alert
          if (plantState.isThirsty && (userTimeStr === '09:00' || userTimeStr === '18:00' || userTimeStr === '21:00')) {
            await sendPush(fcmToken, 'Water Needed! 💧', `Your ${plantState.type} is drying out, bro! Save your ecosystem!`);
          }
          // Growth Alert
          if (userTimeStr === '10:00') {
            if (plantState.stage === 5) {
              await sendPush(fcmToken, 'Legendary Status! 🏆', `Your ${plantState.type} ecosystem is fully evolved! Go admire your work!`);
            } else if (plantState.growthPoints > 50) {
              await sendPush(fcmToken, 'Plant Progress! 🌱', `Your plant is growing strong! Keep crushing habits to see it level up!`);
            }
          }
        }

        // 3. Trophy & Achievement Alert
        if (userTimeStr === '19:00') {
          const stats = userData.stats;
          if (stats) {
            if (stats.trophies && stats.trophies.some((t: any) => t.type === 'broken')) {
              await sendPush(fcmToken, 'Broken Trophy! 🧊', 'A trophy is frozen/broken! Fix it before it shatters completely!');
            }
            if (stats.totalPoints > 0 && stats.totalPoints % 1000 < 50) {
              await sendPush(fcmToken, 'Points Milestone! ✨', `You're crushing it! Over ${Math.floor(stats.totalPoints / 1000) * 1000} points reached!`);
            }
          }
        }

        // 4. Daily Motivation
        if (userTimeStr === (userData.motivationTime || '12:00')) {
          const quotes = [
            "Winning isn't everything, but wanting to win is. 🔥",
            "Your only limit is you. 🚀",
            "Be better than you were yesterday. 💪",
            "Don't stop until you're proud. 🏆",
            "Hard work beats talent when talent doesn't work hard. ⚡"
          ];
          const quote = quotes[Math.floor(Math.random() * quotes.length)];
          await sendPush(fcmToken, 'Daily Fire! 💡', quote);
        }

        // 5. Inactivity "We Miss You" (Check every Sunday at 3 PM)
        const localDate = new Date(now.toLocaleString("en-US", {timeZone: tz}));
        if (localDate.getDay() === 0 && userTimeStr === '15:00') {
          const lastActive = userData.updatedAt?.toDate() || new Date(0);
          const daysInactive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
          if (daysInactive > 3) {
            await sendPush(fcmToken, 'Nexora Misses You! 👋', "It's been a few days, bro. Your plants and trophies are waiting for you!");
          }
        }
      }

      // 3. Custom Plan Reminders (Global check)
      try {
        const plansSnapshot = await db.collection("customPlans").get();
        for (const planDoc of plansSnapshot.docs) {
          const plan = planDoc.data();
          // Find user for this plan
          const userToNotify = usersToNotify.find((u: any) => u.id === plan.userId);
          if (!userToNotify) continue;

          const userData = userToNotify.data();
          const tz = userData.timezone || 'UTC';
          const formatter = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit', minute: '2-digit',
            hour12: false, timeZone: tz
          });
          
          // Use a simpler day check
          const localDate = new Date(now.toLocaleString("en-US", {timeZone: tz}));
          const localDay = localDate.getDay();
          const userTimeStr = formatter.format(now);

          if (plan.days.includes(localDay)) {
            if (userTimeStr === plan.reminderTime || userTimeStr === plan.reminderTime2) {
              const currentToken = userData.fcmToken || (userData.settings && userData.settings.fcmToken);
              if (currentToken) {
                await sendPush(currentToken, `${plan.name} 🚀`, `Time for your custom plan: ${plan.name}! Let's go!`);
              }
            }
          }
        }
      } catch (e: any) {
        console.error("Scheduler Error (Custom Plans):", e.message);
      }

    } catch (error) {
      console.error("Scheduler Error:", error);
    }
  }, 60000);
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
          const usersSnapshot = await db.collection("users").get();
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
  }, 60000); // Check every minute
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

const MOTIVATIONAL_QUOTES = [
  { title: "Crush It Bro! 🚀", body: "Don't let your streak die today. You're a beast!" },
  { title: "Level Up! 🔥", body: "Consistency is the key to greatness. Get your habits done!" },
  { title: "Nexora Power ⚡", body: "Small wins every day lead to massive results. Keep going!" },
  { title: "Stay Disciplined 🧠", body: "Motivation gets you started, discipline keeps you going." },
  { title: "No Excuses 🚫", body: "Your future self will thank you for the work you do today." },
  { title: "Champion Mindset 🏆", body: "Champions keep playing until they get it right. Let's go!" },
  { title: "Focus Bro! 🎯", body: "Distractions are the enemy of progress. Stay focused on your goals." },
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Basic CORS and Body Parsing
  app.use(express.json());
  
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
      let title = "Nexora Motivation 🔥";
      let body = "Don't let your streak die! You're a beast, bro!";
      
      // Try to use Gemini to generate a fresh quote
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
      
      const message = {
        notification: {
          title: title,
          body: body,
        },
        webpush: {
          notification: {
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
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
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
            badge: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
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
