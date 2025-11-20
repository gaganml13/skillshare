import React, { useMemo, useState } from 'react';
import PartnerMatcher from '../components/PartnerMatcher';
import { getUsers, getCurrentCommunityUser } from '../utils/loadSeeds';

const REMINDER_KEY = 'skillversex:partnerReminders';

const readReminders = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(REMINDER_KEY) || '[]');
  } catch (error) {
    console.info('partners: unable to read reminders', error);
    return [];
  }
};

const persistReminders = (list) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REMINDER_KEY, JSON.stringify(list));
};

// PartnersPage wires together the matcher and recurring reminder setup
const PartnersPage = () => {
  const viewer = useMemo(() => getCurrentCommunityUser(), []);
  const users = useMemo(() => getUsers(), []);
  const [minMatch, setMinMatch] = useState(60);
  const [reminderLabel, setReminderLabel] = useState('Tuesday 09:00 standup');
  const [reminders, setReminders] = useState(readReminders);
  const [statusMessage, setStatusMessage] = useState('');

  const handleConnect = (partner) => {
    setStatusMessage(`Connection started with ${partner.name}. We will alert them.`);
  };

  const handleCreateReminder = () => {
    const trimmed = reminderLabel.trim();
    if (!trimmed) return;
    const nextReminder = {
      id: `reminder-${Date.now()}`,
      label: trimmed,
      createdAt: new Date().toISOString()
    };
    const next = [nextReminder, ...reminders].slice(0, 10);
    setReminders(next);
    persistReminders(next);
    setReminderLabel('');
    setStatusMessage('Recurring check-in saved.');
  };

  return (
    <main className="partners-page">
      <header className="partners-hero">
        <div>
          <p className="partners-hero__eyebrow">Accountability pods</p>
          <h1>Match partners that keep you honest</h1>
          <p>Share goals, align calendars, and log recurring nudges so you never skip a check-in.</p>
        </div>
        <div className="partners-filter">
          <label htmlFor="minMatch">Min match %</label>
          <input
            type="range"
            id="minMatch"
            min="0"
            max="100"
            step="5"
            value={minMatch}
            onChange={(event) => setMinMatch(Number(event.target.value))}
          />
          <p>{minMatch}%</p>
        </div>
      </header>

      <section className="partners-reminders" aria-label="Recurring check-ins">
        <h2>Start pairing cadence</h2>
        <div className="partners-reminders__form">
          <input
            type="text"
            value={reminderLabel}
            onChange={(event) => setReminderLabel(event.target.value)}
            placeholder="e.g. Fridays 07:30 demo sync"
          />
          <button type="button" className="primary-btn" onClick={handleCreateReminder}>
            Save reminder
          </button>
        </div>
        <ul className="partners-reminders__list">
          {reminders.map((reminder) => (
            <li key={reminder.id}>{reminder.label}</li>
          ))}
          {!reminders.length && <li>No reminders yet. Add your first intention.</li>}
        </ul>
      </section>

      <PartnerMatcher
        currentUser={viewer}
        users={users}
        minMatch={minMatch}
        onConnect={handleConnect}
      />

      {statusMessage && <p className="partners-status" role="status">{statusMessage}</p>}
    </main>
  );
};

export default PartnersPage;