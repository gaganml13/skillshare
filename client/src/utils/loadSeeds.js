import rawSeeds from '../data/seeds.json';
import mentorSeeds from '../data/mentors.json';
import communitySeeds from '../data/community.json';
import jobSeeds from '../data/jobs.json';

const PUBLISHED_COURSES_KEY = 'skillversex:publishedCourses';
const LOCAL_JOBS_KEY = 'skillversex:jobs';
const SAVED_JOBS_KEY = 'skillversex:savedJobs';
const JOB_APPLICATIONS_KEY = 'skillversex:jobApplications';
const COMMUNITY_POSTS_KEY = 'skillversex:communityPosts';
const PUBLISHED_EVENTS_KEY = 'skillversex:events';
const JOINED_EVENTS_KEY = 'skillversex:joinedEvents';
const EVENT_INVITES_KEY = 'skillversex:eventInvites';
const USER_SKILLS_KEY = 'skillversex:userSkills';
const DEFAULT_COMMUNITY_USER = {
  id: 'gagan-host',
  name: 'Gagan (You)',
  avatar: 'https://i.pravatar.cc/120?img=3',
  role: 'Community host',
  skills: ['Product', 'AI Ops', 'Facilitation'],
  availability: 'Weeknights'
};

const deepClone = (value, fallback = []) => {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback));
  } catch (error) {
    console.info('loadSeeds: unable to clone value', error);
    return Array.isArray(fallback) ? [...fallback] : fallback;
  }
};

const safeParse = (payload) => {
  try {
    const parsed = JSON.parse(payload || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.info('loadSeeds: unable to parse payload', error);
    return [];
  }
};

const safeParseObject = (payload) => {
  try {
    const parsed = JSON.parse(payload || '{}');
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    console.info('loadSeeds: unable to parse object payload', error);
    return {};
  }
};

const readPublishedCourses = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(PUBLISHED_COURSES_KEY);
  return safeParse(raw);
};

const persistPublishedCourses = (courses) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PUBLISHED_COURSES_KEY, JSON.stringify(courses));
  } catch (error) {
    console.info('loadSeeds: unable to persist local courses', error);
  }
};

const readLocalJobs = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(LOCAL_JOBS_KEY);
  return safeParse(raw);
};

const persistLocalJobs = (jobs) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs));
  } catch (error) {
    console.info('loadSeeds: unable to persist local jobs', error);
  }
};

const readSavedJobs = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(SAVED_JOBS_KEY);
  return safeParse(raw);
};

const persistSavedJobs = (jobIds) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(jobIds));
  } catch (error) {
    console.info('loadSeeds: unable to persist saved jobs', error);
  }
};

const readJobApplications = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(JOB_APPLICATIONS_KEY);
  return safeParse(raw);
};

const persistJobApplications = (applications) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(JOB_APPLICATIONS_KEY, JSON.stringify(applications));
  } catch (error) {
    console.info('loadSeeds: unable to persist job applications', error);
  }
};

const readCommunityPosts = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(COMMUNITY_POSTS_KEY);
  return safeParse(raw);
};

const persistCommunityPosts = (posts) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
  } catch (error) {
    console.info('loadSeeds: unable to persist community posts', error);
  }
};

const readPublishedEvents = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(PUBLISHED_EVENTS_KEY);
  return safeParse(raw);
};

const persistPublishedEvents = (events) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PUBLISHED_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.info('loadSeeds: unable to persist events', error);
  }
};

const readJoinedEvents = () => {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(JOINED_EVENTS_KEY);
  return safeParseObject(raw);
};

const persistJoinedEvents = (joinedMap) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(JOINED_EVENTS_KEY, JSON.stringify(joinedMap));
  } catch (error) {
    console.info('loadSeeds: unable to persist joined events', error);
  }
};

const readEventInvites = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(EVENT_INVITES_KEY);
  return safeParse(raw);
};

const persistEventInvites = (invites) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EVENT_INVITES_KEY, JSON.stringify(invites));
  } catch (error) {
    console.info('loadSeeds: unable to persist event invites', error);
  }
};

const readUserSkills = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(USER_SKILLS_KEY);
  return safeParse(raw);
};

const persistUserSkills = (skills) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(USER_SKILLS_KEY, JSON.stringify(skills));
  } catch (error) {
    console.info('loadSeeds: unable to persist user skills', error);
  }
};

