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
  background: #f5f7fb;
  padding-bottom: 4rem;
`;

const NavBar = styled.nav`
  width: 100%;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
`;

const NavInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
`;

const BrandLink = styled(Link)`
  font-weight: 700;
  font-size: 1.1rem;
  color: #312e81;
  text-decoration: none;
`;

const NavCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
`;

const NavChip = styled(Link)`
  text-decoration: none;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 0.45rem 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #0f172a;
  transition: transform 200ms ease, box-shadow 200ms ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    box-shadow: 0 18px 30px rgba(79, 70, 229, 0.2);
  }
`;

const IconBubble = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: ${({ accent }) => accent || 'linear-gradient(135deg,#818cf8,#6366f1)'};
`;

const UserChip = styled.span`
  border-radius: 999px;
  background: #e0e7ff;
  padding: 0.35rem 0.9rem;
  font-weight: 600;
  color: #312e81;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem 0;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const QuickGrid = styled.section`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const QuickCard = styled(Link)`
  text-decoration: none;
  border-radius: 1.75rem;
  background: #fff;
  padding: 1.25rem;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.08);
  color: #0f172a;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 200ms ease, box-shadow 200ms ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-4px);
    box-shadow: 0 30px 55px rgba(15, 23, 42, 0.12);
  }
`;

const QuickLabel = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
`;

const QuickCopy = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
`;

const AsideColumn = styled.aside`
  display: none;
`;

const MobileRailButton = styled.button`
  display: none;
`;

const MobileRailPanel = styled.div`
  display: none;
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
      label: 'Focus minutes logged',
      value: 145,
      meta: 'Past 7 days',
      trend: '+18% vs last week'
    }
  ];
  return (
    <Shell>
      <NavBar>
        <NavInner>
          <BrandLink to="/dashboard">SkillverseX</BrandLink>
          <NavCluster>
            {NAV_LINKS.map((item) => (
              <NavChip key={item.key} to={item.to} aria-label={`Go to ${item.label}`}>
                <IconBubble accent={item.accent}>{FEATURE_ICONS[item.key]}</IconBubble>
                <span>{item.label}</span>
              </NavChip>
            ))}
          </NavCluster>
          <UserChip>{user.name}</UserChip>
        </NavInner>
      </NavBar>

      <Content>
        <Layout>
          <MainColumn>
            <section className="rounded-3xl bg-white/90 p-4 shadow-xl ring-1 ring-slate-100 backdrop-blur sm:p-6">
              <HeaderHero
                eyebrow="Dashboard"
                title={`Welcome back, ${user.name}`}
                description="Your personalized SkillverseX hub — keep streaks alive, manage cohorts, and explore fresh drops."
                chips={[{ label: 'Weekly focus • Deep Work' }, { label: 'Streak goal • 30 days' }]}
                actions={[
                  { label: 'Create a course', to: '/create-course' },
                  { label: 'Browse catalog', to: '/courses', variant: 'ghost' }
                ]}
                rightSlot={<KPIGrid items={kpiCards} />}
              />
            </section>


          </MainColumn>
        </Layout>
      </Content>
    </Shell>
  );
};

export default DashboardPage;
