import React, { useEffect, useMemo, useState } from 'react';
import HeaderHero from '../components/HeaderHero';
import KPIGrid from '../components/KPIGrid';
import FilterPills from '../components/FilterPills';
import CourseGrid from '../components/CourseGrid';
import AIChatWidget from '../components/AIChatWidget';
import { getJobs } from '../utils/loadSeeds';
import { getStoredCourses } from '../utils/dataStore';

const HomePage = () => {
  const [courses, setCourses] = useState(() => getStoredCourses());
  const [loadingCourses, setLoadingCourses] = useState(true);
  const jobs = useMemo(() => getJobs().slice(0, 3), []);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const refresh = () => {
      setCourses(getStoredCourses());
      setLoadingCourses(false);
    };
    refresh();
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('courses:updated', refresh);
    return () => window.removeEventListener('courses:updated', refresh);
  }, []);

  const heroKpis = [
    { label: 'Learners online', value: '3.1k', meta: 'Right now' },
    { label: 'Live cohorts', value: '48', meta: 'Streaming this week' },
    { label: 'Jobs posted', value: `${jobs.length}`, meta: 'Curated roles' }
  ];

  const categories = useMemo(() => {
    const set = new Set(courses.map((course) => course.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (activeCategory === 'All') return courses.slice(0, 6);
    return courses.filter((course) => course.category === activeCategory).slice(0, 6);
  }, [activeCategory, courses]);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white/90 p-4 shadow-xl ring-1 ring-slate-100 backdrop-blur sm:p-6">
          <HeaderHero
            eyebrow="SkillverseX"
            title="Where creators ship cinematic learning"
            description="Prototype lessons, run async cohorts, and unlock AI copilots that keep your studio humming."
            chips={[{ label: 'New drop • Studio OS' }, { label: 'Community sprint • 72 hrs' }]}
            actions={[
              { label: 'Enter dashboard', to: '/dashboard' },
              { label: 'Explore catalog', to: '/courses', variant: 'ghost' }
            ]}
            rightSlot={<KPIGrid items={heroKpis} />}
          />
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Curated playlists</p>
              <h2 className="text-2xl font-semibold text-slate-900">Pick a category to start</h2>
            </div>
            <p className="text-sm text-slate-500">
              {loadingCourses ? 'Refreshing courses…' : `${filteredCourses.length} featured picks`}
            </p>
          </div>
          <div className="mt-5">
            <FilterPills
              options={categories.map((category) => ({ label: category, value: category }))}
              active={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
          <div className="mt-6">
            <CourseGrid
              title="Trending courses"
              subtitle="Hand-crafted experiences from top mentors."
              courses={filteredCourses}
              enableFilters={false}
              emptyMessage="No courses match this filter yet."
            />
          </div>
        </section>

        <section className="mt-10">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24 }}>
            <ToggleAIWidget />
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;

function ToggleAIWidget() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        style={{
          borderRadius: '1.5rem',
          border: '1px solid #e0e7ff',
          background: '#fff',
          padding: '0.85rem 1.5rem',
          fontWeight: 600,
          color: '#6366f1',
          boxShadow: '0 15px 30px rgba(99,102,241,0.08)',
          marginBottom: 16,
          cursor: 'pointer',
        }}
        onClick={() => setShow((prev) => !prev)}
        aria-expanded={show}
      >
        {show ? 'Hide AI Assistant' : 'Show AI Assistant'}
      </button>
      {show && (
        <div style={{ maxWidth: 480, width: '100%' }}>
          <AIChatWidget userName="Demo User" />
        </div>
      )}
    </>
  );
}
