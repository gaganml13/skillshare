// CoursesPage.js - Displays all available courses
import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import CourseCard from '../components/courses/CourseCard';
import { AuthContext } from '../context/AuthContext';
import { SAMPLE_COURSES, isSampleEnrolled } from '../utils/sampleCourses';

const CoursesPage = () => {
  // State to hold array of courses
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useContext(AuthContext);

  // Fetch courses from backend on page load
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
    return courses.filter(course => {
      const matchesTerm = term.length === 0 || [course.title, course.category, course.description, course.instructor?.name]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(term));
      const matchesCategory = category === 'all' || (course.category || '').toLowerCase() === category;
      return matchesTerm && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const distinctCategories = useMemo(() => {
    const set = new Set(courses.map(course => course.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [courses]);

  return (
    <div style={{ background: 'linear-gradient(180deg, #f7f8ff 0%, #ffffff 220px)', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '40px 48px', boxShadow: '0 32px 60px rgba(82, 87, 255, 0.12)', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 220, height: 220, background: 'rgba(108, 99, 255, 0.18)', filter: 'blur(48px)' }} />
          <div style={{ position: 'absolute', bottom: -120, left: -60, width: 260, height: 260, background: 'rgba(33, 150, 243, 0.12)', filter: 'blur(60px)' }} />
          <div style={{ position: 'relative' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(108, 99, 255, 0.12)', color: '#3f3dff', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Curated Catalog</span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#111634', marginBottom: 16 }}>Browse Courses</h1>
            <p style={{ color: '#5c5f78', fontSize: 16, maxWidth: 620 }}>
              Explore premium classes from expert creators. Enroll in a course to unlock lessons, download resources, and chat with the AI study assistant.
            </p>
            {usingSampleData && (
              <p style={{ color: '#7a7d99', fontSize: 13, marginTop: 8 }}>
                We could not load live courses, so you&apos;re seeing interactive sample content.
              </p>
            )}
            {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 28 }}>
              <input
                type="text"
                placeholder="Search by title, skill, or instructor"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ flex: '1 1 320px', padding: '14px 18px', borderRadius: 14, border: '1px solid #e0e3ff', background: '#f7f8ff', fontSize: 15, color: '#111634' }}
              />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid #e0e3ff', background: '#f7f8ff', fontSize: 15, color: '#111634', minWidth: 180 }}
              >
                {distinctCategories.map(option => (
                  <option key={option} value={option}>{option === 'all' ? 'All Categories' : option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', color: '#5c5f78', boxShadow: '0 24px 40px rgba(15, 23, 42, 0.08)' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: 12 }}>No courses match your filters.</h3>
            <p>Try adjusting the category or search terms to find new skills to learn.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
            {filteredCourses.map((course, idx) => (
              <CourseCard
                key={course._id}
                id={course._id}
                title={course.title}
                instructorName={course.instructor?.name || 'Unknown'}
                price={course.price}
                category={course.category}
                imageUrl={course.imageUrl}
                duration={course.duration || (idx % 2 === 0 ? '12 hours' : '8 hours')}
                learners={course.learners || (idx % 2 === 0 ? 1250 : 890)}
                rating={course.rating || (idx % 2 === 0 ? 4.8 : 4.9)}
                showEnrollButton={true}
                access={course.access}
                enrolled={usingSampleData
                  ? isSampleEnrolled(course._id)
                  : Boolean(
                      user && course.authorizedUsers && [course.authorizedUsers].flat().some(authUser => {
                        const userId = user._id || user.id;
                        if (!userId) return false;
                        if (!authUser) return false;
                        if (typeof authUser === 'string') return authUser === userId;
                        if (typeof authUser === 'object') return (authUser._id || authUser.id) === userId;
                        return false;
                      })
                    )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
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
