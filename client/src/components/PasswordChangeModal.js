import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { getUserPasswordHash, updateUserPassword } from '../utils/loadSeeds';

// Basic reversible "hash" purely for demo; replace with server hashing in prod.
const hashPassword = (value = '') => {
  if (typeof window === 'undefined') return value;
  try {
    return window.btoa(unescape(encodeURIComponent(value)));
  } catch (error) {
    console.info('password-modal: unable to encode password', error);
    return value;
  }
};

const PasswordChangeModal = ({ isOpen, onClose }) => {
  const [formState, setFormState] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const modalRef = useRef(null);
  const firstFieldRef = useRef(null);
  const storedHashRef = useRef('');

  useEffect(() => {
    getUserPasswordHash().then((hash) => {
      storedHashRef.current = hash || '';
    });
  }, []);

  // Trap focus inside the modal when it is open for keyboard accessibility.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.activeElement;
    const focusFirstField = setTimeout(() => firstFieldRef.current?.focus(), 10);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        previous?.focus();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const nodes = Array.from(focusableElements);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusFirstField);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateForm = () => {
    if (formState.next.length < 8) {
      setStatus({ type: 'error', message: 'New password needs at least 8 characters.' });
      return false;
    }
    if (formState.next !== formState.confirm) {
      setStatus({ type: 'error', message: 'Confirmation does not match.' });
      return false;
    }
    const hashedCurrent = hashPassword(formState.current);
    if (storedHashRef.current && hashedCurrent !== storedHashRef.current) {
      setStatus({ type: 'error', message: 'Current password is incorrect.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    if (!validateForm()) return;
    const newHash = hashPassword(formState.next);
    await updateUserPassword(newHash);
    storedHashRef.current = newHash;
    setStatus({ type: 'success', message: 'Password updated locally.' });
    console.log('Password change simulated', new Date().toISOString());
    setFormState({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        ref={modalRef}
      >
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">Security</p>
            <h2 id="password-modal-title">Change password</h2>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </header>
        <form className="modal__body" onSubmit={handleSubmit}>
          <label className="form-field">
            Current password
            <input
              ref={firstFieldRef}
              type="password"
              name="current"
              value={formState.current}
              onChange={(event) => setFormState((prev) => ({ ...prev, current: event.target.value }))}
              autoComplete="current-password"
              required={Boolean(storedHashRef.current)}
            />
          </label>
          <label className="form-field">
            New password
            <input
              type="password"
              name="next"
              value={formState.next}
              onChange={(event) => setFormState((prev) => ({ ...prev, next: event.target.value }))}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className="form-field">
            Confirm password
            <input
              type="password"
              name="confirm"
              value={formState.confirm}
              onChange={(event) => setFormState((prev) => ({ ...prev, confirm: event.target.value }))}
              autoComplete="new-password"
              required
            />
          </label>
          {status.message && (
            <p className={`form-status form-status--${status.type}`} role="alert">
              {status.message}
            </p>
          )}
          <div className="modal__actions">
            <button type="submit" className="btn btn--primary">
              Save password
            </button>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PasswordChangeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PasswordChangeModal;
