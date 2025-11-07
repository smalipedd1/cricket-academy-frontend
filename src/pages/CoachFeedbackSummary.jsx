import { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const CoachFeedbackSummary = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [entries, setEntries] = useState([]);
  const [skill, setSkill] = useState('batting');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('https://cricket-academy-backend.onrender.com/api/coach/players?status=Active', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPlayers(res.data);
        setLoadingPlayers(false);
      })
      .catch((err) => {
        console.error('Player list fetch error:', err.response?.data || err.message);
        alert('Failed to load players.');
        setLoadingPlayers(false);
      });
  }, []);

  const handlePlayerSelect = (e) => {
    const playerId = e.target.value;
    setSelectedPlayerId(playerId);
    setLoadingFeedback(true);

    const token = localStorage.getItem('token');

    axios
      .get(`https://cricket-academy-backend.onrender.com/api/coach/feedback/player/${playerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFeedback(res.data);
        setLoadingFeedback(false);
      })
      .catch((err) => {
        console.error('Feedback fetch error:', err.response?.data || err.message);
        alert('Failed to load feedback.');
        setLoadingFeedback(false);
      });

    axios
      .get(`https://cricket-academy-backend.onrender.com/api/coach/player/${playerId}/performance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEntries(res.data.entries))
      .catch((err) => console.error('Chart data error:', err));
  };

  const filteredEntries = entries.filter((e) => {
    const date = new Date(e.date);
    return (
      (!startDate || date >= new Date(startDate)) &&
      (!endDate || date <= new Date(endDate))
    );
  });

  const chartData = {
    labels: filteredEntries.map((e) => new Date(e.date).toLocaleDateString()),
    datasets: [
      {
        label: `${skill.charAt(0).toUpperCase() + skill.slice(1)} Progress`,
        data: filteredEntries.map((e) => e.rating?.[skill] ?? null),
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.1)',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-purple-700">Player Progress Summary</h1>

        <button
          onClick={() => window.location.href = '/coach/dashboard'}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          ← Back to Dashboard
        </button>

        {loadingPlayers ? (
          <p className="mt-4">Loading players...</p>
        ) : (
          <select
            value={selectedPlayerId}
            onChange={handlePlayerSelect}
            className="border border-gray-300 px-4 py-2 rounded shadow-sm w-full md:w-1/2 mt-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select a player</option>
            {players.map((p) => (
              <option key={p._id} value={p._id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        )}

        {loadingFeedback && <p className="mt-4">Loading feedback...</p>}

        {!loadingFeedback && feedback.length > 0 && (
          <div className="space-y-4 mt-4">
            {feedback.map((entry, index) => (
              <div key={index} className="border border-gray-200 bg-white p-5 rounded-lg shadow hover:shadow-md transition">
                <p className="text-gray-600 text-sm mb-2">
                  <span className="font-semibold">Session:</span> {new Date(entry.sessionDate).toLocaleDateString()} | 
                  <span className="ml-2 font-semibold">Focus:</span> {entry.focusArea}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <SkillRating label="Batting" value={entry.rating?.batting} />
                  <SkillRating label="Bowling" value={entry.rating?.bowling} />
                  <SkillRating label="Wicketkeeping" value={entry.rating?.wicketkeeping} />
                  <SkillRating label="Fielding" value={entry.rating?.fielding} />
                </div>

                {entry.notes && (
                  <p className="mt-3 text-gray-700">
                    <span className="font-semibold">Coach Notes:</span> {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 📊 Skill Progress Chart */}
        {selectedPlayerId && entries.length > 0 && (
          <div className="mt-10 bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">Skill Progress Chart</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="border px-4 py-2 rounded"
              >
                <option value="batting">Batting</option>
                <option value="bowling">Bowling</option>
                <option value="wicketkeeping">Wicketkeeping</option>
                <option value="fielding">Fielding</option>
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-4 py-2 rounded"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-4 py-2 rounded"
              />
            </div>

            <Line data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

const SkillRating = ({ label, value }) => {
  const getColor = (val) => {
    if (val >= 8) return 'bg-green-100 text-green-700';
    if (val >= 4) return 'bg-yellow-100 text-yellow-700';
    if (val >= 1) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="text-center">
      <span className="block font-medium text-gray-700">{label}</span>
      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getColor(value)}`}>
        {value ?? 'N/A'}
      </span>
    </div>
  );
};

export default CoachFeedbackSummary;