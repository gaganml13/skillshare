import React, { useMemo } from 'react';
import HeaderHero from '../components/HeaderHero';
import CourseGrid from '../components/CourseGrid';
import { SAMPLE_COURSES } from '../utils/sampleCourses';

const CourseList = () => {
  const featured = useMemo(() => SAMPLE_COURSES.slice(0, 8), []);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white/90 p-4 shadow-xl ring-1 ring-slate-100 backdrop-blur sm:p-6">
          <HeaderHero
            eyebrow="Playlists"
            title="Browse the SkillverseX library"
            description="These cinematic classes are our community favourites. Enroll to unlock the AI coach and streak tracking."
            actions={[{ label: 'Go to dashboard', to: '/dashboard' }]}
            stats={[]}
          />
        </section>
        <div className="mt-8">
          <CourseGrid
            title="Featured catalog"
            subtitle="Eight lessons to inspire your next build."
            courses={featured}
            enableFilters
            emptyMessage="Catalog is updating."
          />
        </div>
      </div>
    </main>
  );
};

export default CourseList;
