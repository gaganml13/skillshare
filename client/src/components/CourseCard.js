import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { storeSampleEnrollment, isSampleCourseId, isSampleEnrolled } from '../utils/sampleCourses';
import ProgressBar from './ui/ProgressBar';
import { useCourseProgress } from '../hooks/useCourseProgress';

// CourseCard consumes the global CSS variables so it naturally adapts to light/dark themes.
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
  const courseImage = course?.thumbnailUrl || course?.imageUrl || imageUrl || fallbackImage;
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
    <article className="card course-card fade-up" tabIndex={0} aria-label={`Course card for ${courseTitle}`}>
      <div className="course-card__media">
        <img src={courseImage} alt={courseTitle} className="course-card__image" />
        <span className="course-card__badge">{courseCategory}</span>
      </div>
      <div className="card__body course-card__body">
        <div className="course-card__top-row">
          <span className="course-card__level">{courseLevel}</span>
          <button
            type="button"
            className="btn btn--icon course-card__quick"
            aria-label={`Open ${courseTitle} quick view`}
            onClick={() => navigate(detailsHref)}
          >
            <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div>
          <h3 className="card__title">{courseTitle}</h3>
          <p className="card__subtitle">by {courseInstructor}</p>
        </div>
        <div className="course-card__tags">
          <span className="course-card__tag">{courseCategory}</span>
          <span className="course-card__tag">{courseLevel}</span>
        </div>
        <p className="card__description">{courseDescription}</p>
        <div className="course-card__meta">
          {courseDuration && <span>⏱ {courseDuration}</span>}
          {courseLearners && <span>👥 {courseLearners}</span>}
          {courseRating && <span>⭐ {courseRating}</span>}
          {priceLabel && <span>{priceLabel}</span>}
        </div>
        {isEnrolled && <span className="status-pill">Enrolled</span>}
        {course.localOnly && <span className="status-pill status-pill--warning">Offline draft</span>}
        <div className="course-card__progress">
          <ProgressBar value={progress} label={isEnrolled ? `Course progress: ${progress}%` : 'Preview progress'} />
        </div>
        {canShowEnroll && (
          <div className="course-card__actions">
            <button type="button" className="btn btn--primary" onClick={handleEnroll} disabled={enrolling}>
              {requested
                ? 'Requested'
                : courseAccess === 'private'
                  ? (enrolling ? 'Requesting...' : 'Request Access')
                  : isEnrolled
                    ? 'Continue learning'
                    : (enrolling ? 'Enrolling...' : 'Enroll now')}
            </button>
            <Link className="btn btn--secondary" to={detailsHref} aria-label={`View ${courseTitle} details`}>
              View syllabus
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};

export default CourseCard;
