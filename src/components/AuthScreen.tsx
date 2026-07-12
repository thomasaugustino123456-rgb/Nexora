import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { motion, useAnimationControls } from "motion/react";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Mascot, MascotMood } from "./Mascot";
import { ArrowLeft } from "lucide-react";
import { vibrate } from "../lib/vibrate";
import { MascotImage } from "./MascotImage";
import nexoraAppIconImg from "../assets/images/nexora_app_icon.png";

const nexoraAppIcon = "/assets/mascot.png";

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
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  // Mascot Interaction State
  const [tapCount, setTapCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mascotControls = useAnimationControls();

  // Calming down state
  const [lastY, setLastY] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);

  // Determine Mascot Mood
  let mascotMood: MascotMood = "neutral";
  if (isSuccess) {
    mascotMood = "happy";
  } else if (tapCount >= 6) {
    mascotMood = "boiling";
  } else if (tapCount >= 5) {
    mascotMood = "angry";
  } else if (error) {
    mascotMood = "angry";
  } else if (isTyping) {
    mascotMood = "happy";
  } else if (tapCount > 0) {
    mascotMood = "happy";
  }

  const triggerJump = async () => {
    await mascotControls.start({
      y: -20,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    });
    await mascotControls.start({
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    });
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
          // significant vertical movement
          setMoveCount((prev) => {
            const newCount = prev + 1;
            if (newCount > 8) {
              setTapCount(0); // calm down
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
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsTyping(true);
    if (error) setError("");
  };

  const handleBlur = () => {
    setIsTyping(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    vibrate(20);
    if (isSigningIn || !email || !password) return;

    setIsSigningIn(true);
    setError("");
    setIsTyping(false);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        const signUpData = {
            name: 'Champion',
            displayName: 'Champion',
            "Name": 'Champion',
            email: email,
            "Email": email,
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
            "Email address": email,
            uid: userCredential.user.uid,
            role: 'user',
            accountName: 'Champion',
            "Account name": 'Champion',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", userCredential.user.uid), signUpData);
        await setDoc(doc(db, "user", userCredential.user.uid), signUpData);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setIsSuccess(true);
      triggerJump();
    } catch (err: any) {
      console.warn("Handled email auth error info:", err.message);
      setError(`Auth error: ${err.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    vibrate(15);
    setError("");
    setResetSuccessMessage("");
    if (!email) {
      setError(
        "Please type your email address first so we know where to send the link!",
      );
      return;
    }

    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSuccessMessage(
        "Reset request submitted! ✉️ Check your email inbox for the reset link! 🚀",
      );
      triggerJump();
    } catch (err: any) {
      console.warn("Forgot password request failed:", err);
      setError(`Failed to send password reset: ${err.message}`);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleGoogleSignIn = async () => {
    vibrate(15);
    if (isSigningIn) return;
    setIsSigningIn(true);
    setError("");
    setIsTyping(false);

    if (window.self !== window.top) {
      setError(
        "Google Sign-In is blocked inside the iframe preview by browser cross-origin security rules. Please click the 'Open in New Tab' icon in the top-right corner of the window to use Google Sign-In, or log in instantly using Email & Password above!"
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
      setIsSuccess(true);
      triggerJump();
    } catch (err: any) {
      console.warn("Error signing in with Google:", err);
      setError(`Failed to sign in with Google: ${err.message}`);
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

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex flex-col gap-2 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {error.includes("Invalid email or password") && (
              <p className="text-[10px] text-red-500 font-bold uppercase pl-7 leading-normal">
                Tip: If you originally joined via Google, please sign in with
                Google or enter your email & tap "Forgot/Set Password" to add a
                password to your Google account!
              </p>
            )}
            {error.includes("already exists") && (
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
                className="text-xs font-bold text-red-700 underline pl-7 hover:text-red-900 text-left"
              >
                Click here to Sign In instead
              </button>
            )}
          </div>
        )}

        {resetSuccessMessage && (
          <div className="w-full bg-green-50 text-green-700 p-3.5 rounded-xl text-sm font-semibold flex items-start gap-2 text-left border border-green-100">
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

        <form onSubmit={handleEmailAuth} className="w-full space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-900/40">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
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
                required
                value={password}
                onChange={handlePasswordChange}
                onBlur={handleBlur}
                placeholder="Password"
                minLength={6}
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
              setError("");
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
