// teamMatcher orchestrates lightweight skill-diverse grouping for event participants
const LEVEL_WEIGHTS = {
  beginner: 0.2,
  junior: 0.35,
  mid: 0.6,
  senior: 0.8,
  principal: 1
};

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const normalizeParticipant = (participant = {}) => {
  const skills = ensureArray(participant.skills && participant.skills.length ? participant.skills : participant.primarySkill);
  return {
    id: participant.id || `participant-${Math.random().toString(36).slice(2, 10)}`,
    name: participant.name || 'Community member',
    avatar: participant.avatar || '',
    level: (participant.level || 'mid').toLowerCase(),
    xp: participant.xp || participant.experience || 0,
    availability: participant.availability || 'Flexible',
    goals: ensureArray(participant.goals),
    primarySkill: participant.primarySkill || skills[0] || 'generalist',
    preferredRole: participant.preferredRole || participant.role || 'generalist',
    skills
  };
};

const mulberry32 = (seed) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleWithSeed = (list, seed = Date.now()) => {
  const random = mulberry32(seed);
  const clone = [...list];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
};

const buildRoleQueue = (roleSpec = {}, teamSize = 3) => {
  const normalized = Object.entries(roleSpec).reduce((acc, [role, count]) => {
    const safeRole = role?.toLowerCase().trim();
    if (!safeRole || count <= 0) return acc;
    acc[safeRole] = Math.max(0, Number(count) || 0);
    return acc;
  }, {});

  const totalRequested = Object.values(normalized).reduce((sum, count) => sum + count, 0);
  if (totalRequested > teamSize) {
    // scale down to never exceed team size while keeping distribution ratios
    const ratio = teamSize / totalRequested;
    Object.keys(normalized).forEach((role) => {
      normalized[role] = Math.max(1, Math.floor(normalized[role] * ratio));
    });
  }

  const queue = [];
  Object.entries(normalized).forEach(([role, count]) => {
    for (let index = 0; index < count; index += 1) {
      queue.push(role);
    }
  });
  return { normalized, queue };
};

const pickRoleCandidate = (pool, usedIds, role) =>
  pool.find((participant) => {
    if (usedIds.has(participant.id)) return false;
    const preferredRole = participant.preferredRole?.toLowerCase();
    return preferredRole === role || participant.primarySkill?.toLowerCase() === role;
  });

const computeDiversityDelta = (teamMembers = [], candidate) => {
  const currentSkills = new Set(teamMembers.flatMap((member) => member.skills || []));
  const candidateSkills = candidate.skills || [];
  const uniqueContribution = candidateSkills.filter((skill) => !currentSkills.has(skill)).length;
  return uniqueContribution + (candidate.level === 'senior' ? 0.25 : 0);
};

const levelWeight = (participant) => LEVEL_WEIGHTS[participant.level] || 0.5;

export const scoreTeam = (team, requiredSkills = []) => {
  if (!team || !team.members?.length) return 0;
  const normalizedRequired = ensureArray(requiredSkills);
  const memberCount = team.members.length;
  if (!memberCount) return 0;

  const overlapSum = team.members.reduce((sum, member) => {
    const memberSkills = member.skills || [];
    if (!normalizedRequired.length) {
      return sum + (memberSkills.length ? 0.5 : 0.25);
    }
    const overlap = memberSkills.filter((skill) => normalizedRequired.includes(skill)).length;
    return sum + overlap / Math.max(normalizedRequired.length, 1);
  }, 0);

  const uniqueSkills = new Set(team.members.flatMap((member) => member.skills || []));
  const diversityBonus = normalizedRequired.length
    ? Math.min(uniqueSkills.size / normalizedRequired.length, 1.2)
    : Math.min(uniqueSkills.size / memberCount, 1.2);

  const baseScore = overlapSum / memberCount;
  return Math.round(baseScore * diversityBonus * 100);
};

export const generateTeams = (participants = [], teamSize = 3, roleSpec = {}, options = {}) => {
  if (!participants.length || teamSize <= 1) {
    return { teams: [], unassigned: participants.map((person) => normalizeParticipant(person)) };
  }

  const normalizedParticipants = participants.map((person) => normalizeParticipant(person));
  const { normalized: normalizedRoles, queue: roleQueue } = buildRoleQueue(roleSpec, teamSize);
  const seed = typeof options.seed === 'number' ? options.seed : Date.now();
  const pool = shuffleWithSeed(normalizedParticipants, seed);
  const usedIds = new Set();
  const teams = [];
  const requiredSkills = ensureArray(options.requiredSkills || []);

  const pullBestAvailable = (teamMembers, fallbackRole) => {
    let bestCandidate = null;
    let bestScore = -Infinity;
    pool.forEach((participant) => {
      if (usedIds.has(participant.id)) return;
      const preferred = participant.preferredRole?.toLowerCase();
      const matchesRole = fallbackRole ? preferred === fallbackRole : true;
      const diversityScore = computeDiversityDelta(teamMembers, participant);
      const balanceScore = levelWeight(participant);
      const candidateScore = (matchesRole ? 0.6 : 0.3) + diversityScore * 0.3 + balanceScore * 0.4;
      if (candidateScore > bestScore) {
        bestCandidate = participant;
        bestScore = candidateScore;
      }
    });
    return bestCandidate;
  };

  while (pool.length - usedIds.size >= Math.max(2, Math.min(teamSize, pool.length))) {
    const currentTeamMembers = [];
    const filledRoles = {};

    roleQueue.forEach((roleKey) => {
      if (currentTeamMembers.length >= teamSize) return;
      const candidate = pickRoleCandidate(pool, usedIds, roleKey);
      if (candidate) {
        usedIds.add(candidate.id);
        currentTeamMembers.push(candidate);
        filledRoles[roleKey] = (filledRoles[roleKey] || 0) + 1;
      }
    });

    while (currentTeamMembers.length < teamSize) {
      const candidate = pullBestAvailable(currentTeamMembers);
      if (!candidate) break;
      usedIds.add(candidate.id);
      currentTeamMembers.push(candidate);
    }

    if (!currentTeamMembers.length) break;

    const teamIndex = teams.length + 1;
    const teamPayload = {
      id: `team-${teamIndex}`,
      name: `Auto Team ${teamIndex}`,
      members: currentTeamMembers,
      roles: {
        required: normalizedRoles,
        filled: filledRoles,
        totalSize: teamSize
      },
      matchScore: scoreTeam({ members: currentTeamMembers }, requiredSkills),
      seedUsed: seed + teamIndex,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    teams.push(teamPayload);

    if (pool.length - usedIds.size < 2) break;
  }

  const unassigned = pool.filter((participant) => !usedIds.has(participant.id));
  return { teams, unassigned };
};

export default {
  generateTeams,
  scoreTeam
};