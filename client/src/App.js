import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import CreateCoursePage from './pages/CreateCoursePage';
import CoursesPage from './pages/CoursesPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import CourseDetailPage from './pages/CourseDetailPage';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/create-course" element={
            <ProtectedRoute>
              <CreateCoursePage />
            </ProtectedRoute>
          } />
          <Route path="/courses" element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          } />
          <Route path="/course/:id" element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
