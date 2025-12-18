import React from 'react';
import PropTypes from 'prop-types';
import VerificationBadge from '../common/VerificationBadge';

// JobCard leans on the shared card + button styles so it stays consistent across themes.

const STATUS_COPY = {
  Applied: 'Applied · recruiter reviewing',
  Interviewing: 'Interviewing · keep preparing',
  Offer: 'Offer stage · congrats!'
};

const JobCard = ({
  job,
  matchScore,
  isSaved,
  onToggleSave,
  onQuickApply,
  applicationStatus
}) => {
  const statusLabel = applicationStatus ? (STATUS_COPY[applicationStatus] || applicationStatus) : null;

  return (
    <article className="card job-card">
      <header className="job-card__header">
        <div className="job-card__company">
          {job.logo ? (
            <img src={job.logo} alt={`${job.company} logo`} className="job-card__logo" />
          ) : (
            <div className="job-card__logo job-card__logo--fallback">
              {job.company?.[0] ?? '?'}
            </div>
          )}
          <div>
            <p className="job-card__company-name">{job.company}</p>
            <p className="job-card__meta">{job.location} • {job.posted}</p>
          </div>
        </div>
        {matchScore !== null && (
          <div className="job-card__match" aria-label="Match score">
            <span>{matchScore}%</span>
            <small>match</small>
          </div>
        )}
      </header>

      <div className="job-card__body">
        <h3>{job.title}</h3>
        <p className="job-card__type">{job.type}</p>
        <p className="job-card__description">{job.description}</p>
        <div className="job-card__salary">{job.salaryRange}</div>

        <div className="job-card__skills">
          {job.skills.map((skill) => {
            // Dummy verification logic: Mark specific skills as verified
            const isVerified = ['React', 'Node.js', 'Figma', 'Python'].some(s => skill.includes(s));
            return (
              <span key={skill} className={`skill-pill ${isVerified ? 'skill-pill--verified' : ''}`} style={isVerified ? { border: '1px solid var(--primary-light)', background: 'var(--bg-surface-2)' } : {}}>
                {skill}
                {isVerified && <VerificationBadge size={14} text="" className="ml-1" />}
              </span>
            );
          })}
        </div>

        {job.tags?.length > 0 && (
          <div className="job-card__tags">
            {job.tags.map((tag) => (
              <span key={tag} className="job-tag">{tag}</span>
            ))}
          </div>
        )}

        {statusLabel && (
          <div className="job-card__status" role="status">
            {statusLabel}
          </div>
        )}
      </div>

      <footer className="job-card__footer">
        <button
          type="button"
          className={`btn btn--ghost ${isSaved ? 'is-active' : ''}`.trim()}
          onClick={() => onToggleSave(job.id)}
        >
          {isSaved ? 'Saved' : 'Save for later'}
        </button>
        <button type="button" className="btn btn--primary" onClick={() => onQuickApply(job)}>
          Quick apply
        </button>
      </footer>
    </article>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    salaryRange: PropTypes.string.isRequired,
    description: PropTypes.string,
    posted: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    logo: PropTypes.string
  }).isRequired,
  matchScore: PropTypes.number,
  isSaved: PropTypes.bool,
  onToggleSave: PropTypes.func.isRequired,
  onQuickApply: PropTypes.func.isRequired,
  applicationStatus: PropTypes.string
};

JobCard.defaultProps = {
  matchScore: null,
  isSaved: false,
  applicationStatus: null
};

export default JobCard;
