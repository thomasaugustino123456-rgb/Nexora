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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);

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
  const PORT = 3000;

  // Middleware for Lemon Squeezy Webhook (needs raw body for signature verification)
  app.use("/api/webhook/lemonsqueezy", bodyParser.raw({ type: "application/json" }));
  app.use(express.json());

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
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      
      const message = {
        notification: {
          title: randomQuote.title,
          body: randomQuote.body,
        },
        token: token,
      };

      const response = await admin.messaging().send(message);
      res.json({ success: true, messageId: response, quote: randomQuote });
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

      const message = {
        notification: {
          title: title || "Nexora Challenge",
          body: body || "Hey bro, it's time for your challenge!",
        },
        token: token,
      };

      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
      res.json({ success: true, messageId: response });
    } catch (error: any) {
      console.error("Error sending message:", error);
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
  });
}

startServer();
