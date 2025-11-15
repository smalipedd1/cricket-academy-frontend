import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ratingOptions = ['Beginner', 'Tenured', 'Advanced', 'N/A'];

const initialFeedback = {
  batting: { score: '', comments: '' },
  bowling: { score: '', comments: '' },
  mindset: { score: '', comments: '' },
  fitness: { score: '', comments: '' },
};

const initialCategories = {
  batting: {
    straightBatShots: '',
    shotSelection: '',
    playingSpin: '',
    playingFast: '',
    power: '',
    footMovement: '',
  },
  bowling: {
    bowlingAction: '',
    accuracy: '',
    paceVariation: '',
    swing: '',
    bowlingVariation: '',
  },
  mindset: {
    gameSense: '',
    maintainsCalm: '',
    executeStrategies: '',
    teamPlayer: '',
  },
  fitness: {
    stamina: '',
    core: '',
    power: '',
    endurance: '',
  },
};

const CoachEvaluationForm = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [coachName, setCoachName] = useState('');
  const [feedback, setFeedback] = useState(initialFeedback);
  const [categories, setCategories] = useState(initialCategories);
  const [coachComments, setCoachComments] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get('https://cricket-academy-backend.onrender.com/api/coach/players?status=Active', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlayers(res.data))
      .catch((err) => console.error('Player fetch error:', err));
  }, []);

  useEffect(() => {
    axios
      .get('https://cricket-academy-backend.onrender.com/api/coach/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log('✅ Coach profile response:', res.data);
        setCoachName(res.data.name);
      })
      .catch((err) => {
        console.error('❌ Coach profile fetch error:', err.response?.data || err.message);
      });
  }, []);

  useEffect(() => {
    if (!selectedPlayerId) return;

    axios
      .get(`https://cricket-academy-backend.onrender.com/api/player/${selectedPlayerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSelectedPlayer(res.data);
        return axios.get(
          `https://cricket-academy-backend.onrender.com/api/cricclubs/${res.data.cricclubsID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .then((res) => setPlayerStats(res.data))
      .catch((err) => console.error('CricClubs fetch error:', err));
  }, [selectedPlayerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'https://cricket-academy-backend.onrender.com/api/evaluations',
        {
          player: selectedPlayerId,
          coach: coachName,
          feedback,
          categories,
          coachComments,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Evaluation submitted!');
      navigate('/coach/dashboard');
    } catch (err) {
      console.error('Evaluation submission error:', err);
      alert('Failed to submit evaluation.');
    }
  };

const derivedCategory = (() => {
  const age = selectedPlayer?.age;
  if (age === undefined || age === null) return 'N/A';
  if (age < 11) return 'U11';
  if (age < 13) return 'U13';
  if (age < 15) return 'U15';
  if (age < 17) return 'U17';
  return 'Adult';
})();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Coach Evaluation Form</h2>

      {/* ✅ Always-visible Coach Header */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow text-sm text-gray-800">
        <strong>Coach:</strong> {coachName || 'Loading...'}
      </div>

      <button
        type="button"
        onClick={() => navigate('/coach/dashboard')}
        className="text-blue-600 underline hover:text-blue-800"
      >
        ← Back to Dashboard
      </button>

      <label className="block font-medium text-gray-700 mt-4">
        Select Player
        <select
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          className="border px-3 py-2 rounded w-full mt-1"
          required
        >
          <option value="">Choose a player</option>
          {players.map((p) => (
            <option key={p._id} value={p._id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
      </label>

      {selectedPlayer && (
        <div className="bg-gray-100 border-l-4 border-green-400 p-4 rounded shadow text-sm text-gray-700 space-y-1">
          <div><strong>Player Name:</strong> {selectedPlayer.firstName} {selectedPlayer.lastName}</div>
          <div><strong>Category:</strong> {derivedCategory}</div>
          <div><strong>Cricclubs ID:</strong> {selectedPlayer.cricclubsID}</div>
          <div><strong>Player Profile:</strong> {selectedPlayer.role}</div>
          <div>
  		<strong>Competitive Years:</strong>{' '}
  		{selectedPlayer.competitiveStartYear
    		? new Date().getFullYear() - selectedPlayer.competitiveStartYear
    		: 'N/A'}
	</div>
          <div><strong>Age:</strong> {selectedPlayer.age}</div>

          {playerStats ? (
            <>
              <div><strong>Total Games Played:</strong> {playerStats.gamesPlayed}</div>
              <div><strong>Total Runs:</strong> {playerStats.totalRuns}</div>
              <div><strong>Total Wickets:</strong> {playerStats.totalWickets}</div>
              {(() => {
                const categoryTargets = {
                  U11: 15,
                  U13: 30,
                  U15: 45,
                  U17: 60,
                  Adult: 60,
                };
                const targetGames = categoryTargets[selectedPlayer.category] || 30;
                const gamesPlayed = playerStats.gamesPlayed || 0;
                const gapPercent = Math.round(((targetGames - gamesPlayed) / targetGames) * 100);
                const gameTime =
                  gapPercent >= 80 ? 'Major Gap' :
                  gapPercent >= 50 ? 'Need Some More' :
                  'On Track';

                return (
                  <>
                    <div><strong>Target:</strong> {targetGames}</div>
                    <div><strong>Gap:</strong> {gapPercent}%</div>
                    <div><strong>Game Time:</strong> {gameTime}</div>
                  </>
                );
              })()}
              <div>
                <a
                  href={`https://cricclubs.com/PremierCricAcad/viewPlayer.do?playerId=${selectedPlayer.cricclubsID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View CricClubs Profile
                </a>
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">Loading CricClubs stats...</p>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8 mt-6">
        {/* 🔹 Feedback Scores */}
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <h3 className="text-xl font-semibold text-blue-700">Feedback Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(feedback).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-4 rounded shadow-sm space-y-2">
                <label className="block font-medium text-gray-700">
                  {key.charAt(0).toUpperCase() + key.slice(1)} Score (1–10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={value.score}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      [key]: { ...value, score: parseInt(e.target.value) || '' },
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <label className="block font-medium text-gray-700">Comments</label>
                <textarea
                  value={value.comments}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      [key]: { ...value, comments: e.target.value },
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 🔹 Category Ratings */}
        {Object.entries(categories).map(([group, fields]) => (
          <div key={group} className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-semibold text-green-700 capitalize">{group} Evaluation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(fields).map(([field, value]) => (
                <label key={field} className="block">
                  <span className="block font-medium text-gray-700 mb-1">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <select
                    value={value}
                    onChange={(e) =>
                      setCategories({
                        ...categories,
                        [group]: {
                          ...categories[group],
                          [field]: e.target.value,
                        },
                      })
                    }
                    className="border px-3 py-2 rounded w-full"
                    required
                  >
                    <option value="">Select</option>
                    {ratingOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* 🔹 Coach Comments */}
        <div className="bg-white p-6 rounded-lg shadow space-y-2">
          <h3 className="text-xl font-semibold text-gray-700">Coach Comments</h3>
          <textarea
            value={coachComments}
            onChange={(e) => setCoachComments(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            rows={4}
            placeholder="Add any final observations or recommendations..."
          />
        </div>

        {/* 🔹 Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Evaluation
          </button>
        </div>
      </form>
    </div>
  );
};

export default CoachEvaluationForm;