import React, { useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import { Link, NavLink } from 'react-router-dom';
import AccountMenu from './AccountMenu';

const Nav = styled.nav`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--background-light);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border-bottom: 1px solid #ececec;
`;

const Logo = styled.div`
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--primary-purple);
  letter-spacing: 1px;
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;

  a {
    position: relative;
    font-size: 0.95rem;
    color: var(--text-dark);
    text-decoration: none;
    font-weight: 500;
    padding-bottom: 0.25rem;
  }

  a.active::after,
  a:hover::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 2px;
    background: var(--primary-purple);
    border-radius: 999px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const LoginBtn = styled.button`
  background: none;
  border: none;
  color: var(--primary-purple);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: color 0.2s;
  &:hover {
    color: var(--primary-blue);
  }
`;

const GetStartedBtn = styled.button`
  background: var(--primary-purple);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(108,99,255,0.08);
  transition: background 0.2s;
  &:hover {
    background: var(--primary-blue);
  }
`;


const Navbar = () => {
  const { user, loading } = useContext(AuthContext);
  const accountButtonRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  if (loading) return null;

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Nav>
      <Logo>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28, marginRight: 6 }}>🎓</span> SkillShare
        </span>
      </Logo>
      <NavLinks>
        {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/courses', label: 'Courses' },
                { to: '/community', label: 'Community' },
                { to: '/mentorship', label: 'Mentorship' },
                { to: '/jobs', label: 'Jobs' },
                { to: '/leaderboard', label: 'Leaderboard' },
                { to: '/partners', label: 'Partners' },
                { to: '/live-events', label: 'Live' }
              ].map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} style={{ color: 'inherit' }}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </NavLinks>
      <Actions>
        {user ? (
          <div className="nav-account">
            <button
              type="button"
              className="nav-account-button"
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
            <AccountMenu isOpen={isMenuOpen} onClose={closeMenu} anchorRef={accountButtonRef} user={user} />
          </div>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none' }}><LoginBtn>Log In</LoginBtn></Link>
            <Link to="/register" style={{ textDecoration: 'none' }}><GetStartedBtn>Get Started</GetStartedBtn></Link>
          </>
        )}
      </Actions>
    </Nav>
  );
};

export default Navbar;
