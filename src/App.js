import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/login';
import CoachDashboard from './pages/CoachDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlayerDashboard from './pages/PlayerDashboard';
import SessionList from './pages/SessionList';
import CoachFeedbackForm from './pages/CoachFeedbackForm';
import CoachFeedbackSummary from './pages/CoachFeedbackSummary';
import CoachPlayerList from './pages/CoachPlayerList';
import CoachPlayerProfile from './pages/CoachPlayerProfile';
import PlayerSessionView from './pages/PlayerSessionView';

function AppRoutes() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role')?.toLowerCase();
    setToken(storedToken);
    setRole(storedRole);
    setLoading(false);
  }, [location.pathname]);

  if (loading) return null; // ⏳ Prevent premature route rendering

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin/dashboard"
        element={token && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/coach/dashboard"
        element={token && role === 'coach' ? <CoachDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/player/dashboard"
        element={token && role === 'player' ? <PlayerDashboard /> : <Navigate to="/login" />}
      />

      <Route path="/admin/sessions" element={<SessionList />} />
      <Route path="/coach/feedback/:sessionId" element={<CoachFeedbackForm />} />
      <Route path="/coach/feedback-summary" element={<CoachFeedbackSummary />} />
      <Route path="/coach/player-list" element={<CoachPlayerList />} />
      <Route path="/coach/player/:id" element={<CoachPlayerProfile />} />
      <Route path="/player/session/:id" element={<PlayerSessionView />} />
	<Route path="/enter-dob" element={<EnterDOB />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;