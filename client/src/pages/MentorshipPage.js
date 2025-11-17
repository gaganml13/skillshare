import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HeaderHero from '../components/HeaderHero';
import MentorCard from '../components/MentorCard';
import MentorFilters from '../components/MentorFilters';
import MentorRequestModal from '../components/MentorRequestModal';
import { getMentors } from '../utils/loadSeeds';
import '../styles/ui.css';

const MENTOR_APPLICATIONS_KEY = 'skillversex:mentorApplications';

const createEmptyApplication = () => ({
  fullName: '',
  email: '',
  headline: '',
  expertise: '',
  experienceYears: '',
  timezone: '',
  ratePreference: '30-60',
  qualifications: [],
  qualificationInput: ''
});

const RATE_LABELS = {
  'under-30': 'Under $30/hr',
  '30-60': '$30–60/hr',
  '60-plus': '$60+/hr',
  any: 'Flexible rate'
};

const MentorshipPage = () => {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [rateFilter, setRateFilter] = useState('any');
  const [activeMentor, setActiveMentor] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [applications, setApplications] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(MENTOR_APPLICATIONS_KEY);
      const parsed = JSON.parse(stored || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.info('mentorship: unable to read mentor applications', error);
      return [];
    }
  });
  const [applicationForm, setApplicationForm] = useState(() => createEmptyApplication());
  const [applicationError, setApplicationError] = useState('');
  const applicationSectionRef = useRef(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  useEffect(() => {
    setMentors(getMentors());
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timeout = setTimeout(() => setToastMessage(''), 3500);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    try {
      window.localStorage.setItem(MENTOR_APPLICATIONS_KEY, JSON.stringify(applications));
    } catch (error) {
      console.info('mentorship: unable to persist mentor applications', error);
    }
    return undefined;
  }, [applications]);

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    mentors.forEach((mentor) => mentor.expertise.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [mentors]);

  const derivedStats = useMemo(() => {
    if (!mentors.length) {
      return {
        averageRating: '—',
        averageRate: '—'
      };
    }
    const rating = mentors.reduce((sum, mentor) => sum + mentor.rating, 0) / mentors.length;
    const rate = mentors.reduce((sum, mentor) => sum + mentor.ratePerHour, 0) / mentors.length;
    return {
      averageRating: `${rating.toFixed(1)}/5`,
      averageRate: `$${Math.round(rate)}/hr`
    };
  }, [mentors]);

  const matchesRateFilter = (mentor) => {
    if (rateFilter === 'any') return true;
    if (rateFilter === 'under-30') return mentor.ratePerHour < 30;
    if (rateFilter === '30-60') return mentor.ratePerHour >= 30 && mentor.ratePerHour <= 60;
    return mentor.ratePerHour > 60;
  };

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const searchValue = searchTerm.trim().toLowerCase();
      const matchesSearch = !searchValue
        || mentor.name.toLowerCase().includes(searchValue)
        || mentor.title.toLowerCase().includes(searchValue)
        || mentor.expertise.some((skill) => skill.toLowerCase().includes(searchValue));

      const matchesTags = !selectedTags.length
        || selectedTags.every((tag) => mentor.expertise.includes(tag));

      return matchesSearch && matchesTags && matchesRateFilter(mentor);
    });
  }, [mentors, searchTerm, selectedTags, rateFilter]);

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((existing) => existing !== tag) : [...prev, tag]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setRateFilter('any');
  };

  const updateApplicationForm = (field, value) => {
    setApplicationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddQualification = () => {
    const nextValue = applicationForm.qualificationInput.trim();
    if (!nextValue) return;
    if (applicationForm.qualifications.includes(nextValue)) {
      setApplicationForm((prev) => ({ ...prev, qualificationInput: '' }));
      return;
    }
    setApplicationForm((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, nextValue],
      qualificationInput: ''
    }));
  };

  const handleRemoveQualification = (qualification) => {
    setApplicationForm((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((entry) => entry !== qualification)
    }));
  };

  const handleApplicationSubmit = (event) => {
    event.preventDefault();
    const fullName = applicationForm.fullName.trim();
    const email = applicationForm.email.trim();
    if (!fullName || !email || applicationForm.qualifications.length === 0) {
      setApplicationError('Please share your name, email, and at least one qualification.');
      return;
    }

    const newApplication = {
      id: `mentor-application-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      fullName,
      email,
      headline: applicationForm.headline.trim(),
      expertise: applicationForm.expertise.trim(),
      experienceYears: applicationForm.experienceYears.trim(),
      timezone: applicationForm.timezone.trim(),
      ratePreference: applicationForm.ratePreference,
      qualifications: applicationForm.qualifications
    };

    console.log('Mentor application received', newApplication);
    setApplications((prev) => [newApplication, ...prev].slice(0, 8));
    setApplicationForm(createEmptyApplication());
    setApplicationError('');
    setToastMessage(`Thanks ${fullName}, our team will reach out after reviewing your profile.`);
  };

  const handleClearApplicationForm = () => {
    setApplicationForm(createEmptyApplication());
    setApplicationError('');
  };

  const scrollToApplication = useCallback(() => {
    if (!applicationSectionRef.current) return;
    applicationSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const focusable = applicationSectionRef.current.querySelector('input, select, textarea, button');
    focusable?.focus({ preventScroll: true });
  }, []);

  const handleOpenApplication = () => {
    if (isApplicationOpen) {
      scrollToApplication();
      return;
    }
    setIsApplicationOpen(true);
  };

  useEffect(() => {
    if (!isApplicationOpen) return undefined;
    const timeout = setTimeout(() => {
      scrollToApplication();
    }, 80);
    return () => clearTimeout(timeout);
  }, [isApplicationOpen, scrollToApplication]);

  const describeRatePreference = (value) => RATE_LABELS[value] || 'Flexible rate';

  const formatSubmissionDate = (timestamp) => {
    try {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(timestamp));
    } catch (error) {
      console.info('mentorship: unable to format date', error);
      return 'Recently';
    }
  };

  const handleSubmitRequest = (payload) => {
    console.log('Mentorship request submitted', payload);
    setToastMessage(`Request sent to ${payload.mentorName}. We’ll email you once they respond.`);
    setActiveMentor(null);
  };

  return (
    <main className="mentorship-page">
      <div className="mentorship-shell">
        <HeaderHero
          eyebrow="Mentorship"
          title="1:1 support from product, design, and growth leaders"
          description="Book focused sessions to unblock roadmaps, get portfolio critiques, and receive candid career guidance."
          actions={[
            { label: 'View dashboard', to: '/dashboard' },
            { label: 'Become a mentor', onClick: handleOpenApplication, variant: 'ghost' }
          ]}
          stats={[
            { label: 'Mentors available', value: `${mentors.length}` },
            { label: 'Average rating', value: derivedStats.averageRating },
            { label: 'Average rate', value: derivedStats.averageRate }
          ]}
        />

        <section className="mentorship-banner" aria-live="polite">
          <p className="mentorship-banner__eyebrow">Personalized growth</p>
          <h2>Find an expert mentor — schedule 1:1s, get feedback, and level up.</h2>
          <p>
            Every mentor in our marketplace is vetted for practical playbooks and recent operator experience. Filter
            by skills, budget, or availability to land the perfect match.
          </p>
        </section>

        {isApplicationOpen && (
          <section className="mentor-application" id="mentor-application" ref={applicationSectionRef}>
            <div className="mentor-application__intro">
            <p className="mentorship-banner__eyebrow">Share your expertise</p>
            <h2>Become a SkillverseX mentor</h2>
            <p>
              Tell us about your craft, your favourite playbooks, and the qualifications you want to highlight. We
              review every submission manually before opening new spots on the marketplace.
            </p>
            </div>

            <div className="mentor-application__layout">
            <form className="mentor-application__form" onSubmit={handleApplicationSubmit}>
              <div className="mentor-application__row">
                <label className="mentor-application__field">
                  <span>Full name*</span>
                  <input
                    type="text"
                    value={applicationForm.fullName}
                    onChange={(event) => updateApplicationForm('fullName', event.target.value)}
                    placeholder="Ava Reyes"
                    required
                  />
                </label>
                <label className="mentor-application__field">
                  <span>Email*</span>
                  <input
                    type="email"
                    value={applicationForm.email}
                    onChange={(event) => updateApplicationForm('email', event.target.value)}
                    placeholder="ava@email.com"
                    required
                  />
                </label>
              </div>

              <div className="mentor-application__row">
                <label className="mentor-application__field">
                  <span>Headline</span>
                  <input
                    type="text"
                    value={applicationForm.headline}
                    onChange={(event) => updateApplicationForm('headline', event.target.value)}
                    placeholder="Lead Product Designer @ Figma"
                  />
                </label>
                <label className="mentor-application__field">
                  <span>Primary expertise</span>
                  <input
                    type="text"
                    value={applicationForm.expertise}
                    onChange={(event) => updateApplicationForm('expertise', event.target.value)}
                    placeholder="Design systems, workshops, prototyping"
                  />
                </label>
              </div>

              <div className="mentor-application__row">
                <label className="mentor-application__field">
                  <span>Years of experience</span>
                  <input
                    type="number"
                    min="0"
                    value={applicationForm.experienceYears}
                    onChange={(event) => updateApplicationForm('experienceYears', event.target.value)}
                    placeholder="10"
                  />
                </label>
                <label className="mentor-application__field">
                  <span>Timezone / availability</span>
                  <input
                    type="text"
                    value={applicationForm.timezone}
                    onChange={(event) => updateApplicationForm('timezone', event.target.value)}
                    placeholder="GMT+5 · Evenings"
                  />
                </label>
              </div>

              <div className="mentor-application__row">
                <label className="mentor-application__field">
                  <span>Preferred rate</span>
                  <select
                    value={applicationForm.ratePreference}
                    onChange={(event) => updateApplicationForm('ratePreference', event.target.value)}
                  >
                    <option value="under-30">Under $30/hr</option>
                    <option value="30-60">$30–60/hr</option>
                    <option value="60-plus">$60+/hr</option>
                    <option value="any">Flexible</option>
                  </select>
                </label>
                <label className="mentor-application__field mentor-qualification-input">
                  <span>Qualifications*</span>
                  <div className="mentor-qualification-inline">
                    <input
                      type="text"
                      value={applicationForm.qualificationInput}
                      onChange={(event) => updateApplicationForm('qualificationInput', event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ',') {
                          event.preventDefault();
                          handleAddQualification();
                        }
                      }}
                      placeholder="Google UX cert, YC alum, ..."
                    />
                    <button type="button" onClick={handleAddQualification} className="mentor-qualification-add">
                      Add
                    </button>
                  </div>
                  {!!applicationForm.qualifications.length && (
                    <div className="mentor-qualification-pills">
                      {applicationForm.qualifications.map((qualification) => (
                        <button
                          key={qualification}
                          type="button"
                          className="mentor-qualification-pill"
                          onClick={() => handleRemoveQualification(qualification)}
                          aria-label={`Remove ${qualification}`}
                        >
                          {qualification}
                          <span aria-hidden="true">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                </label>
              </div>

              {applicationError && <p className="mentor-application__error">{applicationError}</p>}

              <div className="mentor-application__actions">
                <button type="submit" className="button-pill">
                  Submit application
                </button>
                <button type="button" className="mentor-application__clear" onClick={handleClearApplicationForm}>
                  Clear form
                </button>
              </div>
            </form>

            <aside className="mentor-application__list" aria-live="polite">
              <div className="mentor-application__list-header">
                <h3>Recently added qualifications</h3>
                <p>We surface the essentials so reviewers can skim at a glance.</p>
              </div>
              {!applications.length ? (
                <p className="mentor-application__empty">No mentor submissions yet — you could be the first.</p>
              ) : (
                <ul className="mentor-application__entries">
                  {applications.map((entry) => (
                    <li key={entry.id} className="mentor-application__entry">
                      <div className="mentor-application__entry-line">
                        <strong>{entry.fullName}</strong>
                        {entry.headline && <span>{entry.headline}</span>}
                        {entry.experienceYears && <span>{entry.experienceYears} yrs exp</span>}
                      </div>
                      {entry.qualifications.length > 0 && (
                        <div className="mentor-application__entry-quals">
                          {entry.qualifications.map((qualification) => (
                            <span key={`${entry.id}-${qualification}`} className="mentor-application__qual-chip">
                              {qualification}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mentor-application__entry-footer">
                        {entry.expertise && <span>Focus: {entry.expertise}</span>}
                        {entry.timezone && <span>{entry.timezone}</span>}
                        <span>{describeRatePreference(entry.ratePreference)}</span>
                        <span>Added {formatSubmissionDate(entry.submittedAt)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
            </div>
          </section>
        )}

        <MentorFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          availableTags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          rateFilter={rateFilter}
          onRateChange={setRateFilter}
          onReset={handleResetFilters}
        />

        <div className="mentorship-results" aria-live="polite">
          <p>{filteredMentors.length} mentors match your filters</p>
        </div>

        <section className="mentors-grid" role="list">
          {filteredMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} onRequest={setActiveMentor} />
          ))}
        </section>

        {!filteredMentors.length && (
          <div className="mentorship-empty">
            <p>No mentors found with that combination. Try resetting or picking fewer filters.</p>
          </div>
        )}
      </div>

      {activeMentor && (
        <MentorRequestModal mentor={activeMentor} onClose={() => setActiveMentor(null)} onSubmit={handleSubmitRequest} />
      )}

      {toastMessage && (
        <div className="mentor-toast" role="status" aria-live="assertive">
          {toastMessage}
        </div>
      )}
    </main>
  );
};

export default MentorshipPage;
