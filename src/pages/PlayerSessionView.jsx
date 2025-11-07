import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const PlayerSessionView = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get(`https://cricket-academy-backend.onrender.com/api/player/session/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSession(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Session fetch error:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-4">Loading session...</p>;
  if (!session || !session.feedback || session.feedback.length === 0)
    return <p className="p-4">No feedback available for this session.</p>;

  const entry = session.feedback[0]; // Only one entry per player

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Session Feedback</h2>
      <p className="text-sm text-gray-600 mb-4">
        Date: {new Date(session.date).toLocaleDateString()} | Focus Area: {session.focusArea}
      </p>

      <div className="bg-white border rounded p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-2">Rating</h3>
        <ul className="text-sm space-y-1">
          {Object.entries(entry.rating).map(([skill, score]) => (
            <li key={skill}>
              <span className="font-semibold capitalize">{skill}:</span> {score}
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">Coach Notes</h3>
        <p className="text-sm text-gray-700">{entry.notes}</p>

        {entry.playerResponse && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-1">Your Response</h3>
            <p className="text-sm text-blue-600">{entry.playerResponse}</p>
          </div>
        )}

        <div className="mt-6">
          <Link
            to="/player/dashboard"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Go to Dashboard to Respond
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerSessionView;