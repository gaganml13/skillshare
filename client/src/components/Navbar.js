import React from 'react';
import styled from 'styled-components';

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
  gap: 2rem;
  list-style: none;

  li {
    font-size: 1rem;
    color: var(--text-dark);
    cursor: pointer;
    transition: color 0.2s;
    &:hover {
      color: var(--primary-purple);
    }
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
  return (
    <Nav>
      <Logo>SkillShare</Logo>
      <NavLinks>
        <li>Browse Courses</li>
        <li>Become a Creator</li>
        <li>About</li>
      </NavLinks>
      <Actions>
        <LoginBtn>Log In</LoginBtn>
        <GetStartedBtn>Get Started</GetStartedBtn>
      </Actions>
    </Nav>
  );
};

export default Navbar;
