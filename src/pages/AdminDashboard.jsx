import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('https://cricket-academy-backend.onrender.com/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setData(res.data))
    .catch(err => {
      console.error('Admin dashboard error:', err.response?.data || err.message);
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
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        {data ? (
          <>
            <p className="mb-2">Welcome, <strong>{data.name}</strong></p>
            <p>Total Players: <strong>{data.totalPlayers}</strong></p>
            <p>Total Coaches: <strong>{data.totalCoaches}</strong></p>
            <p>Upcoming Sessions: <strong>{data.upcomingSessions}</strong></p>
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

export default AdminDashboard;