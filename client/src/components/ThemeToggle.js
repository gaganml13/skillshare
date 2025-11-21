import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const THEME_STORAGE_KEY = 'theme';

// ThemeToggle flips the root data-theme attribute and keeps the preference in localStorage.
const isDomAvailable = () => typeof document !== 'undefined' && typeof window !== 'undefined';

const applyTheme = (mode) => {
  if (!isDomAvailable()) return;
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
};

const resolveInitialTheme = () => {
  if (!isDomAvailable()) return 'light';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored);
      return stored;
    }
  } catch (error) {
    console.warn('ThemeToggle: unable to read stored theme', error);
  }
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
};

const ThemeToggle = ({ className }) => {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    if (!isDomAvailable()) return;
    applyTheme(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Unable to persist theme preference', error);
    }
  }, [theme]);

  const handleToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  const icon = theme === 'dark' ? '☀️' : '🌙';

  return (
    <button
      type="button"
      className={`theme-toggle ${className ?? ''}`.trim()}
      aria-pressed={theme === 'dark'}
      aria-label={label}
      onClick={handleToggle}
    >
      <span className="theme-toggle__icon" aria-hidden="true">{icon}</span>
      <span className="theme-toggle__label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
};

ThemeToggle.propTypes = {
  className: PropTypes.string
};

ThemeToggle.defaultProps = {
  className: ''
};

export default ThemeToggle;
