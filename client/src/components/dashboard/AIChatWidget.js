import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const HISTORY_KEY = 'skillshare:ai-widget-history';

const WidgetShell = styled.aside`
  position: sticky;
  top: 2rem;
  border-radius: 1.5rem;
  background: linear-gradient(160deg, #1d1b5f, #4338ca);
  color: #fff;
  padding: 1.25rem;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.35);
  min-height: 420px;
  min-width: 320px;
  transition: width 220ms ease, transform 220ms ease;
  overflow: hidden;

  &[data-collapsed='true'] {
    width: 64px;
    min-width: 64px;
    min-height: 64px;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ToggleButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  padding: 0.2rem 0.85rem;
  background: rgba(15, 23, 42, 0.25);
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  align-self: flex-end;
`;

const PromptButton = styled.button`
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 0.55rem 0.85rem;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  cursor: pointer;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin: 1rem 0;
  max-height: 260px;
  overflow-y: auto;
`;

const MessageBubble = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  padding: 0.75rem;
  font-size: 0.9rem;
`;

const InputRow = styled.form`
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
`;

const TextInput = styled.input`
  flex: 1;
  border-radius: 1rem;
  border: none;
  padding: 0.65rem 0.85rem;
  font-size: 0.95rem;
`;

const SendButton = styled.button`
  border-radius: 1rem;
  border: none;
  padding: 0.65rem 1rem;
  font-weight: 600;
  background: #f1f5ff;
  color: #27204a;
  cursor: pointer;
`;

const SuggestedPrompts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const HistoryStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
`;

const HistoryChip = styled.span`
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.35);
`;

const EmptyState = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
`;

const uniqueId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readHistory = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

const writeHistory = (history) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-25)));
};

const AIChatWidget = ({ userName = 'Learner' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 'seed', author: 'AI', text: `Hi ${userName}, ask me anything about your lessons or projects.` }
  ]);

  useEffect(() => {
    const stored = readHistory();
    if (stored.length > 0) {
      setMessages(stored);
    }
  }, []);

  useEffect(() => {
    if (messages.length) {
      writeHistory(messages);
    }
  }, [messages]);

  const prompts = useMemo(() => [
    'Summarize my progress this week',
    'Suggest a project based on the UI course',
    'Quiz me on responsive design basics'
  ], []);

  const logMessage = (text) => {
    console.info('[AIChatWidget]', text);
  };

  const pushMessage = (payload) => {
    setMessages((prev) => [...prev.slice(-24), payload]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = input.trim();
    if (!query) return;
    const userMessage = { id: uniqueId(), author: 'You', text: query, timestamp: new Date().toISOString() };
    pushMessage(userMessage);
    logMessage(query);
    setInput('');

    setTimeout(() => {
      pushMessage({
        id: uniqueId(),
        author: 'AI',
        text: 'Noted! I will add this to your study log 📚',
        timestamp: new Date().toISOString()
      });
    }, 400);
  };

  const handlePrompt = (prompt) => {
    setInput(prompt);
  };

  const recentQueries = messages
    .filter((msg) => msg.author === 'You')
    .slice(-4)
    .reverse();

  return (
    <WidgetShell className="fade-up" aria-live="polite" data-collapsed={collapsed}>
      <ToggleButton type="button" onClick={() => setCollapsed((prev) => !prev)}>
        {collapsed ? 'Open AI' : 'Collapse'}
      </ToggleButton>
      {!collapsed && (
        <>
          <h3 style={{ margin: '0 0 0.25rem' }}>AI Study Assistant</h3>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', color: 'rgba(255,255,255,0.85)' }}>
            Keep notes, summarize lessons, and log focus blocks.
          </p>
          <SuggestedPrompts>
            {prompts.map((prompt) => (
              <PromptButton key={prompt} type="button" onClick={() => handlePrompt(prompt)}>
                {prompt}
              </PromptButton>
            ))}
          </SuggestedPrompts>
          <MessageList>
            {messages.length === 0 && <EmptyState>No messages yet. Try a quick prompt!</EmptyState>}
            {messages.map((message) => (
              <MessageBubble key={message.id}>
                <strong>{message.author}:</strong> {message.text}
              </MessageBubble>
            ))}
          </MessageList>
          <HistoryStrip>
            {recentQueries.length === 0 && <HistoryChip>Recently logged queries will show here</HistoryChip>}
            {recentQueries.map((msg) => (
              <HistoryChip key={msg.id}>{msg.text}</HistoryChip>
            ))}
          </HistoryStrip>
          <InputRow onSubmit={handleSubmit}>
            <TextInput
              type="text"
              placeholder="Ask anything about your course..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="Ask the AI assistant"
            />
            <SendButton type="submit">Send</SendButton>
          </InputRow>
        </>
      )}
    </WidgetShell>
  );
};

export default AIChatWidget;
