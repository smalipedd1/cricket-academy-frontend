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
  const [coachProfile, setCoachProfile] = useState({ name: '', _id: '' });
  const [feedback, setFeedback] = useState(initialFeedback);
  const [categories, setCategories] = useState(initialCategories);
  const [coachComments, setCoachComments] = useState('');
  const [manualStats, setManualStats] = useState({
    gamesPlayed: '',
    totalRuns: '',
    totalWickets: '',
  });
  const [derivedStats, setDerivedStats] = useState({
    target: null,
    gapPercent: null,
    gameTime: '',
  });

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
      .then((res) => setCoachProfile(res.data))
      .catch((err) => console.error('Coach profile fetch error:', err.response?.data || err.message));
  }, []);

  useEffect(() => {
    if (!selectedPlayerId) return;

    axios
      .get(`https://cricket-academy-backend.onrender.com/api/player/${selectedPlayerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSelectedPlayer(res.data))
      .catch((err) => console.error('Player detail fetch error:', err));
  }, [selectedPlayerId]);

  const derivedCategory = (() => {
    const age = selectedPlayer?.age;
    if (age === undefined || age === null) return 'N/A';
    if (age < 11) return 'U11';
    if (age < 13) return 'U13';
    if (age < 15) return 'U15';
    if (age < 17) return 'U17';
    return 'Adult';
  })();

  const handleSaveStats = () => {
    const categoryTargets = {
      U11: 15,
      U13: 30,
      U15: 45,
      U17: 60,
      Adult: 60,
    };
    const target = categoryTargets[derivedCategory] || 30;
    const played = parseInt(manualStats.gamesPlayed) || 0;
    const gapPercent = Math.round(((target - played) / target) * 100);
    const gameTime =
      gapPercent >= 80 ? 'Major Gap' :
      gapPercent >= 50 ? 'Need Some More' :
      'On Track';

    setDerivedStats({ target, gapPercent, gameTime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'https://cricket-academy-backend.onrender.com/api/evaluations',
        {
          player: selectedPlayerId,
          coach: coachProfile._id,
          feedback,
          categories,
          coachComments,
          gamesPlayed: parseInt(manualStats.gamesPlayed) || 0,
          totalRuns: parseInt(manualStats.totalRuns) || 0,
          totalWickets: parseInt(manualStats.totalWickets) || 0,
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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Coach Evaluation Form</h2>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow text-sm text-gray-800">
        <strong>Coach:</strong> {coachProfile.name || 'Loading...'}
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
          <div><strong>CricClubs ID:</strong> {selectedPlayer.cricclubsID}</div>
          <div><strong>Player Profile:</strong> {selectedPlayer.role}</div>
          <div>
            <strong>Competitive Years:</strong>{' '}
            {selectedPlayer.competitiveStartYear
              ? new Date().getFullYear() - selectedPlayer.competitiveStartYear
              : 'N/A'}
          </div>
          <div><strong>Age:</strong> {selectedPlayer.age}</div>
          <div>
            <a
              href={`https://cricclubs.com/PremierCricAcad/viewPlayer.do?playerId=${selectedPlayer.cricclubsID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View CricClubs Profile ↗
            </a>
            <p className="text-sm text-gray-500 mt-1">
              Please open the link, review the stats, and enter them manually below.
            </p>
          </div>

          {/* 🔹 Manual Stat Entry */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Games Played</label>
              <input
                type="number"
                value={manualStats.gamesPlayed}
                onChange={(e) =>
                  setManualStats({ ...manualStats, gamesPlayed: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                placeholder="Enter manually"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Runs</label>
              <input
                type="number"
                value={manualStats.totalRuns}
                onChange={(e) =>
                  setManualStats({ ...manualStats, totalRuns: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                placeholder="Enter manually"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Wickets</label>
              <input
                type="number"
                value={manualStats.totalWickets}
                onChange={(e) =>
                  setManualStats({ ...manualStats, totalWickets: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                placeholder="Enter manually"
              />
            </div>
          </div>

          {/* 🔹 Save Stats Button */}
          <button
            type="button"
            onClick={handleSaveStats}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Stats
          </button>

          {/* 🔹 Derived Output */}
          {derivedStats.target !== null && (
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <div><strong>Target:</strong> {derivedStats.target}</div>
              <div><strong>Gap:</strong> {derivedStats.gapPercent}%</div>
              <div><strong>Game Time:</strong> {derivedStats.gameTime}</div>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Grouped Feedback + Evaluation Sections */}
      <form onSubmit={handleSubmit} className="space-y-8 mt-6">
        {['batting', 'bowling', 'mindset', 'fitness'].map((group) => (
          <div key={group} className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-semibold text-blue-700 capitalize">{group} Evaluation</h3>

            {/* Feedback Score + Comments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700">
                  {group.charAt(0).toUpperCase() + group.slice(1)} Score (1–10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={feedback[group].score}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      [group]: {
                        ...feedback[group],
                        score: parseInt(e.target.value) || '',
                      },
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Comments</label>
                <textarea
                  value={feedback[group].comments}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      [group]: {
                        ...feedback[group],
                        comments: e.target.value,
                      },
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
            </div>

            {/* Category Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(categories[group]).map(([field, value]) => (
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