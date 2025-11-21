// CoursesPage.js - Displays all available courses
import React, { useState, useEffect, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { isSampleEnrolled } from '../utils/sampleCourses';
import { getStoredCourses } from '../utils/dataStore';
import HeaderHero from '../components/HeaderHero';
import FilterPills from '../components/FilterPills';
import CourseGrid from '../components/CourseGrid';

const PageShell = styled.main`
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f8ff 0%, #ffffff 220px);
  padding-bottom: 4rem;
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FilterPanel = styled.div`
  background: #fff;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TextInput = styled.input`
  flex: 1 1 280px;
  border-radius: 1rem;
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 0.85rem 1rem;
  font-size: 1rem;
  background: rgba(99, 102, 241, 0.04);
`;

const Select = styled.select`
  flex: 0 0 220px;
  border-radius: 1rem;
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 0.85rem 1rem;
  background: rgba(99, 102, 241, 0.04);
  font-size: 1rem;
`;

const CoursesPage = () => {
  const [courses, setCourses] = useState(() => getStoredCourses());
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const refresh = () => {
      const nextCourses = getStoredCourses();
      setCourses(nextCourses);
      setUsingSampleData(nextCourses.length === 0);
    };
    refresh();
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('courses:updated', refresh);
    return () => window.removeEventListener('courses:updated', refresh);
  }, []);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const category = selectedCategory.toLowerCase();
    return courses.filter((course) => {
      const matchesTerm = term.length === 0 || [course.title, course.category, course.description, course.instructor?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
      const matchesCategory = category === 'all' || (course.category || '').toLowerCase() === category;
      return matchesTerm && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const distinctCategories = useMemo(() => {
    const set = new Set(courses.map((course) => course.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [courses]);

  const isUserAuthorized = (course) => {
    if (!course || !user) return false;
    if (!course.authorizedUsers) return false;
    const list = Array.isArray(course.authorizedUsers) ? course.authorizedUsers : [course.authorizedUsers];
    const userId = user._id || user.id;
    return list.some((authUser) => {
      if (!authUser) return false;
      if (typeof authUser === 'string') return authUser === userId;
      if (typeof authUser === 'object') return (authUser._id || authUser.id) === userId;
      return false;
    });
  };

  return (
    <PageShell>
      <Inner>
        <HeaderHero
          eyebrow="Catalog"
          title="Curated SkillverseX experiences"
          description="Discover cinematic lessons, async cohorts, and interactive workshops built by top creators."
          actions={[
            { label: 'Sort by newest', to: '/courses' },
            { label: 'Create course', to: '/courses/create' }
          ]}
          stats={[
            { label: 'Courses live', value: `${Math.max(courses.length, 24)}` },
            { label: 'Hours filmed', value: '180+' },
            { label: 'Creators onboard', value: '90+' }
          ]}
        />
        <FilterPanel>
          <InputsRow>
            <TextInput
              type="text"
              placeholder="Search by title, skill, or instructor"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              {distinctCategories.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All categories' : option}
                </option>
              ))}
            </Select>
          </InputsRow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FilterPills
              options={distinctCategories.map((option) => ({ label: option === 'all' ? 'All' : option, value: option }))}
              active={selectedCategory}
              onChange={setSelectedCategory}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                {filteredCourses.length} courses · refreshed each publish
              </span>
              <Link className="btn btn--primary" to="/courses/create">Create course</Link>
            </div>
          </div>
          {usingSampleData && (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Showing interactive sample content while we fetch live courses.
            </span>
          )}
        </FilterPanel>
        <CourseGrid
          title="All courses"
          subtitle="Filter to find your next deep work session."
          courses={filteredCourses.map((course) => ({
            ...course,
            enrolled: usingSampleData ? isSampleEnrolled(course._id) : isUserAuthorized(course)
          }))}
          enableFilters={false}
          emptyMessage="No courses match your filters."
        />
      </Inner>
    </PageShell>
  );
};

export default CoursesPage;

/*
Code Description:
- useState: Tracks catalog filters and locally stored courses.
- useEffect: Listens for custom "courses:updated" events to refresh UI instantly.
- getStoredCourses: Reads merged seed/localStorage collection without hitting the API.
- CourseGrid: Renders responsive cards that inherit the shared design tokens.
*/