export const getCurrentCommunityUser = () => {
  if (typeof window === 'undefined') return { ...DEFAULT_COMMUNITY_USER };
  try {
    const rawUser = window.localStorage.getItem('user') || window.localStorage.getItem('currentUser');
    if (!rawUser) return { ...DEFAULT_COMMUNITY_USER };
    const parsed = JSON.parse(rawUser);
    return {
      id: parsed._id || parsed.id || parsed.email || DEFAULT_COMMUNITY_USER.id,
      name: parsed.name || parsed.fullName || DEFAULT_COMMUNITY_USER.name,
      avatar: parsed.avatar || parsed.photo || DEFAULT_COMMUNITY_USER.avatar,
      role: parsed.role || parsed.title || DEFAULT_COMMUNITY_USER.role,
      skills: parsed.skills || DEFAULT_COMMUNITY_USER.skills,
      availability: parsed.availability || DEFAULT_COMMUNITY_USER.availability
    };
  } catch (error) {
    console.info('loadSeeds: unable to read current community user', error);
    return { ...DEFAULT_COMMUNITY_USER };
  }
};

const ensureAttendee = (profile) => ({
  id: profile.id || `attendee-${Date.now()}`,
  name: profile.name || 'Community member',
  avatar: profile.avatar || DEFAULT_COMMUNITY_USER.avatar,
  skills: Array.isArray(profile.skills) ? profile.skills : normalizeSkills(profile.skills),
  availability: profile.availability || 'Flexible'
});

const mapEventWithOverride = (event, overrides) => {
  const override = overrides[event.id] || {};
  return {
    ...event,
    attendees: deepClone(override.attendees, event.attendees || []),
    active: typeof override.active === 'boolean' ? override.active : event.active !== false
  };
};

const eventDateToComparable = (event) => {
  const date = event.date || new Date().toISOString().split('T')[0];
  const time = event.time || '00:00';
  return new Date(`${date}T${time}:00`).getTime();
};

const sortEventsByDate = (list) => [...list].sort((a, b) => eventDateToComparable(a) - eventDateToComparable(b));

const composeEvents = () => {
  const baseEvents = deepClone(communitySeeds.events || [], []);
  const published = deepClone(readPublishedEvents(), []);
  const overrides = readJoinedEvents();
  const merged = [...baseEvents, ...published].map((event) => mapEventWithOverride(event, overrides));
  return sortEventsByDate(merged);
};

export const publishCourse = (course) => {
  if (!course) return null;
  const ensuredCourse = course._id ? course : { ...course, _id: course.id || `local-${Date.now()}` };
  const existing = readPublishedCourses();
  const next = [...existing, ensuredCourse];
  persistPublishedCourses(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('seeds:coursePublished', {
      detail: { courseId: ensuredCourse._id }
    }));
  }
  return ensuredCourse;
};

export const getCourses = () => {
  const published = readPublishedCourses();
  return [...deepClone(rawSeeds.courses, []), ...deepClone(published, [])];
};

export const getCommunity = () => {
  const base = deepClone(communitySeeds, { posts: [], channels: [], challenges: [], contributors: [] });
  const local = deepClone(readCommunityPosts(), []);
  return {
    ...base,
    posts: [...local, ...(base.posts || [])],
    events: composeEvents()
  };
};

export const getChannels = () => deepClone(communitySeeds.channels || [], []);

export const getPosts = () => {
  const community = getCommunity();
  return community.posts || [];
};

export const getEvents = () => composeEvents();
export const getJobs = () => {
  const localJobs = readLocalJobs();
  return [...deepClone(jobSeeds, []), ...deepClone(localJobs, [])];
};
export const getLeaderboard = () => deepClone(rawSeeds.leaderboard, []);
export const getMentors = () => deepClone(mentorSeeds, []);

