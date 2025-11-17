import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import CourseCard from './CourseCard';
import FilterPills from '../ui/FilterPills';

const Section = styled.section`
  margin-bottom: var(--space-xl);
  padding: 2rem;
  border-radius: 1.5rem;
  background: var(--color-surface);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: 1.25rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.4rem, 2vw, 2rem);
  color: var(--color-text);
`;

const SectionCopy = styled.p`
  margin: 0;
  color: var(--color-text-muted);
`;

const EmptyState = styled.div`
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px dashed rgba(15, 23, 42, 0.2);
  text-align: center;
  color: var(--color-text-muted);
`;

const GridWrapper = styled.div`
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const CourseGrid = ({
  title,
  subtitle,
  courses = [],
  enableFilters = true,
  emptyMessage = 'No courses to display right now.',
  onCourseAction
}) => {
  const categories = useMemo(() => {
    const unique = new Set();
    courses.forEach((course) => {
      if (course?.category) unique.add(course.category);
    });
    return ['All', ...Array.from(unique)];
  }, [courses]);

  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCourses = useMemo(() => {
    if (activeFilter === 'All') return courses;
    return courses.filter((course) => course?.category === activeFilter);
  }, [activeFilter, courses]);

  return (
    <Section className="fade-up">
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        {subtitle && <SectionCopy>{subtitle}</SectionCopy>}
      </SectionHeader>
      {enableFilters && categories.length > 1 && (
        <FilterPills
          options={categories.map((category) => ({ label: category, value: category }))}
          active={activeFilter}
          onChange={setActiveFilter}
        />
      )}
      {filteredCourses.length === 0 ? (
        <EmptyState>{emptyMessage}</EmptyState>
      ) : (
        <GridWrapper data-testid="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id || course.id}
              course={course}
              id={course._id || course.id}
              onEnrolled={onCourseAction}
              enrolled={course.enrolled}
              access={course.access}
            />
          ))}
        </GridWrapper>
      )}
    </Section>
  );
};

export default CourseGrid;
