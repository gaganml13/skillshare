import React from 'react';
import styled from 'styled-components';

const PillRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PillButton = styled.button`
  border-radius: 999px;
  border: 1px solid ${(props) => (props.$active ? 'transparent' : 'rgba(99, 102, 241, 0.4)')};
  background: ${(props) => (props.$active ? 'linear-gradient(120deg, #6366f1, #8b5cf6)' : 'rgba(99, 102, 241, 0.08)')};
  color: ${(props) => (props.$active ? '#fff' : '#312e81')};
  font-weight: 600;
  padding: 0.45rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: transform 200ms ease, box-shadow 200ms ease;
  box-shadow: ${(props) => (props.$active ? '0 8px 18px rgba(99, 102, 241, 0.35)' : 'none')};

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
  }
`;

const FilterPills = ({ options = [], active, onChange }) => {
  return (
    <PillRow role="tablist" aria-label="Category filters">
      {options.map((option) => (
        <PillButton
          key={option.value || option}
          type="button"
          $active={(option.value || option) === active}
          aria-pressed={(option.value || option) === active}
          onClick={() => onChange(option.value || option)}
        >
          {option.label || option}
        </PillButton>
      ))}
    </PillRow>
  );
};

export default FilterPills;
