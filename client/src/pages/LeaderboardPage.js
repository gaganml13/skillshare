import React, { useMemo } from 'react';
import styled from 'styled-components';
import Leaderboard from '../components/Leaderboard';
import { getLeaderboard } from '../utils/loadSeeds';

const PageShell = styled.main`
  background: var(--background);
  min-height: 100vh;
  padding: clamp(1.5rem, 4vw, 2.6rem) 1.25rem 4rem;
`;

const PageContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
`;

const HeroBanner = styled.section`
  border-radius: var(--radius-xl);
  padding: clamp(1.75rem, 3vw, 2.5rem);
  background: linear-gradient(135deg, rgba(93, 95, 239, 0.12), rgba(56, 189, 248, 0.12));
  border: 1px solid rgba(93, 95, 239, 0.25);
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
`;

const HeroStats = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  color: var(--text-muted);

  li {
    min-width: 120px;
  }

  strong {
    display: block;
    font-size: 1.35rem;
    color: var(--text-primary);
  }
`;

const HeroMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 1rem;
  color: var(--text-muted);
`;

const Label = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: var(--text-muted);
`;

const LeaderboardPage = () => {
  const leaderboard = useMemo(() => getLeaderboard(), []);
  const totalSprint = leaderboard.filter((entry) => entry.dailySprint).length;
  const topScore = leaderboard.reduce((max, entry) => Math.max(max, entry.points || 0), 0);

  return (
    <PageShell>
      <PageContent>
        <HeroBanner>
          <HeroMeta>
            <Label>Leaderboard</Label>
            <h1 style={{ margin: 0 }}>Daily sprint leaders</h1>
            <Subtitle>Follow the makers stacking streaks, finishing prompts, and sparking the community every morning.</Subtitle>
          </HeroMeta>
          <HeroStats>
            <li>
              <strong>{leaderboard.length}</strong>
              <span>Makers ranked</span>
            </li>
            <li>
              <strong>{topScore}</strong>
              <span>Top score</span>
            </li>
            <li>
              <strong>{totalSprint}</strong>
              <span>Daily sprinters</span>
            </li>
          </HeroStats>
        </HeroBanner>
        <Leaderboard entries={leaderboard} />
      </PageContent>
    </PageShell>
  );
};

export default LeaderboardPage;
