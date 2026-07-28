import React, { useState } from 'react';

export default function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ sender: 'user', text: input }] }),
      });
      const data = await res.json();
      setResponse(data.reply || 'No response');
    } catch (err) {
      setResponse('Error connecting to AI');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1>LifePilot AI</h1>
      <textarea
        rows={4}
        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        placeholder="Ask LifePilot AI..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br />
      <button 
        onClick={handleAsk} 
        disabled={loading}
        style={{ padding: '10px 20px', marginTop: '10px', borderRadius: '5px', background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        {loading ? 'Thinking...' : 'Send'}
      </button>
      {response && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f4f4f4', borderRadius: '8px' }}>
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
          }
