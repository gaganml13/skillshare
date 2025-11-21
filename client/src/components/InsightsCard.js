import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ui.css';

// InsightsCard surfaces job-market signals alongside quick CTAs
const InsightsCard = ({ title, stat, trend, description, tags, cta }) => (
  <article className="insights-card">
    <header>
      <p className="insights-card__eyebrow">{trend || 'New insight'}</p>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
    </header>
    <div className="insights-card__stat">
      <strong>{stat}</strong>
      <span>Signal</span>
    </div>
    {!!tags.length && (
      <div className="insights-card__tags">
        {tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    )}
    {cta && (
      <button type="button" className="ghost-btn insights-card__cta">
        {cta}
      </button>
    )}
  </article>
);

InsightsCard.propTypes = {
  title: PropTypes.string.isRequired,
  stat: PropTypes.string.isRequired,
  trend: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  cta: PropTypes.string
};

InsightsCard.defaultProps = {
  trend: '',
  description: '',
  tags: [],
  cta: ''
};

export default InsightsCard;
