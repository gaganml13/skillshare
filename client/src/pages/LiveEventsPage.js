import React, { useEffect, useMemo, useState } from 'react';
import MicroEventCard from '../components/MicroEventCard';
import MicroEventModal from '../components/MicroEventModal';
import {
  createMicroEvent,
  getCurrentCommunityUser,
  getMicroEvents,
  joinMicroEvent
} from '../utils/loadSeeds';
import '../styles/ui.css';

const defaultForm = () => {
  const now = new Date();
  const isoDate = now.toISOString().split('T')[0];
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return {
    title: 'Daily Coding Push-Up',
    type: 'Coding Challenge',
    date: isoDate,
    time: `${hour}:${minute}`,
    duration: 15,
    tags: 'Focus,Pomodoro',
    description: 'Short burst to unblock and share progress.',
    prompt: 'Share your intention when the room opens.',
    capacity: 20
  };
};

// LiveEventsPage threads together listing, RSVP, and creation workflow
const LiveEventsPage = () => {
  const viewer = useMemo(() => getCurrentCommunityUser(), []);
  const [events, setEvents] = useState(() => getMicroEvents());
  const [formState, setFormState] = useState(defaultForm);
  const [status, setStatus] = useState('');
  const [modalEvent, setModalEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [events]
  );

  useEffect(() => {
    const refresh = () => setEvents(getMicroEvents());
    refresh();
    if (typeof window === 'undefined') return undefined;
    window.addEventListener('microEvents:updated', refresh);
    window.addEventListener('microEvents:rsvp', refresh);
    return () => {
      window.removeEventListener('microEvents:updated', refresh);
      window.removeEventListener('microEvents:rsvp', refresh);
    };
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = () => {
    if (!formState.title.trim()) {
      setStatus('Give the room a title before publishing.');
      return;
    }
    setSubmitting(true);
    const startTime = new Date(`${formState.date}T${formState.time}:00`).toISOString();
    const tags = formState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const payload = {
      title: formState.title.trim(),
      type: formState.type,
      tags,
      startTime,
      duration: Number(formState.duration) || 15,
      prompt: formState.prompt,
      description: formState.description,
      capacity: Number(formState.capacity) || 0,
      host: viewer
    };
    const created = createMicroEvent(payload);
    setEvents(getMicroEvents());
    setFormState(defaultForm);
    setStatus(`Created ${created.title}. Share the link!`);
    setSubmitting(false);
  };

  const handleRsvpToggle = async (eventData) => {
    const result = joinMicroEvent(eventData.id, { user: viewer });
    if (result?.event) {
      setEvents((prev) => prev.map((entry) => (entry.id === eventData.id ? result.event : entry)));
      setStatus(result.status === 'joined' ? `RSVPed to ${eventData.title}.` : `Left ${eventData.title}.`);
    }
  };

  const handleJoinRoom = (eventData) => {
    setModalEvent(eventData);
  };

  return (
    <main className="live-events-page">
      <header className="live-events-hero">
        <div>
          <p className="live-events-hero__eyebrow">Micro-events</p>
          <h1>Stack 15-minute practice rooms</h1>
          <p>RSVP, get nudged one minute before go-time, and ship something tiny with your pod.</p>
        </div>
        <div className="live-events-hero__stats">
          <p><strong>{events.length}</strong><span>Events queued</span></p>
          <p><strong>{events.filter((event) => event.rsvps?.some((person) => person.id === viewer.id)).length}</strong><span>You RSVP’d</span></p>
          <p><strong>15m</strong><span>Avg duration</span></p>
        </div>
      </header>

      <section className="micro-event-creator" aria-label="Create micro event">
        <div>
          <h2>Quick-create</h2>
          <p>Hosts can spin a pop-up room in seconds. Members RSVP instantly.</p>
        </div>
        <form onSubmit={(event) => event.preventDefault()} className="micro-event-creator__form">
          <label>
            <span>Title</span>
            <input type="text" name="title" value={formState.title} onChange={handleFormChange} required />
          </label>
          <label>
            <span>Type</span>
            <select name="type" value={formState.type} onChange={handleFormChange}>
              <option value="Coding Challenge">Coding Challenge</option>
              <option value="Study With Me">Study With Me</option>
              <option value="Interview Q">Interview Q</option>
            </select>
          </label>
          <label>
            <span>Date</span>
            <input type="date" name="date" value={formState.date} onChange={handleFormChange} required />
          </label>
          <label>
            <span>Time</span>
            <input type="time" name="time" value={formState.time} onChange={handleFormChange} required />
          </label>
          <label>
            <span>Duration (min)</span>
            <input type="number" min="5" max="45" name="duration" value={formState.duration} onChange={handleFormChange} />
          </label>
          <label>
            <span>Capacity</span>
            <input type="number" min="0" name="capacity" value={formState.capacity} onChange={handleFormChange} />
          </label>
          <label className="micro-event-creator__full">
            <span>Tags (comma separated)</span>
            <input type="text" name="tags" value={formState.tags} onChange={handleFormChange} />
          </label>
          <label className="micro-event-creator__full">
            <span>Description</span>
            <textarea name="description" rows="2" value={formState.description} onChange={handleFormChange} />
          </label>
          <label className="micro-event-creator__full">
            <span>Prompt</span>
            <textarea name="prompt" rows="2" value={formState.prompt} onChange={handleFormChange} />
          </label>
          <button type="button" className="primary-btn" onClick={handleCreateEvent} disabled={submitting}>
            {submitting ? 'Saving...' : 'Publish event'}
          </button>
        </form>
        {status && <p className="micro-event-status" role="status">{status}</p>}
      </section>

      <section className="micro-event-grid" aria-label="Upcoming micro events">
        {sortedEvents.map((event) => (
          <MicroEventCard
            key={event.id}
            event={event}
            isJoined={event.rsvps?.some((person) => person.id === viewer.id)}
            onRsvpToggle={handleRsvpToggle}
            onJoin={handleJoinRoom}
            isNew={false}
          />
        ))}
        {!sortedEvents.length && <p>No micro-events yet. Create the first sprint above.</p>}
      </section>

      {modalEvent && (
        <MicroEventModal event={modalEvent} viewer={viewer} onClose={() => setModalEvent(null)} />
      )}
    </main>
  );
};

export default LiveEventsPage;
