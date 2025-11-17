import React from 'react';
import PropTypes from 'prop-types';

const typeOptions = ['Any', 'Remote', 'Hybrid', 'On-site', 'Contract', 'Part-time'];

const salaryOptions = [
  { value: 'all', label: 'All salaries' },
  { value: 'lt100', label: 'Under $100k' },
  { value: '100-150', label: '$100k – $150k' },
  { value: 'gt150', label: '$150k+' }
];

const JobFilters = ({
  searchTerm,
  onSearchChange,
  selectedLocation,
  selectedType,
  salaryBand,
  onLocationChange,
  onTypeChange,
  onSalaryChange,
  availableLocations,
  userSkills,
  onReset
}) => (
  <section className="job-filters">
    <div className="job-filters__search">
      <input
        type="search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search role, company, or keyword"
      />
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </div>

    <div className="job-filters__row">
      <div className="job-filters__field">
        <label htmlFor="location-filter">Location</label>
        <select
          id="location-filter"
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
        >
          <option value="all">All locations</option>
          {availableLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div className="job-filters__field">
        <label>Work style</label>
        <div className="pill-group">
          {typeOptions.map((option) => {
            const value = option.toLowerCase();
            return (
              <button
                key={option}
                type="button"
                className={`pill ${selectedType === value ? 'is-active' : ''}`}
                onClick={() => onTypeChange(value)}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="job-filters__field">
        <label>Salary focus</label>
        <div className="pill-group">
          {salaryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`pill ${salaryBand === option.value ? 'is-active' : ''}`}
              onClick={() => onSalaryChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>

    {userSkills.length > 0 && (
      <div className="job-filters__skills" role="status">
        <strong>Your skills powering matches:</strong>
        <div>{userSkills.join(', ')}</div>
      </div>
    )}
  </section>
);

JobFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedLocation: PropTypes.string.isRequired,
  selectedType: PropTypes.string.isRequired,
  salaryBand: PropTypes.string.isRequired,
  onLocationChange: PropTypes.func.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  onSalaryChange: PropTypes.func.isRequired,
  availableLocations: PropTypes.arrayOf(PropTypes.string).isRequired,
  userSkills: PropTypes.arrayOf(PropTypes.string),
  onReset: PropTypes.func.isRequired
};

JobFilters.defaultProps = {
  userSkills: []
};

export default JobFilters;
