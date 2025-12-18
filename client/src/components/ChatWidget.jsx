import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/chat-widget.css';
import { API_URL } from '../config';

const CHAT_ENDPOINT = `${API_URL}/api/chat`;

// Predefined questions
const QUICK_QUESTIONS = [
  "Which course should I start?",
  "Best course for beginners?",
  "Courses for placement preparation?",
  "How to grow skills fast?",
  "Which domain has more jobs?"
];

const ChatWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm SkillverseX AI. How can I help you learn today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useLocalOnly, setUseLocalOnly] = useState(false); // Persistent fallback state
  const messagesEndRef = useRef(null);

  // Only render on Home ('/' or '/home') and Course pages ('/course...')
  const shouldRender =
    location.pathname === '/' ||
    location.pathname === '/home' ||
    location.pathname.startsWith('/course');

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!shouldRender) return null;

  // LOCAL RESPONSE ENGINE
  const getLocalResponse = (text) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("which course should i start")) {
      return "If you're a beginner, start with Web Development or Programming Fundamentals. These courses build strong foundations and have high job demand.";
    }
    if (lowerText.includes("best course") || lowerText.includes("beginner")) {
      return "Beginner-friendly courses include HTML, CSS, JavaScript, and basic UI/UX design. They are easy to start and very practical.";
    }
    if (lowerText.includes("placement")) {
      return "For placements, focus on DSA, Full Stack Development, and project-based courses with mentorship support.";
    }
    if (lowerText.includes("grow skills") || lowerText.includes("fast")) {
      return "Consistent learning, real-world projects, community collaboration, and mentorship will help you grow skills faster.";
    }
    if (lowerText.includes("domain") || lowerText.includes("jobs")) {
      return "Currently, Web Development, AI & Automation, and Data-related roles have strong job demand.";
    }
    if (lowerText.includes("community")) {
      return "Our community helps you learn from peers, share projects, and stay motivated. It's a key part of the SkillverseX experience.";
    }
    if (lowerText.includes("mentor")) {
      return "Mentorship connects you with industry experts to guide your career path and help with technical challenges.";
    }

    // Default fallback
    return "That’s a great question. Explore courses, community discussions, or mentorship to grow faster on SkillverseX.";
  };

  const processMessage = async (text) => {
    // 1. UI Update (User Message)
    const userMessage = { id: Date.now(), text: text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    let replyText = "";

    // PHASE 2 CHECK: If we already failed once, strictly use local logic
    if (useLocalOnly) {
      setTimeout(() => { // Simulate tiny partial delay for natural feel
        const reply = getLocalResponse(text);
        const botMessage = { id: Date.now() + 1, text: reply, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 600);
      return;
    }

    try {
      // PHASE 1: Try Real API
      // const controller = new AbortController();
      // const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        // signal: controller.signal
      });
      // clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.reply) {
          replyText = data.reply;
        } else {
          throw new Error("Invalid API response format");
        }
      } else {
        throw new Error("API Error or Non-JSON response");
      }

    } catch (error) {
      // PHASE 2: Fallback to Local Smart AI
      console.log("Switching to Local AI due to error:", error);
      setUseLocalOnly(true); // Enable persistent fallback
      replyText = getLocalResponse(text);
    }

    // 2. UI Update (Bot Reply) - strictly no errors shown
    const botMessage = {
      id: Date.now() + 1,
      text: replyText,
      sender: 'bot'
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    processMessage(inputValue);
  };

  const handleChipClick = (question) => {
    if (isLoading) return;
    processMessage(question);
  };

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>SkillverseX AI</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                AI is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-questions-container">
            <div className="quick-questions-title">Try asking:</div>
            <div className="chips-wrapper">
              {QUICK_QUESTIONS.map((q, index) => (
                <button
                  key={index}
                  className="chip"
                  onClick={() => handleChipClick(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
            />
            <button type="submit" className="send-btn" disabled={isLoading || !inputValue.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Ask SkillverseX AI
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
