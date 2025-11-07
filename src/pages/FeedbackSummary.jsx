import { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackSummary = () => {
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [responses, setResponses] = useState({});
  const [focusFilter, setFocusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFeedbackEntries(res.data);
        setFilteredEntries(res.data);
      })
      .catch((err) => {
        console.error('Feedback fetch error:', err.response?.data || err.message);
        alert('Failed to load feedback.');
      });
  }, []);

  useEffect(() => {
    let filtered = [...feedbackEntries];

    if (focusFilter !== 'All') {
      filtered = filtered.filter(
        (entry) => entry.focusArea?.toLowerCase() === focusFilter.toLowerCase()
      );
    }

    if (startDate) {
      filtered = filtered.filter(
        (entry) => new Date(entry.sessionDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (entry) => new Date(entry.sessionDate) <= new Date(endDate)
      );
    }

    setFilteredEntries(filtered);
  }, [focusFilter, startDate, endDate, feedbackEntries]);

  const handleResponseChange = (sessionId, value) => {
    setResponses((prev) => ({ ...prev, [sessionId]: value }));
  };

  const handleSubmitResponse = (sessionId) => {
    const token = localStorage.getItem('token');
    const playerId = localStorage.getItem('playerId');

    axios
      .patch(
        `https://cricket-academy-backend.onrender.com/api/player/feedback-response/${sessionId}`,
        { playerId, responseText: responses[sessionId] },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert('Response submitted!');
        setResponses((prev) => ({ ...prev, [sessionId]: '' }));
      })
      .catch((err) => {
        console.error('Response error:', err.response?.data || err.message);
        alert('Failed to submit response.');
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Coach Feedback</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Focus Area:</label>
          <select
            value={focusFilter}
            onChange={(e) => setFocusFilter(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="All">All</option>
            <option value="Batting">Batting</option>
            <option value="Bowling">Bowling</option>
            <option value="Fielding">Fielding</option>
            <option value="Wicketkeeping">Wicketkeeping</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <p className="text-gray-500">No feedback matches this filter.</p>
      ) : (
        filteredEntries.map((entry) => (
          <div key={entry.sessionId} className="border p-4 rounded shadow">
            <p><strong>Date:</strong> {new Date(entry.sessionDate).toLocaleDateString()}</p>
            <p><strong>Focus Area:</strong> {entry.focusArea}</p>
            <p><strong>Notes:</strong> {entry.notes}</p>
            <p><strong>Ratings:</strong></p>
            <ul className="list-disc ml-6">
              <li>Batting: {entry.rating.batting}</li>
              <li>Bowling: {entry.rating.bowling}</li>
              <li>Wicketkeeping: {entry.rating.wicketkeeping}</li>
              <li>Fielding: {entry.rating.fielding}</li>
            </ul>
            <p><strong>Your Response:</strong> {entry.playerResponse || 'No response yet.'}</p>

            <textarea
              placeholder="Write your response..."
              value={responses[entry.sessionId] || ''}
              onChange={(e) => handleResponseChange(entry.sessionId, e.target.value)}
              className="border rounded w-full p-2 mt-2"
            />
            <button
              onClick={() => handleSubmitResponse(entry.sessionId)}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
              Submit Response
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedbackSummary;