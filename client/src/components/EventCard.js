import React from 'react';
import PropTypes from 'prop-types';

// EventCard presents a single community event with host context, skill tags, and CTA buttons
const EventCard = ({
  event,
  currentUserId,
  onJoin,
  onFindTeam,
  onViewDetails,
  onToggleActive
}) => {
  const attendeeCount = event.attendees?.length || 0;
  const isFull = Boolean(event.capacity) && attendeeCount >= event.capacity;
  const isHost = event.hostId && event.hostId === currentUserId;
  const isJoined = event.attendees?.some((attendee) => attendee.id === currentUserId);
  const isInactive = event.active === false;
  const statusLabel = event.capacity
    ? `${attendeeCount}/${event.capacity} joined`
    : `${attendeeCount} joined`;
  const joinLabel = isJoined ? 'Leave event' : 'Join event';

  return (
    <article className="card event-card fade-up" aria-labelledby={`event-${event.id}-title`}>
      <header className="event-card__header">
        <div className="event-card__host">
          <img src={event.hostAvatar} alt={event.hostName} className="event-card__host-avatar" />
          <div>
            <p className="event-card__eyebrow">Hosted by {event.hostName}</p>
            <h4 id={`event-${event.id}-title`}>{event.title}</h4>
            <p className="event-card__description">{event.description}</p>
          </div>
        </div>
        <div className="event-card__meta">
          <p aria-label="Event date and time">{event.date} • {event.time}</p>
          <p aria-label="Event location">{event.location}</p>
          <span className="event-card__capacity" data-state={isFull || isInactive ? 'warning' : 'ok'}>
            {isInactive ? 'Registration closed' : isFull && !isJoined ? 'Full' : statusLabel}
          </span>
        </div>
      </header>

      <div className="event-card__body">
        <div className="event-card__tags" aria-label="Required skills">
          {event.skillsRequired?.map((skill) => (
            <span key={skill} className="skill-pill" data-variant="event">{skill}</span>
          ))}
        </div>
        <div className="event-card__attendees" aria-label="Confirmed attendees">
          {event.attendees?.slice(0, 6).map((attendee) => (
            <img key={attendee.id} src={attendee.avatar} alt={attendee.name} title={attendee.name} />
          ))}
          {attendeeCount > 6 && <span className="event-card__attendees-more">+{attendeeCount - 6}</span>}
        </div>
      </div>

      <footer className="event-card__footer">
        <div className="event-card__cta-group">
          <button
            type="button"
            className="primary-btn"
            aria-label={`${joinLabel} for ${event.title}`}
            disabled={isInactive || (isFull && !isJoined)}
            onClick={() => onJoin(event, { leave: isJoined })}
          >
            {joinLabel}
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => onFindTeam(event)}
            aria-label={`Find teammates for ${event.title}`}
          >
            Find teammates
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => onViewDetails(event)}
            aria-label={`View details for ${event.title}`}
          >
            View details
          </button>
        </div>
        {isHost && (
          <details className="event-card__menu">
            <summary aria-label="Manage registration" className="event-card__menu-trigger">⋯</summary>
            <div role="menu">
              <button
                type="button"
                className="event-card__menu-item"
                role="menuitem"
                onClick={() => onToggleActive(event, event.active === false)}
              >
                {event.active === false ? 'Reopen registration' : 'Close registration'}
              </button>
            </div>
          </details>
        )}
      </footer>
    </article>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    hostId: PropTypes.string,
    hostName: PropTypes.string.isRequired,
    hostAvatar: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    skillsRequired: PropTypes.arrayOf(PropTypes.string),
    capacity: PropTypes.number,
    attendees: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired
    })),
    active: PropTypes.bool
  }).isRequired,
  currentUserId: PropTypes.string,
  onJoin: PropTypes.func.isRequired,
  onFindTeam: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired
};

EventCard.defaultProps = {
  currentUserId: ''
};

export default EventCard;