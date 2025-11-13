import React from 'react';
import styled from 'styled-components';

// Main container for hero section
const HeroSection = styled.section`
  width: 100%;
  min-height: 88vh;
  background: radial-gradient(circle at top left, rgba(108, 99, 255, 0.35) 0%, transparent 50%),
    radial-gradient(circle at bottom right, rgba(33, 150, 243, 0.3) 0%, transparent 50%),
    linear-gradient(120deg, #201f82 0%, #6C63FF 45%, #0aa5ff 95%);
  color: #f8f9ff;
  position: relative;
  overflow: hidden;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(16, 16, 72, 0.55) 0%, rgba(32, 30, 132, 0.35) 40%, rgba(44, 196, 244, 0.18) 100%);
  mix-blend-mode: screen;
`;

const HeroInner = styled.div`
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  padding: 36px 32px 120px;
  display: flex;
  flex-direction: column;
  gap: 56px;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
`;

const Logo = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.04em;
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
  font-size: 0.95rem;
`;

const NavLink = styled.li`
  color: rgba(240, 242, 255, 0.82);
  cursor: pointer;
  transition: opacity 0.18s;
  &:hover {
    opacity: 1;
  }
`;

const AuthActions = styled.div`
  display: flex;
  gap: 14px;
`;

const OutlineButton = styled.button`
  padding: 0.55rem 1.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #f6f6ff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const FilledButton = styled.button`
  padding: 0.55rem 1.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  background: #f8f9ff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.28);
  }
`;

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 60px;
  align-items: center;
`;

const Content = styled.div`
  max-width: 560px;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.2);
  color: rgba(248, 250, 255, 0.92);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 22px;
`;

const Title = styled.h1`
  font-size: clamp(2.8rem, 4vw, 3.6rem);
  font-weight: 700;
  line-height: 1.08;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(235, 238, 255, 0.82);
  margin-bottom: 32px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  padding: 0.9rem 2.4rem;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  background: linear-gradient(90deg, #fdecff 0%, #fdffff 45%, #f5f8ff 100%);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.22);
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 44px rgba(15, 23, 42, 0.32);
  }
`;

const SecondaryButton = styled.button`
  padding: 0.9rem 2.4rem;
  font-size: 1rem;
  font-weight: 600;
  color: #f8f9ff;
  background: transparent;
  border: 1px solid rgba(248, 250, 255, 0.5);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s;
  &:hover {
    background: rgba(15, 23, 42, 0.25);
    transform: translateY(-3px);
  }
`;

const StatsCard = styled.div`
  margin-top: 44px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 18px;
`;

const Stat = styled.div`
  background: rgba(15, 23, 42, 0.18);
  border-radius: 18px;
  padding: 18px 22px;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: rgba(248, 250, 255, 0.88);
`;

const StatNumber = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  letter-spacing: 0.04em;
`;

const IllustrationWrapper = styled.div`
  position: relative;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IllustrationBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
`;

const Illustration = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  border-radius: 32px;
  padding: 28px;
  background: rgba(248, 250, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 32px 60px rgba(17, 25, 40, 0.38);
  backdrop-filter: blur(10px);
  display: grid;
  gap: 16px;
  color: #f7f9ff;
`;

const IllustrationTitle = styled.div`
  font-weight: 600;
  font-size: 1.05rem;
`;

const IllustrationItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.28);
  border: 1px solid rgba(148, 163, 184, 0.16);
`;

const Hero = () => (
  <HeroSection>
    <GradientOverlay />
    <HeroInner>
      <Navigation>
        <Logo>SkillShare</Logo>
        <NavLinks>
          <NavLink>Browse Courses</NavLink>
          <NavLink>Creators</NavLink>
          <NavLink>Pricing</NavLink>
          <NavLink>Community</NavLink>
        </NavLinks>
        <AuthActions>
          <OutlineButton>Log In</OutlineButton>
          <FilledButton>Get Started</FilledButton>
        </AuthActions>
      </Navigation>

      <HeroContent>
        <Content>
          <Badge>
            <span role="img" aria-label="sparkle">✨</span>
            Learn from expert creators worldwide
          </Badge>
          <Title>Master new skills with real-time AI assistance.</Title>
          <Subtitle>
            Stream premium video lessons, complete guided assignments, and collaborate with a vibrant community.
            Your AI study assistant is on-call whenever you need clarification.
          </Subtitle>
          <ButtonGroup>
            <PrimaryButton>Start Learning</PrimaryButton>
            <SecondaryButton>Become a Creator</SecondaryButton>
          </ButtonGroup>
          <StatsCard>
            <Stat>
              <StatNumber>10K+</StatNumber>
              <StatLabel>Active Learners</StatLabel>
            </Stat>
            <Stat>
              <StatNumber>500+</StatNumber>
              <StatLabel>Premium Courses</StatLabel>
            </Stat>
            <Stat>
              <StatNumber>50+</StatNumber>
              <StatLabel>Expert Creators</StatLabel>
            </Stat>
          </StatsCard>
        </Content>

        <IllustrationWrapper>
          <IllustrationBackdrop />
          <Illustration>
            <IllustrationTitle>React Masterclass</IllustrationTitle>
            <IllustrationItem>
              <span style={{ fontWeight: 600 }}>Lesson 2 · Building dynamic UIs</span>
              <span style={{ fontSize: 13, color: 'rgba(220, 225, 255, 0.75)' }}>Streaming • 28 mins</span>
            </IllustrationItem>
            <IllustrationItem>
              <span style={{ fontWeight: 600 }}>AI Study Assistant</span>
              <span style={{ fontSize: 13, color: 'rgba(220, 225, 255, 0.75)' }}>“Need help? Ask me anything about the class.”</span>
            </IllustrationItem>
            <IllustrationItem>
              <span style={{ fontWeight: 600 }}>Final Project</span>
              <span style={{ fontSize: 13, color: 'rgba(220, 225, 255, 0.75)' }}>Design, build, and deploy a portfolio-ready app.</span>
            </IllustrationItem>
          </Illustration>
        </IllustrationWrapper>
      </HeroContent>
    </HeroInner>
  </HeroSection>
);

export default Hero;
