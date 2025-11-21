import React, { useState, useContext, useCallback, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import HeaderHero from '../components/HeaderHero';
import KPIGrid from '../components/KPIGrid';
import { SAMPLE_COURSES, getLocalCreatedCourses, isSampleEnrolled } from '../utils/sampleCourses';

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

const IconHome = () => (
  <svg {...iconProps}>
    <path d="M3 11l9-7 9 7" />
    <path d="M5.5 9.5V21h5.5v-5h2v5h5.5V9.5" />
  </svg>
);

const IconCourses = () => (
  <svg {...iconProps}>
    <path d="M5 5h12a2 2 0 0 1 2 2v11H7a2 2 0 0 0-2 2V5z" />
    <path d="M5 11h14" />
    <path d="M9 7v4" />
  </svg>
);

const IconCommunity = () => (
  <svg {...iconProps}>
    <path d="M8 10a4 4 0 1 1 8 0" />
    <path d="M4 19a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4" />
    <path d="M3 13h2" />
    <path d="M19 13h2" />
  </svg>
);

const IconMentor = () => (
  <svg {...iconProps}>
    <circle cx="8.5" cy="8.5" r="3" />
    <circle cx="15.5" cy="8.5" r="2.5" />
    <path d="M2.5 19.5a5.5 5.5 0 0 1 11 0" />
    <path d="M13 17a4 4 0 0 1 6 2.5" />
  </svg>
);

const IconJobs = () => (
  <svg {...iconProps}>
    <rect x="3" y="7" width="18" height="11" rx="2" />
    <path d="M9 7V5h6v2" />
    <path d="M3 12h18" />
  </svg>
);

const IconLeaderboard = () => (
  <svg {...iconProps}>
    <path d="M6 21v-8" />
    <path d="M12 21V3" />
    <path d="M18 21v-12" />
    <path d="M8 5h8" />
  </svg>
);

const FEATURE_ICONS = {
  home: <IconHome />,
  courses: <IconCourses />,
  community: <IconCommunity />,
  mentorship: <IconMentor />,
  jobs: <IconJobs />,
  leaderboard: <IconLeaderboard />
};

const NAV_LINKS = [
  { key: 'home', label: 'Home', to: '/home', accent: 'linear-gradient(135deg,#a5b4fc,#6366f1)' },
  { key: 'courses', label: 'Courses', to: '/courses', accent: 'linear-gradient(135deg,#c7d2fe,#7c3aed)' },
  { key: 'community', label: 'Community', to: '/community', accent: 'linear-gradient(135deg,#fecdd3,#f472b6)' },
  { key: 'mentorship', label: 'Mentors', to: '/mentorship', accent: 'linear-gradient(135deg,#bfdbfe,#3b82f6)' },
  { key: 'jobs', label: 'Jobs', to: '/jobs', accent: 'linear-gradient(135deg,#fde68a,#f59e0b)' },
  { key: 'leaderboard', label: 'Leaderboard', to: '/leaderboard', accent: 'linear-gradient(135deg,#fbcfe8,#db2777)' }
];

const QUICK_TILES = [
  { key: 'home', label: 'Home', to: '/home', description: 'Master new drops & livestreams', accent: NAV_LINKS[0].accent },
  { key: 'courses', label: 'Courses', to: '/courses', description: 'Browse cinematic classes', accent: NAV_LINKS[1].accent },
  { key: 'community', label: 'Community', to: '/community', description: 'Critiques & creator clubs', accent: NAV_LINKS[2].accent },
  { key: 'mentorship', label: 'Mentorship', to: '/mentorship', description: 'Book 1:1 expert sessions', accent: NAV_LINKS[3].accent },
  { key: 'jobs', label: 'Jobs', to: '/jobs', description: 'Apply to curated briefs', accent: NAV_LINKS[4].accent }
];

const Shell = styled.main`
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 280px);
  padding-bottom: 4rem;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const HeroCard = styled.section`
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.95);
  padding: clamp(1.5rem, 3vw, 2.75rem);
  box-shadow: 0 35px 80px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.35);
  backdrop-filter: blur(16px);
