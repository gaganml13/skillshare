import React from 'react';
import styled from 'styled-components';

const HeroSection = styled.section`
  width: 100%;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(247,247,250,0.85);
  z-index: 1;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const Heading = styled.h1`
  font-size: 2.7rem;
  font-weight: 700;
  color: var(--primary-purple);
  margin-bottom: 1.2rem;
`;

const Subheading = styled.p`
  font-size: 1.2rem;
  color: var(--text-dark);
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: center;
`;

const PrimaryBtn = styled.button`
  background: var(--primary-purple);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.8rem 2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(108,99,255,0.08);
  transition: background 0.2s;
  &:hover {
    background: var(--primary-blue);
  }
`;

const SecondaryBtn = styled.button`
  background: transparent;
  color: var(--primary-purple);
  border: 2px solid var(--primary-purple);
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.8rem 2rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: var(--primary-purple);
    color: #fff;
  }
`;

const Hero = () => (
  <HeroSection>
    <Overlay />
    <Content>
      <Heading>Master New Skills from Expert Creators</Heading>
      <Subheading>
        Discover thousands of courses, connect with top creators, and unlock your potential. Whether you want to learn or teach, SkillShare is your platform for growth.
      </Subheading>
      <ButtonGroup>
        <PrimaryBtn>Start Learning</PrimaryBtn>
        <SecondaryBtn>Become a Creator</SecondaryBtn>
      </ButtonGroup>
    </Content>
  </HeroSection>
);

export default Hero;
