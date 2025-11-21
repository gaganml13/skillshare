import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import CreateCoursePage from './pages/CreateCoursePage';
import CoursesPage from './pages/CoursesPage';
import CommunityPage from './pages/CommunityPage';
import MentorshipPage from './pages/MentorshipPage';
import JobsPage from './pages/JobsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import AccountPage from './pages/AccountPage';
import DownloadsPage from './pages/DownloadsPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import CourseDetailPage from './pages/CourseDetailPage';
import { Navigate } from 'react-router-dom';

// The app shell stays theme-aware by relying on global CSS variables instead of inline styles.

function App() {
  return (
    <div className="app-shell">
      <AuthProvider>
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
            <Route path="/courses/create" element={
              <ProtectedRoute>
                <CreateCoursePage />
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            } />
            <Route path="/community" element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } />
            <Route path="/mentorship" element={
              <ProtectedRoute>
                <MentorshipPage />
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } />
            <Route path="/partners" element={<Navigate to="/community" replace />} />
            <Route path="/events" element={
              <ProtectedRoute>
                <EventsPage />
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
            <Route path="/live-events" element={<Navigate to="/events" replace />} />
            <Route path="/account" element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } />
            <Route path="/downloads" element={
              <ProtectedRoute>
                <DownloadsPage />
              </ProtectedRoute>
            } />
            <Route path="/create-course" element={<Navigate to="/courses/create" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
