import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CoachPlayerEvaluations = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [selectedEvalId, setSelectedEvalId] = useState(null);
  const [selectedEval, setSelectedEval] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [tempResponse, setTempResponse] = useState('');
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

  useEffect(() => {
    const evalObj = filteredEvaluations.find((ev) => ev._id === selectedEvalId);
    setSelectedEval(evalObj || null);
  }, [filteredEvaluations, selectedEvalId]);
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
              <button
                onClick={async () => {
                  try {
                    await axios.post(
                      `https://cricket-academy-backend.onrender.com/api/evaluations/${selectedEval._id}/respond`,
                      { playerResponse: tempResponse },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    alert('✅ Response submitted successfully!');
                    setFilteredEvaluations((prev) =>
                      prev.map((ev) =>
                        ev._id === selectedEval._id
                          ? {
                              ...ev,
                              playerResponded: true,
                              playerResponse: tempResponse,
                            }
                          : ev
                      )
                    );
                    setSelectedEvalId(selectedEval._id);
                    setTempResponse('');
                  } catch (err) {
                    console.error('Response submission error:', err.response?.data || err.message);
                    alert('Failed to submit response.');
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Submit Response
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoachPlayerEvaluations;