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

    axios.get('https://cricket-academy-backend.onrender.com/api/coach/dashboard-lite', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setData(res.data))
    .catch(err => {
      console.error('Dashboard error:', err.response?.data || err.message);
      navigate('/login');
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow-md max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Coach Dashboard</h1>
        {data ? (
          <>
            <p className="mb-2">Welcome, <strong>{data.name}</strong></p>

            <h2 className="text-xl font-semibold mb-2">Assigned Sessions</h2>
            <ul className="list-disc pl-5 mb-4">
              {data.assignedSessions.map((s, i) => (
                <li key={i}>
                  {s.date} – {s.focusArea} ({s.players} players)
                </li>
              ))}
            </ul>

            <p className="text-lg">Feedback Pending: <strong>{data.feedbackPending}</strong></p>
          </>
        ) : (
          <p>Loading dashboard...</p>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default CoachDashboard;