export const getPublishedCoursesKey = () => PUBLISHED_COURSES_KEY;

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => skill.trim()).filter(Boolean);
  }
  return String(skills || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

export const publishJob = (job) => {
  if (!job) return null;
  const normalized = {
    id: job.id || `local-job-${Date.now()}`,
    title: job.title?.trim() || job.role?.trim() || 'Untitled role',
    company: job.company?.trim() || 'Confidential',
    location: job.location?.trim() || 'Remote',
    salaryRange: job.salaryRange?.trim() || job.salary?.trim() || 'Competitive',
    type: job.type || 'Contract',
    posted: job.posted || 'Just now',
    description: job.description || job.summary || '',
    skills: normalizeSkills(job.skills),
    applyUrl: job.applyUrl || '#',
    tags: Array.isArray(job.tags) ? job.tags : [],
    logo: job.logo || job.icon || 'briefcase'
  };
  const current = readLocalJobs();
  const next = [...current, normalized];
  persistLocalJobs(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobs:updated', { detail: { jobId: normalized.id } }));
  }
  return normalized;
};

export const getSavedJobs = () => readSavedJobs();
export const persistSavedJobsList = (jobIds) => persistSavedJobs(jobIds);
export const getJobApplications = () => readJobApplications();

export const saveApplication = (jobId, application) => {
  if (!jobId || !application) return null;
  const current = readJobApplications();
  const filtered = current.filter((entry) => entry.jobId !== jobId);
  const nextRecord = {
    jobId,
    status: application.status || 'Applied',
    submittedAt: application.submittedAt || new Date().toISOString(),
    name: application.name,
    email: application.email,
    message: application.message || '',
    resumeName: application.resumeName || ''
  };
  const next = [nextRecord, ...filtered];
  persistJobApplications(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobs:applicationSaved', {
      detail: { jobId, status: nextRecord.status }
    }));
  }
  return nextRecord;
};

export const publishPost = (post) => {
  if (!post) return null;
  const normalized = {
    id: post.id || `local-post-${Date.now()}`,
    channelId: post.channelId || 'all',
    author: post.author || { name: 'Anonymous', avatar: '', role: '' },
    timestamp: post.timestamp || new Date().toISOString(),
    type: post.type || 'text',
    content: post.content || '',
    image: post.image || null,
    poll: post.poll || null,
    tags: Array.isArray(post.tags) ? post.tags : [],
    reactions: post.reactions || { '🔥': 0, '👏': 0, '💡': 0 },
    comments: typeof post.comments === 'number' ? post.comments : 0,
    bookmarked: Boolean(post.bookmarked)
  };
  const current = readCommunityPosts();
  const next = [normalized, ...current].slice(0, 50);
  persistCommunityPosts(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('community:postPublished', {
      detail: { postId: normalized.id }
    }));
  }
  return normalized;
};

// publishEvent persists a community event locally so it instantly shows up in the UI
export const publishEvent = (event) => {
  if (!event) return null;
  const hostProfile = ensureAttendee({
    ...getCurrentCommunityUser(),
    name: event.hostName || event.host?.name || getCurrentCommunityUser().name,
    avatar: event.hostAvatar || event.host?.avatar || getCurrentCommunityUser().avatar,
    skills: event.host?.skills || getCurrentCommunityUser().skills
  });
  const normalized = {
    id: event.id || `event-${Date.now()}`,
    title: event.title?.trim() || 'Untitled event',
    description: event.description?.trim() || '',
    hostId: event.hostId || hostProfile.id,
    hostName: event.hostName || hostProfile.name,
    hostAvatar: event.hostAvatar || hostProfile.avatar,
    date: event.date,
    time: event.time || '09:00',
    location: event.location || 'Remote',
    mode: event.mode || 'remote',
    skillsRequired: normalizeSkills(event.skillsRequired?.length ? event.skillsRequired : event.skills),
    capacity: Number(event.capacity) || 0,
    attendees: (event.attendees && event.attendees.length ? event.attendees : [hostProfile]).map(ensureAttendee),
    createdAt: event.createdAt || new Date().toISOString(),
    active: event.active !== false
  };
  const currentEvents = readPublishedEvents();
  const next = [normalized, ...currentEvents].slice(0, 100);
  persistPublishedEvents(next);
  const joined = readJoinedEvents();
  joined[normalized.id] = {
    attendees: normalized.attendees,
    active: normalized.active
  };
  persistJoinedEvents(joined);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('community:eventPublished', {
      detail: { eventId: normalized.id }
    }));
  }
  return normalized;
};

