import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const QuickApplyModal = ({ job, onClose, onSubmit, prefill }) => {
  const [formData, setFormData] = useState({
    name: prefill.name || '',
    email: prefill.email || '',
    message: prefill.message || ''
  });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: prefill.name || prev.name,
      email: prefill.email || prev.email,
      message:
        prefill.message ||
        prev.message ||
        `Hi ${job.company} team — I love what you're building and would be excited to help as ${job.title}.`
    }));
  }, [job, prefill]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      resumeName: resumeFile?.name || prefill.resumeName || '',
      status: 'Applied'
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <header className="modal-card__header">
          <div>
            <p className="eyebrow">Quick apply</p>
            <h2>{job.title}</h2>
            <p className="muted">{job.company} • {job.location}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close quick apply">
            ×
          </button>
        </header>

        <form className="modal-card__body" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Personal note</span>
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
            />
          </label>

          <label className="file-upload">
            <span>Portfolio / Résumé</span>
            <input type="file" onChange={(event) => setResumeFile(event.target.files[0])} />
            <p>{resumeFile?.name || prefill.resumeName || 'Attach PDF or link document'}</p>
          </label>

          <div className="modal-card__actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Submit application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

QuickApplyModal.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  prefill: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    message: PropTypes.string,
    resumeName: PropTypes.string
  })
};

QuickApplyModal.defaultProps = {
  prefill: {}
};

export default QuickApplyModal;
