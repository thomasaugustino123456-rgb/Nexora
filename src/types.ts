export interface UserSettings {
  pushupsGoal: number;
  waterGoal: number;
  reminderTime: string;
  displayName?: string;
  profilePic?: string; // base64
  themeColor?: string;
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
  showQuotes?: boolean;
  unitSystem?: 'metric' | 'imperial';
  purchasedItems?: string[];
  savedChallengeIds?: string[];
  savedTrophyIds?: string[];
  activeHat?: string;
  activeSkin?: string;
  zenModeEnabled?: boolean;
  isPro?: boolean;
  challengeCountGoal?: number;
  inventory?: LibraryItem[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  effect: 'streak-protection' | 'double-points' | 'skin' | 'gift';
  icon: string;
}

export interface LibraryItem {
  id: string; // Unique instance ID
  itemId: string; // Reference to ShopItem.id
  name: string;
  icon: string;
  activated: boolean;
  type: 'power-up' | 'skin' | 'gift';
  purchasedAt: string; // ISO date
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  completed: boolean;
  completionsCount: number; // Number of times the flow was completed today
  pushupsDone: boolean;
  waterDrank: number;
  breathingDone: boolean;
  drawingDone: boolean;
  footballDone: boolean;
  bubblesDone: boolean;
  dailyQuestDone?: boolean;
  memoryDone?: boolean;
  gratitudeDone?: boolean;
  reactionDone?: boolean;
}

export type TrophyType = 'golden' | 'ice' | 'broken';

export interface Trophy {
  id: string;
  type: TrophyType;
  earnedDate: string; // ISO string
  lastUpdated: string; // ISO string
}

export interface GratitudeEntry {
  id: string;
  text: string;
  date: string;
}

export interface UserStats {
  streak: number;
  bestStreak: number;
  totalPoints: number;
  level?: number;
  totalCompletedDays: number;
  lastCompletedDate: string | null;
  currentChallengeIndex: number; // The index of the next challenge to be completed
  trophies: Trophy[];
  pointsByCategory: {
    physical: number;
    mental: number;
    creative: number;
  };
  drawings?: string[]; // base64 strings
  unlockedHats?: string[];
  gratitudeEntries?: GratitudeEntry[];
}

export type Screen = 'home' | 'progress' | 'profile' | 'challenge' | 'settings' | 'shop' | 'library' | 'gallery' | 'notebook' | 'leaderboard' | 'subscription';
export type ChallengeStep = 'pushups' | 'water' | 'breathing' | 'drawing' | 'football' | 'bubbles' | 'memory' | 'gratitude' | 'reaction' | 'completion';
export type MascotMood = 'neutral' | 'happy' | 'angry' | 'boiling';