`;

const QuickSection = styled.section`
  border-radius: 2rem;
  background: #ffffff;
  padding: 1.75rem;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 640px) {
    padding: 1.25rem;
  }
`;

const QuickHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;

  h2 {
    margin: 0.15rem 0 0;
    font-size: 1.35rem;
    color: #0f172a;
  }

  p {
    margin: 0;
    color: #475569;
  }

  span {
    font-size: 0.9rem;
    color: #64748b;
  }
`;

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
`;

const QuickCard = styled(Link)`
  text-decoration: none;
  border-radius: 1.5rem;
  border: 1px solid rgba(99, 102, 241, 0.14);
  padding: 1rem;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, #fff 100%);
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.05);
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  transition: transform 180ms ease, box-shadow 180ms ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    box-shadow: 0 35px 60px rgba(99, 102, 241, 0.18);
    outline: none;
  }
`;

const QuickIcon = styled.span`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  display: inline-flex;
  color: #fff;
  background: ${({ accent }) => accent || 'var(--primary-purple)'};
  flex-shrink: 0;
`;

const QuickLabel = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
`;

const QuickCopy = styled.p`
  margin: 0.35rem 0 0;
  color: #475569;
  font-size: 0.9rem;
`;

const MomentumSection = styled.section`
  border-radius: 2rem;
  background: #0f172a;
  color: #fff;
  padding: 2rem;
  box-shadow: 0 40px 80px rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`;

const MomentumHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  h2 {
    margin: 0;
    font-size: 1.4rem;
  }

  p {
    margin: 0;
    color: rgba(248, 250, 252, 0.75);
  }
`;

const MomentumList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const MomentumItem = styled.li`
  border-radius: 1.25rem;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(226, 232, 240, 0.25);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 180ms ease, border-color 180ms ease;

  &:hover,
  &:focus-within {
    transform: translateY(-2px);
    border-color: rgba(248, 250, 252, 0.65);
  }

  h4 {
    margin: 0;
    font-size: 1rem;
    color: #e2e8f0;
  }
`;

const MomentumValue = styled.span`
  font-size: 2rem;
  font-weight: 700;
`;

const MomentumMeta = styled.p`
  margin: 0;
  color: rgba(248, 250, 252, 0.75);
  font-size: 0.9rem;
`;

const StatusNotice = styled.p`
  margin: 0;
  color: #ef4444;
  font-weight: 600;
