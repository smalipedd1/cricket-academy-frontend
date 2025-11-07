import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CoachFeedbackForm = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`https://cricket-academy-backend.onrender.com/api/coach/feedback/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSession(res.data);

        const hasExistingFeedback = Array.isArray(res.data.feedbackEntries) && res.data.feedbackEntries.length > 0;

        const initialFeedback = hasExistingFeedback
          ? res.data.feedbackEntries.map((p) => ({
              playerId: p.player._id,
              player: p.player, // ✅ include full player object
              rating: p.rating,
              notes: p.notes,
              focusArea: p.focusArea || 'Combined',
              playerResponse: p.playerResponse || '',
            }))
          : res.data.players.map((p) => ({
              playerId: p._id,
              player: p, // ✅ fallback for new feedback
              rating: {
                batting: 0,
                bowling: 0,
                wicketkeeping: 0,
                fielding: 0,
              },
              notes: '',
              focusArea: 'Combined',
              playerResponse: '',
            }));

        setFeedback(initialFeedback);
      })
      .catch((err) => {
        console.error('Session fetch error:', err.response?.data || err.message);
        alert('Failed to load session.');
      });
  }, [sessionId]);

  const handleChange = (playerId, field, value) => {
    setFeedback((prev) =>
      prev.map((entry) =>
        entry.playerId === playerId
          ? field === 'notes' || field === 'focusArea'
            ? { ...entry, [field]: value }
            : { ...entry, rating: { ...entry.rating, [field]: Number(value) } }
          : entry
      )
    );
  };

  const handleSubmit = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .patch(
        `https://cricket-academy-backend.onrender.com/api/coach/feedback/${sessionId}`,
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert('Feedback submitted!');
        navigate('/coach/dashboard');
      })
      .catch((err) => {
        console.error('❌ Feedback submit error:', err.response?.data || err.message);
        alert('Failed to submit feedback.');
      });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Submit Feedback</h1>
      {session && (
        <>
          <p className="text-gray-600">Session Date: {new Date(session.date).toLocaleDateString()}</p>
          <p className="text-gray-600">Focus Area: {session.focusArea}</p>
        </>
      )}

      {Array.isArray(feedback) &&
        feedback.map((entry) => {
          const player = entry.player || session?.players?.find((p) => p._id === entry.playerId);
          return (
            <div key={entry.playerId} className="border p-4 rounded mb-4 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {player?.firstName || player?.username} {player?.lastName || ''}
              </h2>

              {entry.playerResponse ? (
                <p className="text-blue-700 text-sm mb-2">
                  <strong>Player Response:</strong> {entry.playerResponse}
                </p>
              ) : (
                <p className="text-gray-400 italic text-sm mb-2">No response from player yet.</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                {['batting', 'bowling', 'wicketkeeping', 'fielding'].map((skill) => (
                  <div key={skill}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">{skill} rating</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={entry.rating[skill]}
                      onChange={(e) => handleChange(entry.playerId, skill, e.target.value)}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={entry.notes}
                  onChange={(e) => handleChange(entry.playerId, 'notes', e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Focus Area</label>
                <select
                  value={entry.focusArea}
                  onChange={(e) => handleChange(entry.playerId, 'focusArea', e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="Combined">Combined</option>
                  <option value="Batting">Batting</option>
                  <option value="Bowling">Bowling</option>
                  <option value="Fielding">Fielding</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Strategy">Strategy</option>
                </select>
              </div>
            </div>
          );
        })}

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => navigate('/coach/dashboard')}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
        >
          Back to Dashboard
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

export default CoachFeedbackForm;