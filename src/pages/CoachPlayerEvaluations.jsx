import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'https://cricket-academy-backend.onrender.com';

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded?.id || null;
  } catch {
    return null;
  }
};

const CoachPlayerEvaluations = ({ viewer }) => {
  const role = viewer || localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const { evaluationId } = useParams();
  const navigate = useNavigate();

  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);
  const [playerResponse, setPlayerResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [playerFilter, setPlayerFilter] = useState('');
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const endpoint =
          role === 'coach'
            ? `${BASE_URL}/api/evaluations/coach-view`
            : `${BASE_URL}/api/evaluations/player/${decodeToken(token)}`;

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvaluations(res.data);
        if (res.data.length > 0) {
          setSelectedEvaluationId(evaluationId || res.data[0]._id);
        }
      } catch (err) {
        console.error('Evaluation fetch error:', err.response?.data || err.message);
        alert('Failed to load evaluations.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [evaluationId, role, token]);

  const handleSubmitResponse = async (evaluationId) => {
    try {
      await axios.post(
        `${BASE_URL}/api/evaluations/${evaluationId}/respond`,
        { playerResponse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Response submitted!');
      setEvaluations((prev) =>
        prev.map((e) =>
          e._id === evaluationId ? { ...e, playerResponded: true, playerResponse } : e
        )
      );
    } catch (err) {
      console.error('Submit response error:', err.response?.data || err.message);
      alert('Failed to submit response.');
    }
  };

  const filteredEvaluations = evaluations.filter((e) => {
    const created = new Date(e.createdAt);
    const afterStart = startDate ? created >= new Date(startDate) : true;
    const beforeEnd = endDate ? created <= new Date(endDate) : true;
    const matchesPlayer =
      role === 'coach'
        ? e.playerName?.toLowerCase().includes(playerFilter.toLowerCase())
        : true;
    return afterStart && beforeEnd && matchesPlayer;
  });

  const selectedEvaluation = evaluations.find((e) => e._id === selectedEvaluationId);

  if (loading) return <p className="p-4">Loading evaluations...</p>;
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 🔙 Back Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {role === 'coach' ? 'Player Evaluations' : 'Your Evaluations'}
        </h1>
        <button
          onClick={() => navigate(role === 'coach' ? '/coach/dashboard' : '/player/dashboard')}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        {role === 'coach' && (
          <input
            type="text"
            placeholder="Filter by player name"
            value={playerFilter}
            onChange={(e) => setPlayerFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        )}
      </div>

      {/* 📋 Evaluation List + Detail View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Evaluation List */}
        <div className="md:col-span-1 border rounded p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Evaluations</h2>
          {filteredEvaluations.length === 0 ? (
            <p className="text-gray-500">No evaluations found.</p>
          ) : (
            <ul className="space-y-2">
              {filteredEvaluations.map((e) => (
                <li
                  key={e._id}
                  onClick={() => setSelectedEvaluationId(e._id)}
                  className={`cursor-pointer p-2 rounded ${
                    e._id === selectedEvaluationId
                      ? 'bg-blue-100 font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <p className="text-sm">
                    {role === 'coach' && <span>{e.playerName} — </span>}
                    {new Date(e.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Evaluation Detail Panel */}
        <div className="md:col-span-2 border rounded p-6 shadow space-y-4">
          {!selectedEvaluation ? (
            <p className="text-gray-500">Select an evaluation to view details.</p>
          ) : (
            <>
              <p><strong>Evaluation Date:</strong> {new Date(selectedEvaluation.createdAt).toLocaleDateString()}</p>
              <p><strong>Coach:</strong> {selectedEvaluation.coachName}</p>
              {role === 'coach' && (
                <p><strong>Player:</strong> {selectedEvaluation.playerName}</p>
              )}
              <p><strong>Coach Comments:</strong> {selectedEvaluation.coachComments || '—'}</p>
              <p><strong>Games Played:</strong> {selectedEvaluation.gamesPlayed}</p>
              <p><strong>Total Runs:</strong> {selectedEvaluation.totalRuns}</p>
              <p><strong>Total Wickets:</strong> {selectedEvaluation.totalWickets}</p>

              {['batting', 'bowling', 'mindset', 'fitness'].map((category) => {
                const catSection = selectedEvaluation.categories?.[category];
                const catFeedback = selectedEvaluation.feedback?.[category];
                const catSkills = catSection?.skills;
                if (!catSkills || typeof catSkills !== 'object') return null;

                return (
                  <div key={category}>
                    <p className="text-lg font-semibold text-gray-800 capitalize mt-4">{category}</p>
                    <p><strong>Score:</strong> {catFeedback?.score ?? '—'}</p>
                    <p><strong>Comments:</strong> {catFeedback?.comments || '—'}</p>
                    <ul className="list-disc list-inside text-sm text-gray-800 mt-2 space-y-1">
                      {Object.entries(catSkills).map(([skill, obj]) => (
                        <li key={skill}>
                          <span className="font-medium capitalize">{skill}:</span> {obj?.level || '—'}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {selectedEvaluation.playerResponded && (
                <div className="mt-4">
                  <p className="font-semibold text-gray-700">Player Response:</p>
                  <p className="text-gray-800 text-sm bg-gray-100 p-2 rounded">
                    {selectedEvaluation.playerResponse || 'No response text provided.'}
                  </p>
                </div>
              )}

              {role === 'player' && !selectedEvaluation.playerResponded && (
                <div className="space-y-2 mt-4">
                  <textarea
                    value={playerResponse}
                    onChange={(e) => setPlayerResponse(e.target.value)}
                    placeholder="Write your response..."
                    className="w-full border rounded p-2"
                  />
                  <button
                    onClick={() => handleSubmitResponse(selectedEvaluation._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Submit Response
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachPlayerEvaluations;