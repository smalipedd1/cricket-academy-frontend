import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showCoachList, setShowCoachList] = useState(false);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [editedCoach, setEditedCoach] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editedPlayer, setEditedPlayer] = useState({});
  const [isAddingCoach, setIsAddingCoach] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role')?.toLowerCase();

    if (!token || role !== 'admin') {
      console.warn('🔒 Unauthorized access attempt');
      return navigate('/login');
    }

    axios
      .get('https://cricket-academy-backend.onrender.com/api/dashboard?role=admin', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn('🔐 Token expired or unauthorized');
          navigate('/login');
        } else {
          console.error('Dashboard fetch error:', err);
        }
      });

    axios
      .get('https://cricket-academy-backend.onrender.com/api/admin/coaches', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCoaches(res.data))
      .catch((err) => console.error('Coach fetch error:', err));

    axios
      .get('https://cricket-academy-backend.onrender.com/api/admin/players', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlayers(res.data))
      .catch((err) => console.error('Player fetch error:', err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  const handleSave = () => {
    const token = localStorage.getItem('token');
    const payload = { ...editedCoach };
    if (!payload.password) delete payload.password;

    const request = isAddingCoach
      ? axios.post('https://cricket-academy-backend.onrender.com/api/admin/coaches', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      : axios.put(
          `https://cricket-academy-backend.onrender.com/api/admin/coaches/${selectedCoach._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

    request
      .then(() => {
        alert(isAddingCoach ? 'Coach added!' : 'Coach updated!');
        setSelectedCoach(null);
        setEditedCoach({});
        setIsAddingCoach(false);
        axios
          .get('https://cricket-academy-backend.onrender.com/api/admin/coaches', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setCoaches(res.data));
      })
      .catch(() => alert('Save failed'));
  };

  const handlePlayerSave = () => {
    const token = localStorage.getItem('token');
    const payload = { ...editedPlayer };

    const request = isAddingPlayer
      ? axios.post('https://cricket-academy-backend.onrender.com/api/admin/players', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      : axios.put(
          `https://cricket-academy-backend.onrender.com/api/admin/players/${selectedPlayer._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

    request
      .then(() => {
        alert(isAddingPlayer ? 'Player added!' : 'Player updated!');
        setSelectedPlayer(null);
        setEditedPlayer({});
        setIsAddingPlayer(false);
        axios
          .get('https://cricket-academy-backend.onrender.com/api/admin/players', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setPlayers(res.data));
      })
      .catch(() => alert('Save failed'));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-8">
        <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>

        {data ? (
          <>
            <p className="text-lg">Welcome Admin <strong>{data.name}</strong></p>

            {/* Summary Cards */}
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

            {/* Action Cards */}
            {/* ... unchanged logic for managing coaches, players, sessions ... */}

            {/* Coach List, Player List, Editors */}
            {/* ... unchanged logic for rendering and editing coaches/players ... */}

            {/* ✅ Updated Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <p>Loading dashboard...</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;