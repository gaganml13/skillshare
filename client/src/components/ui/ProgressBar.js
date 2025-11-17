import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
`;

const ValueBubble = styled.span`
  background: rgba(99, 102, 241, 0.12);
  border-radius: 999px;
  padding: 0.1rem 0.65rem;
  color: var(--color-primary);
  font-size: 0.8rem;
`;

const Track = styled.div`
  width: 100%;
  height: 0.65rem;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.12);
  overflow: hidden;
  position: relative;
`;

const Fill = styled.div`
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(120deg, #6366f1, #8b5cf6);
  transition: width 320ms ease;
  position: relative;
`;

const Marker = styled.span`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #312e81;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.25);
`;

const ProgressBar = ({ value = 0, label = 'Course progress' }) => {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <Wrapper>
      <LabelRow>
        <span>{label}</span>
        <ValueBubble>{safeValue}%</ValueBubble>
      </LabelRow>
      <Track role="progressbar" aria-label={label} aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
        <Fill style={{ width: `${safeValue}%` }} data-testid="progress-fill">
          <Marker aria-hidden="true" />
        </Fill>
      </Track>
    </Wrapper>
  );
};

export default ProgressBar;
