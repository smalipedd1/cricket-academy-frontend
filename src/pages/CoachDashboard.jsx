import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoachDashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('https://cricket-academy-backend.onrender.com/api/dashboard?role=coach', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setData(res.data))
    .catch(err => {
      console.error(err);
      navigate('/login');
    });
  }, [navigate]);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {data.name}</h1>
      <p>Total Sessions: {data.totalSessions}</p>
      <p>Total Players: {data.totalPlayers}</p>
      <h2>Recent Sessions</h2>
      <ul>
        {data.recentSessions.map((s, i) => (
          <li key={i}>
            {s.date} - {s.focusArea} ({s.playerCount} players)
          </li>
        ))}
      </ul>
      <button onClick={() => {
        localStorage.removeItem('token');
        navigate('/login');
      }}>Logout</button>
    </div>
  );
};

export default CoachDashboard;