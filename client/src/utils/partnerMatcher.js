// partnerMatcher groups members based on shared goals, availability, and experience
const tokenize = (value) => {
  if (!value) return [];
  const base = Array.isArray(value) ? value.join(' ') : String(value);
  return base
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
};

const uniqueTokens = (list) => Array.from(new Set(list));

const normalizeProfile = (profile = {}) => ({
  id: profile.id || `user-${Date.now()}`,
  name: profile.name || 'Community member',
  avatar: profile.avatar || 'https://i.pravatar.cc/120?img=55',
  experience: (profile.experience || 'intermediate').toLowerCase(),
  goals: Array.isArray(profile.goals) ? profile.goals : [profile.goals || 'ship weekly projects'],
  focusTags: Array.isArray(profile.focusTags) ? profile.focusTags : tokenize(profile.goals),
  availability: Array.isArray(profile.availability) ? profile.availability : [profile.availability || 'Flexible'],
  timeZone: profile.timeZone || 'UTC',
  hoursPerWeek: Number(profile.hoursPerWeek || profile.weeklyHours || 4)
});

const buildGoalScore = (current, candidate) => {
  const currentTokens = uniqueTokens([...tokenize(current.goals), ...(current.focusTags || [])]);
  const candidateTokens = uniqueTokens([...tokenize(candidate.goals), ...(candidate.focusTags || [])]);
  if (!currentTokens.length || !candidateTokens.length) return 0.25;
  const intersection = candidateTokens.filter((token) => currentTokens.includes(token));
  return Math.min(intersection.length / Math.max(currentTokens.length, 1), 1);
};

const parseDay = (slot = '') => slot.split(' ')[0]?.toLowerCase();

const buildAvailabilityScore = (current, candidate) => {
  const currentDays = current.availability.map(parseDay);
  const candidateDays = candidate.availability.map(parseDay);
  const overlap = candidateDays.filter((day) => day && currentDays.includes(day));
  if (!overlap.length) return 0.2;
  const minSlots = Math.max(1, Math.min(current.availability.length, candidate.availability.length));
  return Math.min(overlap.length / minSlots, 1);
};

const buildExperienceScore = (current, candidate) => {
  const map = { beginner: 0, intermediate: 1, advanced: 2 };
  const delta = Math.abs((map[current.experience] ?? 1) - (map[candidate.experience] ?? 1));
  if (delta === 0) return 1;
  if (delta === 1) return 0.7;
  return 0.4;
};

const computeScore = (current, candidate, options = {}) => {
  const goalScore = buildGoalScore(current, candidate);
  const availabilityScore = buildAvailabilityScore(current, candidate);
  const experienceScore = buildExperienceScore(current, candidate);
  const preferSameZone = options.preferSameZone;
  const timezoneBonus = preferSameZone && current.timeZone === candidate.timeZone ? 0.1 : 0;
  const weighted = goalScore * 0.5 + availabilityScore * 0.3 + experienceScore * 0.2 + timezoneBonus;
  return Math.round(Math.min(weighted, 1) * 100);
};

export const findPartners = (currentUser, users = [], options = {}) => {
  if (!currentUser) return [];
  const normalizedCurrent = normalizeProfile(currentUser);
  const minMatchPct = Number(options.minMatchPct || 0);

  return users
    .map((user) => normalizeProfile(user))
    .filter((user) => user.id !== normalizedCurrent.id)
    .map((candidate) => ({
      ...candidate,
      matchScore: computeScore(normalizedCurrent, candidate, options),
      overlapDays: candidate.availability.filter((slot) => normalizedCurrent.availability.map(parseDay).includes(parseDay(slot)))
    }))
    .filter((candidate) => candidate.matchScore >= minMatchPct)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, options.limit || 12);
};

export default {
  findPartners
};