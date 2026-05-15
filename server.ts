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

// Background Scheduler for Reminders
const startScheduler = () => {
  console.log("[V2 Scheduler] Starting... (Checking every 10 minutes)");
  setInterval(async () => {
    if (!db) return;
    
    const now = new Date();
    try {
      const usersSnapshot = await db.collection("users")
        .where("notificationsEnabled", "==", true)
        .limit(100) 
        .get();
      
      for (const userDoc of usersSnapshot.docs) {
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
        } catch (e) {
          const userHour = now.getUTCHours().toString().padStart(2, '0');
          const userMin = now.getUTCMinutes().toString().padStart(2, '0');
          userTimeStr = `${userHour}:${userMin}`;
        }

        const reminder1 = userData.reminderTime || (userData.settings && userData.settings.reminderTime);
        const reminder2 = userData.reminderTime2 || (userData.settings && userData.settings.reminderTime2);

        if ((reminder1 && userTimeStr === reminder1) || (reminder2 && userTimeStr === reminder2)) {
          if (!userData.isTodayCompleted) {
            await sendPush(fcmToken, 'Nexora 🔥', 'Hey 👋 Ready for today’s challenge? Don\'t let that streak die!');
          }
        }

        if (userTimeStr === '22:00' && !userData.isTodayCompleted) {
          await sendPush(fcmToken, 'Streak at Risk! ⚠️', 'Bro, your streak is about to die! 💀 Spend 2 minutes now to save it!');
        }

        // Additional status checks
        const plantState = userData.plantState;
        if (plantState && !plantState.isDead && plantState.isThirsty && (userTimeStr === '18:00' || userTimeStr === '21:00')) {
          await sendPush(fcmToken, 'Water Needed! 💧', `Your ${plantState.type} is drying out, bro!`);
        }
      }
    } catch (error: any) {
      if (error.message.includes("PERMISSION_DENIED")) {
        console.warn("[V2 Scheduler] Permission Denied. Skipping scheduler ticks.");
      } else {
        console.error("Scheduler Error:", error);
      }
    }
  }, 600000); 
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