`;

const DashboardPage = () => {
  const { user, token, loading } = useContext(AuthContext);
  const [remoteCreatedCourses, setRemoteCreatedCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [error, setError] = useState('');
  const [featuredCourses, setFeaturedCourses] = useState(SAMPLE_COURSES);
  const [isFetching, setIsFetching] = useState(false);
  const [localCreatedCourses, setLocalCreatedCourses] = useState([]);

  useEffect(() => {
    const fetchUserCourses = async () => {
      setIsFetching(true);
      try {
        const res = await axios.get('/api/courses/user/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRemoteCreatedCourses(res.data.createdCourses || []);
        setEnrolledCourses(res.data.enrolledCourses || []);
        setError('');
      } catch (err) {
        setError('Failed to load your courses');
      } finally {
        setIsFetching(false);
      }
    };
    if (user && token) fetchUserCourses();
  }, [user, token]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get('/api/courses');
        const fetched = Array.isArray(res.data) ? res.data : [];
        setFeaturedCourses(fetched.length > 0 ? fetched : SAMPLE_COURSES);
      } catch (err) {
        setFeaturedCourses(SAMPLE_COURSES);
      }
    };
    fetchFeatured();
  }, []);

  const refreshLocalCreatedCourses = useCallback(() => {
    if (!user) return;
    const ownerId = user._id || user.id;
    if (!ownerId) return;
    setLocalCreatedCourses(getLocalCreatedCourses(ownerId));
  }, [user]);

  useEffect(() => {
    refreshLocalCreatedCourses();
  }, [refreshLocalCreatedCourses]);

  useEffect(() => {
    const handleCourseCreated = () => refreshLocalCreatedCourses();
    window.addEventListener('courseCreated', handleCourseCreated);
    return () => window.removeEventListener('courseCreated', handleCourseCreated);
  }, [refreshLocalCreatedCourses]);

  const createdList = useMemo(() => {
    const merged = [...localCreatedCourses, ...remoteCreatedCourses];
    return merged.map((course) => ({
      ...course,
      instructor: course.instructor || { name: course.ownerName || user?.name || 'You' },
      enrolled: true,
      localOnly: Boolean(course.localOnly)
    }));
  }, [localCreatedCourses, remoteCreatedCourses, user?.name]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const kpiCards = [
    {
      label: 'Active classrooms',
      value: createdList.length || 1,
      meta: 'Creators you manage'
    },
    {
      label: 'Inbox',
      value: '3 replies',
      meta: 'Community threads to review'
    },
    {
      label: 'Creator nudges sent',
      value: 24,
      meta: 'This week',
      trend: '+18% vs last week'
    }
  ];

  const heroDescription = isFetching
    ? 'Syncing the latest cohorts and enrollments...'
    : 'Your personalized SkillverseX hub — keep streaks alive, manage cohorts, and explore fresh drops.';

  const momentumCards = [
    {
      key: 'pods',
      title: 'Creator pods',
      value: createdList.length || 0,
      meta: `${localCreatedCourses.length} local • ${remoteCreatedCourses.length} synced`
    },
    {
      key: 'learners',
      title: 'Active enrollments',
      value: enrolledCourses.length || 0,
      meta: 'Learners progressing this week'
    },
    {
      key: 'catalog',
      title: 'Fresh drops bookmarked',
      value: Math.max(1, Math.min(6, featuredCourses.length || SAMPLE_COURSES.length)),
      meta: 'Auto-refreshed from catalog'
    }
  ];

  return (
    <Shell>
      <Content>
        <HeroCard>
          <HeaderHero
            eyebrow="Dashboard"
            title={`Welcome back, ${user.name}`}
            description={heroDescription}
            chips={[{ label: 'Weekly sprint • Build mode' }, { label: 'Goal streak • 30 days' }]}
            actions={[
              { label: 'Create a course', to: '/create-course' },
              { label: 'Browse catalog', to: '/courses', variant: 'ghost' }
            ]}
            rightSlot={<KPIGrid items={kpiCards} />}
          />
          {error && <StatusNotice role="status">{error}</StatusNotice>}
        </HeroCard>

        <QuickSection aria-label="Quick workspace shortcuts">
          <QuickHeader>
            <div>
              <p>Jump back into key hubs</p>
              <h2>Keep momentum across SkillverseX</h2>
            </div>
            <span>{QUICK_TILES.length} destinations</span>
          </QuickHeader>
          <QuickGrid>
            {QUICK_TILES.map((tile) => (
              <QuickCard key={tile.key} to={tile.to}>
                <QuickIcon accent={tile.accent}>{FEATURE_ICONS[tile.key]}</QuickIcon>
                <div>
                  <QuickLabel>{tile.label}</QuickLabel>
                  <QuickCopy>{tile.description}</QuickCopy>
                </div>
              </QuickCard>
            ))}
          </QuickGrid>
        </QuickSection>

        <MomentumSection aria-label="Creator momentum summary">
          <MomentumHeader>
            <h2>Momentum overview</h2>
            <p>Real-time snapshot of your pods, enrollments, and catalog saves.</p>
          </MomentumHeader>
          <MomentumList>
            {momentumCards.map((card) => (
              <MomentumItem key={card.key}>
                <MomentumValue>{card.value}</MomentumValue>
                <h4>{card.title}</h4>
                <MomentumMeta>{card.meta}</MomentumMeta>
              </MomentumItem>
            ))}
          </MomentumList>
        </MomentumSection>
      </Content>
    </Shell>
  );
};

export default DashboardPage;
