import { GoogleGenAI } from "@google/genai";
import { UserStats, DailyProgress, UserSettings } from "../types";

let aiInstance: any = null;

const getAI = () => {
  if (!aiInstance) {
    let apiKey = process.env.GEMINI_API_KEY;
    
    // Fallback logic for different environments
    if (!apiKey) {
      // In some environments, it might be in import.meta.env
      apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    }

    if (!apiKey) {
      console.warn("AI Service: GEMINI_API_KEY missing. Using limited simulation mode.");
      // We return a mock-capable object or just proceed to let the catch handle it later
      try {
        aiInstance = new GoogleGenAI({ apiKey: "MOCK_KEY" });
      } catch (e) {
        throw new Error("AURORA_CORE_INIT_FAILURE");
      }
    } else {
      try {
        aiInstance = new GoogleGenAI({ apiKey: apiKey as string });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI:", err);
        throw new Error("AURORA_CORE_INIT_FAILURE");
      }
    }
  }
  return aiInstance;
};

export async function analyzeHabits(stats: UserStats, history: DailyProgress[]) {
  const ai = getAI();
  const summary = history.slice(-7).map(h => ({
    date: h.date,
    completed: h.completed,
    tasks: {
      pushups: h.pushupsDone,
      water: h.waterDrank,
      breathing: h.breathingDone,
      writing: h.drawingDone, // reusing drawing as focus/writing in some places
      football: h.footballDone
    }
  }));

  const prompt = `
    You are Nexora Vision, a futuristic biological optimization AI.
    Analyze the following user habit data from the last 7 days:
    ${JSON.stringify(summary)}
    
    Total XP: ${stats.xp}
    Streak: ${stats.streak}
    
    Provide a "Nexus Optimization Protocol" in an authoritative, futuristic, and encouraging tone.
    Include:
    1. A "Current Biological Status" (e.g. Optimized, Fatigued, Ascending).
    2. One specific insight about their patterns.
    3. One "Override Protocol" (a suggested habit shift).
    
    Keep it short (max 100 words), use uppercase for emphasis, and sound like a high-end AI assistant.
  `;

  try {
    const ai = getAI();
    // Check if we are in mock mode
    if (ai.apiKey === "MOCK_KEY") {
      await new Promise(r => setTimeout(r, 1500));
      return `NEXUS VISION PROTOCOL: SIMULATED ANALYSIS.
      
      BIOLOGICAL STATUS: ASCENDING.
      
      PATTERN INSIGHT: YOUR MOMENTUM INDICATES HIGH NEURAL PLASTICITY. STREAK OF ${stats.streak} IS OPTIMAL.
      
      OVERRIDE PROTOCOL: INCREASE HYDRATION FREQUENCY TO MAINTAIN COGNITIVE FLOW.
      
      [UPGRADE TO PRO TO ACTIVATE FULL NEURAL LINK]`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    if (!response || !response.text) {
      throw new Error("EMPTY_AI_RESPONSE");
    }
    
    return response.text;
  } catch (error: any) {
    console.error("AI Analysis failed:", error);
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
      return "NEXUS ERROR: AUTHENTICATION FAILED. PLEASE CHECK GENAI API CONFIGURATION IN SETTINGS.";
    }
    return "NEXUS VISION ERROR: NEURAL LINK INTERRUPTED. PERSISTENCE REQUIRED.";
  }
}

export async function analyzeNoteMood(noteTitle: string, noteContent: string) {
  const ai = getAI();
  const prompt = `
    Analyze this brain dump/note:
    Title: ${noteTitle}
    Content: ${noteContent}
    
    Return a JSON object:
    {
      "mood": "Short mood description",
      "neural_insight": "One sentence psychological insight",
      "biological_recommendation": "One physical action to take based on this mood"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Note analysis failed:", error);
    return null;
  }
}
