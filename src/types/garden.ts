export type SeedRarity = "Common" | "Rare" | "Epic" | "Legendary";

export type MascotMood = 'happy' | 'neutral' | 'sad' | 'angry';

export interface MascotState {
  mood: MascotMood;
  lastInteracted: number;
}

export interface PlantArchetype {
  id: string;
  name: string;
  rarity: SeedRarity;
  growthTimeMinutes: number;
  waterRequired: number;
  coinCostToWater: number;
  xpReward: number;
  coinReward: number;
  premiumRewardEffect?: string;
  themeColor: string;
}

export type GrowthStage = "Seed" | "Sprout" | "Bud" | "Fully Grown";

export interface GardenTile {
  tileIndex: number; // 0 to 8 for a 3x3 grid
  plantId: string | null; // null if tile is empty soil
  plantName: string | null;
  rarity: SeedRarity | null;
  growthStage: GrowthStage | null;
  plantedAt: number | null; // Date.now() timestamp when planted
  lastWateredAt: number | null; // Date.now() timestamp
  waterCount: number; // Current number of times watered
  waterRequired: number; // Total water cycles needed to hit fully grown
}

export interface GardenState {
  tiles: GardenTile[];
  inventory: Record<string, number>; // Maps Plant Archetype ID to quantity owned
  mascotState: MascotState;
  streakSavers: number;
  pendingLootSeed?: LootDropResult | null; // Track seed awaiting collection on the Plant section
  lastSeedDropAt?: number; // Rate-limiting limit: Once every 2 days
}

// 1. Core Cozy Plant Archetypes Definitions
export const PLANT_ARCHETYPES: Record<string, PlantArchetype> = {
  "slime-berry": {
    id: "slime-berry",
    name: "Slime-Berry",
    rarity: "Common",
    growthTimeMinutes: 5,
    waterRequired: 2,
    coinCostToWater: 5,
    xpReward: 15,
    coinReward: 15,
    themeColor: "text-emerald-500 bg-emerald-50 border-emerald-200",
  },
  "solar-flare-pea": {
    id: "solar-flare-pea",
    name: "Solar-Flare Pea",
    rarity: "Rare",
    growthTimeMinutes: 15,
    waterRequired: 3,
    coinCostToWater: 10,
    xpReward: 40,
    coinReward: 25,
    themeColor: "text-amber-500 bg-amber-50 border-amber-200",
  },
  "moon-sprout": {
    id: "moon-sprout",
    name: "Moon-Sprout",
    rarity: "Rare",
    growthTimeMinutes: 30,
    waterRequired: 3,
    coinCostToWater: 12,
    xpReward: 50,
    coinReward: 30,
    themeColor: "text-indigo-500 bg-indigo-50 border-indigo-200",
  },
  "star-silk-leaf": {
    id: "star-silk-leaf",
    name: "Star-Silk Leaf",
    rarity: "Epic",
    growthTimeMinutes: 60,
    waterRequired: 4,
    coinCostToWater: 20,
    xpReward: 120,
    coinReward: 60,
    premiumRewardEffect: "1x Streak-Saver Card",
    themeColor: "text-fuchsia-500 bg-fuchsia-50 border-fuchsia-200",
  },
  "dream-shroom": {
    id: "dream-shroom",
    name: "Dream-Shroom",
    rarity: "Legendary",
    growthTimeMinutes: 120,
    waterRequired: 5,
    coinCostToWater: 35,
    xpReward: 300,
    coinReward: 150,
    premiumRewardEffect: "1x Streak-Saver Card",
    themeColor: "text-rose-500 bg-rose-50 border-rose-200",
  },
};

// 2. Local Initial Component State Generator
export const createInitialGardenState = (): GardenState => {
  const tiles: GardenTile[] = Array.from({ length: 9 }, (_, index) => ({
    tileIndex: index,
    plantId: null,
    plantName: null,
    rarity: null,
    growthStage: null,
    plantedAt: null,
    lastWateredAt: null,
    waterCount: 0,
    waterRequired: 0,
  }));

  const inventory: Record<string, number> = {
    "slime-berry": 1, // Start with one free Common seed for onboarding tutorial
    "solar-flare-pea": 0,
    "moon-sprout": 0,
    "star-silk-leaf": 0,
    "dream-shroom": 0,
  };

  return {
    tiles,
    inventory,
    mascotState: {
        mood: 'happy',
        lastInteracted: Date.now()
    },
    streakSavers: 0,
  };
};

