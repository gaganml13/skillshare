// AddLessonForm.js - Form for instructors to add a lesson to a course
import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import VideoUpload from './VideoUpload';

const AddLessonForm = ({ courseId, onLessonAdded }) => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [visibility, setVisibility] = useState('enrolled');
  const [groupName, setGroupName] = useState('');
  const [groupEmails, setGroupEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !videoUrl) {
      setError('Both title and video are required.');
      return;
    }
    if (visibility === 'group' && !groupEmails.trim()) {
      setError('Provide at least one learner email for group visibility.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/courses/${courseId}/lessons`, {
        title,
        videoUrl,
        visibility,
        groupName,
        allowedUserEmails: visibility === 'group'
          ? groupEmails.split(',').map(item => item.trim()).filter(Boolean)
          : []
      }, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setSuccess('Lesson added!');
      setTitle('');
      setVideoUrl('');
      setVisibility('enrolled');
      setGroupName('');
      setGroupEmails('');
      if (onLessonAdded) onLessonAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lesson');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '32px 0', padding: 24, background: '#f7f7fa', borderRadius: 12 }}>
      <h3 style={{ marginBottom: 16 }}>Upload Lesson Video</h3>
      <div style={{ marginBottom: 16 }}>
        <label>Lesson Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', padding: 8 }}
          required
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Lesson Video</label>
        <VideoUpload onUpload={setVideoUrl} videoUrl={videoUrl} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Visibility</label>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="radio"
              name="lesson-visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
            />
            <span>Public to everyone</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="radio"
              name="lesson-visibility"
              value="enrolled"
              checked={visibility === 'enrolled'}
              onChange={() => setVisibility('enrolled')}
            />
            <span>All enrolled learners</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="radio"
              name="lesson-visibility"
              value="group"
              checked={visibility === 'group'}
              onChange={() => setVisibility('group')}
            />
            <span>Share with a specific group</span>
          </label>
        </div>
      </div>
      {visibility === 'group' && (
        <div style={{ marginBottom: 16 }}>
          <label>Group Name (optional)</label>
          <input
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="e.g. Frontend Cohort"
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <label>Allowed learner emails (comma separated)</label>
          <textarea
            value={groupEmails}
            onChange={e => setGroupEmails(e.target.value)}
            placeholder="student1@example.com, student2@example.com"
            rows={3}
            style={{ width: '100%', padding: 8 }}
            required
          />
          <p style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
            We'll match enrolled learners by email to grant them access.
          </p>
        </div>
      )}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 4 }}>
        {loading ? 'Adding...' : 'Add Lesson'}
      </button>
    </form>
  );
};

export default AddLessonForm;
