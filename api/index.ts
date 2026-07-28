import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const GEMINI_MODEL = "gemini-2.5-flash";
const apiKey = process.env.GEMINI_API_KEY || "";

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

function getCoachFallback(lastUserMessage: string): string {
  return "🚀 **Stay Focused & Driven!**\n\nStart with just 5 minutes of focused work.";
}

function getPlannerFallback(subjects: string[], hours: number) {
  return {
    planSummary: `Optimized study plan.`,
    studySchedule: [{ title: "Deep Work", subject: subjects[0] || "General", priority: "High", estimatedMinutes: 60, category: "Study" }],
    tips: ["Take regular breaks."]
  };
}

function getSummarizerFallback(noteTitle: string, subject: string) {
  return {
    summary: `Overview of ${noteTitle || "Notes"}.`,
    keyTakeaways: ["Core principles."],
    cheatSheet: [{ term: "Core", definition: "Main concept" }],
    flashcards: [{ question: "What is core?", answer: "Primary principle" }],
    tags: [subject || "Study"]
  };
}

function getQuizFallback(subject: string, topic: string, difficulty: string) {
  return {
    quizTitle: `${topic || "Core"} Quiz`,
    subject: subject || "General",
    topic: topic || "Core",
    difficulty: difficulty || "Medium",
    questions: [{ id: "q-1", text: "Sample question?", options: ["A", "B"], correctIndex: 0, explanation: "Correct" }]
  };
}

app.post("/api/ai/coach", async (req, res) => {
  try {
    const { messages } = req.body;
    if (ai) {
      const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: JSON.stringify(messages) });
      if (response.text) return res.json({ reply: response.text });
    }
    res.json({ reply: getCoachFallback("") });
  } catch (err) {
    res.json({ reply: getCoachFallback("") });
  }
});

app.post("/api/ai/planner", async (req, res) => {
  try {
    const { subjects, availableHoursPerDay } = req.body;
    res.json(getPlannerFallback(subjects, availableHoursPerDay));
  } catch (err) {
    res.json(getPlannerFallback([], 3));
  }
});

app.post("/api/ai/explain", async (req, res) => {
  res.json({ explanation: "Explanation text." });
});

app.post("/api/ai/summarize", async (req, res) => {
  res.json(getSummarizerFallback(req.body?.noteTitle, req.body?.subject));
});

app.post("/api/ai/quiz", async (req, res) => {
  res.json(getQuizFallback(req.body?.subject, req.body?.topic, req.body?.difficulty));
});

export default app;const apiKey = process.env.GEMINI_API_KEY || "AIzaSy...AapkiKeyYahan";
