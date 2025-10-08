import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlayerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.get('https://cricket-academy-backend.onrender.com/api/player/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProfile(res.data));

    axios.get('https://cricket-academy-backend.onrender.com/api/player/sessions', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSessions(res.data));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Player Dashboard</h1>
        {profile ? (
          <>
            <div className="mb-4">
              <p className="text-lg">Welcome, <strong>{profile.firstName}</strong></p>
              <p>Academy Level: <span className="font-semibold">{profile.academyLevel}</span></p>
              <p>Role: <span className="font-semibold">{profile.role}</span></p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg shadow mb-4">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Progress</h2>
              {profile.progress ? (
  		<ul className="list-disc pl-5 text-blue-900">
    		{Object.entries(profile.progress).map(([area, value]) => (
      		<li key={area}>{area}: {value}</li>
   		 ))}
  		</ul>
	) : (
  <p className="text-gray-500">No progress data available</p>
)}
            </div>

            <div className="bg-green-50 p-4 rounded-lg shadow mb-4">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Upcoming Sessions</h2>
              <ul className="list-disc pl-5 text-green-900">
                {sessions.map((s, i) => (
                  <li key={i}>{s.date} – {s.focusArea}</li>
                ))}
              </ul>
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

export default PlayerDashboard;