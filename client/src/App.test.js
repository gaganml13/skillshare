import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders login headline by default', () => {
  render(<App />);
  const headings = screen.getAllByRole('heading', { name: /login/i });
  expect(headings[0]).toBeInTheDocument();
});
