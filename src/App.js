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
import EnterDOB from './pages/EnterDOB';
import CoachEvaluationForm from './pages/CoachEvaluationForm';
import CoachPlayerEvaluations from './pages/CoachPlayerEvaluations';
import ChangePassword from './pages/ChangePassword';
import Layout from './components/Layout';

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

  if (loading) return null;
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin/dashboard"
        element={token && role === 'admin'
          ? <Layout><AdminDashboard /></Layout>
          : <Navigate to="/login" />}
      />
      <Route
        path="/coach/dashboard"
        element={token && role === 'coach'
          ? <Layout><CoachDashboard /></Layout>
          : <Navigate to="/login" />}
      />
      <Route
        path="/player/dashboard"
        element={token && role === 'player'
          ? <Layout><PlayerDashboard /></Layout>
          : <Navigate to="/login" />}
      />

      <Route path="/admin/sessions" element={<Layout><SessionList /></Layout>} />
      <Route path="/coach/feedback/:sessionId" element={<Layout><CoachFeedbackForm /></Layout>} />
      <Route path="/coach/feedback-summary" element={<Layout><CoachFeedbackSummary /></Layout>} />
      <Route path="/coach/player-list" element={<Layout><CoachPlayerList /></Layout>} />
      <Route path="/coach/player/:id" element={<Layout><CoachPlayerProfile /></Layout>} />
      <Route path="/player/session/:id" element={<Layout><PlayerSessionView /></Layout>} />
      <Route path="/enter-dob" element={<Layout><EnterDOB /></Layout>} />
      <Route path="/player-dashboard" element={<Layout><PlayerDashboard /></Layout>} />
      <Route path="/coach/evaluation" element={<Layout><CoachEvaluationForm /></Layout>} />

      <Route
        path="/coach/evaluations/player"
        element={token && role === 'coach'
          ? <Layout><CoachPlayerEvaluations viewer="coach" /></Layout>
          : <Navigate to="/login" />}
      />
      <Route
        path="/player/evaluation/:evaluationId"
        element={token && role === 'player'
          ? <Layout><CoachPlayerEvaluations viewer="player" /></Layout>
          : <Navigate to="/login" />}
      />

      <Route
        path="/coach/change-password"
        element={token && role === 'coach'
          ? <Layout><ChangePassword /></Layout>
          : <Navigate to="/login" />}
      />
      <Route
        path="/player/change-password"
        element={token && role === 'player'
          ? <Layout><ChangePassword /></Layout>
          : <Navigate to="/login" />}
      />
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