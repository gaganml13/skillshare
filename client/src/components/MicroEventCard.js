import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/ui.css';

const SAVED_EVENTS_KEY = 'skillversex:microEventSaves';

const readSavedIds = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_EVENTS_KEY) || '[]';
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.info('micro-events: unable to read saved state', error);
    return [];
  }
};

const persistSavedIds = (ids) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.info('micro-events: unable to persist saved state', error);
  }
};

// MicroEventCard highlights schedule, RSVP state, and quick save/share controls.
const MicroEventCard = ({ event, isJoined, onJoin, onRsvpToggle, isNew }) => {
  const [savedIds, setSavedIds] = useState(() => readSavedIds());
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    persistSavedIds(savedIds);
  }, [savedIds]);

  if (!event) return null;

  const start = new Date(event.startTime);
  const dateLabel = start.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const timeLabel = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const rsvpCount = event.rsvps?.length || 0;
  const capacity = event.capacity ? `${rsvpCount}/${event.capacity}` : `${rsvpCount} RSVP`;
  const hostName = event.hostName || event.host?.name || 'Host TBA';
  const tags = Array.isArray(event.tags)
    ? event.tags
    : typeof event.tags === 'string' && event.tags.length
      ? event.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];
  const isSaved = savedIds.includes(event.id);

  const handleSaveToggle = () => {
    setSavedIds((prev) => (prev.includes(event.id) ? prev.filter((id) => id !== event.id) : [...prev, event.id]));
  };

  const handleShare = async () => {
    if (typeof navigator === 'undefined') return;
    const summary = `${event.title} - ${dateLabel} ${timeLabel}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text: summary });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
      }
      setShareStatus('Link copied');
    } catch (error) {
      console.info('micro-events: share aborted', error);
      setShareStatus('Share unavailable');
    } finally {
      setTimeout(() => setShareStatus(''), 1800);
    }
  };
  return (
    <article className={`card micro-event-card${isNew ? ' micro-event-card--new' : ''}`}>
      <header className="micro-event-card__header">
        <div>
          <p className="micro-event-card__eyebrow">{event.type}</p>
          <h4>{event.title}</h4>
          <p className="micro-event-card__host">Hosted by {hostName}</p>
        </div>
        <div className="micro-event-card__time" aria-label="Event time">
          <strong>{dateLabel}</strong>
          <span>{timeLabel}</span>
          <small>{event.duration} min</small>
        </div>
      </header>

      <p className="micro-event-card__description">
        {event.description || event.prompt || 'Prompt drops when the room is live.'}
      </p>

      {!!tags.length && (
        <div className="micro-event-card__tags" aria-label="Event tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      <footer className="micro-event-card__footer">
        <div className="micro-event-card__avatars" aria-label="RSVPs">
          {event.rsvps?.slice(0, 4).map((person) => (
            <img key={person.id} src={person.avatar} alt={person.name} title={person.name} />
          ))}
          {event.rsvps?.length > 4 && (
            <span className="micro-event-card__more">+{event.rsvps.length - 4}</span>
          )}
          <span className="micro-event-card__capacity">{capacity}</span>
        </div>
        <div className="micro-event-card__actions">
          <button
            type="button"
            className={isJoined ? 'ghost-btn' : 'primary-btn'}
            onClick={() => onRsvpToggle(event)}
            aria-label={isJoined ? `Cancel RSVP for ${event.title}` : `RSVP to ${event.title}`}
          >
            {isJoined ? 'Cancel RSVP' : 'RSVP'}
          </button>
          <button
            type="button"
            className={`chip micro-event-card__save${isSaved ? ' is-active' : ''}`}
            onClick={handleSaveToggle}
            aria-pressed={isSaved}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            className="ghost-btn micro-event-card__share"
            onClick={handleShare}
            aria-label={`Share ${event.title}`}
          >
            Share
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => onJoin(event)}
            aria-label={`Join ${event.title} room`}
          >
            Join room
          </button>
        </div>
        {shareStatus && <p className="micro-event-card__status" role="status">{shareStatus}</p>}
      </footer>
    </article>
  );
};

MicroEventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    startTime: PropTypes.string.isRequired,
    duration: PropTypes.number,
    hostName: PropTypes.string,
    prompt: PropTypes.string,
    capacity: PropTypes.number,
    rsvps: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string
    }))
  }).isRequired,
  isJoined: PropTypes.bool,
  onJoin: PropTypes.func.isRequired,
  onRsvpToggle: PropTypes.func.isRequired,
  isNew: PropTypes.bool
};

MicroEventCard.defaultProps = {
  isJoined: false,
  isNew: false
};

export default MicroEventCard;
