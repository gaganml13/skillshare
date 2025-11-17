import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const HISTORY_KEY = 'skillshare:ai-widget-history';

const Shell = styled.section`
  border-radius: 1.75rem;
  background: #ffffff;
  box-shadow: 0 25px 65px rgba(15, 23, 42, 0.15);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.05);
`;

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const CollapseButton = styled.button`
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.8rem;
  background: #f8fafc;
  cursor: pointer;
`;

const SuggestedPrompts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const PromptButton = styled.button`
  text-align: left;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1rem;
  padding: 0.55rem 0.85rem;
  font-size: 0.85rem;
  background: #f8fafc;
  color: inherit;
  cursor: pointer;
  transition: transform 150ms ease, border-color 150ms ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
    border-color: rgba(99, 102, 241, 0.45);
  }
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin: 0.5rem 0;
  max-height: 260px;
  overflow-y: auto;
`;

const MessageBubble = styled.div`
  border-radius: 1rem;
  padding: 0.75rem;
  font-size: 0.9rem;
  align-self: ${({ $author }) => ($author === 'You' ? 'flex-end' : 'flex-start')};
  background: ${({ $author }) => ($author === 'You' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.05)')};
  color: #0f172a;
  max-width: 100%;
`;

const InputRow = styled.form`
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
`;

const TextInput = styled.input`
  flex: 1;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  padding: 0.65rem 0.85rem;
  font-size: 0.95rem;
`;

const SendButton = styled.button`
  border-radius: 1rem;
  border: none;
  padding: 0.65rem 1rem;
  font-weight: 600;
  background: linear-gradient(120deg, #6366f1, #8b5cf6);
  color: white;
  cursor: pointer;
`;

const HistoryStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #475569;
`;

const HistoryChip = styled.span`
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  background: #f1f5f9;
`;

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

const uniqueId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

  const pushMessage = (payload) => {
    setMessages((prev) => [...prev.slice(-24), payload]);
  };

  const simulateReply = () => {
    setTimeout(() => {
      pushMessage({
        id: uniqueId(),
        author: 'AI',
        text: 'Noted! I logged this for your weekly recap.'
      });
    }, 400);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = input.trim();
    if (!query) return;
    console.info('[AIChatWidget]', query);
    pushMessage({ id: uniqueId(), author: 'You', text: query });
    setInput('');
    simulateReply();
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    console.info('[AIChatWidget:prompt]', prompt);
  };

  const recentQueries = messages
    .filter((msg) => msg.author === 'You')
    .slice(-4)
    .reverse();

  return (
    <Shell aria-live="polite">
      <Header>
        <div>
          <p style={{
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            margin: 0
          }}>
            AI Study Assistant
          </p>
          <h3 style={{ margin: 0 }}>Stay on track</h3>
          <p style={{ marginTop: 4, color: '#475569' }}>Log focus blocks, get summaries, and keep streaks alive.</p>
        </div>
        <CollapseButton
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          aria-controls="ai-widget-body"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </CollapseButton>
      </Header>

      {!collapsed && (
        <div id="ai-widget-body">
          <SuggestedPrompts aria-label="Suggested prompts">
            {prompts.map((prompt) => (
              <PromptButton key={prompt} type="button" onClick={() => handlePromptClick(prompt)}>
                {prompt}
              </PromptButton>
            ))}
          </SuggestedPrompts>

          <MessageList>
            {messages.map((message) => (
              <MessageBubble key={message.id} $author={message.author}>
                <strong>{message.author}:</strong> {message.text}
              </MessageBubble>
            ))}
          </MessageList>

          <HistoryStrip>
            {recentQueries.length === 0 && <HistoryChip>Recent prompts will appear here</HistoryChip>}
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
        </div>
      )}
    </Shell>
  );
};

export default AIChatWidget;
