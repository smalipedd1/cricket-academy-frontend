import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const CoachDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [coachName, setCoachName] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('https://cricket-academy-backend.onrender.com/api/coach/dashboard-ui', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = res.data.recentSessions.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setSessions(sorted);
        setCoachName(res.data.coachName || 'Coach');
      })
      .catch((err) => {
        console.error('Dashboard fetch error:', err.response?.data || err.message);
        alert('Failed to load dashboard.');
      });
  }, []);

  const fetchPlayers = () => {
    const token = localStorage.getItem('token');
    axios
      .get('https://cricket-academy-backend.onrender.com/api/coach/player-list', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = res.data.sort((a, b) =>
          a.firstName.localeCompare(b.firstName)
        );
        setPlayers(sorted);
        setShowPlayers(true);
      })
      .catch((err) => {
        console.error('Player list fetch error:', err.response?.data || err.message);
        alert('Failed to load player list.');
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Welcome, {coachName}</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div
          onClick={() => {
            setShowPlayers(true);
            setShowSessions(false);
            fetchPlayers();
          }}
          className="bg-blue-100 hover:bg-blue-200 cursor-pointer p-6 rounded shadow text-center"
        >
          <div className="text-4xl mb-2">👥</div>
          <h2 className="text-xl font-semibold text-blue-700">Manage Players</h2>
          <p className="text-gray-600 mt-1 text-sm">View and update player profiles</p>
        </div>

        <div
          onClick={() => {
            setShowSessions(true);
            setShowPlayers(false);
          }}
          className="bg-yellow-100 hover:bg-yellow-200 cursor-pointer p-6 rounded shadow text-center"
        >
          <div className="text-4xl mb-2">📝</div>
          <h2 className="text-xl font-semibold text-yellow-700">Session Feedback</h2>
          <p className="text-gray-600 mt-1 text-sm">Log or update feedback for sessions</p>
        </div>

        <div
          onClick={() => navigate('/coach/feedback-summary')}
          className="bg-purple-100 hover:bg-purple-200 cursor-pointer p-6 rounded shadow text-center"
        >
          <div className="text-4xl mb-2">📊</div>
          <h2 className="text-xl font-semibold text-purple-700">Player Progress</h2>
          <p className="text-gray-600 mt-1 text-sm">View performance graphs and analytics</p>
        </div>

        <div
          onClick={() => navigate('/coach/evaluation')}
          className="bg-green-100 hover:bg-green-200 cursor-pointer p-6 rounded shadow text-center"
        >
          <div className="text-4xl mb-2">🧾</div>
          <h2 className="text-xl font-semibold text-green-700">Player Evaluation</h2>
          <p className="text-gray-600 mt-1 text-sm">Submit detailed player evaluations</p>
        </div>

        <div
          onClick={() => {
            const token = localStorage.getItem('token');
            if (token) {
              navigate('/coach/evaluations/player');
            } else {
              alert('Session expired. Please log in again.');
              navigate('/login', { replace: true });
            }
          }}
          className="bg-indigo-100 hover:bg-indigo-200 cursor-pointer p-6 rounded shadow text-center"
        >
          <div className="text-4xl mb-2">📁</div>
          <h2 className="text-xl font-semibold text-indigo-700">View Evaluations</h2>
          <p className="text-gray-600 mt-1 text-sm">Browse submitted evaluations by player</p>
        </div>

        {/* 🔑 New Change Password Card */}
        <div
          onClick={() => navigate('/coach/change-password')}
          className="bg-red-100 hover:bg-red-200 cursor-pointer p-6 rounded shadow text-center"
        >
          <div className="text-4xl mb-2">🔒</div>
          <h2 className="text-xl font-semibold text-red-700">Change Password</h2>
          <p className="text-gray-600 mt-1 text-sm">Update your login credentials securely</p>
        </div>
      </div>

      {showPlayers && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">All Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {players.map((player) => (
              <div key={player._id} className="border p-4 rounded shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {player.firstName} {player.lastName}
                </h3>
                <p className="text-gray-600">Age: {player.age ?? 'N/A'}</p>
                <p className="text-gray-600">Specialization: {player.role ?? 'N/A'}</p>
                <p className="text-gray-600">Academy Level: {player.academyLevel ?? 'N/A'}</p>
		<p className="text-gray-600">competitiveStartYear: {player.competitiveStartYear ?? 'N/A'}</p>
                <p className="text-gray-600">Status: {player.status ?? 'N/A'}</p>

                <button
                  onClick={() => navigate(`/coach/player/${player._id}`)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View / Update
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSessions && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-gray-600">No sessions assigned yet.</p>
          ) : (
            sessions.map((session) => (
              <div key={session._id} className="border p-4 rounded shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {new Date(session.date).toLocaleDateString()}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.feedbackStatus === 'Complete'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {session.feedbackStatus}
                  </span>
                </div>

                <p className="text-gray-600 mb-2">Focus Area: {session.focusArea}</p>
                <p className="text-gray-600 mb-4">Players Assigned: {session.playerCount}</p>

                                <button
                  onClick={() => navigate(`/coach/feedback/${session._id}`)}
                  className={`px-6 py-2 rounded ${
                    session.feedbackStatus === 'Complete'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {session.feedbackStatus === 'Complete' ? 'Update Feedback' : 'Log Feedback'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;