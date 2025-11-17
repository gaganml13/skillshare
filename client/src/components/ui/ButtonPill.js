import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  border: ${({ $variant }) => ($variant === 'ghost' ? '1px solid rgba(255,255,255,0.35)' : 'none')};
  background: ${({ $variant }) => ($variant === 'ghost'
    ? 'rgba(15, 23, 42, 0.1)'
    : 'linear-gradient(120deg, #fffbeb, #ffffff)')};
  color: ${({ $variant }) => ($variant === 'ghost' ? '#f8fafc' : '#0f172a')};
  font-weight: 600;
  padding: 0.85rem 1.6rem;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.95rem;
  box-shadow: ${({ $variant }) => ($variant === 'ghost' ? 'none' : '0 20px 35px rgba(15, 23, 42, 0.22)')};
  transition: transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ButtonPill = React.forwardRef(({ children, variant = 'solid', ...rest }, ref) => (
  <StyledButton ref={ref} $variant={variant} {...rest}>
    {children}
  </StyledButton>
));

ButtonPill.displayName = 'ButtonPill';

export default ButtonPill;
