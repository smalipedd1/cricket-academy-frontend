import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CoachPlayerEvaluations = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [selectedEvalId, setSelectedEvalId] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://cricket-academy-backend.onrender.com/api/coach/players?status=Active', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlayers(res.data))
      .catch((err) => console.error('Player list fetch error:', err));
  }, []);

  useEffect(() => {
    if (!selectedPlayerId) return;

    axios
      .get(`https://cricket-academy-backend.onrender.com/api/evaluations/player/${selectedPlayerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.dateOfEvaluation) - new Date(a.dateOfEvaluation));
        setEvaluations(sorted);
        setFilteredEvaluations(sorted);
      })
      .catch((err) => console.error('Evaluation fetch error:', err));
  }, [selectedPlayerId]);

  const applyDateFilter = () => {
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;

    const filtered = evaluations.filter((ev) => {
      const date = new Date(ev.dateOfEvaluation);
      return (!from || date >= from) && (!to || date <= to);
    });

    setFilteredEvaluations(filtered);
    setSelectedEvalId(null);
  };

  const selectedEval = filteredEvaluations.find((ev) => ev._id === selectedEvalId);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-700">Player Evaluations</h2>
        <button
          onClick={() => navigate('/coach/dashboard')}
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 border border-gray-300"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Player Selection */}
      <label className="block font-medium text-gray-700">
        Select Player
        <select
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          className="border px-3 py-2 rounded w-full mt-1"
        >
          <option value="">Choose a player</option>
          {players.map((p) => (
            <option key={p._id} value={p._id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
      </label>

      {/* Date Filter */}
      {selectedPlayerId && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          <div className="col-span-2 text-right">
            <button
              onClick={applyDateFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* Evaluation List */}
      {filteredEvaluations.length > 0 ? (
        <div className="space-y-4 mt-6">
          {filteredEvaluations.map((ev) => (
            <div
              key={ev._id}
              className={`border rounded p-4 shadow cursor-pointer ${
                selectedEvalId === ev._id ? 'bg-blue-50 border-blue-400' : 'bg-white'
              }`}
              onClick={() => setSelectedEvalId(ev._id)}
            >
              <div className="text-sm text-gray-600">
                <strong>Date:</strong> {new Date(ev.dateOfEvaluation).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-700">
                <strong>Coach Comments:</strong> {ev.coachComments || '—'}
              </div>
              {ev.playerResponded && (
                <div className="text-xs text-green-700 mt-1">✅ Player responded</div>
              )}
            </div>
          ))}
        </div>
      ) : selectedPlayerId ? (
        <p className="text-gray-600 mt-4">No evaluations found for this player.</p>
      ) : null}

      {/* Full Evaluation Detail */}
      {selectedEval && (
        <div className="mt-6 border rounded p-6 bg-white shadow space-y-2">
          <h3 className="text-xl font-semibold text-blue-700">Evaluation Details</h3>
          <div><strong>Date:</strong> {new Date(selectedEval.dateOfEvaluation).toLocaleDateString()}</div>
          <div><strong>Coach Comments:</strong> {selectedEval.coachComments || '—'}</div>
          <div><strong>Games Played:</strong> {selectedEval.gamesPlayed}</div>
          <div><strong>Total Runs:</strong> {selectedEval.totalRuns}</div>
          <div><strong>Total Wickets:</strong> {selectedEval.totalWickets}</div>

          {['batting', 'bowling', 'mindset', 'fitness'].map((group) => (
            <div key={group} className="mt-4">
              <h4 className="text-md font-semibold text-gray-700 capitalize">{group}</h4>
              <div className="text-sm text-gray-700">
                <strong>Score:</strong> {selectedEval.feedback[group]?.score}
              </div>
              <div className="text-sm text-gray-700">
                <strong>Comments:</strong> {selectedEval.feedback[group]?.comments}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                {Object.entries(selectedEval.categories[group]).map(([field, value]) => (
                  <div key={field}>
                    <strong>{field.replace(/([A-Z])/g, ' $1')}:</strong> {value}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Player Response */}
          {selectedEval.playerResponded && selectedEval.playerResponse && (
            <div className="mt-6 border-t pt-4">
              <h4 className="text-md font-semibold text-green-700">Player Response</h4>
              <p className="text-sm text-gray-800 whitespace-pre-line">
                {selectedEval.playerResponse}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoachPlayerEvaluations;