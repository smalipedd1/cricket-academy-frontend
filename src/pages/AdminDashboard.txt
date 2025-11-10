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
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* 🔷 Top Bar */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-700">Welcome, {data?.name}</h1>
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

          {data ? (
            <>
              {/* 🧩 Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Manage Players */}
                <div
                  onClick={() => {
                    setShowPlayerList(true);
                    setShowCoachList(false);
                    setSelectedPlayer(null);
                    setEditedPlayer({});
                    setIsAddingPlayer(false);
                    setSelectedCoach(null);
                    setEditedCoach({});
                    setIsAddingCoach(false);
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

                {/* Session Feedback */}
                <div
                  onClick={() => {
                    setShowCoachList(false);
                    setShowPlayerList(false);
                    navigate('/admin/sessions');
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
                      <h3 className="text-lg font-semibold text-purple-700">Session Feedback</h3>
                      <p className="text-sm text-gray-600">Log or update feedback for sessions.</p>
                    </div>
                  </div>
                </div>

                {/* Player Progress */}
                <div
                  onClick={() => {
                    setShowCoachList(false);
                    setShowPlayerList(false);
                    navigate('/admin/analytics');
                  }}
                  className="cursor-pointer bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v6H2v-6zm6-4a1 1 0 011-1h2a1 1 0 011 1v10H8V7zm6-4a1 1 0 011-1h2a1 1 0 011 1v14h-4V3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700">Player Progress</h3>
                      <p className="text-sm text-gray-600">View performance graphs and analytics.</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* 👥 Coach List */}
              {showCoachList && (
                <div className="mt-10 bg-white rounded-xl shadow p-6 space-y-4">
                  <h2 className="text-xl font-bold text-blue-700">Coach List</h2>
                  <button
                    onClick={() => {
                      setIsAddingCoach(true);
                      setSelectedCoach(null);
                      setEditedCoach({
                        username: '',
                        password: '',
                        firstName: '',
                        lastName: '',
                        emailAddress: '',
                        phoneNumber: '',
                        coachId: '',
                        status: 'Active',
                      });
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add New Coach
                  </button>
                  <ul className="mt-4 space-y-2">
                    {coaches.map((coach) => (
                      <li
                        key={coach._id}
                        className="border p-4 rounded hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          setSelectedCoach(coach);
                          setEditedCoach(coach);
                          setIsAddingCoach(false);
                        }}
                      >
                        {coach.firstName} {coach.lastName}
                      </li>
                    ))}
                  </ul>

                  {(selectedCoach || isAddingCoach) && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-blue-600">
                        {isAddingCoach ? 'Add New Coach' : 'Edit Coach'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label>
                          Username
                          <input
                            type="text"
                            value={editedCoach.username}
                            onChange={(e) => setEditedCoach({ ...editedCoach, username: e.target.value })}
                            className="border px-3 py-2 rounded w-full"
                          />
                        </label>
                        <label>
                          Password
                          <input
                            type="password"
                            value={editedCoach.password}
                            onChange={(e) => setEditedCoach({ ...editedCoach, password: e.target.value })}
                            className="border px-3 py-2 rounded w-full"
                          />
                        </label>
                        <label>
                          First Name
                          <input
                            type="text"
                            value={editedCoach.firstName}
                            onChange={(e) => setEditedCoach({ ...editedCoach, firstName: e.target.value })}
                            className="border px-3 py-2 rounded w-full"
                          />
                        </label>
                        <label>
                          Last Name
                          <input
                            type="text"
                            value={editedCoach.lastName}
                            onChange={(e) => setEditedCoach({ ...editedCoach, lastName: e.target.value })}
                            className="border px-3 py-2 rounded w-full"
                          />
                        </label>
                        <label>
                          Email Address
                          <input
                            type="email"
                            value={editedCoach.emailAddress}
                            onChange={(e) => setEditedCoach({ ...editedCoach, emailAddress: e.target.value })}
                            className="border px-3 py-2 rounded w-full"
                          />
                        </label>
                        <label>
                          Phone Number
                          <input
                            type="text"
                            value={editedCoach.phoneNumber}
                            onChange={(e) => setEditedCoach({ ...editedCoach, phoneNumber: e.target.value })}
                            className="border px-3 py-2 rounded w-full"
                          />
                        </label>
                        <label>
                          Coach ID
                          <input
                            type="text"
                            value={editedCoach.coachId}
                            onChange={(e) => setEditedCoach({ ...editedCoach, coachId: e.target.value })}
                            className="border px-3 py-2 rounded w-full"
                          />
                        </label>
                        <label>
                          Status
                          <select
                            value={editedCoach.status}
                            onChange={(e) => setEditedCoach({ ...editedCoach, status: e.target.value })}
                            className="border px-3 py-2 rounded w-full"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Retired">Retired</option>
                          </select>
                        </label>
                      </div>
                      <button
                        onClick={handleCoachUpdate}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        {isAddingCoach ? 'Save New Coach' : 'Update Coach'}
                      </button>
                    </div>
                  )}
                </div>
              )}

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

                    <button
                      onClick={handleBulkAgeUpdate}
                      className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                    >
                      Update All Player Ages
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
          </>
        ) : (
          <p className="text-gray-600">Loading dashboard...</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;