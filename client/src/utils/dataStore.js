import seeds from '../data/seeds.json';

const STORAGE_KEYS = {
  COURSES: 'skillversex:courses',
  COURSE_QA: 'skillversex:course-qa',
  MICRO_EVENTS: 'skillversex:micro-events'
};

const PLACEHOLDER_VIDEO = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4';

const clone = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return value;
  }
};

const getWindow = () => (typeof window !== 'undefined' ? window : null);

const safeRead = (key, fallback) => {
  const win = getWindow();
  if (!win) return clone(fallback);
  const raw = win.localStorage.getItem(key);
  if (!raw) return clone(fallback);
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.info('dataStore: unable to parse key', key, error);
    return clone(fallback);
  }
};

const safeWrite = (key, value) => {
  const win = getWindow();
  if (!win) return value;
  try {
    win.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.info('dataStore: unable to persist key', key, error);
  }
  return value;
};

const courseIdentifier = (course, index, prefix) => {
  if (!course || typeof course !== 'object') return `${prefix || 'course'}-${index}`;
  return course._id || course.id || course.slug || `${prefix || 'course'}-${index}`;
};

const mergeCourseCollections = (seedCourses = [], storedCourses = []) => {
  const merged = new Map();
  seedCourses.forEach((course, index) => {
    merged.set(courseIdentifier(course, index, 'seed'), clone(course));
  });
  storedCourses.forEach((course, index) => {
    const key = courseIdentifier(course, index, 'stored');
    const existing = merged.get(key) || {};
    merged.set(key, { ...existing, ...clone(course) });
  });
  return Array.from(merged.values());
};

export const readSeed = () => clone(seeds);

export const writeSeed = (key, value) => safeWrite(key, value);

const ensureCourses = () => {
  const fallback = seeds.courses || [];
  const stored = safeRead(STORAGE_KEYS.COURSES, null);
  if (!stored || !Array.isArray(stored) || !stored.length) {
    safeWrite(STORAGE_KEYS.COURSES, fallback);
    return clone(fallback);
  }
  const merged = mergeCourseCollections(fallback, stored);
  safeWrite(STORAGE_KEYS.COURSES, merged);
  return merged;
};

const withCourseDefaults = (course) => {
  if (!course) return null;
  const assignments = course.assignments?.length ? course.assignments : [
    {
      id: `${course._id || course.id}-assign-1`,
      title: 'Map your sprint rituals',
      description: 'Outline the checkpoints students will move through this week.',
      due: '2025-01-31',
      status: 'pending'
    },
    {
      id: `${course._id || course.id}-assign-2`,
      title: 'Share a practice deliverable',
      description: 'Upload a lightweight artifact to gather quick critique.',
      due: '2025-02-07',
      status: 'pending'
    }
  ];

  const qa = course.qa?.length ? course.qa : [
    {
      id: `${course._id || course.id}-qa-1`,
      question: 'What gear do you use to capture lessons?',
      author: 'Nia Gomez',
      timestamp: '2025-01-14T09:00:00Z',
      answers: [
        {
          id: `${course._id || course.id}-qa-1-a`,
          author: course.instructor?.name || 'Instructor',
          timestamp: '2025-01-14T11:00:00Z',
          message: 'I pair a mirrorless camera with a single key light and bounce card to keep setup simple.'
        }
      ]
    },
    {
      id: `${course._id || course.id}-qa-2`,
      question: 'How long should each lesson be?',
      author: 'Malik Porter',
      timestamp: '2025-01-15T17:30:00Z',
      answers: [
        {
          id: `${course._id || course.id}-qa-2-a`,
          author: course.instructor?.name || 'Instructor',
          timestamp: '2025-01-15T18:00:00Z',
          message: 'Aim for 8-12 minutes so learners can apply concepts without fatigue.'
        }
      ]
    }
  ];

  const finalProject = course.finalProject || {
    title: 'Ship your flagship lesson',
    summary: 'Blend the course frameworks into one cinematic walkthrough. Outline outcomes, capture b-roll, and publish a final reflection.',
    deliverables: [
      { id: `${course._id || course.id}-fp-1`, label: 'Submit outline', status: 'todo' },
      { id: `${course._id || course.id}-fp-2`, label: 'Upload final edit', status: 'todo' },
      { id: `${course._id || course.id}-fp-3`, label: 'Post reflection', status: 'todo' }
    ]
  };

  return {
    ...course,
    assignments,
    qa,
    finalProject
  };
};

export const getStoredCourses = () => ensureCourses().map(withCourseDefaults);

export const saveStoredCourses = (courses = []) => safeWrite(STORAGE_KEYS.COURSES, courses.map(withCourseDefaults));

export const addCourse = (course) => {
  if (!course) return null;
  const current = ensureCourses();
  const courseId = course._id || course.id || `local-course-${Date.now()}`;
  const ensured = withCourseDefaults({
    ...course,
    _id: courseId,
    thumbnailUrl: course.thumbnailUrl || course.thumbnail,
    lessons: (course.lessons || []).map((lesson, index) => ({
      ...lesson,
      id: lesson.id || `${courseId}-lesson-${index}`,
      videoUrl: lesson.videoUrl || PLACEHOLDER_VIDEO
    }))
  });
  const next = [ensured, ...current.filter((entry) => (entry._id || entry.id) !== courseId)];
  saveStoredCourses(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('courses:updated', { detail: { id: courseId } }));
  }
  return ensured;
};

export const getCourseById = (courseId) => {
  if (!courseId) return null;
  return getStoredCourses().find((course) => String(course._id || course.id) === String(courseId)) || null;
};

export const appendQuestion = (courseId, payload) => {
  const courses = ensureCourses();
  const index = courses.findIndex((entry) => String(entry._id || entry.id) === String(courseId));
  if (index === -1) return null;
  const qaEntry = {
    id: `${courseId}-qa-${Date.now()}`,
    question: payload.question?.trim() || 'Untitled question',
    author: payload.author || 'Learner',
    timestamp: new Date().toISOString(),
    answers: []
  };
  const nextCourse = withCourseDefaults({
    ...courses[index],
    qa: [qaEntry, ...(courses[index].qa || [])]
  });
  courses.splice(index, 1, nextCourse);
  saveStoredCourses(courses);
  return qaEntry;
};

export const toggleDeliverable = (courseId, deliverableId) => {
  const courses = ensureCourses();
  const index = courses.findIndex((entry) => String(entry._id || entry.id) === String(courseId));
  if (index === -1) return null;
  const deliverables = (courses[index].finalProject?.deliverables || []).map((item) =>
    item.id === deliverableId
      ? { ...item, status: item.status === 'done' ? 'todo' : 'done' }
      : item
  );
  const nextCourse = withCourseDefaults({
    ...courses[index],
    finalProject: {
      ...(courses[index].finalProject || {}),
      deliverables
    }
  });
  courses.splice(index, 1, nextCourse);
  saveStoredCourses(courses);
  return nextCourse.finalProject;
};

export const upsertMicroEvent = (event) => {
  if (!event) return null;
  const current = safeRead(STORAGE_KEYS.MICRO_EVENTS, seeds.microEvents || []);
  const next = [event, ...current.filter((entry) => entry.id !== event.id)];
  safeWrite(STORAGE_KEYS.MICRO_EVENTS, next);
  return event;
};

export default {
  readSeed,
  writeSeed,
  getStoredCourses,
  saveStoredCourses,
  addCourse,
  getCourseById,
  appendQuestion,
  toggleDeliverable,
  upsertMicroEvent
};
