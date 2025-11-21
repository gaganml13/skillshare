import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const sorters = {
  points: (a, b) => b.points - a.points,
  streak: (a, b) => b.streak - a.streak,
  xp: (a, b) => b.xp - a.xp
};

const sortOptions = [
  { value: 'points', label: 'Points' },
  { value: 'streak', label: 'Streak' },
  { value: 'xp', label: 'XP' }
];

const StyledLeaderboard = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
`;

const ControlsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: var(--space-lg);
  box-shadow: var(--shadow-xs);
`;

const ControlField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--text-muted);
`;

const ControlInput = styled.input`
  border-radius: 999px;
  border: 1px solid var(--border);
  padding: 0.65rem 1rem;
  background: var(--surface-muted);
  font-size: 0.95rem;
`;

const ControlSelect = styled.select`
  border-radius: 999px;
  border: 1px solid var(--border);
  padding: 0.65rem 1rem;
  background: var(--surface);
  font-size: 0.95rem;
`;

const LeaderList = styled.div`
  display: grid;
  gap: var(--space-md);
`;

const LeaderRow = styled.article`
  display: grid;
  grid-template-columns: auto 48px minmax(220px, 1fr) auto auto;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-xs);
`;

const RankBadge = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--shadow-sm);
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Muted = styled.span`
  color: var(--text-muted);
  font-size: 0.85rem;
`;

const BadgeGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

const BadgePill = styled.span`
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(93, 95, 239, 0.12);
  color: var(--primary);
`;

const ScoreGroup = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: var(--text-muted);
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
`;

const TrackChip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: rgba(15, 23, 42, 0.08);
  color: var(--text-muted);
  width: fit-content;
`;

const Leaderboard = ({ entries }) => {
  const [sortBy, setSortBy] = useState('points');
  const [focus, setFocus] = useState('all');
  const [query, setQuery] = useState('');
  const [dailySprintOnly, setDailySprintOnly] = useState(false);

  const tracks = useMemo(() => {
    const unique = new Set(entries.map((entry) => entry.track || 'all'));
    return ['all', ...Array.from(unique)].filter(Boolean);
  }, [entries]);

  const decoratedEntries = useMemo(() => {
    const filtered = entries
      .filter((entry) => (focus === 'all' ? true : entry.track === focus))
      .filter((entry) => (!dailySprintOnly ? true : Boolean(entry.dailySprint)))
      .filter((entry) => entry.name.toLowerCase().includes(query.toLowerCase()));
    return filtered
      .slice()
      .sort(sorters[sortBy] || sorters.points)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        badges: entry.badges || []
      }));
  }, [entries, focus, query, sortBy, dailySprintOnly]);

  const handleFollow = (maker) => {
    window.alert(`Followed ${maker.name}!`);
  };

  const handleChallenge = (maker) => {
    window.alert(`Challenge invite sent to ${maker.name}.`);
  };

  return (
    <StyledLeaderboard aria-label="Community leaderboard">
      <ControlsBar>
        <button
          type="button"
          className={`ghost-btn${dailySprintOnly ? ' is-active' : ''}`}
          onClick={() => setDailySprintOnly((prev) => !prev)}
        >
          Daily sprint
        </button>
        <ControlField>
          <span className="sr-only">Search members</span>
          <ControlInput
            type="search"
            placeholder="Search makers"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </ControlField>
        <ControlField>
          <span className="sr-only">Sort by</span>
          <ControlSelect value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </ControlSelect>
        </ControlField>
        <ControlField>
          <span className="sr-only">Filter track</span>
          <ControlSelect value={focus} onChange={(event) => setFocus(event.target.value)}>
            {tracks.map((track) => (
              <option key={track} value={track}>{track === 'all' ? 'All tracks' : track}</option>
            ))}
          </ControlSelect>
        </ControlField>
      </ControlsBar>

      <LeaderList>
        {decoratedEntries.map((entry) => (
          <LeaderRow key={entry.id}>
            <RankBadge>#{entry.rank}</RankBadge>
            <Avatar src={entry.avatar || `https://i.pravatar.cc/120?u=${entry.id}`} alt={`${entry.name} avatar`} />
            <Body>
              <strong>{entry.name}</strong>
              <Muted>Lvl {entry.level} • {entry.xp} xp</Muted>
              <BadgeGroup>
                {entry.badges.map((badge) => (
                  <BadgePill key={badge}>{badge}</BadgePill>
                ))}
              </BadgeGroup>
              {entry.track && <TrackChip>{entry.track}</TrackChip>}
            </Body>
            <ScoreGroup>
              <strong>{entry.points} pts</strong>
              <span>{entry.streak}-day streak</span>
            </ScoreGroup>
            <ActionGroup>
              <button type="button" className="ghost-btn" onClick={() => handleFollow(entry)}>Follow</button>
              <button type="button" className="primary-btn" onClick={() => handleChallenge(entry)}>Challenge</button>
            </ActionGroup>
          </LeaderRow>
        ))}
        {!decoratedEntries.length && <p className="muted">No makers yet.</p>}
      </LeaderList>
    </StyledLeaderboard>
  );
};

Leaderboard.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    level: PropTypes.number,
    xp: PropTypes.number,
    points: PropTypes.number,
    streak: PropTypes.number,
    badges: PropTypes.arrayOf(PropTypes.string),
    track: PropTypes.string
  }))
};

Leaderboard.defaultProps = {
  entries: []
};

export default Leaderboard;
