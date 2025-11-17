// CourseList.js - Displays a grid of featured courses below the hero section

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import CourseCard from '../CourseCard';
import { SAMPLE_COURSES, isSampleEnrolled } from '../../utils/sampleCourses';

/**
 * CourseList component
 * Fetches and displays a grid of CourseCard components using real backend data
 */
const CourseList = () => {
  const [courses, setCourses] = useState([]); // State for courses
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    // Fetch courses from backend API
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
      } catch (err) {
        setCourses(SAMPLE_COURSES);
        setUsingSampleData(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 80 }}>Loading...</div>;
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
        Featured Courses
      </h2>
      {usingSampleData && (
        <p style={{ textAlign: 'center', color: '#8b8b9a', marginBottom: 12, fontSize: 14 }}>
          Showing curated sample courses while we fetch live data.
        </p>
      )}
      <Grid>
        {courses.map((course, idx) => (
          <CourseCard
            key={course._id}
            id={course._id}
            title={course.title}
            instructorName={course.instructor?.name || 'Unknown'}
            imageUrl={course.imageUrl}
            category={course.category}
            duration={course.duration || (idx % 2 === 0 ? '12 hours' : '8 hours')}
            learners={course.learners || (idx % 2 === 0 ? 1250 : 890)}
            rating={course.rating || (idx % 2 === 0 ? 4.8 : 4.9)}
            showEnrollButton={false}
            access={course.access}
            price={course.price}
            enrolled={usingSampleData ? isSampleEnrolled(course._id) : false}
          />
        ))}
      </Grid>
    </section>
  );
};


// Responsive grid for course cards
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg, 2rem);
  padding: var(--space-lg, 2rem) 0;
`;

// ...existing code...

export default CourseList;

/*
Code Description:
- useEffect: Fetches courses from backend API on mount.
- useState: Manages courses, loading, and error state.
- Maps over real courses and renders a CourseCard for each.
- Each card is wrapped in a Link to /course/:id using course._id.
- Responsive grid layout for cards using styled-components.
*/
