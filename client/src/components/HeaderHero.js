import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import ButtonPill from './ui/ButtonPill';
import KPIGrid from './KPIGrid';

const Shell = styled.header`
  position: relative;
  padding: clamp(2.5rem, 4vw, 4.5rem) clamp(1.25rem, 6vw, 4.5rem);
  border-radius: 2.5rem;
  background: ${({ $background }) => $background};
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
  gap: 2.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: stretch;
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

const RightSlot = styled.div`
  min-height: 100%;
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
  const slot = rightSlot || (stats.length > 0 ? <KPIGrid items={stats} /> : null);

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
                <Chip key={chip.label || chip}>
                  {chip.icon && <span>{chip.icon}</span>}
                  {chip.label || chip}
                </Chip>
              ))}
            </ChipRow>
          )}
          {children}
          {actions.length > 0 && (
            <Actions>
              {actions.map((action) => {
                const Component = action.to ? Link : action.href ? 'a' : 'button';
                const props = {
                  as: Component,
                  key: action.label,
                  variant: action.variant === 'ghost' ? 'ghost' : 'solid',
                  'aria-label': action.ariaLabel || action.label,
                  onClick: action.onClick,
                  type: action.type || (Component === 'button' ? 'button' : undefined)
                };
                if (action.to) props.to = action.to;
                if (action.href) {
                  props.href = action.href;
                  if (action.target) props.target = action.target;
                  if (action.rel) props.rel = action.rel;
                }
                // Remove key from props object to avoid spreading it
                const { key, ...restProps } = props;

                return (
                  <ButtonPill key={key} {...restProps}>
                    {action.icon && <span aria-hidden="true">{action.icon}</span>}
                    {action.label}
                  </ButtonPill>
                );
              })}
            </Actions>
          )}
        </Content>
        {slot && <RightSlot>{slot}</RightSlot>}
      </HeroGrid>
    </Shell>
  );
};

export default HeaderHero;
