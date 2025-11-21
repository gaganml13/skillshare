import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AddLessonForm from '../components/courses/AddLessonForm';
import CourseTabs from '../components/courses/CourseTabs';
import AiAssistantTab from '../components/courses/AiAssistantTab';
import CourseProgressBar from '../components/courses/CourseProgressBar';
import {
  getSampleCourseById,
  isSampleCourseId,
  isSampleEnrolled,
  storeSampleEnrollment
} from '../utils/sampleCourses';
import { getCourseById, appendQuestion, toggleDeliverable } from '../utils/dataStore';
import styled from 'styled-components';

const DownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.6rem;
  font-weight: 600;
  cursor: pointer;
  background: ${({ disabled }) => disabled ? '#d7dbf8' : 'linear-gradient(120deg, var(--color-primary), #7c3aed)'};
  color: ${({ disabled }) => disabled ? '#64748b' : '#fff'};
  box-shadow: ${({ disabled }) => disabled ? 'none' : '0 12px 30px rgba(92, 97, 242, 0.3)'};
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  &:hover,
  &:focus-visible {
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-2px)'};
  }
`;

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 16v3.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [questionText, setQuestionText] = useState('');
  const [questionStatus, setQuestionStatus] = useState('');
  const [isSampleCourse, setIsSampleCourse] = useState(false);
  const { user } = useContext(AuthContext);
  const fetchCourse = () => {
    setLoading(true);
    const storedCourse = getCourseById(id);
    if (storedCourse) {
      setCourse(storedCourse);
      setIsSampleCourse(false);
      setError(null);
      setLoading(false);
      return;
    }
    const fallback = getSampleCourseById(id);
    if (fallback) {
      setCourse(fallback);
      setIsSampleCourse(true);
      setError(null);
      if (!isSampleEnrolled(id)) {
        storeSampleEnrollment(id);
      }
    } else {
      setError('Failed to load course details.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourse();
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('courses:updated', fetchCourse);
    return () => window.removeEventListener('courses:updated', fetchCourse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const computedUserId = useMemo(() => user?._id || user?.id, [user]);
  const courseHasLessons = course?.lessons && course.lessons.length > 0;
  const firstLesson = courseHasLessons ? course.lessons[0] : null;
  const totalLessons = courseHasLessons ? course.lessons.length : 0;
  const assignments = course?.assignments || [];
  const qaThreads = course?.qa || [];
  const finalProject = course?.finalProject || null;
  const completedLessonsRaw = course?.progress?.completedLessons ?? course?.progress?.completedLessonsCount ?? 0;
  const completedLessons = Array.isArray(completedLessonsRaw)
    ? completedLessonsRaw.length
    : Number.isFinite(Number(completedLessonsRaw))
      ? Number(completedLessonsRaw)
      : 0;
  const isInstructor = Boolean(user && course?.instructor && (user._id === (course.instructor._id || course.instructor)));
  const sampleEnrollment = useMemo(() => (isSampleCourse ? true : false), [isSampleCourse]);

  const backendEnrollment = useMemo(() => {
    if (!computedUserId || !course?.authorizedUsers) return false;
    return course.authorizedUsers.some(authUser => {
      if (!authUser) return false;
      if (typeof authUser === 'string') return authUser === computedUserId;
      if (typeof authUser === 'object') return (authUser._id || authUser.id) === computedUserId;
      return false;
    });
  }, [course?.authorizedUsers, computedUserId]);

  const isEnrolled = sampleEnrollment || backendEnrollment;

  const showInstructorControls = isInstructor;
  const canTrackProgress = isEnrolled || showInstructorControls;

  const matchesUser = (candidate) => {
    if (!candidate || !computedUserId) return false;
    if (typeof candidate === 'string') return candidate === computedUserId;
    if (typeof candidate === 'object') return (candidate._id || candidate.id) === computedUserId;
    return false;
  };

  const isLessonGroupMember = (lesson) => {
    if (!lesson?.allowedUsers || !computedUserId) return false;
    return lesson.allowedUsers.some(matchesUser);
  };

  const canAccessLesson = (lesson) => {
    if (!lesson?.videoUrl) return false;
    if (lesson.visibility === 'public') return true;
    if (showInstructorControls) return true;
    if (isSampleCourse) return true;
    if (!isEnrolled) return false;
    if (lesson.visibility === 'group') return isLessonGroupMember(lesson);
    return true;
  };

  const firstLessonUnlocked = canAccessLesson(firstLesson);

  const handleQuestionSubmit = (event) => {
    event.preventDefault();
    if (!questionText.trim()) {
      setQuestionStatus('Add a question before posting.');
      return;
    }
    if (!course || isSampleCourse) {
      setQuestionStatus('Questions are available on published courses only.');
      return;
    }
    const posted = appendQuestion(course._id || course.id, {
      question: questionText,
      author: user?.name || 'You'
    });
    if (posted) {
      setQuestionText('');
      setQuestionStatus('Question posted for the cohort.');
      fetchCourse();
    } else {
      setQuestionStatus('Unable to store the question right now.');
    }
  };

  const handleDeliverableToggle = (deliverableId) => {
    if (!course || isSampleCourse) return;
    toggleDeliverable(course._id || course.id, deliverableId);
    fetchCourse();
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 80 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 80 }}>{error}</div>;

  const handleDownload = () => {
    if (!firstLesson?.videoUrl || !firstLessonUnlocked) return;
    window.open(firstLesson.videoUrl, '_blank', 'noopener');
  };

  return (
    <div style={{ maxWidth: 1180, margin: '40px auto', padding: '0 16px' }}>
      {course && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ flex: '1 1 680px', minWidth: 0 }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 12px 32px rgba(17, 24, 39, 0.08)',
              padding: 24,
              marginBottom: 24
            }}>
              <div style={{ marginBottom: 24 }}>
                {firstLesson && typeof firstLesson === 'object' && typeof firstLesson.videoUrl === 'string' && firstLesson.videoUrl.trim() !== '' ? (
                  <video
                    src={firstLesson.videoUrl}
                    controls
                    style={{ width: '100%', height: 420, objectFit: 'cover', borderRadius: 12, background: '#000' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div style={{ width: '100%', height: 420, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 20 }}>
                    No video available yet
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>{course.title}</h1>
                  <p style={{ color: '#64748b', marginBottom: 12 }}>Instructor: {course?.instructor?.name || 'Unknown'}</p>
                  <div style={{ display: 'flex', gap: 16, color: '#475569', fontSize: 14, flexWrap: 'wrap' }}>
                    {course.category && <span>Category: {course.category}</span>}
                    {course.level && <span>Level: {course.level}</span>}
                    {course.duration && <span>Duration: {course.duration}</span>}
                  </div>
                </div>
                <DownloadButton onClick={handleDownload} disabled={!firstLessonUnlocked} aria-label="Download lesson video">
                  <DownloadIcon />
                  Download video
                </DownloadButton>
              </div>

              <div style={{ marginTop: 24 }}>
                <span style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: 8 }}>Course Progress</span>
                <CourseProgressBar completed={canTrackProgress ? completedLessons : 0} total={Math.max(totalLessons, 1)} />
                {!canTrackProgress && (
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>Enroll in the course to start tracking your progress and download resources.</p>
                )}
              </div>

              <div style={{ marginTop: 32 }}>
                <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                {activeTab === 'Overview' && (
                  <>
                    <section style={{ marginBottom: 32 }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>About This Course</h2>
                      <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6 }}>{course.description || 'No description available.'}</p>
                    </section>
                    <section>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>Course Content</h2>
                      {courseHasLessons ? (
                        <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                          {course.lessons.map((lesson, idx) => {
                            const unlocked = canAccessLesson(lesson);
                            const visibilityLabel = lesson.visibility === 'public'
                              ? 'Public'
                              : lesson.visibility === 'group'
                                ? lesson.groupName || 'Private group'
                                : 'Enrolled learners';
                            return (
                              <li key={idx} style={{ marginBottom: 12, padding: 16, background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, color: '#6C63FF' }}>Lesson {idx + 1}</span>
                                <span style={{ flex: 1, minWidth: 200, color: '#0f172a' }}>{lesson.title}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: unlocked ? '#0ea5e9' : '#64748b', background: unlocked ? 'rgba(14,165,233,0.12)' : 'rgba(100,116,139,0.12)', padding: '4px 10px', borderRadius: 999 }}>{visibilityLabel}</span>
                                {lesson.videoUrl && unlocked ? (
                                  <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 500 }}>Watch</a>
                                ) : (
                                  <span style={{ color: '#94a3b8' }}>{lesson.visibility === 'public' ? 'Video unavailable' : 'Locked'}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p style={{ color: '#94a3b8' }}>No lessons added yet.</p>
                      )}
                    </section>
                    {showInstructorControls && (
                      <div style={{ marginTop: 32 }}>
                        <AddLessonForm courseId={course._id} onLessonAdded={fetchCourse} />
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'Assignments' && (
                  <div style={{ marginTop: 24 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>Assignments</h2>
                    {assignments.length ? (
                      <div className="assignment-grid">
                        {assignments.map((assignment) => (
                          <article key={assignment.id} className="assignment-card">
                            <header>
                              <p className="muted">Due {assignment.due || 'TBD'}</p>
                              <span className={`status-pill status-pill--${assignment.status || 'pending'}`}>
                                {assignment.status || 'pending'}
                              </span>
                            </header>
                            <h3>{assignment.title}</h3>
                            <p>{assignment.description}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8' }}>Publish a course to unlock guided assignments.</p>
                    )}
                  </div>
                )}

                {activeTab === 'Q&A' && (
                  <div style={{ marginTop: 24 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>Questions & Answers</h2>
                    <form className="qa-form" onSubmit={handleQuestionSubmit}>
                      <textarea
                        rows={3}
                        value={questionText}
                        placeholder={isSampleCourse ? 'Publish your course to unlock Q&A.' : 'Ask the cohort anything about this lesson.'}
                        onChange={(event) => setQuestionText(event.target.value)}
                        disabled={isSampleCourse}
                      />
                      <button type="submit" className="btn btn--primary" disabled={isSampleCourse}>
                        Post question
                      </button>
                    </form>
                    {questionStatus && <p className="muted">{questionStatus}</p>}
                    <div className="qa-thread-list">
                      {qaThreads.length ? (
                        qaThreads.map((thread) => (
                          <article key={thread.id} className="qa-thread">
                            <header>
                              <strong>{thread.author || 'Learner'}</strong>
                              <span>{new Date(thread.timestamp || Date.now()).toLocaleDateString()}</span>
                            </header>
                            <p>{thread.question}</p>
                            <div className="qa-thread__answers">
                              {thread.answers?.length ? (
                                thread.answers.map((answer) => (
                                  <p key={answer.id}>
                                    <span>{answer.author || 'Instructor'}:</span> {answer.message}
                                  </p>
                                ))
                              ) : (
                                <p className="muted">Answer coming soon.</p>
                              )}
                            </div>
                          </article>
                        ))
                      ) : (
                        <p className="muted">No questions yet. Start the conversation above.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Certificate' && (
                  <div style={{ marginTop: 24 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>Certificate</h2>
                    <p style={{ color: '#475569' }}>Complete all lessons and assignments to unlock your certificate of completion.</p>
                  </div>
                )}

                {activeTab === 'Final Project' && (
                  <div style={{ marginTop: 24 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>Final Project</h2>
                    {finalProject ? (
                      <div className="final-project">
                        <p>{finalProject.summary}</p>
                        <ul>
                          {finalProject.deliverables?.map((item) => (
                            <li key={item.id}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={item.status === 'done'}
                                  onChange={() => handleDeliverableToggle(item.id)}
                                  disabled={isSampleCourse}
                                />
                                <span>{item.label}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8' }}>Add a brief so learners know how to apply the material.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: '0 1 320px', minWidth: 280 }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 12px 32px rgba(17, 24, 39, 0.08)',
              padding: 24,
              position: 'sticky',
              top: 96,
              maxHeight: '85vh',
              overflow: 'auto'
            }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>AI Study Assistant</h2>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>Ask anything about this course content, assignments, or final project topics.</p>
              </div>
              <AiAssistantTab showHeader={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
