import { useEffect, useState } from 'react';
import axios from 'axios';

const PlayerDashboard = () => {
  const [playerData, setPlayerData] = useState(null);
  const [performanceChart, setPerformanceChart] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [responseText, setResponseText] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const token = localStorage.getItem('token');
  const playerId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token) return;

    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlayerData(res.data))
      .catch((err) => console.error('Player profile fetch error:', err));

    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/performance-chart', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPerformanceChart(res.data.entries))
      .catch((err) => console.error('Chart fetch error:', err));

    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFeedbacks(res.data);
        setFilteredFeedbacks(res.data);
      })
      .catch((err) => console.error('Feedback fetch error:', err));
  }, [token]);

  const handleFilter = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filtered = feedbacks.filter((fb) => {
      const sessionDate = new Date(fb.sessionDate);
      return sessionDate >= start && sessionDate <= end;
    });
    setFilteredFeedbacks(filtered);
  };

  const handleResponseSubmit = (sessionId) => {
    axios
      .patch(
        `https://cricket-academy-backend.onrender.com/api/player/feedback-response/${sessionId}`,
        { playerId, responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert('Response submitted!');
        setResponseText('');
        setSelectedSessionId(null);
        return axios.get('https://cricket-academy-backend.onrender.com/api/player/feedback', {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => {
        setFeedbacks(res.data);
        setFilteredFeedbacks(res.data);
      })
      .catch((err) => {
        console.error('Response error:', err);
        alert('Failed to submit response.');
      });
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-8">
        <h1 className="text-3xl font-bold text-green-700">Player Dashboard</h1>

        {playerData ? (
          <>
            <p className="text-lg">Welcome <strong>{playerData.firstName}</strong></p>

            {/* Feedback Filter */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">Session Feedback</h2>
              <div className="flex gap-4 mb-4">
                <label>
                  Start Date:
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                </label>
                <label>
                  End Date:
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                </label>
                <button
                  onClick={handleFilter}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Filter
                </button>
              </div>

              {filteredFeedbacks.map((fb) => (
                <div key={fb.sessionId} className="border p-4 rounded mb-4 bg-white shadow">
                  <h3 className="text-lg font-semibold text-blue-600">
                    Session on {new Date(fb.sessionDate).toLocaleDateString()}
                  </h3>
                  <p><strong>Focus Area:</strong> {fb.focusArea}</p>
                  <p><strong>Coach Rating:</strong> {fb.rating}</p>
                  <p><strong>Coach Notes:</strong> {fb.notes}</p>
                  <p><strong>Your Response:</strong> {fb.playerResponse || 'No response yet'}</p>

                  {!fb.playerResponse && (
                    <>
                      <textarea
                        placeholder="Write your response..."
                        value={selectedSessionId === fb.sessionId ? responseText : ''}
                        onChange={(e) => {
                          setSelectedSessionId(fb.sessionId);
                          setResponseText(e.target.value);
                        }}
                        className="border w-full p-2 mt-2 rounded"
                      />
                      <button
                        onClick={() => handleResponseSubmit(fb.sessionId)}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Submit Response
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Performance Chart */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-purple-700 mb-2">Performance Chart</h2>
              {performanceChart.length > 0 ? (
                <ul className="space-y-2">
                  {performanceChart.map((entry, index) => (
                    <li key={index} className="border p-4 rounded bg-purple-50">
                      <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
                      <p><strong>Rating:</strong> {entry.rating}</p>
                      <p><strong>Focus Area:</strong> {entry.focusArea}</p>
                      <p><strong>Notes:</strong> {entry.notes}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No performance data available.</p>
              )}
            </div>
          </>
        ) : (
          <p>Loading dashboard...</p>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;