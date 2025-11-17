import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const initialFormState = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  capacity: '',
  skills: '',
  mode: 'remote'
};

const requiredFields = ['title', 'description', 'date', 'time', 'location', 'capacity', 'skills'];

// CreateEventModal collects structured event data and traps focus while open
const CreateEventModal = ({ isOpen, onClose, onSubmit }) => {
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
        const nodes = Array.from(focusable).filter((node) => !node.hasAttribute('disabled'));
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormState(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  const normalizedSkills = useMemo(() => (
    formState.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
  ), [formState.skills]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (!formState[field]?.trim()) {
        nextErrors[field] = 'Required field';
      }
    });
    if (Number(formState.capacity) < 1) {
      nextErrors.capacity = 'Capacity must be at least 1';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: formState.title,
      description: formState.description,
      date: formState.date,
      time: formState.time,
      location: formState.location,
      mode: formState.mode,
      capacity: Number(formState.capacity),
      skillsRequired: normalizedSkills
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create a community event">
      <div className="modal-card create-event-modal" ref={dialogRef}>
        <header className="create-event-modal__header">
          <div>
            <p className="create-event-modal__eyebrow">Host a drop-in</p>
            <h3>Plan a new event</h3>
            <p>Outline the basics—members can see it instantly.</p>
          </div>
          <button type="button" className="icon-btn" aria-label="Close create event modal" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="create-event-form" onSubmit={handleSubmit}>
          <label>
            <span>Title*</span>
            <input
              ref={firstFieldRef}
              name="title"
              value={formState.title}
              onChange={handleChange}
              required
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </label>

          <label>
            <span>Description*</span>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows={4}
              required
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </label>

          <div className="create-event-form__grid">
            <label>
              <span>Date*</span>
              <input type="date" name="date" value={formState.date} onChange={handleChange} required />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </label>
            <label>
              <span>Time*</span>
              <input type="time" name="time" value={formState.time} onChange={handleChange} required />
              {errors.time && <span className="form-error">{errors.time}</span>}
            </label>
          </div>

          <label>
            <span>Location*</span>
            <input name="location" value={formState.location} onChange={handleChange} placeholder="Remote • Zoom" required />
            {errors.location && <span className="form-error">{errors.location}</span>}
          </label>

          <label>
            <span>Capacity*</span>
            <input type="number" name="capacity" min="1" value={formState.capacity} onChange={handleChange} required />
            {errors.capacity && <span className="form-error">{errors.capacity}</span>}
          </label>

          <label>
            <span>Skills required*</span>
            <input
              name="skills"
              value={formState.skills}
              onChange={handleChange}
              placeholder="Comma separated list"
              required
            />
            {errors.skills && <span className="form-error">{errors.skills}</span>}
            <small>{normalizedSkills.join(' · ') || 'Add the skill focus for this session.'}</small>
          </label>

          <fieldset className="create-event-form__mode">
            <legend>Format</legend>
            <div className="events-filter-toggle">
              <button
                type="button"
                className={formState.mode === 'remote' ? 'ghost-btn is-active' : 'ghost-btn'}
                onClick={() => setFormState((prev) => ({ ...prev, mode: 'remote' }))}
              >
                Remote
              </button>
              <button
                type="button"
                className={formState.mode === 'hybrid' ? 'ghost-btn is-active' : 'ghost-btn'}
                onClick={() => setFormState((prev) => ({ ...prev, mode: 'hybrid' }))}
              >
                Hybrid / In-person
              </button>
            </div>
          </fieldset>

          <div className="create-event-form__actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Publish event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateEventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default CreateEventModal;