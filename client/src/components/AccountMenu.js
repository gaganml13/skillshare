import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../utils/loadSeeds';

// Lightweight toast helper keeps DOM manipulation isolated to this component.
const createToast = (message) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const toast = document.createElement('div');
  toast.className = 'ui-toast';
  toast.role = 'status';
  toast.textContent = message;
  document.body.appendChild(toast);
  window.requestAnimationFrame(() => {
    toast.classList.add('ui-toast--visible');
  });
  setTimeout(() => {
    toast.classList.remove('ui-toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 2400);
};

const AccountMenu = ({ isOpen, anchorRef, onClose, user }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const firstItemRef = useRef(null);

  const menuItems = useMemo(
    () => [
      { id: 'profile', label: 'My Profile', to: '/my-profile' },
      { id: 'account', label: 'Account Settings', to: '/account' },
      { id: 'password', label: 'Change Password', to: '/account#password' },
      { id: 'downloads', label: 'Downloads', to: '/downloads' },
      { id: 'email', label: 'Email Preferences', to: '/account#email-preferences' },
      { id: 'feedback', label: 'Feedback', to: '/account#feedback' }
    ],
    []
  );

  // Manage outside clicks and focus return for keyboard users.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      if (anchorRef?.current && anchorRef.current.contains(event.target)) return;
      onClose();
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        anchorRef?.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    const timer = setTimeout(() => firstItemRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      clearTimeout(timer);
    };
  }, [anchorRef, isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  // Logout flow mirrors spec: API call, local clearance, toast, redirect.
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.info('account-menu: logout fallback engaged', error);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth');
    }
    createToast('Successfully signed out');
    onClose();
    setTimeout(() => {
      navigate('/login');
      // Server-side session cookies (if any) are invalidated via /api/logout response.
    }, 900);
  };

  return (
    <div
      className="account-menu"
      role="menu"
      aria-label="Account quick links"
      ref={menuRef}
      tabIndex={-1}
    >
      <div className="account-menu__header">
        <div className="account-menu__avatar" aria-hidden="true">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="account-menu__name">{user?.displayName || user?.name || 'Member'}</p>
          <p className="account-menu__email">{user?.email || 'user@example.com'}</p>
        </div>
      </div>
      <ul className="account-menu__list">
        {menuItems.map((item, idx) => (
          <li key={item.id}>
            <button
              type="button"
              className="account-menu__item"
              onClick={() => handleNavigate(item.to)}
              ref={idx === 0 ? firstItemRef : undefined}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="account-menu__logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

AccountMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchorRef: PropTypes.shape({ current: PropTypes.any }),
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    displayName: PropTypes.string,
    email: PropTypes.string
  })
};

AccountMenu.defaultProps = {
  anchorRef: null,
  user: null
};

export default AccountMenu;
