import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

// 🔑 APNI GEMINI API KEY YAHAN "YOUR_GEMINI_API_KEY_HERE" KI JAGAH PASTE KAREIN:
const MY_GEMINI_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";

app.post("/api/ai/coach", async (req, res) => {
  try {
    const { messages } = req.body;
    const lastUserMsg = [...(messages || [])].reverse().find((m: any) => m.sender === "user")?.text || "";

    // 1. Try Real Google Gemini AI
    if (MY_GEMINI_KEY && MY_GEMINI_KEY !== "YOUR_GEMINI_API_KEY_HERE") {
      try {
        const ai = new GoogleGenAI({ apiKey: MY_GEMINI_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${JSON.stringify(messages || [])}\nStudent asked: ${lastUserMsg}`,
          config: {
            systemInstruction: "You are LifePilot AI, an empathetic academic tutor and study coach. Answer questions clearly using markdown formatting.",
          },
        });

        if (response && response.text) {
          return res.json({ reply: response.text });
        }
      } catch (err: any) {
        console.error("Gemini API Error:", err.message);
      }
    }

    // 2. Dynamic Smart Fallback (Har sawal ka alag jawab)
    const prompt = (lastUserMsg || "").toLowerCase();
    let replyText = `💡 **LifePilot AI Study Guide for "${lastUserMsg || "Study"}":**\n\n1. **Core Concept**: Focus on understanding the primary definition and underlying rules.\n2. **Active Recall**: Test yourself by writing down key points from memory.\n3. **Practice**: Apply this concept to past exam questions.`;

    if (prompt.includes("science")) {
      replyText = "🔬 **What is Science?**\n\nScience is the systematic study of the physical and natural world through observation, experimentation, and testing of theories against obtained evidence. Key branches include Physics, Chemistry, and Biology.";
    } else if (prompt.includes("math") || prompt.includes("calculus")) {
      replyText = "📐 **Math Solving Strategy:**\n\n1. Identify given variables and constraints.\n2. Apply first-principles formulas.\n3. Verify boundary conditions.";
    } else if (prompt.includes("motivation") || prompt.includes("lazy") || prompt.includes("tired")) {
      replyText = "🚀 **Boost Your Motivation:**\n\nStart with just 5 minutes of focused effort using the Pomodoro technique. Action builds momentum!";
    }

    return res.json({ reply: replyText });
  } catch (error) {
    return res.json({ reply: "👋 LifePilot AI is ready! Ask any academic question." });
  }
});

app.post("/api/ai/explain", async (req, res) => {
  try {
    const { topic, subject } = req.body;

    if (MY_GEMINI_KEY && MY_GEMINI_KEY !== "YOUR_GEMINI_API_KEY_HERE") {
      try {
        const ai = new GoogleGenAI({ apiKey: MY_GEMINI_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Explain "${topic}" clearly for subject "${subject || "Academic"}". Use markdown formatting.`,
        });
        if (response && response.text) {
          return res.json({ explanation: response.text });
        }
      } catch (err: any) {
        console.error("Explain API Error:", err.message);
      }
    }

    return res.json({
      explanation: `## Concept Breakdown: ${topic || "Core Subject"}\n\n### 1. Overview\nA foundational principle in ${subject || "studies"}.\n\n### 2. Key Takeaways\n- Focus on primary definitions.\n- Practice active recall flashcards.`,
    });
  } catch (error) {
    return res.json({ explanation: "Explanation ready." });
  }
});

export default app;
