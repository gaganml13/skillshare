// CoursesPage.js - Displays all available courses
import React, { useState, useEffect, useContext, useMemo } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SAMPLE_COURSES, isSampleEnrolled } from '../utils/sampleCourses';
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
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/courses');
        const fetched = Array.isArray(res.data) ? res.data : [];
        if (fetched.length === 0) {
          setCourses(SAMPLE_COURSES);
          setUsingSampleData(true);
        } else {
          setCourses(fetched);
          setUsingSampleData(false);
        }
        setError('');
      } catch (err) {
        setCourses(SAMPLE_COURSES);
        setUsingSampleData(true);
        setError('');
      }
    };
    fetchCourses();
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
            { label: 'Request mentorship', to: '/mentorship', variant: 'ghost' }
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
          <FilterPills
            options={distinctCategories.map((option) => ({ label: option === 'all' ? 'All' : option, value: option }))}
            active={selectedCategory}
            onChange={setSelectedCategory}
          />
          {usingSampleData && (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Showing interactive sample content while we fetch live courses.
            </span>
          )}
          {error && <span style={{ color: 'red' }}>{error}</span>}
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
- useState: Holds courses array and error message.
- useEffect: Fetches courses from backend API on initial render.
- axios: Used for GET request to /api/courses.
- CourseCard: Renders each course with its details.
- Layout: Responsive flexbox grid for course cards.
*/
