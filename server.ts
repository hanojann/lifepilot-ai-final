import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
// Fix 1: Dynamic PORT for hosting platforms (Render, Railway, Heroku etc.)
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

// Fix 2: Updated model string to standard valid model
const GEMINI_MODEL = "gemini-2.5-flash";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// ----------------------------------------------------
// AI FALLBACK GENERATORS (guarantees seamless UX even without API key)
// ----------------------------------------------------

function getCoachFallback(lastUserMessage: string): string {
  const msg = (lastUserMessage || "").toLowerCase();
  if (msg.includes("motivation") || msg.includes("tired") || msg.includes("lazy")) {
    return "🚀 **Stay Focused & Driven!**\n\nRemember: momentum builds motivation, not the other way around. Start with just **5 minutes** of focused work on your easiest task using the Pomodoro technique. Once you get past the initial resistance, your brain enters the flow state!\n\n*\"Success is the sum of small efforts repeated day in and day out.\"* You've got this! What task shall we tackle first?";
  }
  if (msg.includes("explain") || msg.includes("what is") || msg.includes("how does")) {
    return "💡 **Concept Breakdown Strategy**\n\nTo master any complex topic, try using the **Feynman Technique**:\n1. **Simplify**: Explain the core concept in plain English as if teaching a 10-year-old.\n2. **Identify Gaps**: Note where you get stuck or use jargon.\n3. **Review**: Re-read your notes or course material specifically for those gap areas.\n\nTell me the specific subject or problem statement, and I'll break it down step-by-step for you!";
  }
  return "👋 **LifePilot AI Study Tip**\n\nTo maximize your retention for exam prep:\n- **Active Recall**: Test yourself rather than passively re-reading notes.\n- **Spaced Repetition**: Review key concepts at 1-day, 3-day, and 7-day intervals.\n- **Interleaving**: Alternate between different subjects to strengthen problem-solving flexibility.\n\nHow else can I support your study session today?";
}

function getPlannerFallback(subjects: string[], hours: number) {
  const primarySubject = subjects[0] || "Computer Science";
  const secondarySubject = subjects[1] || "Mathematics";

  return {
    planSummary: `Optimized ${hours || 3}-hour daily study itinerary designed to prioritize high-yield exam preparation while maintaining active recall breaks.`,
    studySchedule: [
      {
        title: `Deep Work: ${primarySubject} Core Concepts`,
        subject: primarySubject,
        priority: "High",
        estimatedMinutes: 60,
        category: "Study",
        recommendedTimeOfDay: "Morning",
        description: "Focus on highest-weight topics and active problem solving while energy levels are peak.",
      },
      {
        title: "Active Recall & Flashcard Review",
        subject: primarySubject,
        priority: "Medium",
        estimatedMinutes: 30,
        category: "Study",
        recommendedTimeOfDay: "Afternoon",
        description: "Test memory retention without looking at notes using spaced repetition.",
      },
      {
        title: `Practice Problems: ${secondarySubject}`,
        subject: secondarySubject,
        priority: "Medium",
        estimatedMinutes: 45,
        category: "Assignment",
        recommendedTimeOfDay: "Afternoon",
        description: "Apply concepts to past exam questions or problem sets.",
      },
      {
        title: "Daily Review & Tomorrow Prep",
        subject: "General",
        priority: "Low",
        estimatedMinutes: 20,
        category: "Personal",
        recommendedTimeOfDay: "Evening",
        description: "Organize tomorrow's priorities and clear study workspace.",
      },
    ],
    tips: [
      "Use 50-minute focused blocks with 10-minute movement breaks.",
      "Hydrate with water and avoid heavy meals immediately before deep work sessions.",
      "Review high-difficulty topics early in your daily schedule.",
    ],
  };
}

function getSummarizerFallback(noteTitle: string, subject: string) {
  const title = noteTitle || "Class Notes Summary";
  const subj = subject || "Computer Science";
  return {
    summary: `Structured overview of ${title} (${subj}): Core mechanisms, operational definitions, and essential exam review points extracted from content.`,
    keyTakeaways: [
      "Primary theoretical framework and foundational principles.",
      "Key formulas, definitions, and domain-specific terminology.",
      "Critical relationship between inputs, variables, and output performance.",
      "High-probability exam topics and common analytical scenarios.",
    ],
    cheatSheet: [
      { term: "Core Principle", definition: "The central rule or theorem governing system behavior." },
      { term: "Primary Formula / Model", definition: "Analytical relationship used to compute expected values." },
      { term: "Boundary Condition", definition: "Constraints under which the model remains valid." },
    ],
    flashcards: [
      {
        question: `What is the central concept discussed in ${title}?`,
        answer: "The fundamental rules and principles governing operational design and systemic outputs.",
      },
      {
        question: "Why is active recall superior to passive re-reading?",
        answer: "Active recall forces memory retrieval, creating stronger neural connections and identifying knowledge gaps instantly.",
      },
      {
        question: "How should boundary conditions be evaluated?",
        answer: "By testing extreme inputs (e.g., zero, infinity, negative values) to verify equation stability.",
      },
      {
        question: `What is the primary practical application of ${subj}?`,
        answer: "Solving real-world optimization problems and building reliable analytical models.",
      },
    ],
    tags: [subj, "Exam Prep", "AI Summary"],
  };
}