// 3. The Loot Drop Calculator Logic
/**
 * Calculates if a loot drop event triggers (35% overall chance), 
 * and determines the resulting plant seed rarity and archetype ID.
 */
export interface LootDropResult {
  triggered: boolean;
  seedId: string | null;
  seedName: string | null;
  rarity: SeedRarity | null;
  message: string | null;
}

export const calculateLootDrop = (lastSeedDropAt?: number): LootDropResult => {
  const now = Date.now();
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

  if (lastSeedDropAt && (now - lastSeedDropAt < twoDaysMs)) {
    return {
      triggered: false,
      seedId: null,
      seedName: null,
      rarity: null,
      message: "cooldown",
    };
  }

  const overallRoll = Math.random(); // 0.0 to 1.0

  // 35% overall drop chance
  if (overallRoll > 0.35) {
    return {
      triggered: false,
      seedId: null,
      seedName: null,
      rarity: null,
      message: null,
    };
  }

  // Handle Rarity cascade with independent 100% within the drop:
  // Legendary: 5% (0.00 to 0.05)
  // Epic: 15% (0.05 to 0.20)
  // Rare: 30% (0.20 to 0.50)
  // Common: 50% (0.50 to 1.00)
  const rarityRoll = Math.random();
  let selectedRarity: SeedRarity = "Common";
  let pool: string[] = ["slime-berry"];

  if (rarityRoll < 0.05) {
    selectedRarity = "Legendary";
    pool = ["dream-shroom"];
  } else if (rarityRoll < 0.20) {
    selectedRarity = "Epic";
    pool = ["star-silk-leaf"];
  } else if (rarityRoll < 0.50) {
    selectedRarity = "Rare";
    pool = ["solar-flare-pea", "moon-sprout"];
  } else {
    selectedRarity = "Common";
    pool = ["slime-berry"];
  }

  // Select a random plant from the matched pool
  const chosenId = pool[Math.floor(Math.random() * pool.length)];
  const archetype = PLANT_ARCHETYPES[chosenId];

  return {
    triggered: true,
    seedId: chosenId,
    seedName: archetype.name,
    rarity: selectedRarity,
    message: `Loot drop! You found an exotic ${archetype.name} Seed (${selectedRarity})! 🌱`,
  };
};

/**
 * Handles adding a seed to the player's garden state inventory in an immutable, purely functional way.
 */
export const addSeedToInventory = (
  currentState: GardenState,
  seedType: string
): GardenState => {
  // Return early if archetype is invalid
  if (!PLANT_ARCHETYPES[seedType]) {
    console.warn(`Attempted to add unsupported seed type: ${seedType}`);
    return currentState;
  }

  const newState = {
    ...currentState,
    inventory: {
      ...currentState.inventory,
      [seedType]: (currentState.inventory[seedType] || 0) + 1,
    },
  };
  return newState;
};

// 4. New Logic Helper Functions

/**
 * Updates the mascot's mood based on consistency traits.
 */
export const updateMascotMood = (currentStreak: number, missedDays: number): MascotMood => {
    if (missedDays > 3) return 'angry';
    if (missedDays > 1) return 'sad';
    if (currentStreak > 5) return 'happy';
    return 'neutral';
};

/**
 * Harvests a plant, clears tile, and rolls for premium loot reward.
 */
export const harvestPlant = (currentState: GardenState, tileId: number): { updatedState: GardenState; rewardDropped: string | null } => {
    const tile = currentState.tiles[tileId];
    if (!tile || tile.growthStage !== 'Fully Grown') {
        return { updatedState: currentState, rewardDropped: null };
    }

    // Clear tile
    const newTiles = [...currentState.tiles];
    newTiles[tileId] = {
        tileIndex: tileId,
        plantId: null,
        plantName: null,
        rarity: null,
        growthStage: null,
        plantedAt: null,
        lastWateredAt: null,
        waterCount: 0,
        waterRequired: 0,
    };

    // Roll for Loot (e.g., Streak Saver)
    const lootRoll = Math.random();
    let rewardDropped: string | null = null;
    let newStreakSavers = currentState.streakSavers;

    if (lootRoll < 0.3) {
        rewardDropped = "Streak Saver";
        newStreakSavers += 1;
    }

    return {
        updatedState: {
            ...currentState,
            tiles: newTiles,
            streakSavers: newStreakSavers,
        },
        rewardDropped,
    };
};
