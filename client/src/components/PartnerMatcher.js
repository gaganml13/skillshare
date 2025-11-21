import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import PartnerCard from './PartnerCard';
import { findPartners, suggestPartners } from '../utils/partnerMatcher';

// Helper ensures we never call .join on an unsafe value
const safeJoin = (value, separator = ', ') => {
  if (Array.isArray(value)) return value.join(separator);
  if (typeof value === 'string') return value;
  return '';
};

const splitAvailability = (value = '') =>
  value
    .split(/\n|,/)
    .map((slot) => slot.trim())
    .filter(Boolean);

// PartnerMatcher renders inputs + results grid backed by findPartners heuristic
const PartnerMatcher = ({ currentUser, users, minMatch, onConnect }) => {
  const [goalInput, setGoalInput] = useState(safeJoin(currentUser?.goals, '; ') || 'Ship weekly demo');
  const [availabilityInput, setAvailabilityInput] = useState(safeJoin(currentUser?.availability, '\n'));
  const [experience, setExperience] = useState(currentUser?.experience || 'intermediate');
  const [preferSameZone, setPreferSameZone] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const viewerProfile = useMemo(() => ({
    ...currentUser,
    goals: goalInput ? goalInput.split(/;|,/).map((entry) => entry.trim()).filter(Boolean) : currentUser?.goals,
    availability: availabilityInput ? splitAvailability(availabilityInput) : currentUser?.availability,
    experience
  }), [currentUser, goalInput, availabilityInput, experience]);

  const partners = useMemo(() => {
    return findPartners(viewerProfile, users, {
      preferSameZone,
      minMatchPct: minMatch
    });
  }, [viewerProfile, users, preferSameZone, minMatch]);

  useEffect(() => {
    const hints = suggestPartners(viewerProfile, users, {
      preferSameZone,
      minMatchPct: Math.max(minMatch, 40)
    });
    setAiSuggestions(hints);
  }, [viewerProfile, users, preferSameZone, minMatch]);

  return (
    <section className="partner-matcher" aria-label="Accountability partner matcher">
      <form className="partner-matcher__form" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>Primary goals</span>
          <textarea
            value={goalInput}
            onChange={(event) => setGoalInput(event.target.value)}
            placeholder="Ship weekly, present Fridays, etc"
          />
        </label>
        <label>
          <span>Availability windows</span>
          <textarea
            value={availabilityInput}
            onChange={(event) => setAvailabilityInput(event.target.value)}
            placeholder="Mon 19:00-20:00\nThu 07:30-08:00"
          />
        </label>
        <label>
          <span>Experience level</span>
          <select value={experience} onChange={(event) => setExperience(event.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label className="partner-matcher__checkbox">
          <input
            type="checkbox"
            checked={preferSameZone}
            onChange={(event) => setPreferSameZone(event.target.checked)}
          />
          <span>Prefer same time zone</span>
        </label>
      </form>

      <section className="partner-matcher__insights" aria-live="polite">
        <h3>AI nudges</h3>
        <p className="muted">Most compatible partners based on goals, timezone, and energy.</p>
        <ul>
          {aiSuggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className="link-btn"
                onClick={() => onConnect(suggestion)}
              >
                {suggestion.name}
              </button>
              <span>{suggestion.reason}</span>
            </li>
          ))}
          {!aiSuggestions.length && <li>No AI suggestions yet. Adjust filters to refresh.</li>}
        </ul>
      </section>

      <div className="partner-grid" role="list">
        {partners.length === 0 && <p role="status">No partners match those filters yet.</p>}
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} onConnect={onConnect} />
        ))}
      </div>
    </section>
  );
};

PartnerMatcher.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    goals: PropTypes.arrayOf(PropTypes.string),
    availability: PropTypes.arrayOf(PropTypes.string),
    experience: PropTypes.string
  }),
  users: PropTypes.arrayOf(PropTypes.object),
  minMatch: PropTypes.number,
  onConnect: PropTypes.func
};

PartnerMatcher.defaultProps = {
  currentUser: null,
  users: [],
  minMatch: 0,
  onConnect: () => {}
};

export default PartnerMatcher;