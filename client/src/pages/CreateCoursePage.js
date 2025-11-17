import React, { useContext, useMemo, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import VideoUpload from '../components/courses/VideoUpload';
import { AuthContext } from '../context/AuthContext';
import { storeLocalCreatedCourse } from '../utils/sampleCourses';

const createEmptyLessonDraft = () => ({
  title: '',
  description: '',
  videoAsset: null
});

const createLessonId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const formatFileSizeMb = (bytes) => ((bytes || 0) / 1024 / 1024).toFixed(2);

const LESSON_DRAFTS_KEY = 'skillshare:lesson-drafts';
const OFFLINE_VIDEO_FALLBACK = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4';
const OFFLINE_THUMBNAIL_FALLBACK = 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80';

const stashLessonDraft = (lesson) => {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      previewUrl: lesson.videoAsset?.previewUrl || '',
      savedAt: new Date().toISOString()
    };
    const existing = JSON.parse(window.localStorage.getItem(LESSON_DRAFTS_KEY) || '[]');
    const next = [...existing.slice(-9), payload];
    window.localStorage.setItem(LESSON_DRAFTS_KEY, JSON.stringify(next));
  } catch (err) {
    console.info('Unable to persist lesson draft', err);
  }
};

const Page = styled.main`
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(14, 165, 233, 0.08));
  padding: 3rem 0 4rem;
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const Hero = styled.section`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Eyebrow = styled.p`
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.8rem;
  font-weight: 700;
  color: #4c1d95;
`;

const Title = styled.h1`
  margin: 0.75rem 0 0;
  font-size: clamp(2rem, 4vw, 3rem);
  color: #0f172a;
`;

const Copy = styled.p`
  max-width: 640px;
  margin: 0.85rem auto 0;
  color: #475569;
  font-size: 1rem;
`;

const Stepper = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.75rem auto 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;

const StepChip = styled.li`
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: #fff;
  color: #4338ca;
  font-weight: 600;
  box-shadow: 0 12px 25px rgba(67, 56, 202, 0.15);
`;

const Layout = styled.div`
  display: grid;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  }
`;

const FormStack = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Card = styled.section`
  background: #ffffff;
  border-radius: 2rem;
  padding: 2rem;
  box-shadow: 0 35px 55px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.6rem;
  color: #0f172a;
`;

const SectionMeta = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
`;

const FieldGroup = styled.div`
  display: grid;
  gap: 1.25rem;
  margin-top: 1.5rem;
`;

const FieldRow = styled.div`
  display: grid;
  gap: 1.25rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.95rem;
`;

const sharedFieldStyles = `
  border-radius: 1.25rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 200ms ease, box-shadow 200ms ease;
  background: #fff;

  &:focus {
    border-color: #6366f1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
  }
`;

const InputField = styled.input`
  ${sharedFieldStyles}
`;

const TextareaField = styled.textarea`
  ${sharedFieldStyles}
  resize: vertical;
  min-height: 140px;
`;

const SelectField = styled.select`
  ${sharedFieldStyles}
`;

const FileInput = styled.input`
  ${sharedFieldStyles}
  cursor: pointer;

  &::file-selector-button {
    border: none;
    border-radius: 999px;
    background: #4f46e5;
    color: #fff;
    padding: 0.4rem 1rem;
    margin-right: 0.75rem;
    cursor: pointer;
    font-weight: 600;
  }
`;

const ThumbnailCard = styled.div`
  border-radius: 1.5rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 1rem;
  background: #f8fafc;
  font-size: 0.9rem;
  color: #475569;
`;

const ThumbnailPreview = styled.img`
  width: 100%;
  height: 14rem;
  border-radius: 1.5rem;
  object-fit: cover;
  border: 1px solid rgba(15, 23, 42, 0.08);
  margin-top: 1.5rem;
`;

const ButtonPrimary = styled.button`
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  box-shadow: 0 18px 30px rgba(79, 70, 229, 0.25);
  transition: transform 200ms ease, box-shadow 200ms ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    box-shadow: 0 25px 40px rgba(79, 70, 229, 0.28);
  }
`;

const ButtonGhost = styled.button`
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.2);
  padding: 0.4rem 1rem;
  background: transparent;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
