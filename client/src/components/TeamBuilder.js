import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import TeamCard from './TeamCard';
import { generateTeams } from '../utils/teamMatcher';
import { getTeams, saveTeams } from '../utils/loadSeeds';

const LEVEL_ORDER = ['any', 'junior', 'mid', 'senior', 'principal'];
const LEVEL_RANK = LEVEL_ORDER.reduce((acc, value, index) => ({ ...acc, [value]: index }), {});

const normalizeMember = (member) => ({
  id: member.id || `participant-${Math.random().toString(36).slice(2, 10)}`,
  name: member.name || 'Community member',
  avatar: member.avatar || 'https://i.pravatar.cc/120?img=67',
  primarySkill: member.primarySkill || member.skills?.[0] || member.preferredRole || 'generalist',
  preferredRole: member.preferredRole || member.role || member.primarySkill || 'generalist',
  skills: member.skills?.length ? member.skills : [member.primarySkill || member.role || 'generalist'],
  level: (member.level || 'mid').toLowerCase(),
  xp: member.xp || member.experience || 0,
  availability: member.availability || 'Flexible',
  goals: member.goals || []
});

const sumRoleSpec = (roleSpec) => Object.values(roleSpec).reduce((total, count) => total + Number(count || 0), 0);

const TeamBuilder = ({ event }) => {
  const [teamSize, setTeamSize] = useState(4);
  const [roleSpec, setRoleSpec] = useState({ dev: 2, design: 1, pm: 1 });
  const [minExperience, setMinExperience] = useState('any');
  const [draftTeams, setDraftTeams] = useState([]);
  const [confirmedTeams, setConfirmedTeams] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [seedUsed, setSeedUsed] = useState(() => Date.now());
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleCount, setCustomRoleCount] = useState(1);

  const defaultRoleSpec = useMemo(() => {
    const roles = event?.roles || event?.roleTemplate || [];
    if (roles.length) {
      return roles.reduce((acc, role) => {
        if (!role?.id) return acc;
        acc[role.id.toLowerCase()] = role.count || 1;
        return acc;
      }, {});
    }
    return { dev: 2, design: 1, pm: 1 };
  }, [event]);

  const participants = useMemo(() => {
    if (!event) return [];
    const roster = [...(event.participants || []), ...(event.attendees || [])];
    const unique = new Map();
    roster.forEach((member) => {
      const normalized = normalizeMember(member);
      unique.set(normalized.id, normalized);
    });
    return Array.from(unique.values());
  }, [event]);

  useEffect(() => {
    setRoleSpec(defaultRoleSpec);
    const inferredSize = Math.max(sumRoleSpec(defaultRoleSpec), 3);
    setTeamSize(inferredSize);
  }, [defaultRoleSpec]);

  useEffect(() => {
    if (!event?.id) return;
    const storedTeams = (getTeams(event.id) || []).map((team) => ({
      ...team,
      status: team.status || 'confirmed'
    }));
    setConfirmedTeams(storedTeams);
  }, [event?.id]);

  const handleRoleCountChange = (roleKey, value) => {
    setRoleSpec((prev) => ({
      ...prev,
      [roleKey]: Math.max(0, Number(value) || 0)
    }));
  };

  const handleAddRole = (eventObj) => {
    eventObj.preventDefault();
    const roleKey = customRoleName.trim().toLowerCase();
    if (!roleKey) return;
    setRoleSpec((prev) => ({
      ...prev,
      [roleKey]: Math.max(1, Number(customRoleCount) || 1)
    }));
    setCustomRoleName('');
    setCustomRoleCount(1);
  };

  const handleAutoGroup = (seed = Date.now()) => {
    if (!participants.length) {
      setStatusMessage('No participants yet. Ask attendees to RSVP first.');
      return;
    }
    setIsGenerating(true);
    const requestedSlots = sumRoleSpec(roleSpec);
    if (!requestedSlots) {
      setStatusMessage('Add at least one role slot before running the matcher.');
      setIsGenerating(false);
      return;
    }
    const levelFloor = LEVEL_RANK[minExperience] || 0;
    const eligible = participants.filter((member) => (LEVEL_RANK[member.level] || 0) >= levelFloor);
    if (!eligible.length) {
      setStatusMessage('No participants meet that experience filter.');
      setIsGenerating(false);
      return;
    }
    const { teams, unassigned: rest } = generateTeams(eligible, Number(teamSize) || 3, roleSpec, {
      seed,
      requiredSkills: event?.skillsRequired || event?.requiredSkills || []
    });
    setDraftTeams(teams);
    setUnassigned(rest);
    setSeedUsed(seed);
    setIsGenerating(false);
    setStatusMessage(`Generated ${teams.length} teams with seed ${seed}.`);
  };

  const handleConfirmTeam = (team) => {
    if (!event?.id || !team) return;
    const lockedTeam = { ...team, status: 'confirmed', confirmedAt: new Date().toISOString() };
    const next = [...confirmedTeams.filter((entry) => entry.id !== team.id), lockedTeam];
    setConfirmedTeams(next);
    saveTeams(event.id, next);
    setDraftTeams((prev) => prev.filter((entry) => entry.id !== team.id));
  };

  const handleShuffle = () => handleAutoGroup(Date.now());

  const handleExportTeam = (team) => {
    if (typeof window === 'undefined' || !team) return;
    const rows = [
      ['Name', 'Primary skill', 'Preferred role', 'Level', 'Availability', 'Goals'].join(','),
      ...team.members.map((member) => [
        member.name,
        member.primarySkill,
        member.preferredRole,
        member.level,
        member.availability,
        (member.goals || []).join('|')
      ].map((cell) => `"${cell || ''}"`).join(','))
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(team.name || 'team').replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderTeams = (list, headline) => (
    <section className="team-builder__group" aria-live="polite">
      <div className="team-builder__group-header">
        <h4>{headline}</h4>
        <p>{list.length} teams</p>
      </div>
      <div className="team-card-grid">
        {list.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onConfirm={handleConfirmTeam}
            onShuffle={handleShuffle}
            onExport={handleExportTeam}
          />
        ))}
      </div>
    </section>
  );

  if (!event) {
    return (
      <section className="team-builder">
        <p>Select an event to start building teams.</p>
      </section>
    );
  }

  return (
    <section className="team-builder" aria-label="Auto-create teams">
      <header className="team-builder__header">
        <div>
          <p className="team-builder__eyebrow">Auto-create teams</p>
          <h3>{event.title}</h3>
          <p>Balance roles and XP in one click. Hosts can tweak slots before locking teams.</p>
        </div>
        <div className="team-builder__meta">
          <p>{participants.length} participants</p>
          <p>Seed: {seedUsed}</p>
        </div>
      </header>

      <form className="team-builder__form" aria-label="Team inputs" onSubmit={(e) => e.preventDefault()}>
        <label>
          <span>Desired team size</span>
          <input
            type="number"
            min="2"
            value={teamSize}
            onChange={(e) => setTeamSize(Math.max(2, Number(e.target.value) || 2))}
          />
        </label>

        <fieldset>
          <legend>Role distribution</legend>
          <div className="team-builder__roles">
            {Object.keys(roleSpec).map((roleKey) => (
              <label key={roleKey}>
                <span>{roleKey}</span>
                <input
                  type="number"
                  min="0"
                  value={roleSpec[roleKey]}
                  onChange={(e) => handleRoleCountChange(roleKey, e.target.value)}
                />
              </label>
            ))}
          </div>
          <div className="team-builder__add-role">
            <input
              type="text"
              placeholder="Role name"
              value={customRoleName}
              onChange={(e) => setCustomRoleName(e.target.value)}
              aria-label="Custom role name"
            />
            <input
              type="number"
              min="1"
              value={customRoleCount}
              onChange={(e) => setCustomRoleCount(Math.max(1, Number(e.target.value) || 1))}
              aria-label="Custom role count"
            />
            <button type="button" className="ghost-btn" onClick={handleAddRole} aria-label="Add role">
              Add role
            </button>
          </div>
        </fieldset>

        <label>
          <span>Minimum experience</span>
          <select value={minExperience} onChange={(e) => setMinExperience(e.target.value)}>
            {LEVEL_ORDER.map((level) => (
              <option key={level} value={level}>
                {level === 'any' ? 'Any level' : level}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="primary-btn" onClick={() => handleAutoGroup()} disabled={isGenerating}>
          {isGenerating ? 'Grouping…' : 'Auto-group'}
        </button>
      </form>

      {statusMessage && <p className="team-builder__status" role="status">{statusMessage}</p>}

      {!!draftTeams.length && renderTeams(draftTeams, 'Suggested pods')}
      {!!confirmedTeams.length && renderTeams(confirmedTeams, 'Confirmed pods')}

      {unassigned.length > 0 && (
        <div className="team-builder__unassigned">
          <p>Unassigned ({unassigned.length})</p>
          <div className="team-builder__chips">
            {unassigned.map((participant) => (
              <span key={participant.id}>{participant.name}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

TeamBuilder.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    skillsRequired: PropTypes.arrayOf(PropTypes.string),
    roles: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, count: PropTypes.number })),
    participants: PropTypes.arrayOf(PropTypes.object),
    attendees: PropTypes.arrayOf(PropTypes.object)
  })
};

TeamBuilder.defaultProps = {
  event: null
};

export default TeamBuilder;