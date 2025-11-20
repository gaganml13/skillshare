import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { saveEmailPrefs } from '../utils/loadSeeds';

const preferenceFields = [
  {
    id: 'weeklyNewsletter',
    label: 'Weekly Newsletter',
    description: 'A concise wrap-up of mentor sessions, trending skills, and platform updates.'
  },
  {
    id: 'jobAlerts',
    label: 'Job Insights Alerts',
    description: 'Personalized job drops that match your saved filters.'
  },
  {
    id: 'eventInvites',
    label: 'Event Invites',
    description: 'Micro-events, AMAs, and cohort announcements straight to your inbox.'
  },
  {
    id: 'messageDigest',
    label: 'Messages Digest',
    description: 'A weekly roll-up of community DMs and thread replies.'
  }
];

const EmailPreferences = ({ initialPrefs, onChange }) => {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(initialPrefs);
  }, [initialPrefs]);

  // Persist toggles as soon as they change for a more natural UX.
  const handleToggle = async (fieldId) => {
    const updated = { ...prefs, [fieldId]: !prefs[fieldId] };
    setPrefs(updated);
    setSaving(true);
    const saved = await saveEmailPrefs(updated);
    console.log('Email preference updated', fieldId, new Date().toISOString());
    setSaving(false);
    if (onChange) {
      onChange(saved);
    }
  };

  return (
    <div className="email-preferences" aria-live="polite">
      {preferenceFields.map((field) => (
        <label key={field.id} className="email-preferences__item">
          <div>
            <span className="email-preferences__label">{field.label}</span>
            <p className="email-preferences__description">{field.description}</p>
          </div>
          <span className="switch">
            <input
              type="checkbox"
              checked={Boolean(prefs[field.id])}
              onChange={() => handleToggle(field.id)}
              aria-label={field.label}
            />
            <span className="switch__slider" aria-hidden="true" />
          </span>
        </label>
      ))}
      {saving && (
        <p className="form-status" role="status">
          Saving preferences...
        </p>
      )}
    </div>
  );
};

EmailPreferences.propTypes = {
  initialPrefs: PropTypes.shape({
    weeklyNewsletter: PropTypes.bool,
    jobAlerts: PropTypes.bool,
    eventInvites: PropTypes.bool,
    messageDigest: PropTypes.bool
  }),
  onChange: PropTypes.func
};

EmailPreferences.defaultProps = {
  initialPrefs: {
    weeklyNewsletter: true,
    jobAlerts: true,
    eventInvites: true,
    messageDigest: false
  },
  onChange: null
};

export default EmailPreferences;
