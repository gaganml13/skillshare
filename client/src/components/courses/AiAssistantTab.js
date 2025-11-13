// AiAssistantTab.js - AI Assistant tab for course detail page

import React, { useState } from 'react';
import axios from 'axios';

const AiAssistantTab = ({ showHeader = true }) => {
  const [messages, setMessages] = useState([]); // { sender: 'user'|'ai', text: string }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError('');
    setLoading(true);
    const userMsg = { sender: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/ai/chat',
        { prompt: input },
        token ? { headers: { Authorization: 'Bearer ' + token } } : {}
      );
      const aiMsg = { sender: 'ai', text: res.data.response || res.data.result || 'No response.' };
      setMessages(msgs => [...msgs, aiMsg]);
    } catch (err) {
      setError('AI request failed.');
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div style={{ width: '100%' }}>
      {showHeader && <h3>Gemini AI Assistant</h3>}
      <div style={{ background: '#f7f7fa', borderRadius: 8, padding: 16, minHeight: 200, marginBottom: 16 }}>
        {messages.length === 0 ? (
          <p style={{ color: '#aaa' }}>Start a conversation with Gemini AI.</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 12, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
              <span style={{ fontWeight: 600, color: msg.sender === 'user' ? '#6C63FF' : '#2196F3' }}>
                {msg.sender === 'user' ? 'You' : 'Gemini'}:
              </span> {msg.text}
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question..."
          style={{ flex: 1, padding: 8 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ padding: '8px 18px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: 4 }}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default AiAssistantTab;
