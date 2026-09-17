import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Check, 
  Maximize2, 
  Minimize2,
  Sparkles,
  PlusCircle,
  Flame,
  Crown,
  RefreshCw
} from 'lucide-react';
import { UserStats, UserSettings, CustomPlan, ChallengeStep, LeaderboardEntry } from '../types';
import { GardenState } from '../types/garden';

interface MascotAIProps {
  stats: UserStats;
  settings: UserSettings;
  showToast?: (m: string, t: any) => void;
  onSaveCustomPlan?: (plan: CustomPlan) => Promise<void> | void;
  onUpdateSettings?: (updater: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
  isPro?: boolean;
  onOpenSubscription?: () => void;
  customPlans?: CustomPlan[];
  gardenState?: GardenState;
  userRank?: number;
  leaderboard?: LeaderboardEntry[];
  onOpenPlant?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  action?: {
    type: 'create_challenge' | 'update_name' | 'show_rank_guidance' | 'relax_breathing' | 'open_plants' | 'show_plant_care';
    payload?: any;
    challenge?: any;
    newName?: string;
  };
  actionApplied?: boolean;
}

const STEP_LABELS: Record<string, { label: string; icon: string }> = {
  pushups: { label: 'Pushups & Form', icon: '🏋️' },
  water: { label: 'Hydration Intake', icon: '💧' },
  breathing: { label: 'Box Breathing', icon: '🌬️' },
  drawing: { label: 'Mindful Sketch', icon: '🎨' },
  football: { label: 'Agility & Reflexes', icon: '⚽' },
  bubbles: { label: 'Focus Bubbles', icon: '🫧' },
  memory: { label: 'Memory Matrix', icon: '🧠' },
  gratitude: { label: 'Gratitude Reflection', icon: '🙏' },
  reaction: { label: 'Reaction Velocity', icon: '⚡' },
  meditation: { label: 'Inner Stillness', icon: '🧘' },
  writing: { label: 'Reflective Journal', icon: '✍️' }
};

// Curated Free Companion Motivation Pool (zero API tokens used)
const FREE_MOTIVATION_POOL = [
  {
    speech: "Discipline is choosing between what you want now and what you want most.",
    tip: "Complete your daily flow challenges today to keep your streak burning bright!",
    sticker: "🔥",
    highlight: "Streak Guardian"
  },
  {
    speech: "Small, consistent actions done every single day create legendary results over time.",
    tip: "Even 10 pushups and 500ml of clean water fuels unstoppable momentum!",
    sticker: "⚡",
    highlight: "Daily Consistency"
  },
  {
    speech: "Champions don't rely on mood—they rely on standards. You already won half the battle by showing up!",
    tip: "Take 60 seconds to do deep box breathing and reset your mind for focus.",
    sticker: "🧘",
    highlight: "Mindset Over Mood"
  },
  {
    speech: "Every habit you complete feeds your botanical garden plant and builds unbreakable confidence.",
    tip: "Water your plant or log hydration to earn +15 plant growth points directly!",
    sticker: "🌱",
    highlight: "Botanical Growth"
  },
  {
    speech: "Never break the chain two days in a row. Bad days happen, but true warriors always protect the streak!",
    tip: "Check the leaderboard to see how close you are to the top spots in your league!",
    sticker: "🏆",
    highlight: "Unbreakable Chain"
  },
  {
    speech: "Focus on winning today. You don't have to conquer the whole year right now—just win this hour!",
    tip: "Drink a glass of cold water right now to trigger immediate physical alertness.",
    sticker: "💧",
    highlight: "Win The Day"
  }
];

// Mascot Avatar with fallback to friendly SVG Mascot Slime
function MascotAvatarIcon({ size = 32 }: { size?: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      className="rounded-full overflow-hidden bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center shrink-0 border border-blue-200/80 shadow-xs select-none"
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <img
          src="/mascot.png"
          alt="Nex Mascot"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full p-1 text-white"
          fill="currentColor"
        >
          {/* Cute Slime Mascot Shape */}
          <path d="M20,4 C10,4 5,14 5,24 C5,32 11,36 20,36 C29,36 35,32 35,24 C35,14 30,4 20,4 Z" fill="#38bdf8" />
          {/* Left Eye */}
          <circle cx="15" cy="19" r="2.5" fill="#0f172a" />
          <circle cx="16" cy="18" r="0.9" fill="#ffffff" />
          {/* Right Eye */}
          <circle cx="25" cy="19" r="2.5" fill="#0f172a" />
          <circle cx="26" cy="18" r="0.9" fill="#ffffff" />
          {/* Blush */}
          <ellipse cx="12" cy="23" rx="2" ry="1.2" fill="#f43f5e" opacity="0.6" />
          <ellipse cx="28" cy="23" rx="2" ry="1.2" fill="#f43f5e" opacity="0.6" />
          {/* Sweet Smile */}
          <path d="M17,23 Q20,27 23,23" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

// Smart context-aware mascot reaction sticker based on message text
function getMascotSticker(content: string): { sticker: string; label: string; bg: string; text: string } | null {
  const lower = content.toLowerCase();

  if (lower.includes("pushup") || lower.includes("workout") || lower.includes("chest") || lower.includes("fitness") || lower.includes("iron core")) {
    return { sticker: "💪", label: "Beast Mode", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" };
  }
  if (lower.includes("water") || lower.includes("hydrat") || lower.includes("drink")) {
    return { sticker: "💧", label: "Stay Hydrated", bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-700" };
  }
  if (lower.includes("breath") || lower.includes("zen") || lower.includes("calm") || lower.includes("meditat") || lower.includes("relax")) {
    return { sticker: "🧘", label: "Inner Peace", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" };
  }
  if (lower.includes("leaderboard") || lower.includes("rank") || lower.includes("champion") || lower.includes("trophy")) {
    return { sticker: "🏆", label: "Champion Vibe", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" };
  }
  if (lower.includes("streak") || lower.includes("discipline") || lower.includes("fire") || lower.includes("power")) {
    return { sticker: "🔥", label: "Keep The Flame", bg: "bg-orange-50 border-orange-200", text: "text-orange-700" };
  }
  if (lower.includes("doctor") || lower.includes("medical") || lower.includes("safety") || lower.includes("professional")) {
    return { sticker: "🛡️", label: "Care First", bg: "bg-rose-50 border-rose-200", text: "text-rose-700" };
  }
  if (lower.includes("hey") || lower.includes("ready") || lower.includes("let's go") || lower.includes("crush")) {
    return { sticker: "✨", label: "Ready to Roll!", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" };
  }
  return null;
}

// Clean text / markdown renderer for ChatGPT app feel
function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed select-text">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bold formatting parser
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        // Bullet point check
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-blue-500 font-bold shrink-0">•</span>
              <span>{formattedLine}</span>
            </div>
          );
        }

        return <p key={idx}>{formattedLine}</p>;
      })}
    </div>
  );
}

export function MascotAI({
  stats,
  settings,
  showToast,
  onSaveCustomPlan,
  onUpdateSettings,
  isPro = false,
  onOpenSubscription,
  customPlans = [],
  gardenState,
  userRank,
  leaderboard = [],
  onOpenPlant
}: MascotAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const userDisplayName = settings.displayName || 'Champion';
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hey ${settings.displayName || 'Champion'}! Ready to crush your goals today? What are we focusing on?`,
      timestamp: Date.now()
    }
  ]);
  const [showProGateModal, setShowProGateModal] = useState(false);
  const [showFreeMotivationModal, setShowFreeMotivationModal] = useState(false);
  const [motivationIndex, setMotivationIndex] = useState(0);

  const effectiveIsPro = Boolean(isPro || settings.isPro || settings.proTestActive);
  const isChatOpen = effectiveIsPro && isOpen;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen, loading]);

  // Compute live effective rank & plant state
  const getComputedContext = () => {
    let effectiveRank: number | null = (typeof userRank === 'number' && userRank > 0) ? userRank : null;
    const effectiveLeaderboard = (leaderboard && leaderboard.length > 0)
      ? leaderboard
      : (() => {
          try {
            const cached = localStorage.getItem("nexora_leaderboard_cache");
            return cached ? JSON.parse(cached) : [];
          } catch {
            return [];
          }
        })();

    if (!effectiveRank && effectiveLeaderboard.length > 0) {
      const currentUid = (stats as any).uid || (settings as any).uid;
      const idx = effectiveLeaderboard.findIndex((e: any) => (currentUid && e.uid === currentUid) || (e.displayName && e.displayName === userDisplayName));
      if (idx !== -1) {
        effectiveRank = idx + 1;
      }
    }

    const plantType = settings.plantState?.type || 'sprout';
    const currentStage = settings.plantState?.stage ?? 0;
    const growthPoints = settings.plantState?.growthPoints ?? 0;
    const health = settings.plantState?.health ?? 100;
    const isThirsty = Boolean(settings.plantState?.isThirsty);
    const isDead = Boolean(settings.plantState?.isDead);
    const stageNames = ['Seed', 'Sprout', 'Seedling', 'Budding', 'Blooming', 'Fully Grown / Flowering'];

    const unlockedTypes = Array.from(new Set([
      'sprout',
      ...(settings.plantState?.unlockedTypes || []),
      ...Object.keys(settings.plantsProgress || {})
    ]));

    const unlockedPlantsDetails = unlockedTypes.map(t => {
      const prog = (settings.plantsProgress as any)?.[t] || (t === plantType ? settings.plantState : null) || { stage: 0 };
      return {
        type: t,
        stage: prog.stage ?? 0,
        stageName: stageNames[Math.min(prog.stage ?? 0, 5)],
        health: prog.health ?? 100,
        isThirsty: Boolean(prog.isThirsty),
        isDead: Boolean(prog.isDead),
        growthPoints: prog.growthPoints ?? 0
      };
    });

    const stage5Count = unlockedPlantsDetails.filter(p => p.stage >= 5).length;

    let pointsNeededToClimb: number | null = null;
    let playerAheadName: string | null = null;
    if (effectiveRank && effectiveRank > 1 && effectiveLeaderboard[effectiveRank - 2]) {
      const ahead = effectiveLeaderboard[effectiveRank - 2];
      playerAheadName = ahead.displayName;
      const aheadXP = ahead.weeklyXP ?? ahead.xp ?? ahead.weeklyPoints ?? 0;
      const userXP = stats.weeklyXP ?? stats.xp ?? 0;
      pointsNeededToClimb = Math.max(1, aheadXP - userXP + 10);
    }

    return {
      effectiveRank,
      effectiveLeaderboard,
      league: settings.league || (stats as any).league || 'Bronze',
      pointsNeededToClimb,
      playerAheadName,
      plantType,
      currentStage,
      stageNames,
      growthPoints,
      health,
      isThirsty,
      isDead,
      unlockedPlantsDetails,
      stage5Count,
      spaceHouseUnlocked: Boolean(settings.spaceHouseUnlocked || stage5Count >= 3)
    };
  };

  // Local fallback response generator with complete real context grounding
  const generateLocalFallback = (text: string, name: string): { content: string; action?: any } => {
    const lower = text.toLowerCase();
    const ctx = getComputedContext();

    // 1. Choice / Option Decision Request (e.g. "either Atlas or Orion, you choose", "pick between X or Y")
    const isChoiceRequest = /\b(?:choose|pick|between|either)\b/i.test(lower);
    const optionsMatch = lower.match(/(?:between|either)\s+["']?([A-Za-z0-9_ -]+?)["']?\s+(?:or|and)\s+["']?([A-Za-z0-9_ -]+?)["']?(?:\s*[,.!?]|\s+you\s+(?:choose|pick)|$)/i);
    
    if (isChoiceRequest && optionsMatch && optionsMatch[1] && optionsMatch[2]) {
      const opt1 = optionsMatch[1].trim().replace(/^(?:my\s+name\s+to\s+|a\s+|the\s+)/i, '');
      const opt2 = optionsMatch[2].trim().replace(/\s+you\s+(?:choose|pick).*$/i, '');
      const chosen = opt1.charAt(0).toUpperCase() + opt1.slice(1);
      const alt = opt2.charAt(0).toUpperCase() + opt2.slice(1);

      if (lower.includes('name') || lower.includes('profile')) {
        return {
          content: `Between **${chosen}** and **${alt}**, I choose **${chosen}**! ⚡\n\nIt sounds bold, grounded, and commands unbreakable discipline—perfect for your Level ${stats.level || 1} journey and ${stats.streak || 0}-day streak. I've prepared your name update below, tap to apply it immediately!`,
          action: {
            type: 'update_name',
            newName: chosen,
            payload: { name: chosen }
          }
        };
      } else {
        return {
          content: `Between **${chosen}** and **${alt}**, I choose **${chosen}**! It sets a powerful momentum for your daily streak. Tap below to add this challenge to your custom plan!`,
          action: {
            type: 'create_challenge',
            challenge: {
              name: chosen,
              icon: '⚡',
              color: '#3b82f6',
              challenges: ['pushups', 'water', 'breathing'],
              steps: ['pushups', 'water', 'breathing'],
              days: [0, 1, 2, 3, 4, 5, 6],
              reminderTime: '08:30',
              targetDesc: `Daily target: ${chosen}`
            }
          }
        };
      }
    }

    // 2. Suggestions Request (e.g. "suggest some profile names", "recommend a challenge")
    const isSuggestionRequest = /\b(?:suggest|recommend|give me|ideas for)\b.*\b(?:name|names|profile|challenge|challenges|routine)\b/i.test(lower);
    if (isSuggestionRequest) {
      if (lower.includes('name') || lower.includes('profile')) {
        return {
          content: `Here are 3 awesome name ideas tailored for your discipline, ${name}:\n\n1. **Atlas** — Grounded, unbreakable strength that carries heavy loads with ease.\n2. **Orion** — The celestial hunter; sharp focus and laser precision towards your goals.\n3. **Vanguard** — The leader at the front line of consistency.\n\n**My Recommendation:** I pick **Atlas** for you! It has that classic stoic presence. Tap below to set your name to Atlas, or let me know if you want another!`,
          action: {
            type: 'update_name',
            newName: 'Atlas',
            payload: { name: 'Atlas' }
          }
        };
      } else {
        return {
          content: `Here are 3 custom challenge ideas for you, ${name}:\n\n1. **Morning Spartan Routine** — 20 pushups & 500ml cold water right after waking up.\n2. **Midday Reset Protocol** — 3 minutes box breathing & gratitude reflection.\n3. **Evening Unwind & Hydrate** — Gentle stretches & 1L clean water.\n\n**My Recommendation:** I pick **Morning Spartan Routine** because starting your day with physical momentum makes everything else feel easy! Tap below to add it:`,
          action: {
            type: 'create_challenge',
            challenge: {
              name: 'Morning Spartan Routine',
              icon: '💪',
              color: '#3b82f6',
              challenges: ['pushups', 'water'],
              steps: ['pushups', 'water'],
              days: [0, 1, 2, 3, 4, 5, 6],
              reminderTime: '08:00',
              targetDesc: '20 Pushups & 500ml Water'
            }
          }
        };
      }
    }

    // 3. Medical / health boundary guardrail
    if (lower.includes('doctor') || lower.includes('sick') || lower.includes('medicine') || lower.includes('pill') || lower.includes('pain') || lower.includes('disease') || lower.includes('diagnose')) {
      return {
        content: `I care deeply about your wellness, ${name}! As your habit and discipline coach, I can't give medical diagnoses or treatment advice. For any persistent pain or symptoms, please consult a healthcare professional. Let's focus on gentle hydration or light breathing instead!`
      };
    }

    // 4. Comprehensive Multi-part Query (Stats, Rank, Climbing, Plants, Care, Unlocking)
    const asksAboutRank = /\b(rank|leaderboard|position|climb|standing|league)\b/i.test(lower);
    const asksAboutStats = /\b(xp|coins|coin|streak|level|stats|points|gems)\b/i.test(lower);
    const asksAboutPlants = /\b(plant|plants|garden|seed|seeds|sprout|flower|improve|unlock|care|water)\b/i.test(lower);

    if ((asksAboutRank && asksAboutPlants) || (asksAboutStats && asksAboutPlants) || (asksAboutRank && asksAboutStats)) {
      const rankText = ctx.effectiveRank 
        ? `You are currently holding **Rank #${ctx.effectiveRank}** in the **${ctx.league} League**! ${ctx.playerAheadName ? `Rank #${ctx.effectiveRank - 1} is held by **${ctx.playerAheadName}** (${ctx.pointsNeededToClimb} XP ahead).` : "You are right at the very top of your division!"}`
        : `You are in the **${ctx.league} League**! Complete your first challenge today to secure an official placement on this week's board.`;

      const plantStatusText = `Your active botanical plant is **${ctx.plantType.toUpperCase()}** (Stage **${ctx.currentStage}/5**: *${ctx.stageNames[Math.min(ctx.currentStage, 5)]}*). Health is at **${ctx.health}%**, and it is currently **${ctx.isThirsty ? "thirsty—water it now!" : "well-hydrated"}**. You have **${ctx.unlockedPlantsDetails.length}** species unlocked (${ctx.unlockedPlantsDetails.map((p: any) => `${p.type} Lv.${p.stage}`).join(', ')}).`;

      return {
        content: `Here is your complete live status breakdown, ${name}! 📊🌱\n\n### ⚡ Your Current Stats\n• **Streak:** 🔥 **${stats.streak || 0} Days** (Best: ${stats.bestStreak || stats.streak || 0} days)\n• **Total XP:** ⭐ **${stats.xp || 0} XP** (Level **${stats.level || 1}**)\n• **Weekly XP:** 📈 **${stats.weeklyXP || 0} XP**\n• **Nexora Coins:** 🪙 **${stats.coins || 0} Coins** | **Gems:** 💎 **${stats.gems || 0}**\n\n### 🏆 Rank & Leaderboard Position\n• ${rankText}\n• **How to climb higher:**\n  1. **Daily Flows:** Complete your primary challenge flow for +50–100 XP.\n  2. **Daily Quests:** Check your quests daily for high-yield XP bounties.\n  3. **Streak Multipliers:** Maintain your streak daily—streak chests grant massive XP multipliers.\n  4. **Shop Boosters:** Pop a **Double XP** or **XP Overdrive** from the shop if you have coins to leapfrog ahead!\n\n### 🌿 Your Plants & Botanical Garden\n• ${plantStatusText}\n• **How to care for & improve your plant:**\n  1. **Water Daily:** Logging water or completing the hydration challenge grants **+15 growth points** directly to your plant.\n  2. **Restore Health:** If health dips or your plant wilts, water it immediately or use **Nano Fertilizer** from the Plant Shop.\n  3. **Equip Gear:** Use the **UV Growth Lamp** (2x growth points) or **Eco Drone** in the Plant Shop for passive growth!\n• **How to get new plants:**\n  1. **Ecosystem Milestone:** Grow ANY plant to **Stage 5 (Fully Bloomed)** to automatically unlock the next species in the ecosystem (*Sprout ➔ Zen ➔ Desert ➔ Tropical ➔ Forest ➔ Meadow ➔ Crystal ➔ Volcano...*)!\n  2. **Space House:** Grow 3 plants to Stage 5 to unlock the secret Space House (${ctx.stage5Count}/3 completed)!\n  3. **Loot Seeds:** Maintain your streak to earn mystery Loot Seeds for rare botanical flora.`,
        action: onOpenPlant ? { type: 'open_plants' } : undefined
      };
    }

    // 5. Plant-only inquiries
    if (asksAboutPlants) {
      return {
        content: `Here's your botanical garden report, ${name}! 🌱\n\n• **Active Plant:** **${ctx.plantType.toUpperCase()}** (Stage **${ctx.currentStage}/5**: *${ctx.stageNames[Math.min(ctx.currentStage, 5)]}*)\n• **Health:** **${ctx.health}%** | **Thirst:** ${ctx.isThirsty ? "💧 Needs water immediately!" : "✨ Thriving & Hydrated"}\n• **Growth Points:** ${ctx.growthPoints}/100 points towards the next stage.\n• **Unlocked Species (${ctx.unlockedPlantsDetails.length}):** ${ctx.unlockedPlantsDetails.map((p: any) => `${p.type} (Stage ${p.stage}/5)`).join(', ')}.\n\n**Plant Care Tips:**\n1. Water it daily by logging your water intake or completing the water challenge (+15 growth points).\n2. If health drops below 50%, use **Nano Fertilizer** from the Plant Shop to bring it back to full vitality.\n3. Grow any plant to Stage 5 to unlock the next exotic species in your ecosystem!`,
        action: onOpenPlant ? { type: 'open_plants' } : undefined
      };
    }

    // 6. Rank-only inquiries
    if (asksAboutRank) {
      return {
        content: `Here is where you stand in the arena, ${name}: 🏆\n\n• **League:** **${ctx.league} League**\n• **Position:** ${ctx.effectiveRank ? `**Rank #${ctx.effectiveRank}** of ${ctx.effectiveLeaderboard.length || 15} competitors` : "**Unranked** (complete a challenge today to enter!)"}\n• **Weekly XP:** **${stats.weeklyXP || 0} XP**\n\n**How to Climb the Ranks:**\n1. Finish your Daily Flow to bank 50–100 XP instantly.\n2. Complete your Daily Quest for high-tier bonus XP.\n3. Keep your streak alive—higher streaks trigger weekly bonus chests that skyrocket your rank standing!\n4. Pick up **Double XP** from the shop to double every point you earn today!`
      };
    }

    // 7. Direct Name change request
    const nameMatch = text.match(/(?:call me|change my name to|set my name to|rename me to|update\s+(?:my\s+)?name(?:\s+to)?)\s+([A-Za-z0-9_ -]{2,20})/i);
    if (nameMatch && nameMatch[1] && !lower.includes('challenge') && !lower.includes('between') && !lower.includes('or')) {
      const newName = nameMatch[1].trim().replace(/\s+(?:please|bro|thanks).*$/i, '');
      return {
        content: `Got it! I've prepared your name update to **${newName}**. Tap the button below to apply it:`,
        action: {
          type: 'update_name',
          newName,
          payload: { name: newName }
        }
      };
    }

    // 8. Custom challenge request
    if (lower.includes('challenge') || lower.includes('routine') || lower.includes('plan') || lower.includes('workout') || lower.includes('pushup')) {
      let challengeName = 'Morning Power Surge';
      let steps: ChallengeStep[] = ['pushups', 'water', 'breathing'];
      let icon = '⚡';
      let targetDesc = '15 Pushups & 500ml Water';

      if (lower.includes('water') || lower.includes('hydrate')) {
        challengeName = 'Hydration Fortress';
        steps = ['water', 'breathing'];
        icon = '💧';
        targetDesc = 'Drink 2L Clean Water';
      } else if (lower.includes('mind') || lower.includes('breath') || lower.includes('relax') || lower.includes('meditat')) {
        challengeName = 'Zen Mind Sanctuary';
        steps = ['breathing', 'gratitude', 'meditation'];
        icon = '🧘';
        targetDesc = '10 Mins Box Breathing & Reflection';
      } else if (lower.includes('pushup') || lower.includes('chest') || lower.includes('body') || lower.includes('workout')) {
        challengeName = 'Iron Core Protocol';
        steps = ['pushups', 'water'];
        icon = '💪';
        targetDesc = '25 Pushups Daily';
      }

      return {
        content: `I've created a custom challenge for you: **${challengeName}**! Tap the button below to add it directly to your home plans:`,
        action: {
          type: 'create_challenge',
          challenge: {
            name: challengeName,
            icon,
            color: '#3b82f6',
            challenges: steps,
            steps,
            days: [0, 1, 2, 3, 4, 5, 6],
            reminderTime: '08:30',
            targetDesc
          },
          payload: {
            name: challengeName,
            icon,
            color: '#3b82f6',
            challenges: steps,
            steps,
            days: [0, 1, 2, 3, 4, 5, 6],
            reminderTime: '08:30',
            targetDesc
          }
        }
      };
    }

    // 9. Quick "Am I Pro?" or status inquiry (direct and simple)
    const isDirectProStatusCheck = /\b(am i pro|is my pro|do i have pro|check my pro|my pro status|what tier am i|my tier)\b/i.test(lower);
    if (isDirectProStatusCheck) {
      const isProTest = Boolean(settings.proTestActive);
      const daysLeft = settings.proTestExpiresAt ? Math.max(0, Math.ceil((new Date(settings.proTestExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
      if (isProTest) {
        return {
          content: `Yes! You are currently on the **4-Day Free Pro Test** ($0.00 trial, ${daysLeft !== null ? `${daysLeft} days remaining` : 'active'}) with all Pro features unlocked 👑`
        };
      } else if (effectiveIsPro) {
        return {
          content: `Yes! You are an active **Nexora Pro Member** with full lifetime/subscription privileges unlocked 👑`
        };
      } else {
        return {
          content: `You're currently on the **Free Tier**. You can start a **4-Day Free Pro Test ($0.00)** anytime in the Pro tab to test all features!`
        };
      }
    }

    // 10. Pro & Subscription Tiers, Money, Offers inquiry
    const asksAboutPro = /\b(pro|subscription|pricing|price|cost|tier|tiers|trial|test|pay|offers|money|plans)\b/i.test(lower);
    if (asksAboutPro) {
      const isProTest = Boolean(settings.proTestActive);
      let proStatusText = "";
      if (isProTest) {
        const daysLeft = settings.proTestExpiresAt ? Math.max(0, Math.ceil((new Date(settings.proTestExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
        proStatusText = `You're currently enjoying the **4-Day Free Pro Test** ($0.00 trial, ${daysLeft !== null ? `${daysLeft} days left` : 'active'}) with full Pro access active! 👑`;
      } else if (effectiveIsPro) {
        proStatusText = `You are currently an active **Nexora Pro Member**! You have full access to everything unlocked. 👑`;
      } else {
        proStatusText = `You are currently on the **Free Tier**. You can start a **4-Day Free Pro Test ($0.00)** anytime to try all Pro features risk-free!`;
      }

      return {
        content: `${proStatusText}\n\n**Nexora Pro Plans & Tiers:**\n• **4-Day Free Pro Test:** $0.00 (Try full Pro features risk-free)\n• **Monthly Pro:** $4.99 / month\n• **Yearly Pro:** $29.99 / year *(Best value - save over 50%!)*\n• **Lifetime Pass:** $49.99 one-time unlock forever\n\n**What Pro Unlocks:**\n- 24/7 Nex AI companion chat & custom challenges creator\n- Unlimited Custom Habit Routines & Flows\n- All Pro Themes, Emblems & Cosmetic Shop Perks\n- Plant Growth Boosters & 2x XP multipliers`
      };
    }

    // 11. Short Greetings (ChatGPT-style: concise, friendly & natural)
    const isGreeting = /^(hey|hi|hello|yo|sup|greetings|good morning|good evening|good afternoon|howdy)(\s+.*)?$/i.test(text.trim());
    if (isGreeting && text.trim().split(/\s+/).length <= 4) {
      return {
        content: `Hey ${name}! 🔥 Ready to lock in and crush some habits, or what's on your mind?`
      };
    }

    // 12. Short acknowledgments (ChatGPT-style: brief, human, direct)
    const isAcknowledgement = /^(ok|okay|cool|nice|got it|alright|bet|sure|done|sounds good|thx|thanks|thank you)(\s+.*)?$/i.test(text.trim());
    if (isAcknowledgement && text.trim().split(/\s+/).length <= 4) {
      if (/thanks|thank you|thx/i.test(text)) {
        return {
          content: `Anytime, ${name}! Always here in your corner. Let's keep that streak alive! 💪`
        };
      }
      return {
        content: `Let's get it! Go crush those goals today, ${name}! 🔥`
      };
    }

    // 13. General companion fallback
    return {
      content: `Hey ${name}! I'm right here with you. What would you like to focus on—checking your rank, reviewing plants, custom workout challenges, or Pro features?`
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    const ctx = getComputedContext();

    const isProTest = Boolean(settings.proTestActive);
    const proTestDaysLeft = settings.proTestExpiresAt ? Math.max(0, Math.ceil((new Date(settings.proTestExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

    const richUserContext = {
      displayName: userDisplayName,
      name: userDisplayName,
      streak: stats.streak || 0,
      bestStreak: stats.bestStreak || stats.streak || 0,
      xp: stats.xp || 0,
      weeklyXP: stats.weeklyXP || 0,
      weeklyPoints: stats.weeklyPoints || 0,
      coins: stats.coins || 0,
      gems: stats.gems || 0,
      level: stats.level || Math.floor((stats.xp || 0) / 100) + 1,
      league: ctx.league,
      rankPosition: ctx.effectiveRank,
      totalPlayersInLeague: ctx.effectiveLeaderboard.length || 15,
      pointsNeededToClimb: ctx.pointsNeededToClimb,
      playerAheadName: ctx.playerAheadName,
      isPro: effectiveIsPro,
      isProTest,
      proPlan: settings.proPlan || (isProTest ? '4-Day Free Pro Test' : effectiveIsPro ? 'Pro Member' : 'Free Tier'),
      proTestDaysLeft,
      leaderboardTop: ctx.effectiveLeaderboard.slice(0, 5).map((entry: any, i: number) => ({
        rank: i + 1,
        name: entry.displayName || `Player ${i + 1}`,
        xp: entry.weeklyXP ?? entry.xp ?? entry.weeklyPoints ?? 0
      })),
      plantInfo: {
        currentPlant: {
          type: ctx.plantType,
          stage: ctx.currentStage,
          stageName: ctx.stageNames[Math.min(ctx.currentStage, 5)],
          growthPoints: ctx.growthPoints,
          health: ctx.health,
          isThirsty: ctx.isThirsty,
          isDead: ctx.isDead
        },
        unlockedPlants: ctx.unlockedPlantsDetails,
        stage5Count: ctx.stage5Count,
        spaceHouseUnlocked: ctx.spaceHouseUnlocked,
        gardenSeedsCount: Object.values(gardenState?.inventory || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
      },
      inventoryInfo: {
        purchasedItemIds: settings.purchasedItems || [],
        libraryCount: (settings.inventory || []).length,
        equipped: {
          hat: settings.activeHat || null,
          eye: settings.activeEye || null,
          clothes: settings.activeClothes || null,
          skin: settings.activeSkin || null,
          effect: settings.activeEffect || null,
          theme: settings.activeAppTheme || null
        }
      },
      rewardsInfo: {
        trophiesCount: stats.trophies?.length || 0,
        trophies: (stats.trophies || []).map(t => ({ type: t.type, earnedDate: t.earnedDate })),
        hasClaimedXpChest: stats.hasClaimedXpChest || false
      },
      customPlans: (customPlans || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
        targetDesc: p.targetDesc || `${(p.challenges || []).length} steps daily`,
        steps: p.steps || p.challenges || []
      })),
      settings: {
        goal: 'Discipline & Consistent Habits',
        language: settings.language || 'en'
      },
      stats: {
        streak: stats.streak || 0,
        bestStreak: stats.bestStreak || stats.streak || 0,
        level: stats.level || Math.floor((stats.xp || 0) / 100) + 1,
        xp: stats.xp || 0,
        coins: stats.coins || 0,
        rank: ctx.effectiveRank ? `Rank #${ctx.effectiveRank}` : `Level ${stats.level || 1}`
      }
    };

    try {
      // Send last 6 messages only to prevent token bloating
      const messagesToSend = newMessages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const response = await fetch('/api/nex-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend,
          userContext: richUserContext
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Let's keep building discipline today!",
        timestamp: Date.now(),
        action: data.action
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Nex AI using smart fallback:', err);
      const localReply = generateLocalFallback(text, userDisplayName);
      setMessages(prev => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: localReply.content,
          timestamp: Date.now(),
          action: localReply.action
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Apply custom challenge creation
  const handleApplyChallenge = async (msgId: string, actionObj: any) => {
    const raw = actionObj?.challenge || actionObj?.payload || actionObj;
    if (!raw || !onSaveCustomPlan) {
      showToast?.('Challenge builder not ready', 'error');
      return;
    }

    const steps = raw.challenges || raw.steps || ['pushups', 'water', 'breathing'];
    const newPlan: CustomPlan = {
      id: `custom-plan-${Date.now()}`,
      userId: (settings as any)?.userId || 'local-user',
      name: raw.name || 'Nex AI Custom Protocol',
      icon: raw.icon || '⚡',
      color: raw.color || '#3b82f6',
      challenges: steps,
      days: raw.days || [0, 1, 2, 3, 4, 5, 6],
      createdAt: new Date().toISOString(),
      reminderTime: raw.reminderTime || '08:30'
    };

    try {
      await onSaveCustomPlan(newPlan);
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, actionApplied: true } : m))
      );
      showToast?.(`Added "${newPlan.name}" to your Custom Challenges! 🚀`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Failed to save challenge', 'error');
    }
  };

  // Apply display name update
  const handleApplyNameUpdate = (msgId: string, actionObj: any) => {
    const cleanName = (actionObj?.newName || actionObj?.name || actionObj?.payload?.name || '').trim();
    if (!cleanName || !onUpdateSettings) {
      showToast?.('Settings updater not available', 'error');
      return;
    }

    try {
      onUpdateSettings({ displayName: cleanName });
      localStorage.setItem('nexora_user_displayName', cleanName);
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, actionApplied: true } : m))
      );
      showToast?.(`Profile name updated to "${cleanName}"! ✨`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Failed to update name', 'error');
    }
  };

  // Trigger button click handler
  const handleTriggerClick = () => {
    if (effectiveIsPro) {
      setIsOpen(prev => !prev);
    }
  };

  // If user is not Pro (neither paid Pro nor 4-Day Free Pro Test active), hide the AI button entirely
  if (!effectiveIsPro) {
    return null;
  }

  return (
    <>
      {/* 1. FLOATING MASCOT TRIGGER BUTTON (Icon-Only Compact Button) */}
      <div className="fixed bottom-24 right-5 z-[70] md:bottom-8 md:right-8">
        <motion.button
          id="mascot-ai-trigger-btn"
          type="button"
          onClick={handleTriggerClick}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={`w-13 h-13 rounded-full flex items-center justify-center border transition-all duration-300 shadow-xl cursor-pointer ${
            isChatOpen
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30 ring-4 ring-blue-100'
              : 'bg-white hover:bg-blue-50/50 text-slate-800 border-slate-200/90 shadow-slate-300/50 hover:border-blue-400'
          }`}
          title="Chat with Nex AI"
          aria-label="Chat with Nex AI"
        >
          {/* App Mascot Character Icon */}
          <div className="relative flex items-center justify-center">
            <MascotAvatarIcon size={32} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full bg-emerald-500 shadow-xs" />
          </div>
        </motion.button>
      </div>

      {/* 2. CHATGPT APP STYLE AI CHAT PAGE / WINDOW */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`bg-white border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'fixed inset-0 z-[100] w-full h-full rounded-none'
                : 'fixed bottom-20 right-3 sm:right-6 w-[calc(100vw-24px)] sm:w-[440px] h-[580px] max-h-[82vh] z-[90] rounded-3xl'
            }`}
          >
            {/* Minimal Clean Header (Mascot Avatar, Title, Expand, Close) */}
            <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <MascotAvatarIcon size={34} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 leading-tight">Nex AI</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Discipline Coach • Active</p>
                </div>
              </div>

              {/* Header Action Buttons: Expand & Close */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(prev => !prev)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  title={isExpanded ? 'Minimize' : 'Expand full page'}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Messages Stream (ChatGPT Layout) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 custom-scrollbar">
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                const sticker = !isUser ? getMascotSticker(msg.content) : null;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Assistant Avatar on Left */}
                    {!isUser && (
                      <div className="shrink-0 mt-0.5">
                        <MascotAvatarIcon size={30} />
                      </div>
                    )}

                    <div className={`space-y-2 max-w-[84%] ${isUser ? 'items-end' : 'items-start'}`}>
                      {/* Message Bubble */}
                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs font-medium ml-auto'
                            : 'bg-white border border-slate-200/85 text-slate-800 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <FormattedMessage content={msg.content} />
                      </div>

                      {/* Mascot Sticker Tag (Context-aware reaction) */}
                      {sticker && (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${sticker.bg} ${sticker.text}`}>
                          <span>{sticker.sticker}</span>
                          <span>{sticker.label}</span>
                        </div>
                      )}

                      {/* Action Card: Custom Challenge Creator */}
                      {msg.action?.type === 'create_challenge' && (
                        <motion.div
                          initial={{ scale: 0.96, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-white border border-blue-200 rounded-2xl p-3.5 shadow-sm space-y-3 mt-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{msg.action.challenge?.icon || msg.action.payload?.icon || '⚡'}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-slate-800 text-xs truncate">
                                {msg.action.challenge?.name || msg.action.payload?.name || 'Custom Challenge'}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {msg.action.challenge?.targetDesc || msg.action.payload?.targetDesc || 'Tap to add to your habit plans'}
                              </p>
                            </div>
                          </div>

                          {/* Steps badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {((msg.action.challenge?.challenges || msg.action.challenge?.steps || msg.action.payload?.challenges || msg.action.payload?.steps || ['pushups', 'water']) as ChallengeStep[]).map(
                              (stepId, idx) => {
                                const stepMeta = STEP_LABELS[stepId] || { label: stepId, icon: '🎯' };
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-700"
                                  >
                                    <span>{stepMeta.icon}</span>
                                    <span>{stepMeta.label}</span>
                                  </span>
                                );
                              }
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={msg.actionApplied}
                            onClick={() => handleApplyChallenge(msg.id, msg.action)}
                            className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                              msg.actionApplied
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white'
                            }`}
                          >
                            {msg.actionApplied ? (
                              <>
                                <Check size={14} className="text-emerald-600" /> Added to My Challenges!
                              </>
                            ) : (
                              <>
                                <PlusCircle size={14} /> Add to My Challenges
                              </>
                            )}
                          </button>
                        </motion.div>
                      )}

                      {/* Action Card: Name Update */}
                      {msg.action?.type === 'update_name' && (
                        <motion.div
                          initial={{ scale: 0.96, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-white border border-amber-200 rounded-2xl p-3.5 shadow-sm space-y-2.5 mt-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">✏️</span>
                            <div>
                              <h4 className="font-black text-slate-800 text-xs">Update Profile Name</h4>
                              <p className="text-[11px] text-slate-500">
                                Set name to: <strong className="text-blue-600">{msg.action.newName || msg.action.payload?.name}</strong>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={msg.actionApplied}
                            onClick={() => handleApplyNameUpdate(msg.id, msg.action)}
                            className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                              msg.actionApplied
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white'
                            }`}
                          >
                            {msg.actionApplied ? (
                              <>
                                <Check size={14} className="text-emerald-600" /> Profile Name Updated!
                              </>
                            ) : (
                              <>
                                <Check size={14} /> Update Name Now
                              </>
                            )}
                          </button>
                        </motion.div>
                      )}

                      {/* Action Card: Open Plant Garden */}
                      {(msg.action?.type === 'open_plants' || msg.action?.type === 'show_plant_care') && onOpenPlant && (
                        <motion.div
                          initial={{ scale: 0.96, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-white border border-emerald-200 rounded-2xl p-3.5 shadow-sm space-y-2.5 mt-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🌿</span>
                            <div>
                              <h4 className="font-black text-slate-800 text-xs">Botanical Garden</h4>
                              <p className="text-[11px] text-slate-500">
                                Water your active plant, check hydration, or visit Plant Shop
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              onOpenPlant();
                            }}
                            className="w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white"
                          >
                            <span>🌱 Go to Botanical Garden</span>
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold p-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:0.4s]" />
                  <span className="ml-1 text-slate-500">Nex AI is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar (ChatGPT App Style) */}
            <div className="p-3 bg-white border-t border-slate-200/80">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="Message Nex AI..."
                  disabled={loading}
                  className="flex-1 bg-slate-100 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
                  title="Send"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
