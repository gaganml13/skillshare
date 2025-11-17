import { getCourses, getJobs, getLeaderboard, getMentors, getPosts } from './loadSeeds';

export const SAMPLE_ENROLL_STORAGE_KEY = 'skillshare:sample-enrollments';
const CREATED_COURSES_STORAGE_KEY = 'skillshare:created-courses';

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (err) {
    return fallback;
  }
};

const readLocalCreatedCourses = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(CREATED_COURSES_STORAGE_KEY);
  return raw ? safeParse(raw, []) : [];
};

export const getLocalCreatedCourses = (ownerId) => {
  const courses = readLocalCreatedCourses();
  if (!ownerId) return courses;
  return courses.filter((course) => course.ownerId === ownerId);
};

export const storeLocalCreatedCourse = (course) => {
  if (typeof window === 'undefined') return course;
  if (!course || typeof course !== 'object') return course;
  const existing = readLocalCreatedCourses().filter((entry) => entry?._id !== course._id);
  const next = [course, ...existing].slice(0, 12);
  window.localStorage.setItem(CREATED_COURSES_STORAGE_KEY, JSON.stringify(next));
  return course;
};

export const clearLocalCreatedCourses = (ownerId) => {
  if (typeof window === 'undefined') return;
  if (!ownerId) {
    window.localStorage.removeItem(CREATED_COURSES_STORAGE_KEY);
    return;
  }
  const remaining = readLocalCreatedCourses().filter((course) => course.ownerId !== ownerId);
  window.localStorage.setItem(CREATED_COURSES_STORAGE_KEY, JSON.stringify(remaining));
};

export const getStoredSampleEnrollments = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(SAMPLE_ENROLL_STORAGE_KEY);
  return raw ? safeParse(raw, []) : [];
};

export const storeSampleEnrollment = (courseId) => {
  if (typeof window === 'undefined') return;
  const existing = new Set(getStoredSampleEnrollments());
  existing.add(courseId);
  window.localStorage.setItem(SAMPLE_ENROLL_STORAGE_KEY, JSON.stringify(Array.from(existing)));
};

export const clearSampleEnrollment = (courseId) => {
  if (typeof window === 'undefined') return;
  const filtered = getStoredSampleEnrollments().filter(id => id !== courseId);
  window.localStorage.setItem(SAMPLE_ENROLL_STORAGE_KEY, JSON.stringify(filtered));
};

export const isSampleEnrolled = (courseId) => getStoredSampleEnrollments().includes(courseId);

const baseSampleCourses = [
  {
    _id: 'demo-1',
    title: 'Web Development Masterclass',
    description: 'Master HTML, CSS, and JavaScript by building real projects. Learn responsive layouts, modern tooling, and deployment best practices for production-ready web apps.',
    category: 'Programming',
    price: 499,
    duration: '15h 30m',
    level: 'Beginner to Advanced',
    rating: 4.8,
    learners: 1250,
    access: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80',
    instructor: { _id: 'instructor-sarah', name: 'Sarah Johnson' },
    lessons: [
      {
        title: 'Introduction to HTML',
        videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
        visibility: 'public'
      },
      {
        title: 'CSS Layouts & Flexbox',
        videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
        visibility: 'enrolled'
      },
      {
        title: 'Responsive Design Project',
        videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
        visibility: 'group',
        groupName: 'Frontend Cohort',
        allowedUsers: ['sample-user']
      }
    ],
    progress: { completedLessonsCount: 0 },
    discussions: [
      {
        _id: 'disc-1',
        question: 'How do I organise my CSS files for large projects?',
        user: { name: 'Priya Patel' },
        answers: [
          {
            user: { name: 'Sarah Johnson' },
            text: 'Use a component-based structure with utility classes. We cover this in the CSS architecture lesson.'
          }
        ]
      }
    ]
  },
  {
    _id: 'demo-2',
    title: 'Digital Illustration Fundamentals',
    description: 'Learn digital painting workflows in Procreate and Photoshop. Sketch, shade, and render vibrant compositions with hands-on practice assignments.',
    category: 'Art & Design',
    price: 299,
    duration: '8h 20m',
    level: 'Beginner',
    rating: 4.9,
    learners: 890,
    access: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    instructor: { _id: 'instructor-alex', name: 'Alex Chen' },
    lessons: [
      {
        title: 'Sketching Essentials',
        videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
        visibility: 'public'
      },
      {
        title: 'Colour and Light Basics',
        videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
        visibility: 'enrolled'
      }
    ],
    progress: { completedLessonsCount: 0 },
    discussions: []
  }
];

const courseSeeds = getCourses();
const additionalCourses = Array.isArray(courseSeeds)
  ? courseSeeds.map((course, idx) => ({
      ...course,
      _id: course._id || `demo-extra-${idx}`
    }))
  : [];

export const SAMPLE_COURSES = [...baseSampleCourses, ...additionalCourses];
export const COMMUNITY_POSTS = getPosts();
export const MENTORS = getMentors();
export const JOB_LISTINGS = getJobs();
export const LEADERBOARD = getLeaderboard();

export const getSampleCourseById = (courseId) => {
  if (!courseId) return undefined;
  const localCourse = readLocalCreatedCourses().find((course) => String(course._id) === String(courseId));
  if (localCourse) return localCourse;
  return SAMPLE_COURSES.find((course) => String(course._id) === String(courseId));
};

export const isSampleCourseId = (courseId) => Boolean(getSampleCourseById(courseId));