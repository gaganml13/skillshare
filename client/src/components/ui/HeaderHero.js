import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Shell = styled.header`
  position: relative;
  padding: clamp(2.5rem, 4vw, 4.5rem) clamp(1.25rem, 6vw, 4.5rem);
  border-radius: 2.5rem;
  background: ${(props) => props.$background};
  color: #fff;
  overflow: hidden;
  box-shadow: 0 40px 90px rgba(15, 23, 42, 0.25);
`;

const Glow = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.18), transparent 45%),
    radial-gradient(circle at 80% -20%, rgba(94, 234, 212, 0.35), transparent 55%);
`;

const HeroGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 3rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: center;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Eyebrow = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const Title = styled.h1`
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1.1;
  margin: 0;
`;

const Description = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.05rem;
  max-width: 640px;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.2);
  font-size: 0.85rem;
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const HeroButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  border-radius: 999px;
  font-weight: 600;
  padding: 0.85rem 1.6rem;
  color: ${(props) => (props.$variant === 'ghost' ? 'rgba(255,255,255,0.9)' : '#0f172a')};
  background: ${(props) => (props.$variant === 'ghost' ? 'transparent' : '#fff')};
  border: ${(props) => (props.$variant === 'ghost' ? '1px solid rgba(255,255,255,0.35)' : 'none')};
  transition: transform 220ms ease, box-shadow 220ms ease;
  box-shadow: ${(props) => (props.$variant === 'ghost' ? 'none' : '0 20px 35px rgba(15, 23, 42, 0.22)')};

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  background: rgba(15, 23, 42, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1.25rem;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatValue = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
`;

const IllustrationSlot = styled.div`
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderHero = ({
  eyebrow,
  title,
  description,
  chips = [],
  actions = [],
  stats = [],
  rightSlot = null,
  children,
  background = 'linear-gradient(120deg, #1a1735 0%, #4338ca 55%, #6366f1 100%)'
}) => {
  return (
    <Shell $background={background}>
      <Glow />
      <HeroGrid>
        <Content>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Title>{title}</Title>
          {description && <Description>{description}</Description>}
          {chips.length > 0 && (
            <ChipRow>
              {chips.map((chip) => (
                <Chip key={chip.label || chip}>{chip.icon && <span>{chip.icon}</span>}{chip.label || chip}</Chip>
              ))}
            </ChipRow>
          )}
          {children}
          {actions.length > 0 && (
            <Actions>
              {actions.map((action) => {
                const Component = action.to ? Link : action.href ? 'a' : 'button';
                const buttonProps = {
                  key: action.label,
                  as: Component,
                  $variant: action.variant,
                  'aria-label': action.ariaLabel || action.label,
                  onClick: action.onClick
                };
                if (action.to) buttonProps.to = action.to;
                if (action.href) {
                  buttonProps.href = action.href;
                  if (action.target) buttonProps.target = action.target;
                  if (action.rel) buttonProps.rel = action.rel;
                }
                buttonProps.type = action.type || (Component === 'button' ? 'button' : undefined);
                return (
                  <HeroButton {...buttonProps}>
                    {action.icon && <span aria-hidden="true">{action.icon}</span>}
                    {action.label}
                  </HeroButton>
                );
              })}
            </Actions>
          )}
          {stats.length > 0 && (
            <StatsGrid>
              {stats.map((stat) => (
                <StatCard key={stat.label}>
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatCard>
              ))}
            </StatsGrid>
          )}
        </Content>
        {rightSlot && <IllustrationSlot>{rightSlot}</IllustrationSlot>}
      </HeroGrid>
    </Shell>
  );
};

export default HeaderHero;
