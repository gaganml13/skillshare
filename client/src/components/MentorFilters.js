import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ui.css';

const RATE_OPTIONS = [
  { value: 'any', label: 'Any rate' },
  { value: 'under-30', label: 'Under $30/hr' },
  { value: '30-60', label: '$30–60/hr' },
  { value: '60-plus', label: '$60+/hr' }
];

/**
 * Lightweight controlled filter bar so the parent page owns the state logic.
 * Includes search, expertise toggles, and rate dropdown for flexible combinations.
 */
const MentorFilters = ({
  searchTerm,
  onSearchChange,
  availableTags,
  selectedTags,
  onToggleTag,
  rateFilter,
  onRateChange,
  onReset
}) => {
  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedTags.length > 0 || rateFilter !== 'any'
  );

  return (
    <section className="mentor-filters" aria-label="Mentor filters">
      <div className="mentor-filter-field mentor-filter-field--wide">
        <label htmlFor="mentor-search" className="mentor-filter-label">
          Search
        </label>
        <input
          id="mentor-search"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Try “React” or “design systems”"
          className="mentor-filter-input"
        />
      </div>

      <div className="mentor-filter-field">
        <label htmlFor="mentor-rate" className="mentor-filter-label">
          Hourly rate
        </label>
        <select
          id="mentor-rate"
          value={rateFilter}
          onChange={(event) => onRateChange(event.target.value)}
          className="mentor-filter-select"
        >
          {RATE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mentor-filter-group" aria-live="polite">
        <p className="mentor-filter-label">Expertise</p>
        <div className="mentor-filter-pills" role="group" aria-label="Expertise filters">
          {availableTags.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className="mentor-filter-pill"
                aria-pressed={isActive}
                onClick={() => onToggleTag(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className={`mentor-filter-reset ${hasActiveFilters ? 'mentor-filter-reset--active' : ''}`}
        onClick={onReset}
        aria-pressed={hasActiveFilters}
      >
        <span className="mentor-filter-reset__thumb" aria-hidden="true" />
        <span className="mentor-filter-reset__label">Reset</span>
      </button>
    </section>
  );
};

MentorFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  availableTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggleTag: PropTypes.func.isRequired,
  rateFilter: PropTypes.string.isRequired,
  onRateChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

export default MentorFilters;
