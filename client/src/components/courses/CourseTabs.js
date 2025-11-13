// CourseTabs.js - Tabbed interface for course detail page
import React from 'react';

const TABS = ["Overview", "Assignments", "Q&A", "Certificate", "Final Project"];

const CourseTabs = ({ activeTab, setActiveTab }) => (
  <div style={{ display: 'flex', gap: 24, marginBottom: 32, borderBottom: '1px solid #eee' }}>
    {TABS.map(tab => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        style={{
          padding: '10px 24px',
          border: 'none',
          borderBottom: activeTab === tab ? '3px solid #6C63FF' : '3px solid transparent',
          background: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          color: activeTab === tab ? '#6C63FF' : '#222',
          cursor: 'pointer',
          outline: 'none',
          transition: 'border-bottom 0.2s',
        }}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default CourseTabs;
