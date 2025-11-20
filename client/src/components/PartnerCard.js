import React from 'react';
import PropTypes from 'prop-types';
import { saveMatches } from '../utils/loadSeeds';

// PartnerCard highlights candidate snapshot plus connection CTA
const PartnerCard = ({ partner, onConnect }) => {
  if (!partner) return null;

  const handleConnect = () => {
    saveMatches({ partnerId: partner.id, partnerName: partner.name });
    console.info(`Partner pending: ${partner.name}`);
    onConnect(partner);
  };

  return (
    <article className="partner-card" aria-label={`Match ${partner.name}`}>
      <header className="partner-card__header">
        <img src={partner.avatar} alt={partner.name} className="partner-card__avatar" />
        <div>
          <p className="partner-card__name">{partner.name}</p>
          <p className="partner-card__experience">{partner.experience}</p>
        </div>
        <div className="partner-card__score" aria-label="Match overlap">
          <span>{partner.matchScore}%</span>
          <small>Overlap</small>
        </div>
      </header>

      <p className="partner-card__goals">{partner.goals?.[0] || 'Co-create routines together.'}</p>

      <div className="partner-card__availability" aria-label="Availability matches">
        {(partner.overlapDays?.length ? partner.overlapDays : partner.availability || []).map((slot) => (
          <span key={slot}>{slot}</span>
        ))}
      </div>

      <footer className="partner-card__footer">
        <button type="button" className="primary-btn" onClick={handleConnect} aria-label={`Connect with ${partner.name}`}>
          Connect
        </button>
      </footer>
    </article>
  );
};

PartnerCard.propTypes = {
  partner: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    experience: PropTypes.string,
    goals: PropTypes.arrayOf(PropTypes.string),
    availability: PropTypes.arrayOf(PropTypes.string),
    overlapDays: PropTypes.arrayOf(PropTypes.string),
    matchScore: PropTypes.number
  }).isRequired,
  onConnect: PropTypes.func
};

PartnerCard.defaultProps = {
  onConnect: () => {}
};

export default PartnerCard;