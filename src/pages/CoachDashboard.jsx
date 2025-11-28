import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const CoachDashboard = () => {
  const [players, setPlayers] = useState([]);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editedPlayer, setEditedPlayer] = useState({});
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role')?.toLowerCase();

    if (!token || role !== 'coach') {
      console.warn('🔒 Unauthorized access attempt');
      return navigate('/login');
    }

    axios
      .get('https://cricket-academy-backend.onrender.com/api/coach/players', {
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

  const handlePlayerUpdate = () => {
    const token = localStorage.getItem('token');
    const method = isAddingPlayer ? 'post' : 'put';
    const url = isAddingPlayer
      ? 'https://cricket-academy-backend.onrender.com/api/coach/players'
      : `https://cricket-academy-backend.onrender.com/api/coach/players/${editedPlayer._id}`;

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
        return axios.get('https://cricket-academy-backend.onrender.com/api/coach/players', {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => setPlayers(res.data))
      .catch((err) => {
        console.error('Player save error:', err);
        alert('Failed to save player.');
      });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* 🔷 Top Bar */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">Welcome Coach</h1>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 🧩 Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manage Players */}
          <div
            onClick={() => {
              setShowPlayerList(true);
              setSelectedPlayer(null);
              setEditedPlayer({});
              setIsAddingPlayer(false);
            }}
            className="cursor-pointer bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 14a4 4 0 018 0H4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-700">Manage Players</h3>
                <p className="text-sm text-gray-600">View and update player profiles.</p>
              </div>
            </div>
          </div>

          {/* Manage Sessions */}
          <div
            onClick={() => {
              setShowPlayerList(false);
              navigate('/coach/sessions');
            }}
            className="cursor-pointer bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm2 3h8v2H6V6zm0 4h5v2H6v-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-700">Manage Sessions</h3>
                <p className="text-sm text-gray-600">Create or update coaching sessions</p>
              </div>
            </div>
          </div>
        </div>
        {/* 🏏 Player List */}
        {showPlayerList && (
          <div className="mt-10 bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-green-700">Player List</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setIsAddingPlayer(true);
                  setSelectedPlayer(null);
                  setEditedPlayer({
                    username: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    age: '',
                    competitiveStartYear: '',
                    emailAddress: '',
                    role: 'Batsman',
                    academyLevel: 'Beginner',
                    cricclubsID: '',
                    status: 'Active',
                  });
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add New Player
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {players.map((player) => (
                <li
                  key={player._id}
                  className="border p-4 rounded hover:bg-green-50 cursor-pointer"
                  onClick={() => {
                    setSelectedPlayer(player);
                    setEditedPlayer(player);
                    setIsAddingPlayer(false);
                  }}
                >
                  {player.firstName} {player.lastName} — {player.role}
                  <span className="block text-sm text-gray-500">
                    Competitive Start Year: {player.competitiveStartYear}
                  </span>
                </li>
              ))}
            </ul>

            {(selectedPlayer || isAddingPlayer) && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-green-600">
                  {isAddingPlayer ? 'Add New Player' : 'Edit Player'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label>
                    Username
                    <input
                      type="text"
                      value={editedPlayer.username}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, username: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={editedPlayer.password}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, password: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </label>
                  <label>
                    First Name
                    <input
                      type="text"
                      value={editedPlayer.firstName}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, firstName: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </label>
                  <label>
                    Last Name
                    <input
                      type="text"
                      value={editedPlayer.lastName}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, lastName: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </label>
                  <label>
                    Age
                    <input
                      type="number"
                      value={editedPlayer.age}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, age: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </label>
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
                  <label>
                    Academy Level
                    <select
                      value={editedPlayer.academyLevel}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, academyLevel: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </label>
                  <label>
                    Email Address
                    <input
                      type="email"
                      value={editedPlayer.emailAddress}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, emailAddress: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </label>
                  <label>
                    Cricclubs ID
                    <input
                      type="text"
                      value={editedPlayer.cricclubsID}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, cricclubsID: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={editedPlayer.status}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, status: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </label>
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
        )}
        {/* ✅ Conditional rendering */}
        {players.length > 0 ? (
          <></>  {/* Dashboard content already rendered above */}
        ) : (
          <p className="text-gray-600">Loading dashboard...</p>
        )}
      </div>
    </div>
  );
};

export default CoachDashboard;