import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

// 🔑 APNI GEMINI API KEY YAHAN "AIzaSy_PASTE_YOUR_KEY_HERE" KI JAGAH PASTE KAREIN:
const MY_GEMINI_KEY = process.env.GEMINI_API_KEY || "AIzaSy_PASTE_YOUR_KEY_HERE";

// Strict System Rules for Gemini AI
const SYSTEM_INSTRUCTION = `You are LifePilot AI, a specialized academic tutor and study assistant.
CRITICAL RULES:
1. Answer ONLY study, academic, exam, course, and educational questions (Math, Physics, Chemistry, Biology, Computer Science, History, Literature, Languages, Study Skills, etc.).
2. Do NOT give repetitive boilerplate greetings or generic template responses. Answer the EXACT question asked with specific facts, formulas, definitions, and step-by-step explanations.
3. Use clean markdown formatting (bold headers, bullet points, clear steps).
4. Keep all responses strictly focused on helping the student master their coursework and pass exams.`;

// Dynamic Academic Fallback Engine
function getAcademicResponse(question: string): string {
  const q = (question || "").toLowerCase().trim();

  if (!q) {
    return "📚 **LifePilot AI Study Assistant:** Ask me any study question, topic, or formula!";
  }

  // Physics
  if (q.includes("physics")) {
    return "⚡ **Physics Study Guide:**\n- **Definition**: Physics studies matter, energy, motion, and force.\n- **Core Fields**: Classical Mechanics (F=ma), Thermodynamics, Electromagnetism, Quantum Mechanics.\n- **Exam Strategy**: Memorize formulas, derive key equations, and solve numerical problem sets.";
  }
  // Chemistry
  if (q.includes("chem")) {
    return "🧪 **Chemistry Study Guide:**\n- **Definition**: Chemistry explores atomic structure, chemical bonding, and reactions.\n- **Core Focus**: Periodic table trends, balancing chemical equations, stoichiometry, and reaction mechanisms.\n- **Exam Strategy**: Practice formula weights and electron configurations.";
  }
  // Biology
  if (q.includes("bio")) {
    return "🧬 **Biology Study Guide:**\n- **Definition**: Biology is the study of living organisms and cellular processes.\n- **Core Focus**: Cell biology (mitosis/meiosis), DNA replication, genetics, photosynthesis, and ecosystems.\n- **Exam Strategy**: Draw labeled diagrams and memorize domain terminology.";
  }
  // Math / Calculus / Algebra
  if (q.includes("math") || q.includes("calculus") || q.includes("algebra") || q.includes("equation") || q.includes("derivative") || q.includes("integral")) {
    return "📐 **Math & Problem-Solving Breakdown:**\n1. **Identify Terms**:
