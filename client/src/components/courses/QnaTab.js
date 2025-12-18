// QnaTab.js - Q&A tab for course detail page
import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const QnaTab = ({ courseId, discussions = [], refreshDiscussions }) => {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to ask a question.');
      setLoading(false);
      return;
    }
    try {
      await axios.post(`${API_URL}/api/discussions/ask`, {
        courseId,
        question,
      }, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setQuestion('');
      if (refreshDiscussions) refreshDiscussions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit question');
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>Questions & Answers</h3>
      <form onSubmit={handleAskQuestion} style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          style={{ width: '70%', padding: 8, marginRight: 8 }}
          required
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 18px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 4 }}>
          {loading ? 'Submitting...' : 'Ask'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div>
        {discussions.length === 0 ? (
          <p>No questions yet. Be the first to ask!</p>
        ) : (
          discussions.map(disc => (
            <div key={disc._id} style={{ marginBottom: 24, padding: 16, background: '#f7f7fa', borderRadius: 8 }}>
              <strong>{disc.user?.name || 'Anonymous'}:</strong> {disc.question}
              <div style={{ marginLeft: 16, marginTop: 8 }}>
                {disc.answers && disc.answers.length > 0 ? (
                  disc.answers.map((ans, idx) => (
                    <div key={idx} style={{ marginBottom: 6 }}>
                      <span style={{ color: '#2196F3', fontWeight: 500 }}>{ans.user?.name || 'Anonymous'}:</span> {ans.text}
                    </div>
                  ))
                ) : (
                  <span style={{ color: '#aaa' }}>No answers yet.</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QnaTab;
