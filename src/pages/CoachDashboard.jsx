import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoachDashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.get('https://cricket-academy-backend.onrender.com/api/coach/dashboard-lite', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data)).catch(() => navigate('/login'));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Coach Dashboard</h1>
        {data ? (
          <>
            <p className="text-lg mb-4">Welcome, <strong>{data.name}</strong></p>

            <div className="bg-blue-50 p-4 rounded-lg shadow mb-4">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Assigned Sessions</h2>
              <ul className="list-disc pl-5 text-blue-900">
                {data.assignedSessions.map((s, i) => (
                  <li key={i}>{s.date} – {s.focusArea} ({s.players} players)</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold inline-block">
              Feedback Pending: {data.feedbackPending}
            </div>
          </>
        ) : (
          <p>Loading dashboard...</p>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default CoachDashboard;