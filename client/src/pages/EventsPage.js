import React, { useEffect, useMemo, useState } from 'react';
import EventsList from '../components/EventsList';
import TeamBuilder from '../components/TeamBuilder';
import MicroEventCard from '../components/MicroEventCard';
import MicroEventModal from '../components/MicroEventModal';
import {
  createMicroEvent,
  getCurrentCommunityUser,
  getEvents,
  getMicroEvents,
  getTeams,
  joinEvent,
  joinMicroEvent,
  updateEventActiveState
} from '../utils/loadSeeds';
import '../styles/ui.css';

const defaultMicroEventForm = () => {
  const now = new Date();
  return {
    title: 'Daily Coding Push-Up',
    type: 'Coding Challenge',
    date: now.toISOString().slice(0, 10),
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    duration: 15,
    tags: 'Focus,Pomodoro',
    description: 'Short burst to unblock and share progress.',
    prompt: 'Share your intention when the room opens.',
    capacity: 12
  };
};

const EventsPage = () => {
  const viewer = useMemo(() => getCurrentCommunityUser(), []);
  const [events, setEvents] = useState(() => getEvents());
  const [selectedEventId, setSelectedEventId] = useState('');
  const [showBuilder, setShowBuilder] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [teamSnapshot, setTeamSnapshot] = useState([]);
  const [microEvents, setMicroEvents] = useState(() => getMicroEvents());
  const [microForm, setMicroForm] = useState(() => defaultMicroEventForm());
  const [microStatus, setMicroStatus] = useState('');
  const [microModalEvent, setMicroModalEvent] = useState(null);
  const [microSubmitting, setMicroSubmitting] = useState(false);

  useEffect(() => {
    const refresh = () => setEvents(getEvents());
    if (typeof window !== 'undefined') {
      window.addEventListener('community:eventPublished', refresh);
      window.addEventListener('teams:updated', refresh);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('community:eventPublished', refresh);
        window.removeEventListener('teams:updated', refresh);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedEventId && events.length) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) {
      setTeamSnapshot([]);
      return;
    }
    setTeamSnapshot(getTeams(selectedEventId));
  }, [selectedEventId]);

  useEffect(() => {
    const refresh = () => setMicroEvents(getMicroEvents());
    refresh();
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('microEvents:updated', refresh);
    window.addEventListener('microEvents:rsvp', refresh);
    return () => {
      window.removeEventListener('microEvents:updated', refresh);
      window.removeEventListener('microEvents:rsvp', refresh);
    };
  }, []);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const handleJoinEvent = (eventData, options = {}) => {
    const result = joinEvent(eventData.id, { user: viewer, ...options });
    if (result?.status === 'joined') {
      setStatusMessage('RSVP confirmed.');
    } else if (result?.status === 'left') {
      setStatusMessage('Left event.');
    }
    setEvents(getEvents());
  };

  const handleFindTeam = (event) => {
    setSelectedEventId(event.id);
    setShowBuilder(true);
  };

  const sortedMicroEvents = useMemo(
    () => [...microEvents].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [microEvents]
  );

  const handleCreateEvent = () => {
    const form = document.getElementById('micro-event-creator');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      form.querySelector('input, textarea, select')?.focus();
    }
  };

  const handleViewDetails = (event) => {
    setStatusMessage(`Viewing ${event.title}. Event modal coming soon.`);
  };

  const handleToggleActive = (eventData, isActive) => {
    updateEventActiveState(eventData.id, isActive);
    setEvents(getEvents());
  };

  const handleMicroFieldChange = (event) => {
    const { name, value } = event.target;
    setMicroForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateMicroEvent = () => {
    if (!microForm.title.trim()) {
      setMicroStatus('Give the room a title before publishing.');
      return;
    }

    setMicroSubmitting(true);
    const startTime = new Date(`${microForm.date}T${microForm.time}:00`).toISOString();
    const payload = {
      title: microForm.title.trim(),
      type: microForm.type,
      tags: microForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      startTime,
      duration: Number(microForm.duration) || 15,
      prompt: microForm.prompt,
      description: microForm.description,
      capacity: Number(microForm.capacity) || 0,
      host: viewer
    };

    const created = createMicroEvent(payload);
    setMicroEvents(getMicroEvents());
    setMicroForm(defaultMicroEventForm());
    setMicroStatus(`Created ${created.title}. Share the link!`);
    setMicroSubmitting(false);
  };

  const handleMicroRsvpToggle = (eventData) => {
    const result = joinMicroEvent(eventData.id, { user: viewer });
    if (result?.event) {
      setMicroEvents((prev) =>
        prev.map((entry) => (entry.id === eventData.id ? result.event : entry))
      );
      setMicroStatus(
        result.status === 'joined'
          ? `RSVPed to ${eventData.title}.`
          : `Left ${eventData.title}.`
      );
    }
  };

  const handleMicroRoom = (eventData) => setMicroModalEvent(eventData);

  return (
    <main className="events-hub">
      <section className="section section--tight">
        <div className="container">
          <header className="card events-hero">
            <div>
              <p className="events-hero__eyebrow">Community calendar</p>
              <h1>Workshops + live pods in one lane</h1>
              <p>
                RSVP to flagship sessions, auto-spin balanced teams, and stack quick micro rooms.
              </p>
            </div>
            <ul className="events-hero__stats">
              <li>
                <strong>{events.length}</strong>
                <span>Upcoming events</span>
              </li>
              <li>
                <strong>{microEvents.length}</strong>
                <span>Micro-sprints</span>
              </li>
              <li>
                <strong>{teamSnapshot.length}</strong>
                <span>Saved pods</span>
              </li>
            </ul>
          </header>
        </div>
      </section>

      <section className="section" aria-label="Events and team tools">
        <div className="container">
          <div className="events-grid">
            <div className="events-grid__primary">
              <EventsList
                events={events}
                currentUserId={viewer.id}
                onJoin={handleJoinEvent}
                onFindTeam={handleFindTeam}
                onViewDetails={handleViewDetails}
                onCreateEvent={handleCreateEvent}
                onToggleActive={handleToggleActive}
              />
            </div>

            <aside className="events-grid__secondary card events-teams" aria-label="Team builder">
              <header>
                <div>
                  <p className="events-teams__eyebrow">Teams</p>
                  <h2>Balance pods for any event</h2>
                  <p>Select a session and auto-create draft teams with roles and skill diversity.</p>
                </div>
                <div className="events-teams__controls">
                  <label>
                    <span>Event</span>
                    <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="ghost-btn" onClick={() => setShowBuilder((prev) => !prev)}>
                    {showBuilder ? 'Hide builder' : 'Auto-create teams'}
                  </button>
                </div>
              </header>

              {!!teamSnapshot.length && (
                <div className="events-teams__existing" aria-live="polite">
                  <h3>Saved teams</h3>
                  <ul>
                    {teamSnapshot.map((team) => (
                      <li key={team.id}>
                        {team.name} - {team.members?.length || 0} members - {team.matchScore || 0}% match
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showBuilder && selectedEvent ? (
                <TeamBuilder event={selectedEvent} />
              ) : (
                <p className="events-teams__hint">Pick an event and tap "Auto-create teams" to open the builder.</p>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Micro-events">
        <div className="container">
          <section className="card micro-events">
            <header>
              <div>
                <p className="micro-events__eyebrow">Micro-events</p>
                <h2>Stack 15-minute practice rooms</h2>
                <p>Hosts can spin a pop-up room in seconds. Members RSVP instantly and get nudged before go time.</p>
              </div>
              <div className="micro-events__stats">
                <p>
                  <strong>{sortedMicroEvents.length}</strong>
                  <span>Queued</span>
                </p>
                <p>
                  <strong>{sortedMicroEvents.filter((event) => event.rsvps?.some((person) => person.id === viewer.id)).length}</strong>
                  <span>Your RSVPs</span>
                </p>
              </div>
            </header>

            <form id="micro-event-creator" className="micro-events__form form-grid" onSubmit={(event) => event.preventDefault()}>
              <label className="col-6">
                <span>Title</span>
                <input type="text" name="title" value={microForm.title} onChange={handleMicroFieldChange} required />
              </label>
              <label className="col-6">
                <span>Type</span>
                <select name="type" value={microForm.type} onChange={handleMicroFieldChange}>
                  <option value="Coding Challenge">Coding Challenge</option>
                  <option value="Study With Me">Study With Me</option>
                  <option value="Interview Q">Interview Q</option>
                </select>
              </label>
              <label className="col-4">
                <span>Date</span>
                <input type="date" name="date" value={microForm.date} onChange={handleMicroFieldChange} required />
              </label>
              <label className="col-4">
                <span>Time</span>
                <input type="time" name="time" value={microForm.time} onChange={handleMicroFieldChange} required />
              </label>
              <label className="col-4">
                <span>Duration (min)</span>
                <input type="number" name="duration" min="5" max="45" value={microForm.duration} onChange={handleMicroFieldChange} />
              </label>
              <label className="col-4">
                <span>Capacity</span>
                <input type="number" name="capacity" min="0" value={microForm.capacity} onChange={handleMicroFieldChange} />
              </label>
              <label className="col-12">
                <span>Tags (comma separated)</span>
                <input type="text" name="tags" value={microForm.tags} onChange={handleMicroFieldChange} />
              </label>
              <label className="col-12">
                <span>Description</span>
                <textarea name="description" rows="2" value={microForm.description} onChange={handleMicroFieldChange} />
              </label>
              <label className="col-12">
                <span>Prompt</span>
                <textarea name="prompt" rows="2" value={microForm.prompt} onChange={handleMicroFieldChange} />
              </label>
              <div className="micro-events__actions col-12">
                <button type="button" className="primary-btn" onClick={handleCreateMicroEvent} disabled={microSubmitting}>
                  {microSubmitting ? 'Saving...' : 'Publish micro-event'}
                </button>
                {microStatus && (
                  <p className="micro-events__status" role="status">
                    {microStatus}
                  </p>
                )}
              </div>
            </form>

            <div className="micro-event-grid" aria-live="polite">
              {sortedMicroEvents.map((event) => (
                <MicroEventCard
                  key={event.id}
                  event={event}
                  isJoined={event.rsvps?.some((person) => person.id === viewer.id)}
                  onRsvpToggle={handleMicroRsvpToggle}
                  onJoin={handleMicroRoom}
                />
              ))}
              {!sortedMicroEvents.length && <p>No micro-events yet. Create the first sprint above.</p>}
            </div>
          </section>
        </div>
      </section>

      {statusMessage && (
        <p className="events-status" role="status">
          {statusMessage}
        </p>
      )}

      {microModalEvent && (
        <MicroEventModal event={microModalEvent} viewer={viewer} onClose={() => setMicroModalEvent(null)} />
      )}
    </main>
  );
};

export default EventsPage;
