import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/ui.css';

const POLL_VOTE_STORAGE_KEY = 'skillversex:pollVotes';

const readStoredVotes = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(POLL_VOTE_STORAGE_KEY) || '{}');
  } catch (error) {
    console.info('poll: unable to read votes', error);
    return {};
  }
};

const persistVote = (pollId, optionId) => {
  if (typeof window === 'undefined') return;
  try {
    const stored = readStoredVotes();
    stored[pollId] = optionId;
    window.localStorage.setItem(POLL_VOTE_STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.info('poll: unable to persist vote', error);
  }
};

const Poll = ({ pollId, question, options }) => {
  const [votes, setVotes] = useState(() => readStoredVotes());
  const selectedOption = votes[pollId];

  const totalVotes = useMemo(() => options.reduce((sum, option) => sum + (option.votes || 0), 0), [options]);

  const handleVote = (optionId) => {
    if (selectedOption) return;
    persistVote(pollId, optionId);
    setVotes((prev) => ({ ...prev, [pollId]: optionId }));
  };

  const renderPercentage = (option) => {
    if (!totalVotes) return '0%';
    const votesCount = option.votes || 0;
    const extra = selectedOption === option.id ? 1 : 0;
    const percentage = Math.round(((votesCount + extra) / (totalVotes + (selectedOption ? 1 : 0))) * 100);
    return `${percentage}%`;
  };

  return (
    <div className="poll-card" role="group" aria-label={question}>
      <p className="poll-question">{question}</p>
      <div className="poll-options">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`poll-option ${isSelected ? 'poll-option--selected' : ''}`}
              onClick={() => handleVote(option.id)}
              disabled={Boolean(selectedOption)}
            >
              <span>{option.label}</span>
              <span className="poll-option__percentage">{renderPercentage(option)}</span>
              <span className="poll-option__bar" aria-hidden="true" style={{ width: renderPercentage(option) }} />
            </button>
          );
        })}
      </div>
      {selectedOption && <p className="poll-vote-note">Thanks for voting! Results update in real time.</p>}
    </div>
  );
};

Poll.propTypes = {
  pollId: PropTypes.string.isRequired,
  question: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      votes: PropTypes.number
    })
  ).isRequired
};

export default Poll;
