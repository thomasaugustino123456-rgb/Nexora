import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function AnimatedBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 15) {
          clearInterval(timer);
          return 15;
        }
        return prev + 1;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg
        width="200"
        height="200"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-blue-500 drop-shadow-2xl"
      >
        {/* Handle - Fixed at the very top */}
        <path
          d="M10 3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V4C14 4.55228 13.5523 5 13 5H11C10.4477 5 10 4.55228 10 4V3Z"
          fill="#1E3A8A"
          fillOpacity="0.2"
        />
        
        {/* Swinging Bell Body */}
        <motion.g
          animate={{
            rotate: [0, -15, 12, -10, 8, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "12px", originY: "4px" }}
        >
          {/* Main Bell Shape */}
          <path
            d="M18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8V11.5L3.5 15.5C3.18182 16.0364 3 16.6545 3 17.3C3 18.2392 3.76076 19 4.7 19H19.3C20.2392 19 21 18.2392 21 17.3C21 16.6545 20.8182 16.0364 20.5 15.5L18 11.5V8Z"
            fill="currentColor"
          />
          
          {/* Bell Highlight */}
          <path
            d="M10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6V8C14 8.55228 13.5523 9 13 9H11C10.4477 9 10 8.55228 10 8V6Z"
            fill="white"
            fillOpacity="0.2"
          />

          {/* Swinging Clapper inside the body */}
          <motion.circle
            cx="12"
            cy="19"
            r="2"
            fill="#1E3A8A"
            animate={{
              x: [-4, 4, -4, 4, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.g>
      </svg>

      {/* Badge with pulse and counter */}
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-12 right-12 z-10"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 0 0px rgba(239, 68, 68, 0.4)",
                "0 0 0 10px rgba(239, 68, 68, 0)",
                "0 0 0 0px rgba(239, 68, 68, 0)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-12 h-12 bg-red-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl"
          >
            <span className="text-white font-black text-lg tabular-nums">
              {count}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
