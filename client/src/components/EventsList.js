import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import EventCard from './EventCard';

// EventsList renders filters + cards for the upcoming events timeline
const EventsList = ({
  events,
  onJoin,
  onFindTeam,
  onViewDetails,
  onCreateEvent,
  onToggleActive,
  currentUserId
}) => {
  const [skillQuery, setSkillQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('all');

  const filteredEvents = useMemo(() => {
    const query = skillQuery.trim().toLowerCase();
    return events.filter((event) => {
      const matchesMode = modeFilter === 'all' ? true : (event.mode || 'remote') === modeFilter;
      const matchesSkill = !query
        ? true
        : event.skillsRequired?.some((skill) => skill.toLowerCase().includes(query));
      return matchesMode && matchesSkill;
    });
  }, [events, skillQuery, modeFilter]);

  return (
    <section className="events-list" aria-label="Upcoming collaboration events">
      <header className="events-list__header">
        <div>
          <p className="events-list__eyebrow">Community events</p>
          <h3>Ship in public with collaborators</h3>
          <p className="events-list__subtitle">Join live jams or create a new drop-in session for your cohort.</p>
        </div>
        <button type="button" className="primary-btn" onClick={onCreateEvent}>
          Create event
        </button>
      </header>

      <form className="events-list__filters" aria-label="Event filters">
        <label className="events-filter-field">
          <span>Filter by skill</span>
          <input
            type="text"
            value={skillQuery}
            placeholder="e.g. React, Prompting"
            onChange={(event) => setSkillQuery(event.target.value)}
          />
        </label>
        <fieldset className="events-filter-segment" aria-label="Mode filter">
          <legend>Format</legend>
          <div className="events-filter-toggle">
            <button type="button" className={modeFilter === 'all' ? 'ghost-btn is-active' : 'ghost-btn'} onClick={() => setModeFilter('all')}>
              All
            </button>
            <button type="button" className={modeFilter === 'remote' ? 'ghost-btn is-active' : 'ghost-btn'} onClick={() => setModeFilter('remote')}>
              Remote
            </button>
            <button type="button" className={modeFilter === 'hybrid' ? 'ghost-btn is-active' : 'ghost-btn'} onClick={() => setModeFilter('hybrid')}>
              Hybrid / IRL
            </button>
          </div>
        </fieldset>
        <p className="events-list__count" role="status">{filteredEvents.length} events</p>
      </form>

      <div className="events-grid" role="list">
        {filteredEvents.length === 0 && (
          <div className="events-list__empty" role="status">
            <p>No sessions match those filters yet—start one!</p>
          </div>
        )}
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            currentUserId={currentUserId}
            onJoin={onJoin}
            onFindTeam={onFindTeam}
            onViewDetails={onViewDetails}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>
    </section>
  );
};

EventsList.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  onJoin: PropTypes.func.isRequired,
  onFindTeam: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onCreateEvent: PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired,
  currentUserId: PropTypes.string
};

EventsList.defaultProps = {
  currentUserId: ''
};

export default EventsList;