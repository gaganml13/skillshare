import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ui.css';

/**
 * Displays a single mentor with key info and call-to-action.
 * Keeps layout flexible so we can drop these cards into any responsive grid.
 */
const MentorCard = ({ mentor, onRequest }) => {
  const {
    name,
    title,
    avatar,
    expertise,
    rating,
    ratePerHour,
    availability,
    bio,
    badges
  } = mentor;

  const formattedRate = `$${ratePerHour}/hr`;
  const formattedRating = rating?.toFixed(1);

  return (
    <article className="mentor-card" tabIndex={0} aria-label={`${name} mentor card`}>
      <header className="mentor-card__header">
        <img className="mentor-card__avatar" src={avatar} alt={name} loading="lazy" />
        <div className="mentor-card__identity">
          <div className="mentor-card__title-row">
            <h3 className="mentor-card__name">{name}</h3>
            <span className="mentor-card__rating" aria-label={`Rating ${formattedRating} out of five`}>
              <svg width="16" height="16" viewBox="0 0 24 24" role="presentation" aria-hidden="true">
                <path
                  d="M12 2.5l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 18.77l-6.18 3.23L6.99 14.6 2 9.76l6.91-1z"
                  fill="currentColor"
                  stroke="currentColor"
                />
              </svg>
              {formattedRating}
            </span>
          </div>
          <p className="mentor-card__role">{title}</p>
        </div>
      </header>

      <p className="mentor-card__bio">{bio}</p>

      {!!badges?.length && (
        <div className="mentor-badges" aria-label="Mentor badges">
          {badges.map((badge) => (
            <span key={`${name}-${badge}`} className="mentor-badge">
              {badge}
            </span>
          ))}
        </div>
      )}

      <div className="mentor-tags" aria-label="Expertise areas">
        {expertise.map((skill) => (
          <span key={`${name}-${skill}`} className="mentor-tag">
            {skill}
          </span>
        ))}
      </div>

      <div className="mentor-card__meta" aria-live="polite">
        <div>
          <p className="mentor-card__meta-label">Rate</p>
          <p className="mentor-card__meta-value">{formattedRate}</p>
        </div>
        <div>
          <p className="mentor-card__meta-label">Availability</p>
          <p className="mentor-card__meta-value">{availability}</p>
        </div>
      </div>

      <div className="mentor-card__actions">
        <button
          type="button"
          className="mentor-card__cta"
          onClick={() => onRequest?.(mentor)}
          aria-label={`Request mentorship with ${name}`}
        >
          Request Mentorship
        </button>
      </div>
    </article>
  );
};

MentorCard.propTypes = {
  mentor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    expertise: PropTypes.arrayOf(PropTypes.string).isRequired,
    rating: PropTypes.number.isRequired,
    ratePerHour: PropTypes.number.isRequired,
    availability: PropTypes.string.isRequired,
    bio: PropTypes.string.isRequired,
    badges: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onRequest: PropTypes.func
};

MentorCard.defaultProps = {
  onRequest: undefined
};

export default MentorCard;
