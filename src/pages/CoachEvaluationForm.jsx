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
  const [coachId, setCoachId] = useState('');
  const [feedback, setFeedback] = useState(initialFeedback);
  const [categories, setCategories] = useState(initialCategories);
  const [coachComments, setCoachComments] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get('https://cricket-academy-backend.onrender.com/api/players', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlayers(res.data))
      .catch((err) => console.error('Player fetch error:', err));
  }, []);

  useEffect(() => {
    if (!selectedPlayerId) return;

    axios
      .get(`https://cricket-academy-backend.onrender.com/api/players/${selectedPlayerId}`, {
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
          coach: coachId,
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Coach Evaluation Form</h2>

      <label>
        Select Player
        <select
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
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

      {selectedPlayer && playerStats && (
        <div className="bg-gray-50 p-4 rounded shadow text-sm text-gray-700 space-y-1">
          <div><strong>Player Name:</strong> {selectedPlayer.firstName} {selectedPlayer.lastName}</div>
          <div><strong>Category:</strong> {selectedPlayer.category}</div>
          <div><strong>Cricclubs ID:</strong> {selectedPlayer.cricclubsID}</div>
          <div><strong>Player Profile:</strong> {selectedPlayer.role}</div>
          <div><strong>Total Games Played:</strong> {playerStats.gamesPlayed}</div>
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
          <div><strong>Years in Academy:</strong> {selectedPlayer.yearsInAcademy}</div>
          <div><strong>Age:</strong> {selectedPlayer.age}</div>
          <div><strong>Total Runs:</strong> {playerStats.totalRuns}</div>
          <div><strong>Total Wickets:</strong> {playerStats.totalWickets}</div>
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
        </div>
      )}

<button
  type="button"
  onClick={() => navigate('/coach/dashboard')}
  className="text-blue-600 underline hover:text-blue-800"
>
  ← Back to Dashboard
</button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label>
          Coach ID
          <input
            type="text"
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </label>

        <div>
          <h3 className="text-lg font-semibold text-gray-700">Feedback Scores</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(feedback).map((key) => (
              <div key={key} className="space-y-2">
                <label>
                  {key.charAt(0).toUpperCase() + key.slice(1)} Score (1–10)
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={feedback[key].score}
                    onChange={(e) =>
                      setFeedback({
                        ...feedback,
                        [key]: { ...feedback[key], score: parseInt(e.target.value) || '' },
                      })
                    }
                    className="border px-3 py-2 rounded w-full"
                    required
                  />
                </label>
                <label>
                  Comments
                  <textarea
                    value={feedback[key].comments}
                    onChange={(e) =>
                      setFeedback({
                        ...feedback,
                        [key]: { ...feedback[key], comments: e.target.value },
                      })
                    }
                    className="border px-3 py-2 rounded w-full"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
        {/* 🔹 Category Ratings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Category Ratings</h3>
          {Object.entries(categories).map(([group, fields]) => (
            <div key={group} className="mb-4">
              <h4 className="text-md font-semibold text-green-700 capitalize">{group}</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(fields).map((field) => (
                  <label key={field}>
                    {field.replace(/([A-Z])/g, ' $1')}
                    <select
                      value={categories[group][field]}
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
        </div>

        {/* 🔹 Coach Comments */}
        <label>
          Coach Comments
          <textarea
            value={coachComments}
            onChange={(e) => setCoachComments(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Evaluation
        </button>
      </form>
    </div>
  );
};

export default CoachEvaluationForm;