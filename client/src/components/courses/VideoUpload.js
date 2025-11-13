// VideoUpload.js - Simple video upload component (simulated upload)
import React, { useRef } from 'react';

const VideoUpload = ({ onUpload, videoUrl }) => {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Simulate upload: create a local URL (replace with real upload logic as needed)
    const url = URL.createObjectURL(file);
    onUpload(url);
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ marginBottom: 8 }}
      />
      {videoUrl && (
        <video src={videoUrl} controls width="320" style={{ display: 'block', marginTop: 8 }} />
      )}
    </div>
  );
};

export default VideoUpload;
