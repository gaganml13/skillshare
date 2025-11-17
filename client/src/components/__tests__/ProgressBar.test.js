import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressBar from '../ui/ProgressBar';

describe('ProgressBar', () => {
  test('respects aria attributes and value clamping', () => {
    render(<ProgressBar value={120} label="Completion" />);
    const progress = screen.getByRole('progressbar', { name: /completion/i });
    expect(progress).toHaveAttribute('aria-valuenow', '100');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('renders correct fill width', () => {
    render(<ProgressBar value={45} label="Lesson progress" />);
    const fill = screen.getByTestId('progress-fill');
    expect(fill).toHaveStyle({ width: '45%' });
  });
});
