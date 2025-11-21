import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../Navbar';

/**
 * ProtectedRoute component
 * Restricts access to children for logged-in users only
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait for authentication state to resolve
  if (loading) {
    return <h1>Loading...</h1>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render protected children with the global navbar
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default ProtectedRoute;
