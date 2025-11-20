import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ui.css';

// MicroEventCard highlights schedule, RSVP count, and room entry CTA
const MicroEventCard = ({ event, isJoined, onJoin, onRsvpToggle, isNew }) => {
  if (!event) return null;
  const start = new Date(event.startTime);
  const dateLabel = start.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const timeLabel = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const rsvpCount = event.rsvps?.length || 0;
  const capacity = event.capacity ? `${rsvpCount}/${event.capacity}` : `${rsvpCount} RSVP`;
  return (
    <article className={isNew ? 'micro-event-card micro-event-card--new' : 'micro-event-card'}>
      <header className="micro-event-card__header">
        <div>
          <p className="micro-event-card__eyebrow">{event.type}</p>
          <h4>{event.title}</h4>
          <p className="micro-event-card__host">Hosted by {event.hostName}</p>
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

      <div className="micro-event-card__tags" aria-label="Event tags">
        {event.tags?.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

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
            className="ghost-btn"
            onClick={() => onJoin(event)}
            aria-label={`Join ${event.title} room`}
          >
            Join room
          </button>
        </div>
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
