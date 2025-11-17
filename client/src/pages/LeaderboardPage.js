import React, { useMemo } from 'react';
import styled from 'styled-components';
import HeaderHero from '../components/HeaderHero';
import { getLeaderboard } from '../utils/loadSeeds';

const PageShell = styled.main`
  min-height: 100vh;
  background: #f5f7fb;
  padding-bottom: 4rem;
`;

const Inner = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const LeaderboardCard = styled.div`
  background: #fff;
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RankBadge = styled.span`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(99, 102, 241, 0.12);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #4338ca;
  font-size: 1.2rem;
`;

const Avatar = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
`;

const Score = styled.div`
  margin-left: auto;
  text-align: right;
`;

const LeaderboardPage = () => {
  const leaderboard = useMemo(() => getLeaderboard(), []);
  return (
    <PageShell>
      <Inner>
        <HeaderHero
          eyebrow="Leaderboard"
          title="Top SkillverseX streaks"
          description="Celebrate the creators shipping daily lessons and helping the community grow."
          actions={[{ label: 'Challenge friends', to: '/community' }]}
          stats={[
            { label: 'Active streaks', value: `${leaderboard.length}` },
            { label: 'Avg. points', value: '1.5k' },
            { label: 'Daily sprints', value: '3' }
          ]}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {leaderboard.map((user, index) => (
            <LeaderboardCard key={user.id}>
              <RankBadge>{index + 1}</RankBadge>
              <Avatar src={user.avatar} alt={user.name} />
              <div>
                <h3 style={{ margin: 0 }}>{user.name}</h3>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{user.specialty}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>Lvl {user.level} • {user.xp} xp</p>
              </div>
              <Score>
                <strong>{user.points} pts</strong>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{user.streak}-day streak</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#818cf8' }}>{user.badges.join(', ')}</p>
              </Score>
            </LeaderboardCard>
          ))}
        </div>
      </Inner>
    </PageShell>
  );
};

export default LeaderboardPage;
