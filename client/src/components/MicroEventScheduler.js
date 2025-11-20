import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import MicroEventCard from './MicroEventCard';
import {
  createMicroEvent,
  getCurrentCommunityUser,
  getMicroEvents,
  getMicroEventChatLog,
  joinMicroEvent,
  saveMicroEventChatLog
} from '../utils/loadSeeds';
import '../styles/ui.css';

// Returns today in YYYY-MM-DD for quick scheduling defaults
const todayIso = () => new Date().toISOString().split('T')[0];

const defaultForm = {
  title: 'Daily Coding Challenge',
  type: 'Coding Challenge',
  date: todayIso(),
  time: '19:00',
  duration: 15,
  tags: 'Focus,Live',
  prompt: 'Ship a micro build and drop your link in chat.',
  recurringDays: 3,
  recurring: false
};

const MicroEventScheduler = ({ onEventsChange }) => {
  const viewer = useMemo(() => getCurrentCommunityUser(), []);
  const [events, setEvents] = useState(() => getMicroEvents());
  const [formState, setFormState] = useState(defaultForm);
  const [statusMessage, setStatusMessage] = useState('');
  const [recentIds, setRecentIds] = useState([]);
  const [modalEvent, setModalEvent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [countdown, setCountdown] = useState('');

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [events]
  );

  const refreshEvents = useCallback(() => {
    const next = getMicroEvents();
    setEvents(next);
  }, []);

  useEffect(() => {
    if (onEventsChange) {
      onEventsChange(events);
    }
  }, [events, onEventsChange]);

  useEffect(() => {
    const handleUpdate = () => refreshEvents();
    if (typeof window !== 'undefined') {
      window.addEventListener('microEvents:updated', handleUpdate);
      window.addEventListener('microEvents:rsvp', handleUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('microEvents:updated', handleUpdate);
        window.removeEventListener('microEvents:rsvp', handleUpdate);
      }
    };
  }, [refreshEvents]);

  useEffect(() => {
    if (!recentIds.length) return undefined;
    const timeout = window.setTimeout(() => setRecentIds([]), 3500);
    return () => window.clearTimeout(timeout);
  }, [recentIds]);

  useEffect(() => {
    if (!modalEvent) return undefined;
    const updateCountdown = () => {
      const start = new Date(modalEvent.startTime).getTime();
      const now = Date.now();
      const diff = start - now;
      if (diff <= 0) {
        setCountdown('Live now');
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [modalEvent]);

  useEffect(() => {
    if (modalEvent) {
      setChatMessages(getMicroEventChatLog(modalEvent.id));
      setChatInput('');
    }
  }, [modalEvent]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateEvent = () => {
    if (!formState.title.trim()) {
      setStatusMessage('Add a title before scheduling.');
      return;
    }
    const tags = formState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const iterations = formState.recurring ? Math.max(1, Number(formState.recurringDays) || 1) : 1;
    const createdIds = [];

    for (let index = 0; index < iterations; index += 1) {
      const baseDate = new Date(`${formState.date}T${formState.time}:00`);
      baseDate.setDate(baseDate.getDate() + index);
      const payload = {
        title: formState.title,
        type: formState.type,
        tags,
        startTime: baseDate.toISOString(),
        duration: Number(formState.duration) || 15,
        prompt: formState.prompt,
        host: viewer
      };
      const created = createMicroEvent(payload);
      createdIds.push(created.id);
    }

    setRecentIds(createdIds);
    setStatusMessage(`Scheduled ${iterations} micro event${iterations > 1 ? 's' : ''}.`);
    refreshEvents();
    setFormState((prev) => ({ ...prev, title: '', prompt: '' }));
  };

  const handleJoinEvent = (eventData) => {
    const result = joinMicroEvent(eventData.id, { user: viewer });
    const updatedEvent = result?.event || eventData;
    setModalEvent(updatedEvent);
    setChatMessages(getMicroEventChatLog(updatedEvent.id));
    setChatInput('');
    setEvents((prev) => prev.map((entry) => (entry.id === updatedEvent.id ? updatedEvent : entry)));
    if (result?.status === 'joined') {
      setStatusMessage(`RSVP locked for ${updatedEvent.title}.`);
    }
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (!chatInput.trim() || !modalEvent) return;
    const nextMessage = {
      id: `chat-${Date.now()}`,
      author: viewer.name,
      body: chatInput.trim(),
      timestamp: new Date().toISOString()
    };
    const nextLog = [...chatMessages, nextMessage];
    setChatMessages(nextLog);
    saveMicroEventChatLog(modalEvent.id, nextLog);
    setChatInput('');
  };

  const closeModal = () => {
    setModalEvent(null);
    setChatMessages([]);
    setChatInput('');
  };

  return (
    <section className="micro-event-scheduler">
      <header>
        <p className="micro-event-scheduler__eyebrow">Live micro-events</p>
        <h3>Spin up 15 minute practice rooms</h3>
        <p>Hosts can queue daily repeats, attendees RSVP instantly.</p>
      </header>

      <form className="micro-event-form" onSubmit={(e) => e.preventDefault()} aria-label="Schedule micro event">
        <label>
          <span>Title</span>
          <input name="title" type="text" value={formState.title} onChange={handleInputChange} placeholder="e.g. Async Stand-up" />
        </label>
        <label>
          <span>Type</span>
          <select name="type" value={formState.type} onChange={handleInputChange}>
            <option>Coding Challenge</option>
            <option>Study With Me</option>
            <option>Interview Q</option>
            <option>Retro Jam</option>
          </select>
        </label>
        <label>
          <span>Date</span>
          <input name="date" type="date" value={formState.date} onChange={handleInputChange} />
        </label>
        <label>
          <span>Time</span>
          <input name="time" type="time" value={formState.time} onChange={handleInputChange} />
        </label>
        <label>
          <span>Duration (min)</span>
          <input name="duration" type="number" min="5" max="45" value={formState.duration} onChange={handleInputChange} />
        </label>
        <label>
          <span>Tags (comma separated)</span>
          <input name="tags" type="text" value={formState.tags} onChange={handleInputChange} />
        </label>
        <label className="micro-event-form__wide">
          <span>Prompt / challenge</span>
          <textarea name="prompt" rows="2" value={formState.prompt} onChange={handleInputChange}></textarea>
        </label>
        <label className="micro-event-form__recurring">
          <input name="recurring" type="checkbox" checked={formState.recurring} onChange={handleInputChange} />
          <span>Repeat daily for</span>
          <input
            name="recurringDays"
            type="number"
            min="1"
            max="10"
            value={formState.recurringDays}
            onChange={handleInputChange}
            disabled={!formState.recurring}
          />
          <span>days</span>
        </label>
        <button type="button" className="primary-btn" onClick={handleCreateEvent}>
          Quick start
        </button>
      </form>

      {statusMessage && <p className="micro-event-status" role="status">{statusMessage}</p>}

      <div className="micro-event-grid" role="list">
        {sortedEvents.map((eventItem) => (
          <MicroEventCard
            key={eventItem.id}
            event={eventItem}
            isJoined={eventItem.rsvps?.some((person) => person.id === viewer.id)}
            onJoin={handleJoinEvent}
            isNew={recentIds.includes(eventItem.id)}
          />
        ))}
      </div>

      {modalEvent && (
        <div className="micro-event-room" role="dialog" aria-modal="true" aria-label={`${modalEvent.title} live room`}>
          <div className="micro-event-room__content">
            <header>
              <div>
                <p className="micro-event-room__eyebrow">Live room</p>
                <h4>{modalEvent.title}</h4>
                <p>{modalEvent.type} • {modalEvent.duration} min</p>
              </div>
              <div className="micro-event-room__timer" aria-live="polite">
                <span>Starts in</span>
                <strong>{countdown}</strong>
              </div>
              <button type="button" className="ghost-btn" onClick={closeModal} aria-label="Close room">
                Close
              </button>
            </header>

            <section className="micro-event-room__prompt" aria-label="Shared prompt">
              <h5>Prompt</h5>
              <p>{modalEvent.prompt || 'Share progress in chat.'}</p>
            </section>

            <section className="micro-event-room__chat" aria-label="Live chat">
              <div className="micro-event-room__chat-log" aria-live="polite">
                {chatMessages.map((message) => (
                  <div key={message.id} className="micro-event-room__chat-item">
                    <strong>{message.author}</strong>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <p>{message.body}</p>
                  </div>
                ))}
              </div>
              <form className="micro-event-room__chat-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Share an insight"
                />
                <button type="submit" className="primary-btn">
                  Send
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </section>
  );
};

MicroEventScheduler.propTypes = {
  onEventsChange: PropTypes.func
};

MicroEventScheduler.defaultProps = {
  onEventsChange: null
};

export default MicroEventScheduler;
