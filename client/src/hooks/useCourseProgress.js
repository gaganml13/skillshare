import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'skillshare:course-progress';
const TIMESTAMP_KEY = 'skillshare:course-progress-meta';

const clamp = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, number));
};

const readProgress = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
};

const writeProgress = (courseId, value) => {
  if (typeof window === 'undefined' || !courseId) return;
  const current = readProgress();
  current[courseId] = value;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

const readTimestamps = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(TIMESTAMP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
};

const writeTimestamp = (courseId) => {
  if (typeof window === 'undefined' || !courseId) return;
  const current = readTimestamps();
  current[courseId] = Date.now();
  window.localStorage.setItem(TIMESTAMP_KEY, JSON.stringify(current));
};

export const useCourseProgress = (courseId, defaultValue = 0) => {
  const [progress, setProgressState] = useState(() => {
    if (!courseId) return defaultValue;
    const stored = readProgress()[courseId];
    return typeof stored === 'number' ? clamp(stored) : defaultValue;
  });
  const [lastTouched, setLastTouched] = useState(() => {
    if (!courseId) return null;
    return readTimestamps()[courseId] || null;
  });

  useEffect(() => {
    if (!courseId) return;
    const stored = readProgress()[courseId];
    if (typeof stored === 'number') {
      setProgressState(clamp(stored));
    }
    setLastTouched(readTimestamps()[courseId] || null);
  }, [courseId]);

  const setProgress = useCallback((value) => {
    if (!courseId) return;
    const safeValue = clamp(value);
    writeProgress(courseId, safeValue);
    setProgressState(safeValue);
    writeTimestamp(courseId);
    setLastTouched(Date.now());
  }, [courseId]);

  const advanceProgress = useCallback((delta = 10) => {
    if (!courseId) return;
    setProgressState((prev) => {
      const safeValue = clamp(prev + delta);
      writeProgress(courseId, safeValue);
      writeTimestamp(courseId);
      setLastTouched(Date.now());
      return safeValue;
    });
  }, [courseId]);

  const resetProgress = useCallback(() => {
    setProgress(defaultValue);
  }, [defaultValue, setProgress]);

  return {
    progress,
    lastTouched,
    setProgress,
    advanceProgress,
    resetProgress
  };
};
