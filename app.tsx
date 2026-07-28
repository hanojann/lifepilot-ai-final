import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'coach' | 'planner' | 'explain' | 'summarize' | 'quiz'>('coach');
  const [loading, setLoading] = useState(false);

  // Coach State
  const [coachInput, setCoachInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string; text: string }>>([
    { sender: 'coach', text: '👋 Hi! I am your LifePilot AI Study Coach. What are we tackling today?' }
  ]);

  // Planner State
  const [subjects, setSubjects] = useState('');
  const [hours, setHours] = useState('3');
  const [planResult, setPlanResult] = useState<any>(null);

  // Explainer State
  const [explainTopic, setExplainTopic] = useState('');
  const [explainSubject, setExplainSubject] = useState('');
  const [explainResult, setExplainResult] = useState('');

  // Summarizer State
  const [rawNotes, setRawNotes] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [summaryResult, setSummaryResult] = useState<any>(null);

  // Quiz State
  const [quizSubject, setQuizSubject] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizResult, setQuizResult] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  // Handlers
  const handleCoachSend = async () => {
    if (!coachInput.trim()) return;
    const newMsg = { sender: 'user', text: coachInput };
    const updatedHistory = [...chatHistory, newMsg];
    setChatHistory(updatedHistory);
    setCoachInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedHistory }),
      });
      const data = await res.json();
      setChatHistory([...updatedHistory, { sender: 'coach', text: data.reply }]);
    } catch (err) {
      setChatHistory([...updatedHistory, { sender: 'coach', text: '🚀 Keep going! Focus on 25 min blocks.' }]);
    }
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: subjects.split(','), availableHoursPerDay: Number(hours) }),
      });
      const data = await res.json();
      setPlanResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleExplain = async () => {
    if (!explainTopic) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: explainTopic, subject: explainSubject }),
      });
      const data = await res.json();
      setExplainResult(data.explanation);
    } catch (err) {
      setExplainResult('Concept breakdown generated.');
    }
    setLoading(false);
  };

  const handleSummarize = async () => {
    if (!rawNotes) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes, noteTitle, subject: explainSubject }),
      });
      const data = await res.json();
      setSummaryResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleGenerateQuiz = async () => {
    if (!quizTopic) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: quizSubject, topic: quizTopic }),
      });
      const data = await res.json();
      setQuizResult(data);
      setSelectedAnswers({});
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.appContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoBadge}>🚀 LifePilot AI</div>
        <p style={styles.subtitle}>Your AI Academic Productivity & Exam Suite</p>
      </header>

      {/* Navigation Tabs */}
      <nav style={styles.tabsContainer}>
        {[
          { id: 'coach', label: '💬 AI Coach' },
          { id: 'planner', label: '📅 Study Planner' },
          { id: 'explain', label: '💡 Concept Explainer' },
          { id: 'summarize', label: '📝 Summarizer & Flashcards' },
          { id: 'quiz', label: '🎯 Quiz Master' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab.id ? styles.activeTabButton : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main style={styles.mainCard}>
        {/* Tab 1: AI Coach */}
        {activeTab === 'coach' && (
          <div style={styles.tabSection}>
            <h2 style={styles.sectionTitle}>Academic Coach & Assistant</h2>
            <div style={styles.chatBox}>
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.chatBubble,
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.sender === 'user' ? '#6366f1' : '#334155',
                  }}
                >
                  <strong>{msg.sender === 'user' ? 'You' : 'LifePilot'}:</strong>
                  <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                </div>
              ))}
            </div>
            <div style={styles.inputRow}>
              <input
                style={styles.input}
                placeholder="Ask for study tips, motivation, or guidance..."
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCoachSend()}
              />
              <button style={styles.primaryBtn} onClick={handleCoachSend} disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Study Planner */}
        {activeTab === 'planner' && (
          <div style={styles.tabSection}>
            <h2 style={styles.sectionTitle}>Smart Daily Study Planner</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subjects (comma separated)</label>
              <input
                style={styles.input}
                placeholder="e.g. Computer Science, Physics, Calculus"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Available Hours per Day</label>
              <input
                style={styles.input}
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <button style={styles.primaryBtn} onClick={handleGeneratePlan} disabled={loading}>
              {loading ? 'Generating Plan...' : 'Generate Itinerary'}
            </button>

            {planResult && (
              <div style={styles.resultBox}>
                <h3>Plan Overview</h3>
                <p>{planResult.planSummary}</p>
                <h4>Schedule Blocks:</h4>
                {planResult.studySchedule?.map((item: any, i: number) => (
                  <div key={i} style={styles.cardItem}>
                    <span style={styles.badge}>{item.priority} Priority</span>
                    <strong>{item.title}</strong> ({item.estimatedMinutes} mins)
                    <p style={{ margin: '4px 0 0 0', color: '#cbd5e1' }}>{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Explainer */}
        {activeTab === 'explain' && (
          <div style={styles.tabSection}>
            <h2 style={styles.sectionTitle}>Deep Concept Explainer</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subject</label>
              <input
                style={styles.input}
                placeholder="e.g. Physics, Chemistry, Economics"
                value={explainSubject}
                onChange={(e) => setExplainSubject(e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Specific Topic or Equation</label>
              <input
                style={styles.input}
                placeholder="e.g. Quantum Entanglement or Bayes Theorem"
                value={explainTopic}
                onChange={(e) => setExplainTopic(e.target.value)}
              />
            </div>
            <button style={styles.primaryBtn} onClick={handleExplain} disabled={loading}>
              {loading ? 'Explaining...' : 'Explain Topic'}
            </button>

            {explainResult && (
              <div style={styles.resultBox}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{explainResult}</div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Summarizer */}
        {activeTab === 'summarize' && (
          <div style={styles.tabSection}>
            <h2 style={styles.sectionTitle}>Notes Summarizer & Flashcards</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Note Title</label>
              <input
                style={styles.input}
                placeholder="e.g. Lecture 4: Operating System Memory"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Raw Class Notes Content</label>
              <textarea
                style={{ ...styles.input, height: '100px' }}
                placeholder="Paste your raw lecture notes or textbook excerpt here..."
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
              />
            </div>
            <button style={styles.primaryBtn} onClick={handleSummarize} disabled={loading}>
              {loading ? 'Processing Notes...' : 'Create Study Kit'}
            </button>

            {summaryResult && (
              <div style={styles.resultBox}>
                <h3>Summary</h3>
                <p>{summaryResult.summary}</p>
                <h4>Flashcards Generated:</h4>
                {summaryResult.flashcards?.map((fc: any, i: number) => (
                  <div key={i} style={styles.cardItem}>
                    <strong>Q: {fc.question}</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#a7f3d0' }}>A: {fc.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Quiz Generator */}
        {activeTab === 'quiz' && (
          <div style={styles.tabSection}>
            <h2 style={styles.sectionTitle}>Interactive Quiz Generator</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subject & Topic</label>
              <input
                style={styles.input}
                placeholder="e.g. Biology - Cell Structure"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
              />
            </div>
            <button style={styles.primaryBtn} onClick={handleGenerateQuiz} disabled={loading}>
              {loading ? 'Generating Quiz...' : 'Start Quiz'}
            </button>

            {quizResult && (
              <div style={styles.resultBox}>
                <h3>{quizResult.quizTitle}</h3>
                {quizResult.questions?.map((q: any, qIdx: number) => (
                  <div key={q.id || qIdx} style={styles.cardItem}>
                    <strong>Question {qIdx + 1}: {q.text}</strong>
                    <div style={{ marginTop: '8px' }}>
                      {q.options?.map((opt: string, optIdx: number) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        const isCorrect = q.correctIndex === optIdx;
                        let btnStyle = { ...styles.optionBtn };
                        if (isSelected) {
                          btnStyle.backgroundColor = isCorrect ? '#059669' : '#dc2626';
                        }
                        return (
                          <button
                            key={optIdx}
                            style={btnStyle}
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {selectedAnswers[q.id] !== undefined && (
                      <p style={{ marginTop: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ----------------------------------------------------
// SLEEK MODERN INLINE STYLES
// ----------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoBadge: {
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  },
  subtitle: {
    color: '#94a3b8',
    margin: '6px 0 0 0',
    fontSize: '14px',
  },
  tabsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  tabButton: {
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    border: '1px solid #334155',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  activeTabButton: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    borderColor: '#818cf8',
  },
  mainCard: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #334155',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  tabSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#f1f5f9',
  },
  chatBox: {
    height: '300px',
    overflowY: 'auto',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '12px',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  chatBubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    color: '#f8fafc',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  },
  primaryBtn: {
    padding: '12px 20px',
    borderRadius: '8px',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  resultBox: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    border: '1px solid #334155',
  },
  cardItem: {
    backgroundColor: '#1e293b',
    padding: '12px',
    borderRadius: '8px',
    marginTop: '10px',
    border: '1px solid #334155',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    backgroundColor: '#4338ca',
    borderRadius: '4px',
    fontSize: '11px',
    marginRight: '8px',
  },
  optionBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 12px',
    marginTop: '6px',
    borderRadius: '6px',
    backgroundColor: '#334155',
    color: '#ffffff',
    border: '1px solid #475569',
    cursor: 'pointer',
  },
};
