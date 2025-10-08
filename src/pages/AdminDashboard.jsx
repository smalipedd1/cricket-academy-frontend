import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.get('https://cricket-academy-backend.onrender.com/api/admin/dashboard', {
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
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Dashboard</h1>
        {data ? (
          <>
            <p className="text-lg mb-4">Welcome, <strong>{data.name}</strong></p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg shadow text-yellow-800 font-semibold">
                Total Players: {data.totalPlayers}
              </div>
              <div className="bg-purple-50 p-4 rounded-lg shadow text-purple-800 font-semibold">
                Total Coaches: {data.totalCoaches}
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow text-green-800 font-semibold">
                Upcoming Sessions: {data.upcomingSessions}
              </div>
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

export default AdminDashboard;