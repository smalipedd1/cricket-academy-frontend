import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

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
      .get('https://cricket-academy-backend.onrender.com/api/admin/dashboard?role=admin', {
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

  const handleBulkAgeUpdate = () => {
    const token = localStorage.getItem('token');
    axios
      .post('https://cricket-academy-backend.onrender.com/api/admin/update-all-ages', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        alert(res.data.message || 'Age update completed.');
      })
      .catch((err) => {
        console.error('Bulk age update failed:', err);
        alert('Failed to update player ages.');
      });
  };

  const handleCoachUpdate = () => {
    const token = localStorage.getItem('token');
    const method = isAddingCoach ? 'post' : 'put';
    const url = isAddingCoach
      ? 'https://cricket-academy-backend.onrender.com/api/admin/coaches'
      : `https://cricket-academy-backend.onrender.com/api/admin/coaches/${editedCoach._id}`;

    axios({
      method,
      url,
      data: editedCoach,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert(isAddingCoach ? 'Coach added!' : 'Coach updated!');
        setSelectedCoach(null);
        setEditedCoach({});
        setIsAddingCoach(false);
        return axios.get('https://cricket-academy-backend.onrender.com/api/admin/coaches', {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => setCoaches(res.data))
      .catch((err) => {
        console.error('Coach save error:', err);
        alert('Failed to save coach.');
      });
  };

  const handlePlayerUpdate = () => {
    const token = localStorage.getItem('token');
    const method = isAddingPlayer ? 'post' : 'put';
    const url = isAddingPlayer
      ? 'https://cricket-academy-backend.onrender.com/api/admin/players'
      : `https://cricket-academy-backend.onrender.com/api/admin/players/${editedPlayer._id}`;

    axios({
      method,
      url,
      data: editedPlayer,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert(isAddingPlayer ? 'Player added!' : 'Player updated!');
        setSelectedPlayer(null);
        setEditedPlayer({});
        setIsAddingPlayer(false);
        return axios.get('https://cricket-academy-backend.onrender.com/api/admin/players', {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => setPlayers(res.data))
      .catch((err) => {
        console.error('Player save error:', err);
        alert('Failed to save player.');
      });
  };
                {(selectedPlayer || isAddingPlayer) && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">
                      {isAddingPlayer ? 'Add New Player' : 'Edit Player'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Existing fields ... */}
                      <label>
                        Age
                        <input
                          type="number"
                          value={editedPlayer.age}
                          onChange={(e) => setEditedPlayer({ ...editedPlayer, age: e.target.value })}
                          className="border px-3 py-2 rounded w-full"
                        />
                      </label>

                      {/* ✅ New Competitive Start Year field */}
                      <label>
                        Competitive Start Year
                        <input
                          type="number"
                          value={editedPlayer.competitiveStartYear || ''}
                          onChange={(e) =>
                            setEditedPlayer({ ...editedPlayer, competitiveStartYear: e.target.value })
                          }
                          min="2010"
                          max={new Date().getFullYear() + 5}
                          className="border px-3 py-2 rounded w-full"
                        />
                      </label>

                      <label>
                        Role
                        <select
                          value={editedPlayer.role}
                          onChange={(e) => setEditedPlayer({ ...editedPlayer, role: e.target.value })}
                          className="border px-3 py-2 rounded w-full"
                        >
                          <option value="Batsman">Batsman</option>
                          <option value="Bowler">Bowler</option>
                          <option value="All-Rounder">All-Rounder</option>
                          <option value="Wicketkeeper">Wicketkeeper</option>
                        </select>
                      </label>
                      {/* ... rest of fields unchanged */}
                    </div>
                    <button
                      onClick={handlePlayerUpdate}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      {isAddingPlayer ? 'Save New Player' : 'Update Player'}
                    </button>
                  </div>
                )}
    </div>
  );
};

export default AdminDashboard;
