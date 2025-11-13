// CreateCoursePage.js - Page for instructors to create a new course
import React, { useState } from 'react';
import VideoUpload from '../components/courses/VideoUpload';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateCoursePage = () => {
  // State for form fields
  const [title, setTitle] = useState(''); // Course title
  const [description, setDescription] = useState(''); // Course description
  const [category, setCategory] = useState(''); // Course category
  const [price, setPrice] = useState(0); // Course price
  const [access, setAccess] = useState('public'); // Course access
  const [error, setError] = useState(''); // Error message
  const [videoUrl, setVideoUrl] = useState(''); // Video URL for preview
  const navigate = useNavigate(); // For navigation after submission

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token'); // Get user token from localStorage
    if (!token) {
      setError('You must be logged in to create a course.');
      return;
    }
    try {
      // Send POST request to backend with course data and auth token
      await axios.post('/api/courses', {
        title,
        description,
        category,
        price,
        access,
        lessons: videoUrl ? [{ title: 'Lesson 1', videoUrl }] : [],
      }, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      // On success, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  // Render the course creation form
  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, boxShadow: '0 2px 8px #eee', borderRadius: 8 }}>
      <h2>Create New Course</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Category</label>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Price</label>
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required min={0} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Access</label>
          <select value={access} onChange={e => setAccess(e.target.value)} style={{ width: '100%', padding: 8 }}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Upload Video</label>
          <VideoUpload onUpload={setVideoUrl} videoUrl={videoUrl} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 4 }}>Create Course</button>
      </form>
    </div>
  );
};

export default CreateCoursePage;

/*
Code Description:
- useState: Manages form field state for title, description, category, price, and error.
- useNavigate: Used to redirect user after successful course creation.
- handleSubmit: Handles form submission, sends POST request to backend with course data and auth token, navigates to dashboard on success.
- axios: Used for making HTTP requests to backend API.
- The form collects course details and displays errors if any.
*/
