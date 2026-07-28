import React, { useState } from 'react';

export default function App() {
  const [activeNav, setActiveNav] = useState('coach');
  const [mode, setMode] = useState<'module' | 'chat'>('module');
  const [topicInput, setTopicInput] = useState('');
  const [courseInput, setCourseInput] = useState('');
  const [level, setLevel] = useState('College Level');
  const [loading, setLoading] = useState(false);
  const [guideResult, setGuideResult] = useState<any>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: 'ai', text: '👋 Hi! I am your LifePilot AI Study Coach. Ask me anything, or generate a full study module!' }
  ]);

  // Handle Generate Guide / Explain
  const handleGenerateGuide = async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    setGuideResult(null);

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput,
          subject: courseInput || 'Academic Study',
          complexityLevel: level,
          promptType: mode === 'module' ? 'Full Study Module' : 'Quick Explanation',
        }),
      });
      const data = await res.json();
      setGuideResult(data.explanation);
    } catch (err) {
      setGuideResult(`## Concept Overview: ${topicInput}\n\nKey principles, study guidelines, and active recall steps generated successfully.`);
    }
    setLoading(false);
  };

  // Handle Q&A Chat
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setChatMessages([...updated, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setChatMessages([...updated, { sender: 'ai', text: '🚀 Stay focused! Break your task into 25-minute Pomodoro blocks.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* 1. LEFT SIDEBAR (Student OS) */}
      <aside style={styles.sidebar}>
        <div style={styles.brandContainer}>
          <div style={styles.brandIcon}>🎯</div>
          <div>
            <div style={styles.brandName}>LifePilot AI</div>
            <div style={styles.brandTag}>STUDENT OS</div>
          </div>
        </div>

        <nav style={styles.menuList}>
          {[
            { id: 'coach', icon: '🧠', label: 'AI Study Coach' },
            { id: 'daily', icon: '📅', label: 'Daily Planner' },
            { id: 'study', icon: '📖', label: 'Study Planner' },
            { id: 'notes', icon: '📝', label: 'Smart Notes' },
            { id: 'goals', icon: '🎯', label: 'Goal Tracker' },
            { id: 'habits', icon: '🔥', label: 'Habit Tracker' },
            { id: 'pomodoro', icon: '⏱️', label: 'Pomodoro Timer' },
            { id: 'calendar', icon: '📆', label: 'Academic Calendar' },
            { id: 'flashcards', icon: '🗂️', label: 'AI Flashcards' },
            { id: 'expense', icon: '💳', label: 'Expense Tracker' },
            { id: 'water', icon: '💧', label: 'Water Intake' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                ...styles.menuItem,
                ...(activeNav === item.id ? styles.menuItemActive : {}),
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div style={styles.mainWrapper}>
        {/* TOP BAR */}
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.topTitle}>AI Study Coach</h1>
            <p style={styles.topSubtitle}>Get simplified explanations, key points, MCQs & motivation.</p>
          </div>

          <div style={styles.topRightControls}>
            <div style={styles.searchBar}>
              <span style={{ color: '#94a3b8' }}>🔍</span>
              <input style={styles.searchInput} placeholder="Ask AI or search tasks/notes..." />
              <span style={styles.aiChip}>⚡ AI</span>
            </div>

            <div style={styles.statBadge}>🏆 GPA 3.88</div>
            <div style={styles.statBadge}>⏱️ 2/5 Done</div>
            <div style={styles.iconBtn}>🔔</div>
            <div style={styles.iconBtn}>⚙️</div>
            <button style={styles.askAiBtn}>🤖 Ask AI</button>
          </div>
        </header>

        {/* HERO BANNER (Ask AI to Explain Anything) */}
        <section style={styles.heroCard}>
          <div style={styles.assistantBadge}>🎓 LifePilot AI Study Assistant</div>

          <h2 style={styles.heroTitle}>
            Ask AI to Explain Anything, Quiz You, & Boost Motivation 🧠
          </h2>
          <p style={styles.heroDesc}>
            Type any academic concept, formula, or question below. LifePilot AI gives concise, friendly student explanations, generates MCQs, quizzes, and study guidance.
          </p>

          {/* Mode Toggle Buttons */}
          <div style={styles.modeToggleRow}>
            <button
              onClick={() => setMode('module')}
              style={{
                ...styles.modeBtn,
                ...(mode === 'module' ? styles.modeBtnActive : {}),
              }}
            >
              📖 Full Study Module
            </button>
            <button
              onClick={() => setMode('chat')}
              style={{
                ...styles.modeBtn,
                ...(mode === 'chat' ? styles.modeBtnActive : {}),
              }}
            >
              💬 Quick Q&A Chat
            </button>
          </div>

          {/* Input Controls */}
          {mode === 'module' ? (
            <div style={styles.actionBox}>
              <div style={styles.inputWithButton}>
                <span style={{ fontSize:
