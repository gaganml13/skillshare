// CourseProgressBar.js - Simple progress bar for course completion
import React from 'react';

const CourseProgressBar = ({ completed = 0, total = 1 }) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div style={{ margin: '16px 0' }}>
      <div style={{ height: 10, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: 10, background: 'linear-gradient(90deg, #6C63FF, #2196F3)', borderRadius: 6, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{percent}% completed</div>
    </div>
  );
};

export default CourseProgressBar;
