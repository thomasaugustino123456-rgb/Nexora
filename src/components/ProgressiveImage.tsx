import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image as ImageIcon } from "lucide-react";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  plain?: boolean;
}

export function ProgressiveImage({ src, alt, className = "", aspectRatioClass = "aspect-[3/2]", plain = false }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
    img.onerror = () => {
      setError(true);
      setIsLoaded(true); // stop loading state on error to show error state
    };
  }, [src]);

  return (
    <div 
      className={`relative overflow-hidden ${
        plain 
          ? "bg-transparent border-none shadow-none" 
          : "bg-blue-950/5 rounded-2xl border border-blue-100/50"
      } ${aspectRatioClass} ${className}`} 
      id={`prog-img-${src.split("/").pop()?.split(".")[0] || "custom"}`}
    >
      {/* Shimmer loading skeleton */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 flex flex-col items-center justify-center ${
              plain 
                ? "bg-transparent" 
                : "bg-gradient-to-br from-blue-50/50 to-blue-100/30"
            } animate-pulse z-10`}
          >
            <div className="relative">
              {/* Spinning active ring */}
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              <ImageIcon className="w-5 h-5 text-blue-500/40 absolute inset-0 m-auto" />
            </div>
            <span className="text-[10px] font-black text-blue-500/40 tracking-wider uppercase mt-3 animate-pulse">
              Optimizing...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual image */}
      {!error ? (
        <motion.img
          initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          animate={isLoaded ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain relative z-0"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2 rounded-2xl">
          <ImageIcon className="w-8 h-8 text-slate-300" />
          <span className="text-xs font-semibold">Image failed to load</span>
        </div>
      )}

      {/* Ambient gradient overlay */}
      {!plain && (
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/5 via-transparent to-transparent pointer-events-none" />
      )}
    </div>
  );
}
