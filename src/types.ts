export interface BadgeSettings {
  trophyAlerts: boolean;
  appUpdates: boolean;
  dailyChallenge: boolean;
  dailyQuest: boolean;
  dynamicUrgency: boolean;
}

export interface HouseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  coinPrice: number;
  icon: string; // Emoji or small SVG path
  room: number; // 0, 1, or 2
  category: 'furniture' | 'decoration' | 'electronics' | 'lighting' | 'other';
}

export interface PlacedHouseItem {
  id: string; // Unique instance ID
  itemId: string;
  x: number;
  y: number;
  room: number;
}

export type PlantType = 'zen' | 'desert' | 'tropical' | 'forest' | 'meadow' | 'crystal' | 'volcano' | 'sprout';

export interface PlantState {
  type: PlantType;
  stage: number; // 0: seed, 1-5: growth
  growthPoints: number;
  lastGrowthDate: string | null;
  lastCheckDate: string; // ISO date
  health: number; // 0-100
  isDead: boolean;
  isThirsty: boolean;
  unlockedTypes?: PlantType[];
}

export interface UserSettings {
  pushupsGoal: number;
  waterGoal: number;
  reminderTime: string;
  reminderTime2?: string;
  motivationTime?: string;
  displayName?: string;
  profilePic?: string; // base64
  themeColor?: string;
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
  showQuotes?: boolean;
  pushMotivationEnabled?: boolean;
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
  isDogSoundPackActive?: boolean;
  league?: string;
  timezone?: string;
  fcmToken?: string;
  badgeSettings?: BadgeSettings;
  purchasedHouseItemIds?: string[];
  placedHouseItems?: PlacedHouseItem[];
  spaceOnboardingCompleted?: boolean;
  plantOnboardingCompleted?: boolean;
  plantState?: PlantState;
  mascotSize?: number;
  mascotPos?: { x: number, y: number };
  mascotPinnedItemId?: string | null;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  coinPrice?: number;
  effect: 'streak-protection' | 'double-points' | 'skin' | 'gift' | 'sound-pack' | 'music';
  icon: string;
}

export interface LibraryItem {
  id: string; // Unique instance ID
  itemId: string; // Reference to ShopItem.id
  name: string;
  icon: string;
  activated: boolean;
  type: 'power-up' | 'skin' | 'gift' | 'sound-pack' | 'music';
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
  meditationDone?: boolean;
  writingDone?: boolean;
  waterChallengeCount?: number;
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
  xp: number;
  level?: number;
  totalCompletedDays: number;
  lastCompletedDate: string | null;
  lastGiftDate?: string | null;
  currentChallengeIndex: number; // The index of the next challenge to be completed
  coins: number;
  weeklyPoints: number;
  weeklyXP: number;
  lastWeeklyReset?: string; // ISO date
  trophies: Trophy[];
  pointsByCategory: {
    physical: number;
    mental: number;
    creative: number;
  };
  drawings?: string[]; // base64 strings
  unlockedHats?: string[];
  gratitudeEntries?: GratitudeEntry[];
  waterDrank?: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  streak: number;
  totalPoints: number;
  xp: number;
  weeklyPoints: number;
  level: number;
  league: string;
}

export interface CustomPlan {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  challenges: ChallengeStep[];
  days: number[]; // 0-6 (Sun-Sat)
  reminderTime?: string;
  reminderTime2?: string;
  createdAt: string;
}

export type Screen = 'home' | 'progress' | 'profile' | 'challenge' | 'settings' | 'shop' | 'library' | 'gallery' | 'notebook' | 'leaderboard' | 'subscription' | 'plan-builder' | 'house' | 'plant';
export type ChallengeStep = 'pushups' | 'water' | 'breathing' | 'drawing' | 'football' | 'bubbles' | 'memory' | 'gratitude' | 'reaction' | 'meditation' | 'writing' | 'completion';
export type MascotMood = 'neutral' | 'happy' | 'angry' | 'boiling';