// joinEvent toggles attendance for the current user, honoring capacity and accessibility constraints
export const joinEvent = (eventId, options = {}) => {
  if (!eventId) return null;
  const events = getEvents();
  const target = events.find((event) => event.id === eventId);
  if (!target) return null;
  const currentUser = ensureAttendee(options.user || getCurrentCommunityUser());
  const joined = readJoinedEvents();
  const override = joined[eventId] || {
    attendees: deepClone(target.attendees || [], []),
    active: target.active !== false
  };
  const roster = Array.isArray(override.attendees) ? [...override.attendees] : [];
  const alreadyJoined = roster.some((attendee) => attendee.id === currentUser.id);
  const shouldLeave = options.leave || (!options.leave && alreadyJoined);
  let status = 'idle';

  if (shouldLeave) {
    override.attendees = roster.filter((attendee) => attendee.id !== currentUser.id);
    status = 'left';
  } else {
    if (target.capacity && roster.length >= target.capacity) {
      return { event: { ...target, attendees: roster }, status: 'full' };
    }
    override.attendees = [...roster.filter((attendee) => attendee.id !== currentUser.id), currentUser];
    status = 'joined';
  }

  joined[eventId] = override;
  persistJoinedEvents(joined);

  const updatedEvent = {
    ...target,
    attendees: override.attendees,
    active: override.active
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('community:eventAttendance', {
      detail: { eventId, status }
    }));
  }

  return { event: updatedEvent, status };
};

// updateEventActiveState lets hosts close or reopen registration (client-side only)
export const updateEventActiveState = (eventId, isActive) => {
  if (!eventId) return null;
  const joined = readJoinedEvents();
  const current = joined[eventId] || {};
  joined[eventId] = {
    ...current,
    active: typeof isActive === 'boolean' ? isActive : current.active
  };
  persistJoinedEvents(joined);
  return joined[eventId];
};

// getUserSkills retrieves cached viewer skills or seeds defaults for matching
export const getUserSkills = () => {
  const stored = readUserSkills();
  if (stored.length) return stored;
  const fallback = getCurrentCommunityUser().skills || DEFAULT_COMMUNITY_USER.skills;
  persistUserSkills(fallback);
  return fallback;
};

// saveUserSkills normalizes and persists the viewer skill list
export const saveUserSkills = (skills) => {
  const normalized = normalizeSkills(skills);
  persistUserSkills(normalized);
  return normalized;
};

// findMatches ranks potential teammates by skill overlap and filters
export const findMatches = (eventId, userSkillsInput = [], filters = {}) => {
  const events = getEvents();
  const event = events.find((entry) => entry.id === eventId);
  if (!event) return [];
  const viewerSkills = normalizeSkills(userSkillsInput.length ? userSkillsInput : getUserSkills());
  const requirementBaseline = (event.skillsRequired || []).length || viewerSkills.length || 1;
  const contributors = deepClone(communitySeeds.contributors || [], []).map((contributor) => ensureAttendee(contributor));
  const pool = [...(event.attendees || []).map(ensureAttendee), ...contributors];
  const uniquePool = Array.from(new Map(pool.map((person) => [person.id, person])).values());
  const currentUser = getCurrentCommunityUser();
  const minMatchPct = Number(filters.minMatchPct || 0);
  const availability = filters.availability;

  return uniquePool
    .filter((person) => person.id !== currentUser.id)
    .map((person) => {
      const overlap = person.skills.filter((skill) => viewerSkills.includes(skill)).length;
      const rawScore = (overlap / Math.max(requirementBaseline, 1)) * 100;
      return { ...person, matchScore: Math.round(rawScore) };
    })
    .filter((person) => person.matchScore >= minMatchPct)
    .filter((person) => !availability || person.availability === availability)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, filters.limit || 10);
};

// recordEventInvite logs lightweight invite notifications for client-only toasts
export const recordEventInvite = (invite) => {
  if (!invite || !invite.to) return null;
  const normalized = {
    id: invite.id || `invite-${Date.now()}`,
    from: invite.from || getCurrentCommunityUser().name,
    to: invite.to,
    eventId: invite.eventId,
    createdAt: new Date().toISOString(),
    message: invite.message || ''
  };
  const current = readEventInvites();
  const next = [normalized, ...current].slice(0, 40);
  persistEventInvites(next);
  return normalized;
};

export const getEventInvites = () => readEventInvites();

export default {
  getCourses,
  getPosts,
  getEvents,
  getJobs,
  getLeaderboard,
  getMentors,
  getCommunity,
  getChannels,
  getSavedJobs,
  persistSavedJobsList,
  getJobApplications,
  publishCourse,
  publishPost,
  publishEvent,
  publishJob,
  saveApplication,
  getPublishedCoursesKey,
  joinEvent,
  updateEventActiveState,
  getUserSkills,
  saveUserSkills,
  findMatches,
  recordEventInvite,
  getEventInvites,
  getCurrentCommunityUser
};
