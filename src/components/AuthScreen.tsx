import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  deleteUser
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

import { motion, useAnimationControls, AnimatePresence } from "motion/react";
import { Mail, Lock, AlertCircle, Eye, EyeOff, X } from "lucide-react";
import { Mascot, MascotMood } from "./Mascot";
import { ArrowLeft } from "lucide-react";
import { vibrate } from "../lib/vibrate";
import { MascotImage } from "./MascotImage";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface AuthScreenProps {
  onBack?: () => void;
}

export function AuthScreen({ onBack }: AuthScreenProps) {
  const [authView, setAuthView] = useState<"options" | "form">("options");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [customMoodOverride, setCustomMoodOverride] = useState<MascotMood | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [isInIframe, setIsInIframe] = useState(false);

  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  // Mascot Interaction State
  const [tapCount, setTapCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mascotControls = useAnimationControls();
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  // Calming down state
  const [lastY, setLastY] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);

  // Helper to trigger mascot lowering / disappointed animation
  const triggerLowerMascot = async (yOffset: number = 12) => {
    if (!isMountedRef.current) return;
    try {
      await mascotControls.start({
        y: yOffset,
        transition: { type: "spring", stiffness: 300, damping: 15 },
      });
    } catch (err) {
      // Safe fallback
    }
  };

  // Helper to trigger celebration jump animation
  const triggerCelebrationJump = async () => {
    if (!isMountedRef.current) return;
    try {
      await mascotControls.start({
        y: [-24, 0, -12, 0],
        scale: [1, 1.22, 1.05, 1],
        transition: { duration: 0.65, ease: "easeOut" },
      });
    } catch (err) {
      // Safe fallback
    }
  };

  // Helper to set animated error with auto-dismiss
  const setAnimatedError = (msg: string, mood: MascotMood, yOffset: number = 12) => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    setError(msg);
    setCustomMoodOverride(mood);
    triggerLowerMascot(yOffset);

    errorTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setError("");
        setCustomMoodOverride(null);
        mascotControls.start({
          y: 0,
          transition: { type: "spring", stiffness: 300, damping: 15 },
        });
      }
    }, 5000); // Disappears automatically after 5 seconds
  };

  const clearErrorState = () => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    setError("");
    setCustomMoodOverride(null);
    mascotControls.start({
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    });
  };

  // Map Firebase errors to friendly messages & mascot moods
  const parseFirebaseAuthError = (err: any, isSignUpMode: boolean): { message: string; mood: MascotMood; yOffset: number } => {
    const code = err?.code || "";
    const rawMsg = err?.message || "";

    if (rawMsg.includes("ACCOUNT_DELETED_OR_NOT_FOUND") || code === "auth/user-not-found" || rawMsg.includes("user-not-found")) {
      return {
        message: "This account no longer exists. Please create a new account.",
        mood: "concerned",
        yOffset: 12,
      };
    }

    if (code === "auth/invalid-email" || rawMsg.includes("invalid-email")) {
      return {
        message: "Please enter a valid email address.",
        mood: "concerned",
        yOffset: 8,
      };
    }

    if (code === "auth/too-many-requests" || rawMsg.includes("too-many-requests")) {
      return {
        message: "Too many login attempts. Please try again later.",
        mood: "pouty",
        yOffset: 14,
      };
    }

    if (code === "auth/email-already-in-use" || rawMsg.includes("email-already-in-use")) {
      return {
        message: "An account with this email already exists.",
        mood: "sad",
        yOffset: 10,
      };
    }

    if (code === "auth/weak-password" || rawMsg.includes("weak-password")) {
      return {
        message: "Password must be at least 6 characters.",
        mood: "neutral",
        yOffset: 6,
      };
    }

    if (code === "auth/network-request-failed" || rawMsg.includes("network")) {
      return {
        message: "Network connection issue. Please check your internet connection.",
        mood: "concerned",
        yOffset: 8,
      };
    }

    // Default friendly fallback
    return {
      message: isSignUpMode
        ? "Could not create account. Please check your details and try again."
        : "Incorrect email or password.",
      mood: "sad",
      yOffset: 12,
    };
  };

  // Determine Mascot Mood
  let mascotMood: MascotMood = "neutral";
  if (isSuccess) {
    mascotMood = "happy";
  } else if (customMoodOverride) {
    mascotMood = customMoodOverride;
  } else if (tapCount >= 6) {
    mascotMood = "boiling";
  } else if (tapCount >= 5) {
    mascotMood = "angry";
  } else if (error) {
    mascotMood = "sad";
  } else if (isTyping) {
    mascotMood = "happy";
  } else if (tapCount > 0) {
    mascotMood = "happy";
  }

  const triggerJump = async () => {
    if (!isMountedRef.current) return;
    try {
      await mascotControls.start({
        y: -20,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      });
      if (!isMountedRef.current) return;
      await mascotControls.start({
        y: 0,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      });
    } catch (err) {
      // Safe fallback if controls unmounted
    }
  };

  const handleMascotTap = () => {
    vibrate(20);
    setTapCount((prev) => prev + 1);
    if (tapCount < 5) {
      triggerJump();
    }
  };

  const handleMascotPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (tapCount >= 5) {
      if (lastY !== null) {
        const deltaY = Math.abs(e.clientY - lastY);
        if (deltaY > 15) {
          setMoveCount((prev) => {
            const newCount = prev + 1;
            if (newCount > 8) {
              setTapCount(0);
              setLastY(null);
              return 0;
            }
            return newCount;
          });
          setLastY(e.clientY);
        }
      } else {
        setLastY(e.clientY);
      }
    }
  };

  const handleMascotPointerLeave = () => {
    setLastY(null);
    setMoveCount(0);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsTyping(true);
    if (error) clearErrorState();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsTyping(true);
    if (error) clearErrorState();
  };

  const handleBlur = () => {
    setIsTyping(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    vibrate(20);
    if (isSigningIn) return;

    const trimmedEmail = email.trim();

    // 1. Validation before Firebase
    if (!trimmedEmail) {
      setAnimatedError("Email is required.", "concerned", 8);
      return;
    }

    if (!password) {
      setAnimatedError("Password is required.", "concerned", 8);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setAnimatedError("Please enter a valid email address.", "concerned", 8);
      return;
    }

    // Password length validation for signup
    if (isSignUp && password.length < 6) {
      setAnimatedError("Password must be at least 6 characters.", "neutral", 6);
      return;
    }

    setIsSigningIn(true);
    clearErrorState();
    setIsTyping(false);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        
        const signUpData = {
          name: 'Champion',
          displayName: 'Champion',
          "Name": 'Champion',
          email: trimmedEmail,
          "Email": trimmedEmail,
          photoFileName: '',
          "Photo file name": '',
          profilePic: '',
          "Profile image": '',
          location: '',
          "Location": '',
          time: new Date().toISOString(),
          "Time": new Date().toISOString(),
          date: new Date().toISOString(),
          "Date": new Date().toISOString(),
          "Email address": trimmedEmail,
          uid: userCredential.user.uid,
          role: 'user',
          accountName: 'Champion',
          "Account name": 'Champion',
          onboardingCompleted: false,
          settings: {
            onboardingCompleted: false,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        localStorage.setItem("nexora_onboarding_completed", "false");
        localStorage.setItem(`nexora_onboarding_completed_${userCredential.user.uid}`, "false");
        localStorage.setItem("nexora_cached_user", userCredential.user.uid);
        try {
          sessionStorage.removeItem("nexora_login_flow");
          sessionStorage.setItem("nexora_signup_flow", "true");
        } catch {}
        // If an account was previously deleted, clean up tombstones so new account is completely fresh
        try {
          await deleteDoc(doc(db, "deleted_users", userCredential.user.uid));
        } catch {}
        try {
          await deleteDoc(doc(db, "onboardingID", userCredential.user.uid));
        } catch {}
        await setDoc(doc(db, "users", userCredential.user.uid), signUpData);
        await setDoc(doc(db, "user", userCredential.user.uid), signUpData);
        const initialLbData = {
          uid: userCredential.user.uid,
          userId: userCredential.user.uid,
          displayName: 'Champion',
          name: 'Champion',
          photoURL: '',
          profilePic: '',
          streak: 0,
          totalPoints: 0,
          points: 0,
          weeklyPoints: 0,
          weeklyXP: 0,
          xp: 0,
          level: 1,
          league: 'Bronze',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, "leaderboard", userCredential.user.uid), initialLbData, { merge: true });
        await setDoc(doc(db, "rank", userCredential.user.uid), initialLbData, { merge: true });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const uid = userCredential.user.uid;
        try {
          sessionStorage.setItem("nexora_login_flow", "true");
          sessionStorage.removeItem("nexora_signup_flow");
        } catch {}
        
        // Check if user was marked deleted or wiped from Firestore
        const [deletedSnap, userSnap] = await Promise.all([
          getDoc(doc(db, "deleted_users", uid)),
          getDoc(doc(db, "users", uid))
        ]);

        if (deletedSnap.exists() || (userSnap.exists() && userSnap.data()?.deleted === true) || !userSnap.exists()) {
          console.warn("[AUTH] Login rejected: Account is deleted or does not exist in Firestore.");
          try {
            await deleteUser(userCredential.user);
          } catch (e) {
            await signOut(auth);
          }
          throw new Error("ACCOUNT_DELETED_OR_NOT_FOUND");
        }
      }
      try {
        sessionStorage.setItem("nexora_fresh_login", "true");
      } catch {}
      setIsSuccess(true);
      setCustomMoodOverride("happy");
      await triggerCelebrationJump();
    } catch (err: any) {
      console.warn("Handled email auth error info:", err?.code || err?.message);
      const mapped = parseFirebaseAuthError(err, isSignUp);
      setAnimatedError(mapped.message, mapped.mood, mapped.yOffset);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    vibrate(15);
    clearErrorState();
    setResetSuccessMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setAnimatedError("Email is required.", "concerned", 8);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setAnimatedError("Please enter a valid email address.", "concerned", 8);
      return;
    }

    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setResetSuccessMessage(
        "Reset request submitted! ✉️ Check your email inbox for the reset link! 🚀",
      );
      setCustomMoodOverride("happy");
      triggerJump();
    } catch (err: any) {
      console.warn("Forgot password request failed:", err?.code || err?.message);
      const mapped = parseFirebaseAuthError(err, false);
      setAnimatedError(mapped.message, mapped.mood, mapped.yOffset);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleGoogleSignIn = async () => {
    vibrate(15);
    if (isSigningIn) return;
    setIsSigningIn(true);
    clearErrorState();
    setIsTyping(false);

    if (window.self !== window.top) {
      setAnimatedError(
        "Google Sign-In is restricted inside preview mode. Please click 'Open in New Tab' in top right, or log in with Email & Password.",
        "concerned",
        8
      );
      setIsSigningIn(false);
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const uid = result.user.uid;

      // Check if user was marked deleted
      const [deletedSnap, existingUserSnap] = await Promise.all([
        getDoc(doc(db, "deleted_users", uid)).catch(() => null),
        getDoc(doc(db, "users", uid)).catch(() => null),
      ]);

      if (deletedSnap?.exists() && deletedSnap.data()?.deleted !== false) {
        console.warn("[AUTH] Google Login rejected: Account is deleted.");
        try {
          await deleteUser(result.user);
        } catch (e) {
          await signOut(auth);
        }
        throw new Error("ACCOUNT_DELETED_OR_NOT_FOUND");
      }

      if (!existingUserSnap || !existingUserSnap.exists()) {
        // Brand new Google user
        const googleUserData = {
          name: result.user.displayName || 'Champion',
          displayName: result.user.displayName || 'Champion',
          "Name": result.user.displayName || 'Champion',
          email: result.user.email || `${result.user.uid}@nexora.app`,
          "Email": result.user.email || `${result.user.uid}@nexora.app`,
          photoFileName: result.user.photoURL || '',
          "Photo file name": result.user.photoURL || '',
          profilePic: result.user.photoURL || '',
          "Profile image": result.user.photoURL || '',
          location: '',
          "Location": '',
          time: new Date().toISOString(),
          "Time": new Date().toISOString(),
          date: new Date().toISOString(),
          "Date": new Date().toISOString(),
          "Email address": result.user.email || `${result.user.uid}@nexora.app`,
          uid: result.user.uid,
          role: 'user',
          accountName: result.user.displayName || 'Champion',
          "Account name": result.user.displayName || 'Champion',
          onboardingCompleted: false,
          settings: {
            onboardingCompleted: false,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        localStorage.setItem(`nexora_onboarding_completed_${uid}`, "false");
        localStorage.setItem("nexora_onboarding_completed", "false");
        localStorage.setItem("nexora_cached_user", uid);
        try {
          sessionStorage.removeItem("nexora_login_flow");
          sessionStorage.setItem("nexora_signup_flow", "true");
        } catch {}
        // If an account was previously deleted, clean up tombstones so new Google account is completely fresh
        try {
          await deleteDoc(doc(db, "deleted_users", result.user.uid));
        } catch {}
        try {
          await deleteDoc(doc(db, "onboardingID", result.user.uid));
        } catch {}
        await setDoc(doc(db, "users", result.user.uid), googleUserData);
        await setDoc(doc(db, "user", result.user.uid), googleUserData);
        const initialGoogleLbData = {
          uid: result.user.uid,
          userId: result.user.uid,
          displayName: result.user.displayName || 'Champion',
          name: result.user.displayName || 'Champion',
          photoURL: result.user.photoURL || '',
          profilePic: result.user.photoURL || '',
          streak: 0,
          totalPoints: 0,
          points: 0,
          weeklyPoints: 0,
          weeklyXP: 0,
          xp: 0,
          level: 1,
          league: 'Bronze',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, "leaderboard", result.user.uid), initialGoogleLbData, { merge: true });
        await setDoc(doc(db, "rank", result.user.uid), initialGoogleLbData, { merge: true });
      } else {
        // Existing Google user - only update updatedAt timestamp, never reset onboardingCompleted
        localStorage.setItem("nexora_cached_user", uid);
        try {
          sessionStorage.setItem("nexora_login_flow", "true");
          sessionStorage.removeItem("nexora_signup_flow");
        } catch {}
        await setDoc(doc(db, "users", result.user.uid), { updatedAt: serverTimestamp() }, { merge: true });
      }

      try {
        sessionStorage.setItem("nexora_fresh_login", "true");
      } catch {}
      setIsSuccess(true);
      setCustomMoodOverride("happy");
      await triggerCelebrationJump();
    } catch (err: any) {
      console.warn("Error signing in with Google:", err?.code || err?.message);
      if (err?.code === "auth/popup-closed-by-user") {
        setAnimatedError("Sign-in window was closed before completing.", "concerned", 6);
      } else {
        const mapped = parseFirebaseAuthError(err, false);
        setAnimatedError(mapped.message, mapped.mood, mapped.yOffset);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between items-center px-5 py-4 sm:px-8 sm:py-6 overflow-hidden z-50 select-none relative"
      style={{
        background: "linear-gradient(180deg, #dbeafe 0%, #bae6fd 50%, #7dd3fc 100%)"
      }}
    >
      {/* Top Bar / Back Navigation */}
      <div className="w-full max-w-md flex items-center justify-between z-20 pt-1 sm:pt-2 shrink-0">
        {authView === "form" ? (
          <button
            onClick={() => {
              vibrate(10);
              setAuthView("options");
              clearErrorState();
            }}
            className="p-2 sm:p-2.5 rounded-full bg-white/70 backdrop-blur-md text-blue-950 hover:bg-white transition-all shadow-md active:scale-95 border border-white/60 cursor-pointer"
            aria-label="Back to options"
          >
            <ArrowLeft size={18} className="text-blue-900 sm:w-5 sm:h-5" />
          </button>
        ) : onBack ? (
          <button
            onClick={() => {
              vibrate(10);
              onBack();
            }}
            className="p-2 sm:p-2.5 rounded-full bg-white/70 backdrop-blur-md text-blue-950 hover:bg-white transition-all shadow-md active:scale-95 border border-white/60 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-blue-900 sm:w-5 sm:h-5" />
          </button>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {authView === "options" ? (
          /* ==================================================================== */
          /* VIEW 1: Clean Gateway / Overview (Matches Mockup Exactly)            */
          /* ==================================================================== */
          <motion.div
            key="options-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-sm sm:max-w-md h-full flex flex-col justify-between items-center my-auto flex-1 py-1 sm:py-3 overflow-hidden min-h-0"
          >
            {/* Upper Hero Section: Celestial Mascot Emblem + Nexora Brand */}
            <div className="flex flex-col items-center text-center mt-1 sm:mt-3 shrink-0">
              {/* Celestial Mascot Emblem */}
              <motion.div
                animate={mascotControls}
                onClick={handleMascotTap}
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                {/* 8-Point Ice Crystal Starburst Compass Background */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_16px_rgba(56,189,248,0.65)]"
                >
                  {/* Outer Glow Ring */}
                  <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(186,230,253,0.85)" strokeWidth="2.5" />
                  <circle cx="100" cy="100" r="70" fill="rgba(224,242,254,0.3)" />

                  {/* Primary 4 Star Points (North, South, East, West) */}
                  <polygon points="100,10 112,85 100,75 88,85" fill="#38bdf8" />
                  <polygon points="100,190 112,115 100,125 88,115" fill="#0284c7" />
                  <polygon points="190,100 115,112 125,100 115,88" fill="#38bdf8" />
                  <polygon points="10,100 85,112 75,100 85,88" fill="#0284c7" />

                  {/* Diagonal 4 Star Points */}
                  <polygon points="160,40 115,90 108,82 110,80" fill="#7dd3fc" />
                  <polygon points="40,160 85,110 92,118 90,120" fill="#0369a1" />
                  <polygon points="160,160 110,115 118,108 120,110" fill="#0284c7" />
                  <polygon points="40,40 90,85 82,92 80,90" fill="#7dd3fc" />
                </svg>

                {/* Floating Halo above Mascot */}
                <div className="absolute top-1 sm:top-2 w-12 sm:w-14 md:w-16 h-3 sm:h-3.5 md:h-4 rounded-full border-2 border-white/90 bg-white/40 shadow-[0_0_12px_rgba(255,255,255,0.9)] z-20 transform -rotate-3" />

                {/* Central Mascot Image */}
                <div className="relative w-22 h-22 sm:w-26 sm:h-26 md:w-30 md:h-30 rounded-full overflow-hidden z-10 border-2 border-white/80 shadow-inner bg-gradient-to-b from-sky-200/80 to-blue-400/90 flex items-center justify-center">
                  <MascotImage
                    alt="Nexora Mascot"
                    className="w-full h-full object-cover"
                  />
                  {/* Glowing "N" Crest on Mascot Chest */}
                  <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 bg-blue-600/90 border border-white/70 text-white font-black text-[9px] sm:text-[10px] md:text-xs px-2 py-0.5 rounded-full shadow-md tracking-wider">
                    N
                  </div>
                </div>

                {/* Gold Badge (1) on Bottom-Right */}
                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-30 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border-2 border-white shadow-lg flex items-center justify-center text-amber-950 font-black text-xs sm:text-sm ring-2 ring-amber-400/50">
                  1
                </div>
              </motion.div>

              {/* Title & Tagline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-1.5 sm:mt-2 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
                Nexora
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1 text-slate-800/90 font-bold text-xs sm:text-sm drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                <span className="text-sky-600 text-xs">🍃</span>
                <span>Your personal flow companion</span>
                <span className="text-sky-600 text-xs">🍃</span>
              </div>
            </div>

            {/* Middle Breathing Room */}
            <div className="flex-1 min-h-[12px] sm:min-h-[20px]" />

            {/* Bottom Actions Section */}
            <div className="w-full space-y-2.5 sm:space-y-3 mt-auto pb-1 shrink-0">
              {/* Error Message if any */}
              {error && (
                <div className="w-full bg-rose-500/90 backdrop-blur-md text-white p-2.5 sm:p-3 rounded-xl text-xs font-bold text-center shadow-lg border border-rose-300/60 animate-shake">
                  {error}
                </div>
              )}

              {/* Button 1: Continue with email */}
              <button
                type="button"
                onClick={() => {
                  vibrate(15);
                  setIsSignUp(false);
                  setAuthView("form");
                  clearErrorState();
                }}
                className="w-full h-11 sm:h-12 md:h-13 bg-[#258bfb] hover:bg-[#1c7ee9] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-500/30 border border-blue-400/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.4]" />
                <span>Continue with email</span>
              </button>

              {/* Button 2: Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full h-11 sm:h-12 md:h-13 bg-white/95 hover:bg-white active:scale-[0.98] text-slate-800 font-bold text-sm sm:text-base rounded-2xl shadow-md border border-white/80 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-70"
              >
                {isSigningIn ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Footer Switcher */}
              <div className="text-center pt-0.5 sm:pt-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      vibrate(15);
                      setIsSignUp(true);
                      setAuthView("form");
                      clearErrorState();
                    }}
                    className="text-blue-700 font-black hover:text-blue-900 underline ml-1 cursor-pointer transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              </div>

              {isInIframe && (
                <div className="w-full bg-white/80 backdrop-blur-md border border-amber-300/70 text-amber-950 p-2 rounded-xl text-[10px] font-semibold text-center shadow-sm">
                  ⚠️ Preview Mode: To sign in with Google popup, use <span className="font-bold underline">Open in New Tab</span>, or use Continue with Email.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ==================================================================== */
          /* VIEW 2: Email & Password Form (Fully Functional & Interactive)        */
          /* ==================================================================== */
          <motion.div
            key="form-view"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-5 sm:p-7 flex flex-col items-center gap-3.5 sm:gap-4 text-center my-auto relative shadow-2xl z-10 scrollbar-none"
          >
            {/* Interactive Mascot Top */}
            <motion.div 
              animate={mascotControls} 
              className="w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform pt-1"
            >
              <Mascot
                mood={mascotMood}
                onClick={handleMascotTap}
                onPointerMove={handleMascotPointerMove}
                onPointerLeave={handleMascotPointerLeave}
              />
            </motion.div>

            {/* Form Title */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {isSignUp ? "Join Nexora and grow your daily flow garden" : "Enter your email and password to continue"}
              </p>
            </div>

            {/* Error Card */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-2xl text-xs font-semibold flex flex-col gap-1.5 text-left shadow-sm relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="font-bold leading-snug">{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearErrorState}
                      className="text-rose-400 hover:text-rose-700 p-0.5 rounded-lg"
                      aria-label="Dismiss error"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {error === "An account with this email already exists." && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        clearErrorState();
                      }}
                      className="text-xs font-bold text-rose-700 underline pl-6 hover:text-rose-950 text-left"
                    >
                      Click here to Sign In instead
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset Password Success Message */}
            {resetSuccessMessage && (
              <div className="w-full bg-emerald-50 text-emerald-800 p-3 rounded-2xl text-xs font-semibold flex items-start gap-2 text-left border border-emerald-200 shadow-sm">
                <span className="text-base">✉️</span>
                <div>
                  <p className="font-bold leading-relaxed">{resetSuccessMessage}</p>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">
                    Security: All plants, stats, coins, and levels remain 100% safe!
                  </p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleEmailAuth} noValidate className="w-full space-y-3.5">
              <div className="space-y-3 text-left">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleBlur}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isResettingPassword}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all focus:outline-none"
                    >
                      {isResettingPassword
                        ? "Sending security link..."
                        : "Forgot Password?"}
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full h-12 bg-[#258bfb] hover:bg-[#1c7ee9] text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSigningIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Or
              </span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Google Alternative in Form View */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full h-12 bg-white text-slate-800 font-bold text-sm rounded-xl transition-all shadow-sm border border-slate-200 active:scale-[0.98] flex items-center justify-center gap-2.5 hover:bg-slate-50 cursor-pointer disabled:opacity-70"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Form Footer Switcher */}
            <p className="text-xs text-slate-600 font-medium pt-1">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  vibrate(10);
                  setIsSignUp(!isSignUp);
                  clearErrorState();
                  setTapCount(0);
                }}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

