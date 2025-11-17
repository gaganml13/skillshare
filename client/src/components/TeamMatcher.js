import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  findMatches,
  getUserSkills,
  saveUserSkills,
  recordEventInvite,
  getCurrentCommunityUser
} from '../utils/loadSeeds';

const parseSkills = (value) => value
  .split(',')
  .map((skill) => skill.trim())
  .filter(Boolean);

// TeamMatcher surfaces overlap scores + invites for a given event roster
const TeamMatcher = ({ event, isOpen, onClose }) => {
  const modalRef = useRef(null);
  const [skillsField, setSkillsField] = useState('');
  const [activeSkills, setActiveSkills] = useState([]);
  const [minMatchPct, setMinMatchPct] = useState(40);
  const [availability, setAvailability] = useState('any');
  const [matches, setMatches] = useState([]);
  const [toast, setToast] = useState('');

  const viewer = useMemo(() => getCurrentCommunityUser(), []);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;
    const handleKeyDown = (eventKey) => {
      if (eventKey.key === 'Escape') {
        eventKey.preventDefault();
        onClose();
      }
      if (eventKey.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const nodes = Array.from(focusable).filter((node) => !node.disabled);
        if (!nodes.length) return;
        const [first, last] = [nodes[0], nodes[nodes.length - 1]];
        if (!eventKey.shiftKey && document.activeElement === last) {
          eventKey.preventDefault();
          first.focus();
        } else if (eventKey.shiftKey && document.activeElement === first) {
          eventKey.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const stored = getUserSkills();
    setSkillsField(stored.join(', '));
    setActiveSkills(stored);
  }, [isOpen, event]);

  useEffect(() => {
    if (!event || !activeSkills.length) {
      setMatches([]);
      return;
    }
    const nextMatches = findMatches(event.id, activeSkills, {
      minMatchPct,
      availability: availability === 'any' ? null : availability
    });
    setMatches(nextMatches);
  }, [event, activeSkills, minMatchPct, availability]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!event || !isOpen) return null;

  const handleSaveSkills = () => {
    const parsed = parseSkills(skillsField);
    if (!parsed.length) return;
    saveUserSkills(parsed);
    setActiveSkills(parsed);
  };

  const handleInvite = (match) => {
    recordEventInvite({ from: viewer.name, to: match.name, eventId: event.id, message: 'Let’s pair up for this session.' });
    console.log('Invite sent', { from: viewer.name, to: match.name, eventId: event.id });
    setToast(`Invite sent to ${match.name}`);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Find teammates">
      <div className="modal-card team-matcher" ref={modalRef}>
        <header className="team-matcher__header">
          <div>
            <p className="team-matcher__eyebrow">Matching for</p>
            <h3>{event.title}</h3>
            <p>{event.skillsRequired?.join(' · ')}</p>
          </div>
          <button type="button" className="icon-btn" aria-label="Close team matcher" onClick={onClose}>
            ×
          </button>
        </header>

        <section className="team-matcher__controls">
          <label>
            <span>Your skills</span>
            <textarea value={skillsField} onChange={(field) => setSkillsField(field.target.value)} rows={2} />
          </label>
          <div className="team-matcher__control-row">
            <label>
              <span>Min match %</span>
              <input type="range" min="0" max="100" value={minMatchPct} onChange={(eventRange) => setMinMatchPct(Number(eventRange.target.value))} />
              <strong>{minMatchPct}%</strong>
            </label>
            <label>
              <span>Availability</span>
              <select value={availability} onChange={(eventSelect) => setAvailability(eventSelect.target.value)}>
                <option value="any">Any</option>
                <option value="Mornings">Mornings</option>
                <option value="Afternoons">Afternoons</option>
                <option value="Evenings">Evenings</option>
                <option value="Weeknights">Weeknights</option>
                <option value="Weekends">Weekends</option>
                <option value="Flexible">Flexible</option>
              </select>
            </label>
            <button type="button" className="ghost-btn" onClick={handleSaveSkills}>
              Save skills
            </button>
          </div>
        </section>

        <section className="team-matcher__results" aria-live="polite">
          {matches.length === 0 && <p>No matches yet—tweak the filters.</p>}
          {matches.map((match) => (
            <article key={match.id} className="team-match-card">
              <div className="team-match-card__identity">
                <img src={match.avatar} alt={match.name} />
                <div>
                  <h4>{match.name}</h4>
                  <p>{match.availability || 'Flexible'}, match {match.matchScore}%</p>
                  <div className="event-card__tags">
                    {match.skills.map((skill) => (
                      <span key={skill} className="skill-pill" data-variant="match">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button type="button" className="primary-btn" onClick={() => handleInvite(match)}>
                Invite
              </button>
            </article>
          ))}
        </section>

        {toast && <div className="team-matcher__toast" role="status">{toast}</div>}
      </div>
    </div>
  );
};

TeamMatcher.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    skillsRequired: PropTypes.arrayOf(PropTypes.string)
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

TeamMatcher.defaultProps = {
  event: null
};

export default TeamMatcher;