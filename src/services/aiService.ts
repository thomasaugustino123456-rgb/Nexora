import { GoogleGenAI } from "@google/genai";
import { UserStats, DailyProgress, UserSettings } from "../types";

let aiInstance: any = null;

const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "NEXUS VISION ERROR: NEURAL LINK INTERRUPTED. RESUME PROTOCOL MANUALLY.";
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
