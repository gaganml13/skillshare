import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { getMicroEventChatLog, saveMicroEventChatLog } from '../utils/loadSeeds';
import '../styles/ui.css';

// MicroEventModal provides the live room placeholder with countdown + chat
const MicroEventModal = ({ event, viewer, onClose }) => {
  const [messages, setMessages] = useState(() => getMicroEventChatLog(event.id));
  const [messageInput, setMessageInput] = useState('');
  const [countdown, setCountdown] = useState('');
  const modalRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Sync chat log when event changes
  useEffect(() => {
    setMessages(getMicroEventChatLog(event.id));
  }, [event.id]);

  // Trap focus inside modal for keyboard users
  useEffect(() => {
    const node = modalRef.current;
    if (!node) return undefined;
    previousFocusRef.current = document.activeElement;
    node.focus();
    const handleKeyDown = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        onClose();
        return;
      }
      if (evt.key === 'Tab') {
        const focusable = node.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (evt.shiftKey && document.activeElement === first) {
          evt.preventDefault();
          last.focus();
        } else if (!evt.shiftKey && document.activeElement === last) {
          evt.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [onClose]);

  // Countdown / elapsed timer
  useEffect(() => {
    const updateCountdown = () => {
      const startTs = new Date(event.startTime).getTime();
      const diff = startTs - Date.now();
      if (diff <= 0) {
        const minutes = Math.floor(Math.abs(diff) / 60000);
        const seconds = Math.floor((Math.abs(diff) % 60000) / 1000);
        setCountdown(`Live • ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [event.startTime]);

  // Schedule notification 1 minute before start
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return undefined;
    if (window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
    const startTs = new Date(event.startTime).getTime();
    const notifyAt = startTs - 60000;
    const delay = notifyAt - Date.now();
    if (delay <= 0) return undefined;
    notificationTimeoutRef.current = window.setTimeout(() => {
      if (window.Notification.permission === 'granted') {
        new window.Notification(`${event.title} starts soon`, {
          body: 'Room opens in 1 minute'
        });
      } else {
        window.alert(`${event.title} starts in 1 minute`);
      }
    }, delay);
    return () => window.clearTimeout(notificationTimeoutRef.current);
  }, [event.startTime, event.title]);

  const handleSubmit = (submissionEvent) => {
    submissionEvent.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    const nextMessage = {
      id: `chat-${Date.now()}`,
      author: viewer?.name || 'You',
      body: trimmed,
      timestamp: new Date().toISOString()
    };
    const nextLog = [...messages, nextMessage];
    setMessages(nextLog);
    setMessageInput('');
    saveMicroEventChatLog(event.id, nextLog);
  };

  return (
    <div className="micro-event-room" role="dialog" aria-modal="true" aria-label={`${event.title} live room`}>
      <div className="micro-event-room__content" ref={modalRef} tabIndex={-1}>
        <header>
          <div>
            <p className="micro-event-room__eyebrow">Live micro-event</p>
            <h4>{event.title}</h4>
            <p>{event.type} • {event.duration} min</p>
            <small>Host: {event.hostName}</small>
          </div>
          <div className="micro-event-room__timer" aria-live="polite">
            <span>{countdown.startsWith('Live') ? 'Elapsed' : 'Starts in'}</span>
            <strong>{countdown}</strong>
          </div>
          <button type="button" className="ghost-btn" onClick={onClose} aria-label="Close live room">
            Done
          </button>
        </header>

        <section className="micro-event-room__prompt" aria-label="Prompt">
          <h5>Prompt</h5>
          <p>{event.prompt || 'Share your intention in chat.'}</p>
        </section>

        <section className="micro-event-room__chat" aria-label="Live chat">
          <div className="micro-event-room__chat-log" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className="micro-event-room__chat-item">
                <strong>{message.author}</strong>
                <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <p>{message.body}</p>
              </div>
            ))}
            {!messages.length && <p>No messages yet. Break the ice!</p>}
          </div>
          <form className="micro-event-room__chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={messageInput}
              onChange={(eventObj) => setMessageInput(eventObj.target.value)}
              placeholder="Share a note"
              aria-label="Chat message"
            />
            <button type="submit" className="primary-btn">Send</button>
          </form>
        </section>
      </div>
    </div>
  );
};

MicroEventModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string,
    duration: PropTypes.number,
    startTime: PropTypes.string.isRequired,
    prompt: PropTypes.string,
    hostName: PropTypes.string
  }).isRequired,
  viewer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default MicroEventModal;
