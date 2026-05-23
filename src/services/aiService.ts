import { UserStats, DailyProgress } from "../types";

export async function analyzeHabits(stats: UserStats, history: DailyProgress[]): Promise<string> {
  try {
    const response = await fetch("/api/gemini/analyze-habits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stats, history }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.analysis || "NEXUS VISION PROTOCOL: FAILED TO PARSE INSIGHTS.";
  } catch (error) {
    console.error("Client AI Analysis failed, using mock sync fallback:", error);
    return `NEXUS VISION PROTOCOL: OFFLINE MODE ACTIVE.
      
BIOLOGICAL STATUS: ASCENDING.

PATTERN INSIGHT: YOUR CONTINUOUS HABIT SELECTION INDICATES HIGH NEURAL MOMENTUM.

OVERRIDE PROTOCOL: ENSURE HYDRATION TO UNLOCK MAXIMUM INTEGRATED PERFORMANCE.`;
  }
}

export async function analyzeNoteMood(noteTitle: string, noteContent: string) {
  try {
    const response = await fetch("/api/gemini/analyze-note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: noteTitle, content: noteContent }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Client Note mood analysis failed, using fallback:", error);
    return {
      mood: "Introspective & Focused",
      neural_insight: "Taking time to draft your thoughts maintains calm neurological clarity, bro.",
      biological_recommendation: "Stand up and stretch your arms for 15 seconds to realign physical status."
    };
  }
}
