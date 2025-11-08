import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoachPlayerList = () => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('https://cricket-academy-backend.onrender.com/api/coach/player-list', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlayers(res.data))
      .catch((err) => {
        console.error('Player list fetch error:', err.response?.data || err.message);
        alert('Failed to load player list.');
      });
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Manage Players</h1>

      {players.length === 0 ? (
        <p className="text-gray-600">No players found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map((player) => (
            <div key={player._id} className="border p-4 rounded shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {player.firstName} {player.lastName}
              </h2>
              <p className="text-gray-600">Age: {player.age ?? 'N/A'}</p>
              <p className="text-gray-600">Specialization: {player.role ?? 'N/A'}</p>
              <p className="text-gray-600">Academy Level: {player.academyLevel ?? 'N/A'}</p>
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
      )}
    </div>
  );
};

export default CoachPlayerList;