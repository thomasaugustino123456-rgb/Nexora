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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

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
        localStorage.setItem("nexora_cached_user", userCredential.user.uid);
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", result.user.uid), googleUserData, { merge: true });
      await setDoc(doc(db, "user", result.user.uid), googleUserData, { merge: true });
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
      className="fixed inset-0 bg-blue-50 flex items-center justify-center p-6 overflow-y-auto"
    >
      {onBack && (
        <button
          onClick={() => {
            vibrate(10);
            onBack();
          }}
          className="absolute top-6 left-6 p-3 rounded-full bg-white/50 text-blue-900/60 hover:bg-white/80 hover:text-blue-900 transition-all z-20 shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-8 md:p-10 flex flex-col items-center gap-6 text-center max-w-md w-full my-auto relative"
      >
        {/* Mascot Container */}
        <motion.div animate={mascotControls} className="w-32 h-32 -mt-20 z-10">
          <Mascot
            mood={mascotMood}
            onClick={handleMascotTap}
            onPointerMove={handleMascotPointerMove}
            onPointerLeave={handleMascotPointerLeave}
          />
        </motion.div>

        <div className="space-y-2 mt-2 flex flex-col items-center">
          <div className="flex flex-col items-center gap-6">
            <MascotImage
              alt="Nexora Logo"
              className="w-48 h-48 object-cover rounded-[36px] shadow-2xl border-4 border-white/50"
            />
            <h1 className="text-7xl md:text-8xl font-black text-blue-900 tracking-tighter">
              Nexora
            </h1>
          </div>
          <p className="text-blue-900/60 font-medium text-2xl">
            Your personal flow companion
          </p>
        </div>

        {/* Nexora-Style Error Card */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full bg-rose-50/95 border border-rose-200/90 text-rose-900 p-4 rounded-2xl text-sm font-semibold flex flex-col gap-2 text-left shadow-md shadow-rose-900/5 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="bg-rose-100 p-1.5 rounded-xl text-rose-600 shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-rose-900 leading-snug pt-0.5">{error}</span>
                </div>
                <button
                  type="button"
                  onClick={clearErrorState}
                  className="text-rose-400 hover:text-rose-700 p-1 rounded-lg transition-colors shrink-0"
                  aria-label="Dismiss error"
                >
                  <X size={16} />
                </button>
              </div>

              {error === "An account with this email already exists." && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    clearErrorState();
                  }}
                  className="text-xs font-bold text-rose-700 underline pl-8 hover:text-rose-950 text-left transition-colors"
                >
                  Click here to Sign In instead
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {resetSuccessMessage && (
          <div className="w-full bg-green-50 text-green-700 p-3.5 rounded-2xl text-sm font-semibold flex items-start gap-2 text-left border border-green-100 shadow-sm">
            <span className="text-lg">✉️</span>
            <div>
              <p className="font-bold leading-relaxed">{resetSuccessMessage}</p>
              <p className="text-[10px] text-green-600 font-bold uppercase mt-1">
                Security confirmation: All garden items, stats, levels, and
                notes remain 100% saved!
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleEmailAuth} noValidate className="w-full space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-900/40">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleBlur}
                placeholder="Email address"
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-blue-900 placeholder:text-blue-900/40 font-medium transition-all"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-900/40">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={handleBlur}
                placeholder="Password"
                className="w-full pl-11 pr-12 py-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-blue-900 placeholder:text-blue-900/40 font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-900/40 hover:text-blue-900/60 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isSignUp && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all focus:outline-none"
                >
                  {isResettingPassword
                    ? "Sending security link..."
                    : "Forgot/Set Password for Google Account Users"}
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSigningIn}
            className={`w-full text-white py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
              isSigningIn
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20"
            }`}
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

        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px bg-blue-900/10"></div>
          <span className="text-xs font-bold text-blue-900/40 uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-blue-900/10"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className={`w-full bg-white text-blue-900 py-3.5 rounded-xl font-bold text-lg transition-all shadow-sm border border-blue-100 active:scale-95 flex items-center justify-center gap-3 ${
            isSigningIn
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-blue-50 hover:shadow-md"
          }`}
        >
          <GoogleIcon />
          Google
        </button>

        {isInIframe && (
          <div className="w-full bg-amber-50/70 border border-amber-200/50 text-amber-800 p-3 rounded-xl text-[11px] font-semibold leading-relaxed text-left flex items-start gap-2 shadow-sm">
            <span className="text-sm">⚠️</span>
            <div>
              <span className="font-bold text-amber-900 block mb-0.5">Iframe Preview Mode:</span>
              Browser cross-origin security blocks Google popups inside frames. To sign in with Google, click the <span className="font-bold text-blue-600 underline">Open in New Tab</span> icon in the top right, or use the Email & Password fields above.
            </div>
          </div>
        )}

        <p className="text-sm text-blue-900/60 font-medium pt-2">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              clearErrorState();
              setTapCount(0);
            }}
            className="text-blue-600 font-bold hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

