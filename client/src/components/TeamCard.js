import React from 'react';
import PropTypes from 'prop-types';

// TeamCard surfaces membership, role coverage, and actions for generated pods
const TeamCard = ({ team, onConfirm, onShuffle, onExport }) => {
  if (!team) return null;
  const isLocked = team.status === 'confirmed';
  const requiredRoles = team.roles?.required || {};
  const filledRoles = team.roles?.filled || {};

  const renderRoleStatus = () => {
    const roleKeys = Object.keys(requiredRoles);
    if (!roleKeys.length) {
      return <p className="team-card__role-note">No role quotas specified</p>;
    }
    return (
      <ul className="team-card__roles" aria-label="Roles filled">
        {roleKeys.map((roleKey) => {
          const requiredCount = requiredRoles[roleKey] || 0;
          const filledCount = filledRoles[roleKey] || 0;
          const hasGap = filledCount < requiredCount;
          return (
            <li key={roleKey} className={hasGap ? 'team-card__role team-card__role--gap' : 'team-card__role'}>
              <span>{roleKey}</span>
              <span>{filledCount}/{requiredCount}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <article className={isLocked ? 'team-card team-card--locked' : 'team-card'} aria-live="polite">
      <header className="team-card__header">
        <div>
          <p className="team-card__eyebrow">{team.id}</p>
          <h4>{team.name}</h4>
        </div>
        <div className="team-card__score" aria-label={`Match score ${team.matchScore || 0} percent`}>
          <span>{team.matchScore || 0}%</span>
          <p>Match score</p>
        </div>
      </header>

      {renderRoleStatus()}

      <ul className="team-card__members" aria-label="Team members">
        {team.members?.map((member) => (
          <li key={member.id}>
            <img src={member.avatar} alt={member.name} />
            <div>
              <p className="team-card__member-name">{member.name}</p>
              <p className="team-card__member-meta">
                {member.primarySkill || member.preferredRole} • {member.level || 'mid'} • {member.xp ? `${member.xp} XP` : 'XP TBD'}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <footer className="team-card__actions">
        <button
          type="button"
          className="primary-btn"
          onClick={() => onConfirm(team)}
          disabled={isLocked}
          aria-label={`Confirm ${team.name}`}
        >
          {isLocked ? 'Locked' : 'Confirm team'}
        </button>
        <button type="button" className="ghost-btn" onClick={() => onShuffle(team)} aria-label="Shuffle team" disabled={isLocked}>
          Shuffle
        </button>
        <button type="button" className="ghost-btn" onClick={() => onExport(team)} aria-label="Export team as CSV">
          Export CSV
        </button>
      </footer>
    </article>
  );
};

TeamCard.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.object),
    roles: PropTypes.shape({
      required: PropTypes.object,
      filled: PropTypes.object,
      totalSize: PropTypes.number
    }),
    matchScore: PropTypes.number,
    status: PropTypes.string
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onShuffle: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired
};

export default TeamCard;