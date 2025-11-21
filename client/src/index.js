import './styles/ui.css';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Apply the saved or preferred theme before React hydrates to avoid flashes.
const THEME_STORAGE_KEY = 'theme';
const getPreferredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.body.dataset.theme = 'dark';
  } else {
    delete document.body.dataset.theme;
  }
};

applyTheme(getPreferredTheme());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