function getQuizFallback(subject: string, topic: string, difficulty: string) {
  const subj = subject || "Academic Studies";
  const top = topic || "Core Fundamentals";
  const diff = difficulty || "Medium";

  return {
    quizTitle: `${top} Master Quiz`,
    subject: subj,
    topic: top,
    difficulty: diff,
    questions: [
      {
        id: "q-1",
        text: `What is the primary function of ${top} in ${subj}?`,
        options: [
          "To optimize throughput and ensure systemic balance",
          "To randomly generate arbitrary variables",
          "To bypass standard analytical protocols",
          "To eliminate the need for verification testing",
        ],
        correctIndex: 0,
        explanation: "The primary function is to optimize throughput and establish predictable balance within the system.",
      },
      {
        id: "q-2",
        text: "Which approach is most effective when encountering complex problem scenarios?",
        options: [
          "Guessing without analyzing underlying constraints",
          "Decomposing the problem into smaller, verifiable sub-problems",
          "Ignoring boundary conditions and assumptions",
          "Skipping initial variable identification",
        ],
        correctIndex: 1,
        explanation: "Problem decomposition isolates variables and reduces cognitive overload, allowing systematic verification.",
      },
      {
        id: "q-3",
        text: "What happens when boundary conditions are exceeded in analytical models?",
        options: [
          "Model predictions remain 100% accurate",
          "The model fails or produces undefined results",
          "System efficiency automatically doubles",
          "Variables become completely immutable",
        ],
        correctIndex: 1,
        explanation: "Analytical models rely on boundary assumptions; exceeding them renders calculations invalid.",
      },
      {
        id: "q-4",
        text: "Why is active recall emphasized in high-yield study methodology?",
        options: [
          "It takes less time than glancing at titles",
          "It triggers memory consolidation and identifies knowledge gaps",
          "It guarantees 100% test scores without effort",
          "It replaces the need for practice problems",
        ],
        correctIndex: 1,
        explanation: "Retrieval practice triggers neuroplasticity, strengthening long-term memory pathways.",
      },
      {
        id: "q-5",
        text: "Which strategy prevents burnout during intense exam preparation?",
        options: [
          "Studying 12 hours straight without any rest",
          "Using structured Pomodoro intervals with movement breaks",
          "Pulling back-to-back all-nighters before exams",
          "Avoiding hydration and regular sleep schedules",
        ],
        correctIndex: 1,
        explanation: "Structured rest intervals maintain cognitive stamina and consolidate short-term memory into long-term storage.",
      },
    ],
  };
}

// ----------------------------------------------------
// AI ROUTES
// ----------------------------------------------------

// 1. AI Study Coach & Assistant Chat
app.post("/api/ai/coach", async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    const lastUserMsg = [...(messages || [])].reverse().find((m: any) => m.sender === "user")?.text || "";

    if (ai) {
      try {
        const systemInstruction = `You are LifePilot AI, an empathetic, highly knowledgeable, and encouraging academic coach for students.
Maintain a warm, supportive, clear, and structured tone. Use markdown styling for readability (bullet points, bold text).
Current user context: ${JSON.stringify(userContext || {})}`;

        const formattedHistory = (messages || []).map((m: any) => `${m.sender === "user" ? "Student" : "Coach"}: ${m.text}`).join("\n");
        const prompt = `${formattedHistory}\nCoach:`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: { systemInstruction, temperature: 0.7 },
        });

        if (response.text) {
          return res.json({ reply: response.text });
        }
      } catch (err) {
        console.warn("Gemini API call failed, using intelligent fallback:", err);
      }
    }

    res.json({ reply: getCoachFallback(lastUserMsg) });
  } catch (error: any) {
    console.error("Coach Route Error:", error);
    res.json({ reply: getCoachFallback("") });
  }
});

