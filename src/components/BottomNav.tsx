import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NavButton } from './NavButton';
import { VIBRATION_PATTERNS } from '../lib/vibrate';
// I'll need to import the vibrate and play functions, but they are defined in App.tsx. 
// I'll need to pass them as props.

export const BottomNav = ({
  activeScreen,
  setActiveScreen,
  settings,
  navItems,
  play,
  vibrate,
  translate,
  isRankGlowActive
}: {
  activeScreen: string;
  setActiveScreen: (screen: any) => void;
  settings: any;
  navItems: any;
  play: (sound: string) => void;
  vibrate: (pattern: number[]) => void;
  translate: (text: string, lang: string) => string;
  isRankGlowActive?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Always show near top of the page
      if (scrollY < 60) {
        if (!isVisibleRef.current) {
          isVisibleRef.current = true;
          if (containerRef.current) {
            containerRef.current.style.transform = "translateY(0px)";
            containerRef.current.style.opacity = "1";
          }
        }
        lastScrollY = scrollY;
        ticking = false;
        return;
      }

      const diff = scrollY - lastScrollY;

      // Filter out small scroll jitter (< 10px) to prevent stutter
      if (Math.abs(diff) > 10) {
        if (diff > 0 && isVisibleRef.current) {
          // Scrolling down -> Hide BottomNav smoothly via GPU transform
          isVisibleRef.current = false;
          if (containerRef.current) {
            containerRef.current.style.transform = "translateY(110%)";
            containerRef.current.style.opacity = "0";
          }
        } else if (diff < 0 && !isVisibleRef.current) {
          // Scrolling up -> Show BottomNav smoothly
          isVisibleRef.current = true;
          if (containerRef.current) {
            containerRef.current.style.transform = "translateY(0px)";
            containerRef.current.style.opacity = "1";
          }
        }
        lastScrollY = scrollY;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 p-3 sm:p-5 flex justify-center pointer-events-none z-[80] transition-all duration-300 ease-out will-change-transform"
    >
      <nav className="bg-white/95 backdrop-blur-lg border border-slate-200/85 shadow-2xl px-2 py-1 rounded-[2rem] flex items-center justify-around gap-0.5 pointer-events-auto w-[96%] max-w-[370px] sm:max-w-[440px] h-[60px] sm:h-[66px] overflow-hidden select-none">
        {(settings.navOrder || Object.keys(navItems)).map(
          (id: string) => {
            const item = navItems[id];
            if (!item) return null;
            if (id === "social") return null;
            const isHidden = settings.hiddenNavItems?.includes(id);
            if (isHidden) return null;

            return (
              <NavButton
                key={id}
                active={activeScreen === item.screen}
                glow={id === "leaderboard" && isRankGlowActive}
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  if (settings?.soundEnabled !== false) play("nav_switch");
                  if (id === "leaderboard") {
                    localStorage.setItem("nexora_scrolling_to_user_rank", "true");
                  }
                  setActiveScreen(item.screen);
                }}
                icon={item.icon}
                label={translate(item.label, settings.language || "en")}
              />
            );
          },
        )}
      </nav>
    </div>
  );
};
