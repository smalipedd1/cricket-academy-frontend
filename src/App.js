import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role')?.toLowerCase();

  return (
    <Router>
      <Routes>
        {/* ✅ Add this route to fix blank page */}
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
      </Routes>
    </Router>
  );
}

export default App;