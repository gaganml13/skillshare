import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/ui.css';

const initialState = {
  date: '',
  time: '',
  message: ''
};

/**
 * Accessible modal that keeps focus inside and surfaces mentor context.
 * Relies on parent callbacks so we can handle analytics/toasts outside the component.
 */
const MentorRequestModal = ({ mentor, onClose, onSubmit }) => {
  const [formValues, setFormValues] = useState(initialState);
  const dateRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    dateRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.date || !formValues.time) {
      return;
    }

    onSubmit({
      mentorId: mentor.id,
      mentorName: mentor.name,
      ...formValues
    });
    setFormValues(initialState);
  };

  return (
    <div className="mentor-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="mentor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentor-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mentor-modal__header">
          <div className="mentor-modal__identity">
            <img src={mentor.avatar} alt="" className="mentor-modal__avatar" />
            <div>
              <p className="mentor-modal__eyebrow">Request session with</p>
              <h2 id="mentor-modal-title">{mentor.name}</h2>
              <p className="mentor-modal__role">{mentor.title}</p>
            </div>
          </div>
          <button type="button" className="mentor-modal__close" onClick={onClose} aria-label="Close modal">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form className="mentor-request-form" onSubmit={handleSubmit}>
          <label className="mentor-form-field">
            <span>Date</span>
            <input
              ref={dateRef}
              type="date"
              name="date"
              value={formValues.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="mentor-form-field">
            <span>Preferred time</span>
            <input type="time" name="time" value={formValues.time} onChange={handleChange} required />
          </label>

          <label className="mentor-form-field">
            <span>Message or goals for the session</span>
            <textarea
              name="message"
              value={formValues.message}
              onChange={handleChange}
              rows={4}
              placeholder="Share context, links, or specific questions so your mentor can prep."
            />
          </label>

          <div className="mentor-modal__actions">
            <button type="button" className="mentor-modal__secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="mentor-modal__primary" disabled={!formValues.date || !formValues.time}>
              Send request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

MentorRequestModal.propTypes = {
  mentor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default MentorRequestModal;
