import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const PLACEHOLDER_POSTER = 'https://dummyimage.com/640x360/111827/ffffff&text=Video+Preview';

const formatBytes = (bytes) => {
  if (!bytes) return '0 MB';
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
};

const VideoUpload = ({ value, onChange, label = 'Upload lesson video' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const previewSource = useMemo(() => value?.previewUrl || value?.remoteUrl || '', [value?.previewUrl, value?.remoteUrl]);

  const uploadToServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'lesson-video');
    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });
    return response.data?.url;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError('');
    const previewUrl = URL.createObjectURL(file);
    const baseAsset = {
      file,
      name: file.name,
      size: file.size,
      previewUrl
    };
    onChange?.(baseAsset);

    try {
      setUploading(true);
      const remoteUrl = await uploadToServer(file);
      onChange?.({ ...baseAsset, remoteUrl });
      setUploadError('');
    } catch (serverError) {
      console.info('VideoUpload: falling back to local preview', serverError);
      setUploadError('Preview ready. Upload service unavailable right now.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-indigo-200"
        />
      </label>

      {value?.name && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <div>
            <p className="font-semibold text-slate-800">{value.name}</p>
            <p className="text-xs text-slate-500">{formatBytes(value.size)}</p>
          </div>
          {uploading ? (
            <span className="text-xs font-semibold text-indigo-600">
              Uploading… {uploadProgress}%
            </span>
          ) : (
            <span className="text-xs text-emerald-600">Ready</span>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black/80">
        {previewSource ? (
          <video
            className="h-48 w-full object-cover"
            src={previewSource}
            poster={PLACEHOLDER_POSTER}
            controls
          />
        ) : (
          <div className="flex h-48 items-center justify-center bg-slate-900 text-sm text-slate-100">
            Video preview will appear here
          </div>
        )}
      </div>

      {uploadError && <p className="text-sm text-amber-600">{uploadError}</p>}
    </div>
  );
};

export default VideoUpload;
