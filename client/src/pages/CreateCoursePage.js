import React, { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { addCourse } from '../utils/dataStore';

const PLACEHOLDER_VIDEO = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4';

const createLessonDraft = () => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  title: '',
  description: '',
  duration: '',
  videoFile: null,
  previewUrl: ''
});

const releasePreview = (url) => {
  if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
};

// CreateCoursePage orchestrates a purely front-end builder that saves courses into localStorage.
const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [access, setAccess] = useState('public');
  const [price, setPrice] = useState('0');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState('');
  const [lessons, setLessons] = useState([createLessonDraft()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const readyLessons = useMemo(
    () => lessons.filter((lesson) => lesson.title.trim() && lesson.videoFile),
    [lessons]
  );

  const totalMinutes = useMemo(() => {
    return readyLessons.reduce((sum, lesson) => {
      const parsed = parseInt(lesson.duration, 10);
      const minutes = Number.isNaN(parsed) ? 10 : Math.max(parsed, 1);
      return sum + minutes;
    }, 0);
  }, [readyLessons]);

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const handleThumbnailChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    releasePreview(thumbnailPreview);
    const previewUrl = typeof URL !== 'undefined' ? URL.createObjectURL(file) : '';
    setThumbnailPreview(previewUrl);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setThumbnailDataUrl(dataUrl);
    } catch (thumbnailError) {
      console.info('CreateCoursePage: unable to read thumbnail', thumbnailError);
      setThumbnailDataUrl('');
    }
  };

  const updateLesson = (lessonId, updates) => {
    setLessons((prev) => prev.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...updates } : lesson)));
  };

  const handleLessonVideoChange = (lessonId, file) => {
    if (!file) return;
    setLessons((prev) => prev.map((lesson) => {
      if (lesson.id !== lessonId) return lesson;
      releasePreview(lesson.previewUrl);
      const previewUrl = typeof URL !== 'undefined' ? URL.createObjectURL(file) : '';
      return { ...lesson, videoFile: file, previewUrl };
    }));
  };

  const addLesson = () => setLessons((prev) => [...prev, createLessonDraft()]);

  const removeLesson = (lessonId) => {
    setLessons((prev) => {
      if (prev.length === 1) {
        alert('Keep at least one lesson in your course.');
        return prev;
      }
      const target = prev.find((lesson) => lesson.id === lessonId);
      if (target?.previewUrl) releasePreview(target.previewUrl);
      return prev.filter((lesson) => lesson.id !== lessonId);
    });
  };

  const resetForm = () => {
    lessons.forEach((lesson) => releasePreview(lesson.previewUrl));
    releasePreview(thumbnailPreview);
    setTitle('');
    setDescription('');
    setCategory('');
    setLevel('Beginner');
    setAccess('public');
    setPrice('0');
    setThumbnailPreview('');
    setThumbnailDataUrl('');
    setLessons([createLessonDraft()]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!title.trim() || !description.trim() || !category.trim()) {
      setError('Please complete the required course details.');
      return;
    }

    if (readyLessons.length === 0) {
      setError('Add at least one lesson with a title and uploaded video.');
      return;
    }

    setSubmitting(true);
    try {
      const lessonsPayload = readyLessons.map((lesson, index) => ({
        id: lesson.id,
        title: lesson.title.trim(),
        description: lesson.description.trim(),
        duration: lesson.duration.trim() || '10',
        order: index,
        videoMeta: lesson.videoFile
          ? { name: lesson.videoFile.name, size: lesson.videoFile.size, type: lesson.videoFile.type }
          : null,
        videoUrl: PLACEHOLDER_VIDEO
      }));

      const normalizedAccess = access === 'individual' ? 'private' : access;
      const newCourse = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        level,
        access: normalizedAccess,
        price: Number(price) || 0,
        duration: `${totalMinutes || readyLessons.length * 10} min`,
        thumbnailUrl: thumbnailDataUrl || thumbnailPreview,
        lessons: lessonsPayload,
        instructor: {
          _id: user?._id || user?.id || 'local-creator',
          name: user?.name || 'You'
        },
        createdAt: new Date().toISOString()
      };

      addCourse(newCourse);
      setNotice('Course published! Redirecting you back to the catalog.');
      resetForm();
      setTimeout(() => navigate('/courses'), 800);
    } catch (submitError) {
      setError(submitError.message || 'Unable to publish the course.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="course-create-shell">
      <section className="course-create-hero fade-up visible">
        <p className="course-create-hero__eyebrow">Creator studio</p>
        <h1>Build a new course</h1>
        <p className="course-create-hero__copy">
          Package cinematic lessons, decide how learners access them, and drop everything into one polished release.
        </p>
        <ul className="course-create-steps">
          <li>Outline</li>
          <li>Upload</li>
          <li>Publish</li>
        </ul>
        <div className="course-create-meta">
          <div>
            <p className="course-create-meta__label">Creator</p>
            <p className="course-create-meta__value">{user?.name || 'You'}</p>
          </div>
          <div>
            <p className="course-create-meta__label">Lessons queued</p>
            <p className="course-create-meta__value">{readyLessons.length}/{lessons.length}</p>
          </div>
          <div>
            <p className="course-create-meta__label">Runtime</p>
            <p className="course-create-meta__value">{totalMinutes || readyLessons.length * 10} min</p>
          </div>
        </div>
      </section>

      <form className="course-create-grid app-container" onSubmit={handleSubmit}>
        <div className="course-create-main">
          <section className="card">
            <header className="course-create-card__header">
              <div>
                <p className="course-create-eyebrow">Basics</p>
                <h2>Course details</h2>
              </div>
              <p className="course-create-card__meta">All fields are required</p>
            </header>
            <div className="form-grid">
              <div className="col-12">
                <label className="form-label">Course Title
                  <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} required />
                </label>
              </div>
              <div className="col-12">
                <label className="form-label">Description
                  <textarea value={description} rows={4} onChange={(event) => setDescription(event.target.value)} required />
                </label>
              </div>
              <div className="col-6">
                <label className="form-label">Category
                  <input type="text" value={category} onChange={(event) => setCategory(event.target.value)} required />
                </label>
              </div>
              <div className="col-3">
                <label className="form-label">Price (USD)
                  <input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} />
                </label>
              </div>
              <div className="col-3">
                <label className="form-label">Level
                  <select value={level} onChange={(event) => setLevel(event.target.value)}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All levels">All levels</option>
                  </select>
                </label>
              </div>
              <div className="col-3">
                <label className="form-label">Access Type
                  <select value={access} onChange={(event) => setAccess(event.target.value)}>
                    <option value="public">Public</option>
                    <option value="community">Community</option>
                    <option value="individual">Individual</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="card">
            <header className="course-create-card__header">
              <div>
                <p className="course-create-eyebrow">Branding</p>
                <h2>Thumbnail upload</h2>
              </div>
              <p className="course-create-card__meta">PNG or JPG - 4MB max</p>
            </header>
            <div className="course-create-thumb">
              <label className="form-label">Thumbnail
                <input type="file" accept="image/*" onChange={handleThumbnailChange} />
              </label>
              {thumbnailPreview && (
                <div className="course-create-thumb__preview">
                  <img src={thumbnailPreview} alt="Thumbnail preview" />
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <header className="course-create-card__header">
              <div>
                <p className="course-create-eyebrow">Lesson builder</p>
                <h2>Lessons</h2>
              </div>
              <button type="button" className="btn btn--secondary" onClick={addLesson}>Add lesson</button>
            </header>
            <div className="lesson-builder">
              {lessons.map((lesson, index) => (
                <article key={lesson.id} className="lesson-card">
                  <div className="lesson-card__header">
                    <div>
                      <p className="course-create-eyebrow">Lesson {index + 1}</p>
                      <h3>{lesson.title || 'Untitled lesson'}</h3>
                    </div>
                    <button type="button" className="ghost-btn" onClick={() => removeLesson(lesson.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="col-12">
                      <label className="form-label">Title
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(event) => updateLesson(lesson.id, { title: event.target.value })}
                          required
                        />
                      </label>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description
                        <textarea
                          rows={3}
                          value={lesson.description}
                          onChange={(event) => updateLesson(lesson.id, { description: event.target.value })}
                        />
                      </label>
                    </div>
                    <div className="col-3">
                      <label className="form-label">Duration (min)
                        <input
                          type="number"
                          min="1"
                          value={lesson.duration}
                          onChange={(event) => updateLesson(lesson.id, { duration: event.target.value })}
                          placeholder="10"
                        />
                      </label>
                    </div>
                    <div className="col-9">
                      <label className="form-label">Upload video
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(event) => handleLessonVideoChange(lesson.id, event.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="lesson-card__preview">
                    {lesson.previewUrl ? (
                      <video src={lesson.previewUrl} controls />
                    ) : (
                      <p className="course-create-card__meta">Video preview appears after upload.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {error && <div className="course-create-alert course-create-alert--error">{error}</div>}
          {notice && <div className="course-create-alert course-create-alert--success">{notice}</div>}

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish course'}
          </button>
        </div>

        <aside className="course-create-aside">
          <section className="card">
            <p className="course-create-eyebrow">Launch checklist</p>
            <ul>
              <li>Share three outcomes learners unlock.</li>
              <li>Keep lessons under twelve minutes.</li>
              <li>Use the community access type for member-only drops.</li>
              <li>Add a final challenge in your syllabus.</li>
            </ul>
          </section>
          <section className="card course-create-aside__tip">
            <p className="course-create-eyebrow">Pro tip</p>
            <h3>Batch upload footage</h3>
            <p>Videos stay local until you publish. Record everything, preview it instantly, and push once you are confident.</p>
          </section>
        </aside>
      </form>
    </main>
  );
};

export default CreateCoursePage;
