import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h1>Hello, {user ? user.name : 'User'}!</h1>
      <p>Welcome to your dashboard.</p>
    </div>
  );
};

export default DashboardPage;
