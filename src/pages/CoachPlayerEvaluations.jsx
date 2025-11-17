import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CoachPlayerEvaluations = ({ viewer }) => {
  const role = viewer || localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const { id } = useParams(); // only used for player route
  const navigate = useNavigate();

  const [evaluations, setEvaluations] = useState([]);
  const [playerResponse, setPlayerResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const endpoint =
          role === 'coach'
            ? '/api/evaluations/coach-view'
            : `/api/evaluations/player/${id}`;

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvaluations(role === 'coach' ? res.data : [res.data]);
      } catch (err) {
        console.error('Evaluation fetch error:', err.response?.data || err.message);
        alert('Failed to load evaluations.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [id, role, token]);
  const handleSubmitResponse = async (evaluationId) => {
    try {
      await axios.post(
        `/api/evaluations/${evaluationId}/respond`,
        { playerResponse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Response submitted!');
  setEvaluations((prev) =>
  prev.map((e) =>
    e._id === evaluationId ? { ...e, playerResponded: true } : e
  )
);
    } catch (err) {
      console.error('Submit response error:', err.response?.data || err.message);
      alert('Failed to submit response.');
    }
  };

  if (loading) return <p className="p-4">Loading evaluations...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {role === 'coach' ? 'Player Evaluations' : 'Your Evaluation'}
      </h1>

      {evaluations.map((evalItem) => (
        <div key={evalItem._id} className="border rounded p-4 shadow space-y-2">
          <p><strong>Player:</strong> {evalItem.playerName}</p>
          <p><strong>Category:</strong> {evalItem.category}</p>
          <p><strong>Coach Comments:</strong> {evalItem.comments}</p>
          <p><strong>Submitted On:</strong> {new Date(evalItem.createdAt).toLocaleDateString()}</p>
          {role === 'player' && !evalItem.playerResponded && (
            <div className="space-y-2 mt-4">
              <textarea
                value={playerResponse}
                onChange={(e) => setPlayerResponse(e.target.value)}
                placeholder="Write your response..."
                className="w-full border rounded p-2"
              />
              <button
                onClick={() => handleSubmitResponse(evalItem._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit Response
              </button>
            </div>
          )}

          {role === 'player' && evalItem.playerResponded && (
            <p className="text-green-700 font-semibold">✅ You have already responded.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CoachPlayerEvaluations;