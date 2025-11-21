import React from 'react';
import { Navigate } from 'react-router-dom';

// Live events now live inside EventsPage. Keep a redirect so legacy links continue working.
const LiveEventsPage = () => <Navigate to="/events" replace />;

export default LiveEventsPage;
