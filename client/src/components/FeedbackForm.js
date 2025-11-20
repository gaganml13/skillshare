import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { saveFeedback } from '../utils/loadSeeds';

const showToast = (message) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const toast = document.createElement('div');
  toast.className = 'ui-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  window.requestAnimationFrame(() => toast.classList.add('ui-toast--visible'));
  setTimeout(() => {
    toast.classList.remove('ui-toast--visible');
    setTimeout(() => toast.remove(), 250);
  }, 2200);
};

const FeedbackForm = ({ onSubmitted }) => {
  const [formState, setFormState] = useState({ category: 'general', message: '' });
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setScreenshotPreview('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result?.toString() || '');
    };
    reader.readAsDataURL(file);
  };

  // Handle submit locally and surface feedback history via parent callback.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.message.trim()) {
      setFormStatus({ type: 'error', message: 'Feedback message is required.' });
      return;
    }
    setSubmitting(true);
    const payload = {
      category: formState.category,
      message: formState.message.trim(),
      screenshot: screenshotPreview || null,
      createdAt: new Date().toISOString()
    };
    const saved = await saveFeedback(payload);
    console.log('Feedback form submitted', new Date().toISOString());
    setFormStatus({ type: 'success', message: 'Thanks! Your feedback is saved locally.' });
    showToast('Feedback captured');
    setFormState({ category: 'general', message: '' });
    setScreenshotPreview('');
    setSubmitting(false);
    if (onSubmitted) {
      onSubmitted(saved);
    }
  };

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <label className="form-field">
        Category
        <select
          value={formState.category}
          onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
        >
          <option value="general">General</option>
          <option value="bug">Bug</option>
          <option value="idea">Product idea</option>
          <option value="praise">Praise</option>
        </select>
      </label>
      <label className="form-field">
        Feedback
        <textarea
          value={formState.message}
          onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
          rows={4}
          required
          aria-required="true"
        />
      </label>
      <label className="form-field">
        Screenshot (optional)
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>
      {screenshotPreview && (
        <div className="feedback-form__preview" aria-live="polite">
          <img src={screenshotPreview} alt="Screenshot preview" />
        </div>
      )}
      {formStatus.message && (
        <p className={`form-status form-status--${formStatus.type}`} role="status">
          {formStatus.message}
        </p>
      )}
      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? 'Saving…' : 'Submit feedback'}
      </button>
    </form>
  );
};

FeedbackForm.propTypes = {
  onSubmitted: PropTypes.func
};

FeedbackForm.defaultProps = {
  onSubmitted: null
};

export default FeedbackForm;
