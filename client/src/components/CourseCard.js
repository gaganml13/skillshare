import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { storeSampleEnrollment, isSampleCourseId, isSampleEnrolled } from '../utils/sampleCourses';
import ProgressBar from './ui/ProgressBar';
import { useCourseProgress } from '../hooks/useCourseProgress';

const Card = styled.article`
  position: relative;
  background: var(--color-surface);
  border-radius: 1.5rem;
  border: 1px solid rgba(99, 102, 241, 0.12);
  padding: 1.25rem;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100%;
  animation: fadeUp 0.6s ease both;
  transition: transform 300ms ease, box-shadow 300ms ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(120deg, rgba(99, 102, 241, 0.45), rgba(14, 165, 233, 0.45));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 35px 60px rgba(15, 23, 42, 0.14);
  }
`;

const Cover = styled.div`
  position: relative;
  border-radius: 1.1rem;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: radial-gradient(circle at top, rgba(93, 95, 239, 0.4), rgba(15, 23, 42, 0.8));
`;

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const LevelTag = styled.span`
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(99, 102, 241, 0.1);
  color: #4338ca;
`;

const FavoriteDot = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(99, 102, 241, 0.08);
  display: grid;
  place-items: center;
  color: #4338ca;
  cursor: pointer;
  transition: transform 200ms ease;
  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-text);
`;

const Instructor = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-muted);
`;

const Description = styled.p`
  margin: 0;
  font-size: 0.92rem;
  color: var(--color-text-muted);
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
`;

const CTAGroup = styled.div`
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const PrimaryButton = styled.button`
  flex: 1;
  min-width: 140px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(120deg, var(--color-primary), #8b5cf6);
  color: #fff;
  font-weight: 600;
  padding: 0.65rem 1rem;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const OutlineButton = styled(PrimaryButton)`
  flex: unset;
  min-width: unset;
  padding: 0.65rem 1.1rem;
  background: transparent;
  color: var(--color-primary);
  border: 1px solid rgba(93, 95, 239, 0.4);
  box-shadow: none;
`;

const StatusTag = styled.span`
  align-self: flex-start;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $variant }) => ($variant === 'warning' ? 'rgba(251, 191, 36, 0.18)' : 'rgba(16, 185, 129, 0.12)')};
  color: ${({ $variant }) => ($variant === 'warning' ? '#b45309' : 'var(--color-success)')};
`;

const CourseCard = ({
  course = {},
  id,
  title,
  instructorName,
  imageUrl,
  category,
  price,
  duration,
  learners,
  rating,
  description,
  access = 'public',
  showEnrollButton = true,
  enrolled = false,
  onEnrolled
}) => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(enrolled);
  const [requested, setRequested] = useState(false);

  const courseId = useMemo(() => {
    return (course && (course._id || course.id)) || id || '';
  }, [course, id]);

  const fallbackImage = 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80';
  const courseTitle = course?.title || title || 'Untitled Course';
  const courseCategory = course?.category || category || 'General';
  const courseInstructor = course?.instructor?.name || instructorName || 'Instructor';
  const courseDescription = course?.description || description || 'Boost your creative flow with hands-on lessons and actionable challenges.';
  const courseImage = course?.imageUrl || imageUrl || fallbackImage;
  const courseDuration = course?.duration || duration;
  const courseLearners = course?.learners || learners;
  const courseRating = course?.rating || rating;
  const courseAccess = course?.access || access;
  const courseLevel = course?.level || course?.difficulty || 'All levels';

  const isDemoCourse = isSampleCourseId(courseId) || /^demo-/i.test(courseId);
  const { progress, advanceProgress } = useCourseProgress(courseId, 0);

  useEffect(() => {
    if (isDemoCourse) {
      setIsEnrolled(isSampleEnrolled(courseId));
    } else {
      setIsEnrolled(enrolled);
    }
  }, [courseId, enrolled, isDemoCourse]);

  const handleEnroll = async (event) => {
    event.preventDefault();
    if (isEnrolled && !requested) {
      advanceProgress(5);
      navigate(`/course/${courseId}`);
      return;
    }

    if (isDemoCourse) {
      storeSampleEnrollment(courseId);
      setIsEnrolled(true);
      advanceProgress(15);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('courseEnrolled', { detail: { courseId } }));
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
      if (courseAccess === 'private') {
        await axios.post(`/api/courses/${courseId}/request-access`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequested(true);
      } else {
        await axios.post(`/api/courses/${courseId}/enroll`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsEnrolled(true);
        advanceProgress(20);
      }

      if (onEnrolled) onEnrolled(courseId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('courseEnrolled', { detail: { courseId } }));
      }
      if (courseAccess !== 'private') {
        navigate(`/course/${courseId}`);
      }
    } catch (error) {
      alert('Operation failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setEnrolling(false);
    }
  };

  const detailsHref = `/course/${courseId}`;
  const canShowEnroll = showEnrollButton && (user || isDemoCourse);
  const priceLabel = typeof (course?.price ?? price) === 'number' ? `₹${course.price ?? price}` : null;

  return (
    <Card tabIndex={0} aria-label={`Course card for ${courseTitle}`}>
      <Cover>
        <CoverImage src={courseImage} alt={courseTitle} />
        <CategoryBadge>{courseCategory}</CategoryBadge>
      </Cover>
      <Content>
        <TopRow>
          <LevelTag>{courseLevel}</LevelTag>
          <FavoriteDot type="button" aria-label={`Open ${courseTitle} quick view`} onClick={() => navigate(detailsHref)}>
            <span aria-hidden="true">↗</span>
          </FavoriteDot>
        </TopRow>
        <div>
          <Title>{courseTitle}</Title>
          <Instructor>by {courseInstructor}</Instructor>
        </div>
        <Description>{courseDescription}</Description>
        <MetaRow>
          {courseDuration && <MetaChip>⏱ {courseDuration}</MetaChip>}
          {courseLearners && <MetaChip>👥 {courseLearners}</MetaChip>}
          {courseRating && <MetaChip>⭐ {courseRating}</MetaChip>}
          {priceLabel && <MetaChip>{priceLabel}</MetaChip>}
        </MetaRow>
        {isEnrolled && <StatusTag>Enrolled</StatusTag>}
        {course.localOnly && <StatusTag $variant="warning">Offline draft</StatusTag>}
        <ProgressBar value={progress} label={isEnrolled ? `Course progress: ${progress}%` : 'Preview progress'} />
        {canShowEnroll && (
          <CTAGroup>
            <PrimaryButton onClick={handleEnroll} disabled={enrolling}>
              {requested
                ? 'Requested'
                : courseAccess === 'private'
                  ? (enrolling ? 'Requesting...' : 'Request Access')
                  : isEnrolled
                    ? 'Continue learning'
                    : (enrolling ? 'Enrolling...' : 'Enroll now')}
            </PrimaryButton>
            <OutlineButton as={Link} to={detailsHref} aria-label={`View ${courseTitle} details`}>
              View syllabus
            </OutlineButton>
          </CTAGroup>
        )}
      </Content>
    </Card>
  );
};

export default CourseCard;
