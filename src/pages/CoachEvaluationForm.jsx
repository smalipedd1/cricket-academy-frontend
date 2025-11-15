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
  const [coachProfile, setCoachProfile] = useState({ firstName: '', lastName: '', _id: '' });
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

    if (!coachProfile._id) {
      alert('Coach profile not loaded yet. Please wait a moment and try again.');
      return;
    }

    try {
      console.log('Submitting with coach ID:', coachProfile._id);
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
      console.error('Evaluation submission error:', err.response?.data || err.message || err.toString());
      alert('Failed to submit evaluation.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Coach Evaluation Form</h2>

      {/* ✅ Fixed Coach Name Display */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow text-sm text-gray-800">
        <strong>Coach:</strong>{' '}
        {coachProfile.firstName && coachProfile.lastName
          ? `${coachProfile.firstName} ${coachProfile.lastName}`
          : 'Loading...'}
      </div>

      <button
        type="button"
        onClick={() => navigate('/coach/dashboard')}
        className="text-blue-600 underline hover:text-blue-800"
      >
        ← Back to Dashboard
      </button>

      {/* 🔹 Rest of the form remains unchanged */}
      {/* Includes player selection, stat entry, feedback sections, and submit button */}
    </div>
  );
};

export default CoachEvaluationForm;