`;

const LessonCard = styled.article`
  border-radius: 1.75rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 1.25rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  background: #fff;
`;

const LessonHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const LessonMetaGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FileInfo = styled.div`
  border-radius: 1.25rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 0.75rem 1rem;
  background: #f1f5f9;
`;

const VideoPreview = styled.video`
  width: 100%;
  border-radius: 1.25rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  height: 8.5rem;
  object-fit: cover;
`;

const Alert = styled.div`
  border-radius: 1.5rem;
  padding: 1rem 1.25rem;
  font-size: 0.95rem;
  border: 1px solid ${({ variant }) => (variant === 'error' ? 'rgba(248, 113, 113, 0.4)' : 'rgba(16, 185, 129, 0.4)')};
  background: ${({ variant }) => (variant === 'error' ? 'rgba(254, 226, 226, 0.7)' : 'rgba(209, 250, 229, 0.7)')};
  color: ${({ variant }) => (variant === 'error' ? '#b91c1c' : '#047857')};
`;

const AsideColumn = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AsideCard = styled.section`
  border-radius: 1.75rem;
  background: #ffffff;
  padding: 1.75rem;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.05);
`;

const AsideDarkCard = styled(AsideCard)`
  background: #0f172a;
  color: #fff;
  border: none;
`;

const SubmitButton = styled(ButtonPrimary)`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
`;

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [price, setPrice] = useState('');
  const [access, setAccess] = useState('public');
  const [thumbnailAsset, setThumbnailAsset] = useState(null);
  const [lessonDraft, setLessonDraft] = useState(createEmptyLessonDraft());
  const [lessons, setLessons] = useState([]);
  const [lessonError, setLessonError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const thumbnailPreview = useMemo(() => thumbnailAsset?.previewUrl || thumbnailAsset?.remoteUrl, [thumbnailAsset]);

  const handleThumbnailUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setThumbnailAsset({
      file,
      name: file.name,
      size: file.size,
      previewUrl
    });
  };

  const handleLessonVideo = (asset) => {
    setLessonDraft((prev) => ({
      ...prev,
      videoAsset: asset
    }));
    if (lessonError) setLessonError('');
  };

  const addLesson = () => {
    if (!lessonDraft.title.trim() || !lessonDraft.videoAsset) {
      setLessonError('Lesson title and video are required.');
      return;
    }

    const newLesson = {
      id: createLessonId(),
      title: lessonDraft.title.trim(),
      description: lessonDraft.description.trim(),
      videoAsset: lessonDraft.videoAsset
    };

    setLessons((prev) => [...prev, newLesson]);
    if (!newLesson.videoAsset?.remoteUrl) {
      stashLessonDraft(newLesson);
    }
    setLessonDraft(createEmptyLessonDraft());
    setLessonError('');
  };

  const removeLesson = (id) => {
    setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
  };

  const persistOfflineCourse = (lessonPayload) => {
    if (!user) return null;
    if (typeof window === 'undefined') return null;

    const normalizedLessons = (lessonPayload.length > 0 ? lessonPayload : [
      {
        title: lessonDraft.title || 'Lesson 1',
        description: lessonDraft.description,
        videoUrl: lessonDraft.videoAsset?.remoteUrl || lessonDraft.videoAsset?.previewUrl || OFFLINE_VIDEO_FALLBACK
      }
    ]).map((lesson, index) => ({
      ...lesson,
      id: lesson.id || `local-lesson-${index}`,
      videoUrl: lesson.videoUrl || OFFLINE_VIDEO_FALLBACK,
      visibility: lesson.visibility || 'public'
    }));

    const ownerId = user._id || user.id || 'local-user';
    const offlineCourse = {
      _id: `local-${Date.now()}`,
      title: title.trim() || 'Untitled course',
      description: description.trim() || 'Course details will appear soon.',
      category: category || 'General',
      level: level || 'All levels',
      access,
      price: Number(price) || 0,
      duration: `${Math.max(normalizedLessons.length, 1) * 8} min`,
      imageUrl: thumbnailAsset?.remoteUrl || OFFLINE_THUMBNAIL_FALLBACK,
      lessons: normalizedLessons,
      instructor: {
        _id: ownerId,
        name: user.name || 'You'
      },
      ownerId,
      ownerName: user.name || 'You',
      localOnly: true,
      createdAt: new Date().toISOString(),
      learners: 0,
      rating: null
    };

    storeLocalCreatedCourse(offlineCourse);
    try {
      window.dispatchEvent(new CustomEvent('courseCreated', { detail: { id: offlineCourse._id } }));
    } catch (eventError) {
      console.info('Unable to broadcast offline course event', eventError);
    }
    return offlineCourse;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (submitting) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a course.');
      return;
    }

    const payloadLessons = lessons.map((lesson, index) => ({
      title: lesson.title || `Lesson ${index + 1}`,
      description: lesson.description,
      videoUrl: lesson.videoAsset?.remoteUrl || lesson.videoAsset?.previewUrl || ''
    }));

    if (payloadLessons.length === 0 && lessonDraft.videoAsset) {
      payloadLessons.push({
        title: lessonDraft.title || 'Lesson 1',
        description: lessonDraft.description,
        videoUrl: lessonDraft.videoAsset.remoteUrl || lessonDraft.videoAsset.previewUrl || ''
      });
    }

    setSubmitting(true);
    try {
      await axios.post(
        '/api/courses',
        {
          title,
          description,
          category,
          level,
          price: Number(price) || 0,
          access,
          thumbnailUrl: thumbnailAsset?.remoteUrl || thumbnailAsset?.previewUrl || '',
          lessons: payloadLessons
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      navigate('/dashboard');
    } catch (requestError) {
      const offlineCourse = !requestError.response ? persistOfflineCourse(payloadLessons) : null;
      if (offlineCourse) {
        setNotice('Lost connection, but we saved this course locally. Find it in "My created courses" once you return to the dashboard.');
        setLessons([]);
        setLessonDraft(createEmptyLessonDraft());
        setThumbnailAsset(null);
        return;
      }
      setError(requestError.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <Container>
        <Hero>
          <Eyebrow>Creator Studio</Eyebrow>
          <Title>Create a SkillverseX course</Title>
          <Copy>Craft your curriculum, drop lessons, and publish when you are ready.</Copy>
          <Stepper>
            <StepChip>1 • Outline</StepChip>
            <StepChip>2 • Upload</StepChip>
            <StepChip>3 • Publish</StepChip>
          </Stepper>
        </Hero>

        <Layout>
          <FormStack onSubmit={handleSubmit}>
            <Card>
              <SectionHeader>
                <SectionTitle>Course basics</SectionTitle>
                <SectionMeta>Required fields · *</SectionMeta>
              </SectionHeader>
              <FieldGroup>
                <Label>
                  Title*
                  <InputField type="text" value={title} onChange={(event) => setTitle(event.target.value)} required />
                </Label>
                <Label>
                  Description*
                  <TextareaField value={description} onChange={(event) => setDescription(event.target.value)} required rows={4} />
                </Label>
                <FieldRow>
                  <Label>
                    Category*
                    <InputField type="text" value={category} onChange={(event) => setCategory(event.target.value)} required />
                  </Label>
                  <Label>
                    Level
                    <SelectField value={level} onChange={(event) => setLevel(event.target.value)}>
                      <option value="">Select level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </SelectField>
                  </Label>
                </FieldRow>
                <FieldRow>
                  <Label>
                    Price (₹)
                    <InputField type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} />
                  </Label>
                  <Label>
                    Access type
                    <SelectField value={access} onChange={(event) => setAccess(event.target.value)}>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </SelectField>
                  </Label>
                </FieldRow>
              </FieldGroup>
            </Card>

            <Card>
              <SectionHeader>
                <SectionTitle>Cover media</SectionTitle>
                <SectionMeta>Upload a thumbnail that represents your course</SectionMeta>
              </SectionHeader>
              <FieldGroup>
                <FieldRow>
                  <Label>
                    Upload thumbnail
                    <FileInput type="file" accept="image/*" onChange={handleThumbnailUpload} />
                  </Label>
                  {thumbnailAsset && (
                    <ThumbnailCard>
                      <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{thumbnailAsset.name}</p>
                      <p style={{ margin: '0.3rem 0 0' }}>{formatFileSizeMb(thumbnailAsset.size)} MB</p>
                    </ThumbnailCard>
                  )}
                </FieldRow>
                {thumbnailPreview && <ThumbnailPreview src={thumbnailPreview} alt="Thumbnail preview" />}
              </FieldGroup>
            </Card>

            <Card>
              <SectionHeader>
                <div>
                  <SectionTitle>Lessons</SectionTitle>
                  <SectionMeta>Add lesson details then attach a video.</SectionMeta>
                </div>
                <ButtonPrimary type="button" onClick={addLesson}>Add lesson</ButtonPrimary>
              </SectionHeader>

              <FieldGroup>
                <Label>
                  Lesson title
                  <InputField
                    type="text"
                    value={lessonDraft.title}
                    onChange={(event) => setLessonDraft((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </Label>
                <Label>
                  Lesson description
                  <TextareaField
                    rows={3}
                    value={lessonDraft.description}
                    onChange={(event) => setLessonDraft((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </Label>
                <VideoUpload value={lessonDraft.videoAsset} onChange={handleLessonVideo} />
                {lessonError && <Alert variant="error">{lessonError}</Alert>}
              </FieldGroup>

              <FieldGroup>
                {lessons.length === 0 && (
                  <SectionMeta style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '1rem' }}>
                    No lessons added yet. Draft a lesson and click “Add lesson”.
                  </SectionMeta>
                )}
                {lessons.map((lesson, index) => (
                  <LessonCard key={lesson.id}>
                    <LessonHeader>
                      <div>
                        <SectionMeta style={{ letterSpacing: '0.3em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          Lesson {index + 1}
                        </SectionMeta>
                        <h3 style={{ margin: '0.35rem 0', fontSize: '1.1rem', color: '#0f172a' }}>{lesson.title}</h3>
                        <p style={{ margin: 0, color: '#475569' }}>{lesson.description || 'No description provided yet.'}</p>
                        {!lesson.videoAsset?.remoteUrl && (
                          <p style={{ margin: '0.4rem 0 0', color: '#b45309', fontSize: '0.8rem', fontWeight: 600 }}>
                            Stored locally — upload when ready
                          </p>
                        )}
                      </div>
                      <ButtonGhost type="button" onClick={() => removeLesson(lesson.id)}>Remove</ButtonGhost>
                    </LessonHeader>
                    <LessonMetaGrid>
                      <FileInfo>
                        <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{lesson.videoAsset?.name}</p>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                          {formatFileSizeMb(lesson.videoAsset?.size)} MB
                        </p>
                      </FileInfo>
                      <VideoPreview src={lesson.videoAsset?.previewUrl || lesson.videoAsset?.remoteUrl} controls />
                    </LessonMetaGrid>
                  </LessonCard>
                ))}
              </FieldGroup>
            </Card>

            {error && <Alert variant="error">{error}</Alert>}
            {notice && (
              <Alert variant="success">
                <p style={{ margin: 0 }}>{notice}</p>
                <ButtonGhost type="button" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/dashboard')}>
                  Go to dashboard
                </ButtonGhost>
              </Alert>
            )}

            <SubmitButton type="submit" disabled={submitting}>
              {submitting ? 'Publishing…' : 'Publish course'}
            </SubmitButton>
          </FormStack>

          <AsideColumn>
            <AsideCard>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Launch checklist</h3>
              <ul style={{ margin: '1rem 0 0', paddingLeft: '1.2rem', color: '#475569', lineHeight: 1.65 }}>
                <li>Outline 3–5 lessons with clear outcomes.</li>
                <li>Record concise videos (under 12 min).</li>
                <li>Add resources or project briefs.</li>
                <li>Schedule a live Q&A once you publish.</li>
              </ul>
            </AsideCard>
            <AsideDarkCard>
              <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.75rem', color: '#a5b4fc' }}>Pro tip</p>
              <h3 style={{ margin: '0.75rem 0 0', fontSize: '1.5rem' }}>Batch upload</h3>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.95rem', color: '#e2e8f0' }}>
                Drag in all lesson recordings first. You can reorder and attach worksheets later without republishing.
              </p>
            </AsideDarkCard>
          </AsideColumn>
        </Layout>
      </Container>
    </Page>
  );
};

export default CreateCoursePage;
