import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/courses/CourseCard';
import styled from 'styled-components';
import { SAMPLE_COURSES, isSampleEnrolled } from '../utils/sampleCourses';

// Styled Components for Dashboard
const HeaderSection = styled.section`
  width: 100%;
  min-height: 260px;
  background: linear-gradient(120deg, #1e3c72 0%, #2a5298 50%, #6C63FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 0;
`;

const HeaderContent = styled.div`
  text-align: center;
  max-width: 700px;
`;

const HeaderTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 24px rgba(44, 62, 80, 0.18);
`;

const HeaderSubtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
`;

const HeaderDesc = styled.p`
  font-size: 1.1rem;
  color: rgba(255,255,255,0.92);
  margin-bottom: 0.5rem;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
`;

const Section = styled.div`
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #22223B;
`;

const EmptyText = styled.p`
  color: #888;
  font-size: 1.1rem;
  margin-bottom: 12px;
`;

const CourseGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
`;

const DashboardPage = () => {
  const { user, token, loading } = useContext(AuthContext);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [error, setError] = useState('');
  const [featuredCourses, setFeaturedCourses] = useState(SAMPLE_COURSES);

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const res = await axios.get('/api/courses/user/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCreatedCourses(res.data.createdCourses);
        setEnrolledCourses(res.data.enrolledCourses);
      } catch (err) {
        setError('Failed to load your courses');
      }
    };
    if (user && token) fetchUserCourses();
    const onEnroll = () => {
      if (user && token) fetchUserCourses();
    };
    window.addEventListener('courseEnrolled', onEnroll);
    return () => window.removeEventListener('courseEnrolled', onEnroll);
  }, [user, token]);

  // Fetch featured/public courses to show recommendations when user has none enrolled
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get('/api/courses');
        const fetched = Array.isArray(res.data) ? res.data : [];
        if (fetched.length === 0) {
          setFeaturedCourses(SAMPLE_COURSES);
        } else {
          setFeaturedCourses(fetched);
        }
      } catch (err) {
  // ignore - keep SAMPLE_COURSES as fallback
      }
    };
    fetchFeatured();
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const currentUserId = user?._id || user?.id;
  const isUserAuthorized = (authorizedUsers = []) => {
    if (!currentUserId || !Array.isArray(authorizedUsers)) return false;
    return authorizedUsers.some(authUser => {
      if (!authUser) return false;
      if (typeof authUser === 'string') return authUser === currentUserId;
      if (typeof authUser === 'object') return (authUser._id || authUser.id) === currentUserId;
      return false;
    });
  };

  return (
    <>
      <HeaderSection>
        <HeaderContent>
          <HeaderTitle>Hello, {user.name}!</HeaderTitle>
          <HeaderSubtitle>Welcome to your dashboard.</HeaderSubtitle>
          <HeaderDesc>
            Track your learning, manage your created courses, and enroll in new skills. <br />
            <span style={{ fontWeight: 600, color: '#fff' }}>Unlock your potential with SkillShare!</span>
          </HeaderDesc>
        </HeaderContent>
      </HeaderSection>
      <MainContent>
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>{error}</div>}
        {/* Featured Courses Section (large cards) */}
        <Section>
          <SectionTitle style={{ textAlign: 'center' }}>Featured Courses</SectionTitle>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>Explore our hand-picked selection of top-rated courses from expert creators</p>
          <CourseGrid>
            {(featuredCourses.length ? featuredCourses : SAMPLE_COURSES).slice(0,4).map((course, idx) => (
              <CourseCard
                key={course._id || idx}
                id={course._id}
                title={course.title}
                instructorName={course.instructor?.name || 'Instructor'}
                price={course.price}
                category={course.category}
                imageUrl={course.imageUrl}
                duration={course.duration}
                learners={course.learners}
                rating={course.rating}
                showEnrollButton={true}
                access={course.access}
                enrolled={Boolean(course._id && isSampleEnrolled(course._id))}
              />
            ))}
          </CourseGrid>
        </Section>
        <Section>
          <SectionTitle>My Created Courses</SectionTitle>
          {createdCourses.length === 0 ? (
            <EmptyText>You haven't created any courses yet.</EmptyText>
          ) : (
            <CourseGrid>
              {createdCourses.map((course, idx) => (
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
                />
              ))}
            </CourseGrid>
          )}
        </Section>
        <Section>
          <SectionTitle>Courses I'm Enrolled In</SectionTitle>
          {enrolledCourses.length === 0 ? (
            <>
              <EmptyText>You are not enrolled in any courses yet.</EmptyText>
              <p style={{ marginTop: 12, color: '#666' }}>Recommended for you</p>
              <CourseGrid>
                {featuredCourses.slice(0,4).map((course, idx) => (
                  <CourseCard
                    key={course._id || idx}
                    id={course._id}
                    title={course.title || 'Sample Course'}
                    instructorName={course.instructor?.name || 'Instructor'}
                    price={course.price}
                    category={course.category}
                    imageUrl={course.imageUrl}
                    duration={course.duration || (idx % 2 === 0 ? '12 hours' : '8 hours')}
                    learners={course.learners || (idx % 2 === 0 ? 1250 : 890)}
                    rating={course.rating || (idx % 2 === 0 ? 4.8 : 4.9)}
                    showEnrollButton={true}
                    access={course.access}
                    enrolled={isUserAuthorized(course.authorizedUsers) || (course._id && isSampleEnrolled(course._id))}
                  />
                ))}
              </CourseGrid>
            </>
          ) : (
            <CourseGrid>
              {enrolledCourses.map((course, idx) => (
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
                />
              ))}
            </CourseGrid>
          )}
        </Section>
      </MainContent>
    </>
  );

};

export default DashboardPage;
