import React, { useEffect, useMemo, useState } from 'react';
import PasswordChangeModal from '../components/PasswordChangeModal';
import FeedbackForm from '../components/FeedbackForm';
import EmailPreferences from '../components/EmailPreferences';
import {
  getUser,
  updateUserProfile,
  getDownloads,
  saveDownloadsList,
  getEmailPrefs,
  getFeedbackHistory
} from '../utils/loadSeeds';

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'feedback', label: 'Feedback' }
];

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: '', displayName: '', email: '' });
  const [downloads, setDownloads] = useState([]);
  const [prefs, setPrefs] = useState({
    weeklyNewsletter: true,
    jobAlerts: true,
    eventInvites: true,
    messageDigest: false
  });
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');

  const lastLogin = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('lastLogin');
  }, []);

  useEffect(() => {
    getUser().then((user) => {
      setProfileForm({
        name: user.name || '',
        displayName: user.displayName || user.name || '',
        email: user.email || ''
      });
    });
    getDownloads().then(setDownloads);
    getEmailPrefs().then(setPrefs);
    getFeedbackHistory().then(setFeedbackHistory);
    if (typeof window !== 'undefined') {
      const applyHash = () => {
        const hash = window.location.hash.replace('#', '');
        if (tabs.some((tab) => tab.id === hash)) {
          setActiveTab(hash);
        }
      };
      applyHash();
      window.addEventListener('hashchange', applyHash);
      return () => window.removeEventListener('hashchange', applyHash);
    }
    return undefined;
  }, []);

  // Save profile locally and simulate exporting data for the user.
  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    await updateUserProfile(profileForm);
    setProfileStatus('Profile updated successfully.');
    setSavingProfile(false);
  };

  // Allow members to export personal data snapshot as JSON for transparency.
  const handleExportData = async () => {
    const payload = {
      profile: profileForm,
      downloads,
      preferences: prefs,
      feedback: feedbackHistory
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'skillshare-account-export.json';
    link.click();
    URL.revokeObjectURL(url);
    console.log('Profile data downloaded', new Date().toISOString());
  };

  const handleDownloadToggle = async (downloadId) => {
    const updated = downloads.map((item) =>
      item.id === downloadId ? { ...item, completed: !item.completed } : item
    );
    setDownloads(updated);
    await saveDownloadsList(updated);
    console.log('Download completion toggled', downloadId, new Date().toISOString());
  };

  // Generate a client-only file when no URL exists so redownload always works.
  const handleDownloadAgain = (item) => {
    const link = document.createElement('a');
    link.href = item.url || URL.createObjectURL(new Blob([item.title], { type: 'text/plain' }));
    link.download = `${item.title || 'download'}.txt`;
    link.click();
    if (!item.url) {
      URL.revokeObjectURL(link.href);
    }
    console.log('Download redelivered', item.id, new Date().toISOString());
  };

  const handleDownloadRemove = async (downloadId) => {
    const filtered = downloads.filter((item) => item.id !== downloadId);
    setDownloads(filtered);
    await saveDownloadsList(filtered);
    console.log('Download removed', downloadId, new Date().toISOString());
  };

  const renderProfile = () => (
    <section id="profile" className="account-panel">
      <form onSubmit={handleProfileSave} className="account-form">
        <label className="form-field">
          Full name
          <input
            type="text"
            value={profileForm.name}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>
        <label className="form-field">
          Display name
          <input
            type="text"
            value={profileForm.displayName}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, displayName: event.target.value }))
            }
            required
          />
        </label>
        <label className="form-field">
          Email
          <input
            type="email"
            value={profileForm.email}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        {profileStatus && (
          <p className="form-status" role="status">
            {profileStatus}
          </p>
        )}
        <div className="account-form__actions">
          <button type="submit" className="btn btn--primary" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleExportData}>
            Download my data
          </button>
        </div>
      </form>
    </section>
  );

  const renderSecurity = () => (
    <section id="security" className="account-panel">
      <div className="account-security">
        <div>
          <p className="account-security__label">Last login</p>
          <p className="account-security__value">{lastLogin || 'Not recorded'}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setPasswordModalOpen(true)}>
          Change password
        </button>
      </div>
      <p className="account-hint">Passwords are stored locally for this demo; server hashing would replace this step in production.</p>
    </section>
  );

  const renderDownloads = () => (
    <section id="downloads" className="account-panel">
      <ul className="download-list">
        {downloads.length === 0 && <li>No downloads yet.</li>}
        {downloads.map((item) => (
          <li key={item.id} className="download-item">
            <div>
              <p className="download-item__title">{item.title}</p>
              <p className="download-item__meta">
                {item.type} · {item.size}
              </p>
            </div>
            <div className="download-item__actions">
              <label className="download-item__complete">
                <input
                  type="checkbox"
                  checked={Boolean(item.completed)}
                  onChange={() => handleDownloadToggle(item.id)}
                />
                <span>Completed</span>
              </label>
              <button type="button" className="btn btn--ghost" onClick={() => handleDownloadAgain(item)}>
                Redownload
              </button>
              <button type="button" className="btn btn--text" onClick={() => handleDownloadRemove(item.id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  const renderPreferences = () => (
    <section id="preferences" className="account-panel">
      <EmailPreferences initialPrefs={prefs} onChange={setPrefs} />
    </section>
  );

  const renderFeedback = () => (
    <section id="feedback" className="account-panel account-feedback">
      <FeedbackForm onSubmitted={setFeedbackHistory} />
      <div className="account-feedback__history" aria-live="polite">
        <h3>View my feedback</h3>
        {feedbackHistory.length === 0 && <p>No submissions yet.</p>}
        <ul>
          {feedbackHistory.map((entry) => (
            <li key={entry.id}>
              <p className="account-feedback__message">{entry.message}</p>
              <span className="account-feedback__meta">
                {entry.category} · {new Date(entry.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'security':
        return renderSecurity();
      case 'downloads':
        return renderDownloads();
      case 'preferences':
        return renderPreferences();
      case 'feedback':
        return renderFeedback();
      case 'profile':
      default:
        return renderProfile();
    }
  };

  return (
    <main className="account-page">
      <header className="account-header">
        <div>
          <p className="account-header__eyebrow">Account</p>
          <h1>Manage your workspace identity</h1>
        </div>
      </header>
      <nav className="account-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`account-tab ${activeTab === tab.id ? 'account-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {renderActiveTab()}
      <PasswordChangeModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </main>
  );
};

export default AccountPage;