// 2. AI Study Planner Generator
app.post("/api/ai/planner", async (req, res) => {
  try {
    const { subjects, availableHoursPerDay, upcomingExams, goals } = req.body;

    if (ai) {
      try {
        const prompt = `Create a realistic, balanced study plan for a student:
- Subjects: ${(subjects || []).join(", ")}
- Available Study Hours per Day: ${availableHoursPerDay || 3} hours
- Upcoming Exams/Deadlines: ${JSON.stringify(upcomingExams || [])}
- Personal Academic Goals: ${goals || "High GPA and deep understanding"}

Generate a structured study schedule with specific tasks. Return JSON conforming strictly to schema.`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction: "You are an expert academic planner.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                planSummary: { type: Type.STRING },
                studySchedule: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      subject: { type: Type.STRING },
                      priority: { type: Type.STRING },
                      estimatedMinutes: { type: Type.NUMBER },
                      category: { type: Type.STRING },
                      recommendedTimeOfDay: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ["title", "subject", "priority", "estimatedMinutes", "category"],
                  },
                },
                tips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["planSummary", "studySchedule", "tips"],
            },
          },
        });

        if (response.text) {
          return res.json(JSON.parse(response.text));
        }
      } catch (err) {
        console.warn("Gemini Planner API call failed, using intelligent fallback:", err);
      }
    }

    res.json(getPlannerFallback(subjects || [], availableHoursPerDay || 3));
  } catch (error: any) {
    console.error("Planner Route Error:", error);
    res.json(getPlannerFallback([], 3));
  }
});

// 3. AI Topic Explainer
app.post("/api/ai/explain", async (req, res) => {
  try {
    const { topic, subject, complexityLevel, promptType } = req.body;

    if (ai) {
      try {
        const prompt = `Explain the following topic for a student:
Topic: "${topic}"
Subject: ${subject || "General Academic"}
Target Complexity Level: ${complexityLevel || "College Level"}
Format Type: ${promptType || "Comprehensive Explanation"}`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction: "You are a master educator who explains complex academic concepts clearly.",
            temperature: 0.6,
          },
        });

        if (response.text) {
          return res.json({ explanation: response.text });
        }
      } catch (err) {
        console.warn("Gemini Explain API failed, using fallback:", err);
      }
    }

    res.json({
      explanation: `## Concept Overview: ${topic || "Core Subject"}\n\n**Subject:** ${subject || "Academic"} | **Complexity:** ${complexityLevel || "Standard"}\n\n### 1. Intuitive Explanation\nThink of **${topic}** as a foundational component in ${subject}. Instead of memorizing raw details, focus on how inputs transform into predictable outputs.\n\n### 2. Key Principles\n* **Structure**: Systems operate according to defined rules and constraints.\n* **Flow**: Input variables dictate throughput and efficiency.\n\n### 3. Study & Exam Advice\n- Practice deriving core equations/concepts from first principles.\n- Test your knowledge using active recall flashcards.`,
    });
  } catch (error) {
    res.json({ explanation: "Concept explanation generated." });
  }
});

// 4. AI Notes Summarizer
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { rawNotes, subject, noteTitle } = req.body;

    if (ai) {
      try {
        const prompt = `Summarize and transform these student notes into a structured study kit:
Note Title: "${noteTitle || "Untitled Notes"}"
Subject: "${subject || "General"}"
Raw Content:
"""
${rawNotes}
"""`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction: "You are a study summarization assistant.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                keyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                cheatSheet: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING },
                    },
                  },
                },
                flashcards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      answer: { type: Type.STRING },
                    },
                    required: ["question", "answer"],
                  },
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["summary", "keyTakeaways", "flashcards", "tags"],
            },
          },
        });

        if (response.text) {
          return res.json(JSON.parse(response.text));
        }
      } catch (err) {
        console.warn("Gemini Summarizer API failed, using fallback:", err);
      }
    }

    res.json(getSummarizerFallback(noteTitle, subject));
  } catch (error: any) {
    console.error("Summarize Route Error:", error);
    res.json(getSummarizerFallback(req.body?.noteTitle, req.body?.subject));
  }
});

// 5. AI Quiz Generator
app.post("/api/ai/quiz", async (req, res) => {
  try {
    const { subject, topic, difficulty, questionCount, quizType } = req.body;

    if (ai) {
      try {
        const prompt = `Generate an interactive ${quizType || "Multiple Choice"} quiz:
- Subject: ${subject}
- Specific Topic: ${topic}
- Difficulty: ${difficulty || "Medium"}
- Questions: ${questionCount || 5}`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction: "You are an exam maker and quiz generator for students.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                quizTitle: { type: Type.STRING },
                subject: { type: Type.STRING },
                topic: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      correctIndex: { type: Type.NUMBER },
                      explanation: { type: Type.STRING },
                    },
                    required: ["id", "text", "options", "correctIndex", "explanation"],
                  },
                },
              },
              required: ["quizTitle", "subject", "topic", "difficulty", "questions"],
            },
          },
        });

        if (response.text) {
          return res.json(JSON.parse(response.text));
        }
      } catch (err) {
        console.warn("Gemini Quiz API failed, using fallback:", err);
      }
    }

    res.json(getQuizFallback(subject, topic, difficulty));
  } catch (error: any) {
    console.error("Quiz Route Error:", error);
    res.json(getQuizFallback(req.body?.subject, req.body?.topic, req.body?.difficulty));
  }
});

// ----------------------------------------------------
// VITE / STATIC MIDDLEWARE SETUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Fix 3: Dynamic Import for Vite so production builds don't fail when Vite is in devDependencies
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: tr
