import React from 'react';
import PropTypes from 'prop-types';

// EventDetailPage shows deeper context for an event, including roster and CTAs
const EventDetailPage = ({
  event,
  isOpen,
  onClose,
  onJoin,
  onFindTeam,
  currentUserId
}) => {
  if (!event || !isOpen) return null;
  const attendeeCount = event.attendees?.length || 0;
  const isJoined = event.attendees?.some((att) => att.id === currentUserId);
  const joinLabel = isJoined ? 'Leave event' : 'Join event';

  return (
    <div className="event-detail" role="dialog" aria-modal="true" aria-label={`Event details for ${event.title}`}>
      <div className="event-detail__shell">
        <button type="button" className="ghost-btn event-detail__close" onClick={onClose}>
          Back to community
        </button>
        <header className="event-detail__hero">
          <div>
            <p className="event-detail__eyebrow">Community event</p>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
          </div>
          <div className="event-detail__meta">
            <p><strong>When:</strong> {event.date} • {event.time}</p>
            <p><strong>Where:</strong> {event.location}</p>
            <p><strong>Skills focus:</strong> {event.skillsRequired?.join(', ')}</p>
            <p><strong>Capacity:</strong> {event.capacity || 'Open'} · {attendeeCount} joined</p>
          </div>
        </header>

        <section className="event-detail__actions">
          <button type="button" className="primary-btn" onClick={() => onJoin(event, { leave: isJoined })}>
            {joinLabel}
          </button>
          <button type="button" className="ghost-btn" onClick={() => onFindTeam(event)}>
            Find teammates
          </button>
        </section>

        <section className="event-detail__host">
          <img src={event.hostAvatar} alt={event.hostName} />
          <div>
            <p className="event-detail__host-label">Host</p>
            <h3>{event.hostName}</h3>
            <p>Keeping registration {event.active === false ? 'closed' : 'open'} • {event.mode === 'hybrid' ? 'Hybrid' : 'Remote friendly'}</p>
          </div>
        </section>

        <section className="event-detail__attendees">
          <h3>Attendees ({attendeeCount})</h3>
          <ul>
            {event.attendees?.map((attendee) => (
              <li key={attendee.id}>
                <img src={attendee.avatar} alt={attendee.name} />
                <div>
                  <p>{attendee.name}</p>
                  <p>{attendee.skills?.join(' · ')}</p>
                  <small>{attendee.availability || 'Flexible'}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

EventDetailPage.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    hostName: PropTypes.string,
    hostAvatar: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    location: PropTypes.string,
    skillsRequired: PropTypes.arrayOf(PropTypes.string),
    capacity: PropTypes.number,
    attendees: PropTypes.arrayOf(PropTypes.object),
    active: PropTypes.bool
  }),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onJoin: PropTypes.func.isRequired,
  onFindTeam: PropTypes.func.isRequired,
  currentUserId: PropTypes.string
};

EventDetailPage.defaultProps = {
  event: null,
  isOpen: false,
  currentUserId: ''
};

export default EventDetailPage;