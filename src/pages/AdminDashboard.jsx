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

  const handleCoachUpdate = () => {
    const token = localStorage.getItem('token');
    axios
      .patch(`https://cricket-academy-backend.onrender.com/api/admin/coaches/${editedCoach._id}`, editedCoach, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert('Coach updated!');
        setSelectedCoach(null);
        setEditedCoach({});
        return axios.get('https://cricket-academy-backend.onrender.com/api/admin/coaches', {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => setCoaches(res.data))
      .catch((err) => {
        console.error('Coach update error:', err);
        alert('Failed to update coach.');
      });
  };

  const handlePlayerUpdate = () => {
    const token = localStorage.getItem('token');
    axios
      .patch(`https://cricket-academy-backend.onrender.com/api/admin/players/${editedPlayer._id}`, editedPlayer, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert('Player updated!');
        setSelectedPlayer(null);
        setEditedPlayer({});
        return axios.get('https://cricket-academy-backend.onrender.com/api/admin/players', {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => setPlayers(res.data))
      .catch((err) => {
        console.error('Player update error:', err);
        alert('Failed to update player.');
      });
  };
  return (
    <>
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

              {/* Navigation Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white border border-blue-100 rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-blue-700">Manage Coaches</h2>
                  <button
                    onClick={() => {
                      setShowCoachList(true);
                      setShowPlayerList(false);
                      setSelectedCoach(null);
                      setEditedCoach({});
                      setIsAddingCoach(false);
                      setSelectedPlayer(null);
                      setEditedPlayer({});
                      setIsAddingPlayer(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View & Update Coaches
                  </button>
                </div>

                <div className="bg-white border border-green-100 rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-green-700">Manage Players</h2>
                  <button
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
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    View & Update Players
                  </button>
                </div>

                <div className="bg-white border border-purple-100 rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-purple-700">Manage Sessions</h2>
                  <button
                    onClick={() => {
                      setShowCoachList(false);
                      setShowPlayerList(false);
                      setSelectedCoach(null);
                      setEditedCoach({});
                      setIsAddingCoach(false);
                      setSelectedPlayer(null);
                      setEditedPlayer({});
                      setIsAddingPlayer(false);
                      navigate('/admin/sessions');
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    View & Update Sessions
                  </button>
                </div>
              </div>
              {/* Coach List */}
              {showCoachList && (
                <div className="mt-10 bg-white p-6 rounded shadow space-y-4">
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
                        specialization: '',
                        experienceYears: '',
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
                        {coach.firstName} {coach.lastName} — {coach.specialization}
                      </li>
                    ))}
                  </ul>

                  {selectedCoach && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-blue-600">Edit Coach</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          Specialization
                          <select
                            value={editedCoach.specialization}
                            onChange={(e) => setEditedCoach({ ...editedCoach, specialization: e.target.value })}
                            className="border px-3 py-2 rounded w-full"
                          >
                            <option value="">Select</option>
                            <option value="Batting">Batting</option>
                            <option value="Bowling">Bowling</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Fielding">Fielding</option>
                            <option value="Wicketkeeping">Wicketkeeping</option>
                          </select>
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
                          Email Address
                          <input
                            type="email"
                            value={editedCoach.emailAddress}
                            onChange={(e) => setEditedCoach({ ...editedCoach, emailAddress: e.target.value })}
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
                          </select>
                        </label>
                      </div>
                      <button
                        onClick={handleCoachUpdate}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Save Coach
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Player List */}
              {showPlayerList && (
                <div className="mt-10 bg-white p-6 rounded shadow space-y-4">
                  <h2 className="text-xl font-bold text-green-700">Player List</h2>
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

                  {selectedPlayer && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-green-600">Edit Player</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Save Player
                      </button>
                    </div>
                  )}
                </div>
              )}

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
    </>
  );
};

export default AdminDashboard;