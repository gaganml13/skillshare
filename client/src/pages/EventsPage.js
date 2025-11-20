import React, { useEffect, useMemo, useState } from 'react';
import EventsList from '../components/EventsList';
import TeamBuilder from '../components/TeamBuilder';
import {
  getCurrentCommunityUser,
  getEvents,
  getTeams,
  joinEvent,
  updateEventActiveState
} from '../utils/loadSeeds';
import '../styles/ui.css';

// EventsPage surfaces the public event feed plus auto-team builder
const EventsPage = () => {
  const viewer = useMemo(() => getCurrentCommunityUser(), []);
  const [events, setEvents] = useState(() => getEvents());
  const [selectedEventId, setSelectedEventId] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [teamSnapshot, setTeamSnapshot] = useState([]);

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

  const handleCreateEvent = () => {
    window.location.assign('/live-events');
  };

  const handleViewDetails = (event) => {
    setStatusMessage(`Viewing ${event.title} - open event modal soon.`);
  };

  const handleToggleActive = (eventData, isActive) => {
    updateEventActiveState(eventData.id, isActive);
    setEvents(getEvents());
  };

  return (
    <main className="events-hub">
      <EventsList
        events={events}
        currentUserId={viewer.id}
        onJoin={handleJoinEvent}
        onFindTeam={handleFindTeam}
        onViewDetails={handleViewDetails}
        onCreateEvent={handleCreateEvent}
        onToggleActive={handleToggleActive}
      />

      <section className="events-teams" aria-label="Team tools">
        <header>
          <div>
            <p className="events-teams__eyebrow">Teams</p>
            <h2>Balance pods for any event</h2>
            <p>Select an upcoming session and auto-create draft teams with roles + skill diversity.</p>
          </div>
          <div className="events-teams__controls">
            <label>
              <span>Event</span>
              <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </label>
            <button type="button" className="primary-btn" onClick={() => setShowBuilder((prev) => !prev)}>
              {showBuilder ? 'Hide builder' : 'Auto-create teams'}
            </button>
          </div>
        </header>

        {!!teamSnapshot.length && (
          <div className="events-teams__existing" aria-live="polite">
            <h3>Saved teams</h3>
            <ul>
              {teamSnapshot.map((team) => (
                <li key={team.id}>{team.name} • {team.members?.length || 0} members • {team.matchScore || 0}% match</li>
              ))}
            </ul>
          </div>
        )}

        {showBuilder && selectedEvent ? (
          <TeamBuilder event={selectedEvent} />
        ) : (
          <p className="events-teams__hint">Pick an event and tap "Auto-create teams" to open the builder.</p>
        )}
      </section>

      {statusMessage && <p className="events-status" role="status">{statusMessage}</p>}
    </main>
  );
};

export default EventsPage;
