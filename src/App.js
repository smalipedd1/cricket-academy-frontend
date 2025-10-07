import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import CoachDashboard from './pages/CoachDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlayerDashboard from './pages/PlayerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<CoachDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/player/dashboard" element={<PlayerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;