import React, { useContext, useEffect, useMemo, useState } from 'react';
import HeaderHero from '../components/HeaderHero';
import { AuthContext } from '../context/AuthContext';
import {
  getJobs,
  getSavedJobs,
  persistSavedJobsList,
  getJobApplications,
  saveApplication
} from '../utils/loadSeeds';
import JobFilters from '../components/jobs/JobFilters';
import JobCard from '../components/jobs/JobCard';
import QuickApplyModal from '../components/jobs/QuickApplyModal';

const USER_PROFILE_KEY = 'skillversex:userProfile';
const USER_SKILLS_KEY = 'skillversex:userSkills';

const salaryBandForRange = (range) => {
  if (!range) return 'all';
  const matches = range.match(/\d+/g);
  if (!matches || matches.length === 0) return 'all';
  const avg = matches.reduce((sum, value) => sum + Number(value), 0) / matches.length;
  if (avg < 100) return 'lt100';
  if (avg <= 150) return '100-150';
  return 'gt150';
};

const normalize = (value) => value?.toLowerCase().trim() || '';

const JobsPage = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('any');
  const [salaryBand, setSalaryBand] = useState('all');
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [quickApplyJob, setQuickApplyJob] = useState(null);
  const [prefillProfile, setPrefillProfile] = useState({});
  const [userSkills, setUserSkills] = useState([]);

  useEffect(() => {
    setJobs(getJobs());
    setSavedJobs(getSavedJobs());
    setApplications(getJobApplications());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedSkills = JSON.parse(window.localStorage.getItem(USER_SKILLS_KEY) || 'null');
      const storedProfile = JSON.parse(window.localStorage.getItem(USER_PROFILE_KEY) || 'null');
      const derivedSkills = Array.isArray(storedSkills)
        ? storedSkills
        : Array.isArray(storedProfile?.skills)
          ? storedProfile.skills
          : Array.isArray(storedProfile?.interests)
            ? storedProfile.interests
            : [];
      setUserSkills(derivedSkills);
      setPrefillProfile({
        name: storedProfile?.name || user?.name || '',
        email: storedProfile?.email || user?.email || '',
        resumeName: storedProfile?.resumeName || ''
      });
    } catch (error) {
      console.info('jobs: unable to parse profile', error);
    }
  }, [user]);

  const jobsWithMeta = useMemo(() => {
    const normalizedSkills = userSkills.map((skill) => skill.toLowerCase());
    return jobs.map((job) => {
      const overlap = normalizedSkills.length
        ? job.skills.filter((skill) => normalizedSkills.includes(skill.toLowerCase()))
        : [];
      const matchScore = normalizedSkills.length
        ? Math.round((overlap.length / job.skills.length) * 100)
        : null;
      const application = applications.find((entry) => entry.jobId === job.id);
      return {
        job,
        matchScore,
        applicationStatus: application?.status || null
      };
    });
  }, [jobs, userSkills, applications]);

  const filteredJobs = useMemo(() => {
    return jobsWithMeta
      .filter(({ job }) => {
        if (!searchTerm) return true;
        const query = normalize(searchTerm);
        return (
          normalize(job.title).includes(query) ||
          normalize(job.company).includes(query) ||
          normalize(job.description).includes(query)
        );
      })
      .filter(({ job }) => selectedLocation === 'all' || job.location === selectedLocation)
      .filter(({ job }) => {
        if (selectedType === 'any') return true;
        return job.type?.toLowerCase().includes(selectedType);
      })
      .filter(({ job }) => {
        if (salaryBand === 'all') return true;
        return salaryBandForRange(job.salaryRange) === salaryBand;
      })
      .sort((a, b) => {
        if (a.matchScore === b.matchScore) return 0;
        return (b.matchScore || 0) - (a.matchScore || 0);
      });
  }, [jobsWithMeta, searchTerm, selectedLocation, selectedType, salaryBand]);

  const availableLocations = useMemo(() => {
    const unique = new Set(jobs.map((job) => job.location));
    return Array.from(unique);
  }, [jobs]);

  const topMatches = jobsWithMeta.filter((item) => (item.matchScore || 0) >= 60).length;
  const unlockedMatches = jobsWithMeta.filter((item) => item.matchScore !== null).length;

  const handleToggleSave = (jobId) => {
    setSavedJobs((prev) => {
      const exists = prev.includes(jobId);
      const next = exists ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      persistSavedJobsList(next);
      return next;
    });
  };

  const handleApplicationSubmit = (applicationPayload) => {
    if (!quickApplyJob) return;
    const saved = saveApplication(quickApplyJob.id, applicationPayload);
    setApplications((prev) => [saved, ...prev.filter((entry) => entry.jobId !== quickApplyJob.id)]);
    setQuickApplyJob(null);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLocation('all');
    setSelectedType('any');
    setSalaryBand('all');
  };

  const handleAddSkills = () => {
    if (typeof window === 'undefined') return;
    window.location.href = '/dashboard';
  };

  const heroAction = userSkills.length === 0
    ? { label: 'Add skills to profile', onClick: handleAddSkills }
    : { label: 'Refresh matches', onClick: () => setJobs(getJobs()) };

  return (
    <main className="jobs-page">
      <div className="jobs-page__inner">
        <HeaderHero
          eyebrow="Opportunities"
          title="Smart matches for Skillverse talent"
          description="We surface roles that map to your portfolio signals, so you can spend more time building."
          actions={[heroAction]}
          stats={[
            { label: 'Matches unlocked', value: `${unlockedMatches}/${jobs.length}` },
            { label: 'Top matches', value: `${topMatches}` },
            { label: 'Quick applies', value: `${applications.length}` }
          ]}
        />

        {userSkills.length === 0 && (
          <div className="jobs-callout">
            <div>
              <p className="eyebrow">Boost your signal</p>
              <h3>Add 3–5 skills to unlock personalised scoring</h3>
              <p className="muted">We use your stack to rank roles and fast-track intros.</p>
            </div>
            <button type="button" className="primary-btn" onClick={handleAddSkills}>
              Add skills to profile
            </button>
          </div>
        )}

        <JobFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedLocation={selectedLocation}
          selectedType={selectedType}
          salaryBand={salaryBand}
          onLocationChange={setSelectedLocation}
          onTypeChange={setSelectedType}
          onSalaryChange={setSalaryBand}
          availableLocations={availableLocations}
          userSkills={userSkills}
          onReset={handleResetFilters}
        />

        <section id="job-feed" className="job-feed">
          <div className="job-feed__header">
            <div>
              <p className="eyebrow">This week</p>
              <h2>{filteredJobs.length} curated roles</h2>
            </div>
            <p className="muted">Sorted by match score, then freshness.</p>
          </div>

          <div className="job-grid">
            {filteredJobs.map(({ job, matchScore, applicationStatus }) => (
              <JobCard
                key={job.id}
                job={job}
                matchScore={matchScore}
                applicationStatus={applicationStatus}
                isSaved={savedJobs.includes(job.id)}
                onToggleSave={handleToggleSave}
                onQuickApply={setQuickApplyJob}
              />
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="job-empty-state">
              <h3>No roles match that filter yet</h3>
              <p>Try widening your location or salary band — new briefs land daily.</p>
              <button type="button" className="ghost-btn" onClick={handleResetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>

      {quickApplyJob && (
        <QuickApplyModal
          job={quickApplyJob}
          onClose={() => setQuickApplyJob(null)}
          onSubmit={handleApplicationSubmit}
          prefill={prefillProfile}
        />
      )}
    </main>
  );
};

export default JobsPage;
