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

              {/* 🔄 Bulk Age Update Button */}
              <div className="mt-8">
                <button
                  onClick={handleBulkAgeUpdate}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Update All Player Ages
                </button>
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

                  {(selectedCoach || isAddingCoach) && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-blue-600">
                        {isAddingCoach ? 'Add New Coach' : 'Edit Coach'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Coach form fields preserved */}
                        {/* ... */}
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

                  {(selectedPlayer || isAddingPlayer) && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-green-600">
                        {isAddingPlayer ? 'Add New Player' : 'Edit Player'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Player form fields preserved */}
                        {/* ... */}
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