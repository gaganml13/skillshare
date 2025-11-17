import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import CourseCard from '../CourseCard';
import { AuthContext } from '../../context/AuthContext';

const renderCourseCard = (overrideProps = {}) => {
  const baseCourse = {
    _id: 'course-card-test',
    title: 'React Basics',
    category: 'Development',
    instructor: { name: 'Alex Rivera' },
    description: 'Build interfaces with React hooks and components.',
    duration: '4h 20m',
    rating: 4.9,
    learners: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80'
  };
  const mergedCourse = { ...baseCourse, ...(overrideProps.course || {}) };
  const props = { ...overrideProps, course: mergedCourse };

  return render(
    <AuthContext.Provider value={{ user: { name: 'Test Learner', _id: 'user-1' }, token: null }}>
      <MemoryRouter>
        <CourseCard {...props} />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('CourseCard', () => {
  test('renders key course details and CTA', () => {
    renderCourseCard();
    expect(screen.getByRole('heading', { name: /react basics/i })).toBeInTheDocument();
    expect(screen.getByText(/Alex Rivera/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enroll now/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open React Basics quick view/i })).toBeInTheDocument();
    expect(screen.getByText(/View syllabus/i)).toBeInTheDocument();
  });

  test('progress bar exposes aria values', () => {
    renderCourseCard({ enrolled: true, course: { _id: 'course-card-test-2' } });
    const progress = screen.getByRole('progressbar', { name: /course progress/i });
    expect(progress).toHaveAttribute('aria-valuenow');
  });
});
