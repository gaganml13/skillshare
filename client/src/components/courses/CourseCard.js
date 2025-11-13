// CourseCard.js - Reusable card for displaying a course
// CourseCard.js - Reusable card for displaying a course (homepage version)
import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { storeSampleEnrollment, isSampleCourseId, isSampleEnrolled } from '../../utils/sampleCourses';

// Styled card container
const Card = styled.div`
  background: #fff;
  border-radius: var(--border-radius-md, 0.75rem);
  box-shadow: var(--box-shadow-sm, 0 2px 8px rgba(44,62,80,0.08));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.22s cubic-bezier(.4,0,.2,1);
  &:hover {
    box-shadow: 0 8px 32px rgba(44,62,80,0.16);
    transform: translateY(-5px);
  }
`;

// Course image placeholder
const Image = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
`;

// Content area for course info
const Content = styled.div`
  padding: var(--space-md, 1rem);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 0.5rem);
`;

const CategoryTag = styled.span`
  display: inline-block;
  background: #6C63FF;
  color: #fff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.85rem;
  margin-bottom: 8px;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-dark, #22223B);
`;

const Instructor = styled.p`
  font-size: 1rem;
  color: var(--text-light, #9A9A9A);
  margin-bottom: 0.5rem;
`;

const EnrollButton = styled.button`
  margin-top: auto;
  padding: 0.6rem 1.5rem;
  background: linear-gradient(90deg, #6C63FF 0%, #2196F3 100%);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-md, 0.75rem);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--box-shadow-sm, 0 2px 8px rgba(44,62,80,0.08));
  transition: filter 0.18s, transform 0.18s;
  &:hover {
    filter: brightness(1.08);
    transform: scale(1.04);
  }
`;

/**
 * CourseCard component
 * Displays course image, title, instructor, and enroll button
 * Uses styled-components for modern UI and hover effects
 */


const CourseCard = ({ id, title, instructorName, imageUrl, category, price, duration, learners, rating, access = 'public', showEnrollButton = true, enrolled = false, onEnrolled }) => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(enrolled);
  const [requested, setRequested] = useState(false);
  const courseId = typeof id === 'string' ? id : id?._id || '';
  const isDemoCourse = isSampleCourseId(courseId) || /^demo-/i.test(courseId);

  useEffect(() => {
    if (isDemoCourse) {
      setIsEnrolled(isSampleEnrolled(courseId));
    } else {
      setIsEnrolled(enrolled);
    }
  }, [enrolled, isDemoCourse, courseId]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (isDemoCourse) {
      storeSampleEnrollment(courseId);
      setIsEnrolled(true);
      try {
        window.dispatchEvent(new CustomEvent('courseEnrolled', { detail: { courseId } }));
      } catch (err) {
        // ignore in non-browser contexts
      }
      navigate(`/course/${courseId}`);
      return;
    }
    if (!user || !token) {
      alert('Please log in to enroll in this course.');
      return;
    }
    setEnrolling(true);
    try {
      if (access === 'private') {
        // Request access flow for private/peer courses
        await axios.post(`/api/courses/${courseId}/request-access`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequested(true);
      } else {
        await axios.post(`/api/courses/${courseId}/enroll`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsEnrolled(true);
      }
  if (onEnrolled) onEnrolled(courseId);
      // Notify other parts of the app that the user enrolled in a course
      try {
        window.dispatchEvent(new CustomEvent('courseEnrolled', { detail: { courseId } }));
      } catch (err) {
        // ignore in non-browser contexts
      }
      if (access !== 'private') {
        navigate(`/course/${courseId}`);
      }
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setEnrolling(false);
    }
  };

  const detailsHref = `/course/${courseId}`;
  const canShowEnroll = showEnrollButton && (user || isDemoCourse);

  return (
    <Card>
      <Image src={imageUrl || 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80'} alt={title} />
      <Content>
        <CategoryTag>{category}</CategoryTag>
        <Title>{title}</Title>
        <Instructor>by {instructorName}</Instructor>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: '#888', margin: '8px 0' }}>
          {duration && <span>⏰ {duration}</span>}
          {learners && <span>👥 {learners}</span>}
          {rating && <span>⭐ {rating}</span>}
        </div>
        {price !== undefined && <p style={{ fontWeight: 600, color: '#6C63FF', marginBottom: 8 }}>₹{price}</p>}
        {canShowEnroll && (
          <> 
            {!isEnrolled && !requested && (
              <EnrollButton onClick={handleEnroll} disabled={enrolling}>
                {access === 'private' ? (enrolling ? 'Requesting...' : 'Request Access') : (enrolling ? 'Enrolling...' : 'Enroll Now')}
              </EnrollButton>
            )}
            {requested && <span style={{ color: '#ff9800', fontWeight: 600, marginTop: 8 }}>Requested</span>}
            {isEnrolled && <span style={{ color: '#2196F3', fontWeight: 600, marginTop: 8 }}>Enrolled ✓</span>}
          </>
        )}
        <Link to={detailsHref} style={{ textDecoration: 'none', display: 'block', marginTop: 12 }}>
          <EnrollButton style={{ background: '#fff', color: '#6C63FF', border: '1px solid #6C63FF' }}>View Details</EnrollButton>
        </Link>
      </Content>
    </Card>
  );
};

export default CourseCard;

/*
Code Description:
- CourseCard: Displays course image, category tag, title, instructor name, and Enroll button.
- Uses Link to make the card clickable and navigates to /course/:id.
- Props: id, title, instructorName, imageUrl, category.
- Styles: Modern card with shadow, rounded corners, and color tags. Styled-components used for hover and transitions.
*/
