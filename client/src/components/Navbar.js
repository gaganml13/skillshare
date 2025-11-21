import React, { useContext, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AccountMenu from './AccountMenu';
import ThemeToggle from './ThemeToggle';
import BrandLogo from '../assets/brand-logo.svg';

// Navbar surfaces the primary routes, profile menu, and theme toggle using CSS variables.
const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/community', label: 'Community' },
  { to: '/mentorship', label: 'Mentorship' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/events', label: 'Events' },
  { to: '/account', label: 'Account' }
];

const Navbar = () => {
  const { user, loading } = useContext(AuthContext);
  const accountButtonRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) return null;

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <div className="site-nav__brand">
        <Link to="/home" className="site-nav__logo">
          <img src={BrandLogo} alt="SkillverseX logo" className="site-nav__logo-img" />
          SkillverseX
        </Link>
      </div>
      <ul className="site-nav__links">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="site-nav__actions">
        <ThemeToggle />
        {user ? (
          <div className="nav-account">
            <button
              type="button"
              className="avatar-btn"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleMenu();
                }
              }}
              ref={accountButtonRef}
            >
              <span className="sr-only">Open account menu</span>
              <span aria-hidden="true">{user.name?.[0]?.toUpperCase() || 'U'}</span>
            </button>
            <AccountMenu
              isOpen={isMenuOpen}
              onClose={closeMenu}
              anchorRef={accountButtonRef}
              user={user}
            />
          </div>
        ) : (
          <div className="site-nav__cta">
            <Link to="/login" className="btn btn--ghost">Log in</Link>
            <Link to="/register" className="btn btn--primary">Get started</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
