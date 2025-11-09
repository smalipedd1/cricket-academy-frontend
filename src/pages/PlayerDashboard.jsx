import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import NotificationBell from './NotificationBell';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [contactUpdates, setContactUpdates] = useState({});
  const [sessions, setSessions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [entries, setEntries] = useState([]);
  const [skill, setSkill] = useState('batting');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [responseText, setResponseText] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data));

    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/sessions/upcoming', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSessions(res.data));

    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFeedback(res.data));

    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/performance-chart', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEntries(res.data.entries));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  const handleContactChange = (e) => {
    setContactUpdates({ ...contactUpdates, [e.target.name]: e.target.value });
  };

  const handleContactSave = () => {
    const token = localStorage.getItem('token');
    axios
      .patch('https://cricket-academy-backend.onrender.com/api/player/profile', contactUpdates, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data.player);
        setEditMode(false);
        setContactUpdates({});
      })
      .catch((err) => {
        console.error('Update error:', err.response?.data || err.message);
        alert('Failed to update profile.');
      });
  };

  const handleResponseSubmit = (sessionId) => {
    const token = localStorage.getItem('token');
    axios
      .patch(
        `https://cricket-academy-backend.onrender.com/api/player/feedback-response/${sessionId}`,
        { playerId: profile._id, responseText },
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
      .then((res) => setFeedback(res.data))
      .catch((err) => {
        console.error('Response error:', err);
        alert('Failed to submit response.');
      });
  };

  const filteredEntries = entries.filter((e) => {
    const date = new Date(e.date);
    return (
      (!startDate || date >= new Date(startDate)) &&
      (!endDate || date <= new Date(endDate))
    );
  });

  const validEntries = filteredEntries.filter((e) => {
    const rating = e.rating?.[skill];
    return rating !== undefined && rating !== null && rating > 0;
  });

  const chartData = {
    labels: validEntries.map((e) => new Date(e.date).toLocaleDateString()),
    datasets: [
      {
        label: `${skill.charAt(0).toUpperCase() + skill.slice(1)} Progress`,
        data: validEntries.map((e) => e.rating[skill]),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 1,
        max: 10,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Rating (1–10)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Session Date',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 space-y-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex justify-end items-center space-x-4">
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* 👤 Profile Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Specialty:</strong> {profile.specialty}</p>
            <p><strong>Username:</strong> {profile.username}</p>
            {editMode ? (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  defaultValue={profile.email}
                  onChange={handleContactChange}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  defaultValue={profile.phone}
                  onChange={handleContactChange}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  defaultValue={profile.address}
                  onChange={handleContactChange}
                  className="border px-3 py-2 rounded"
                />
                <button
                  onClick={handleContactSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Phone:</strong> {profile.phone}</p>
                <p><strong>Address:</strong> {profile.address}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit Contact Info
                </button>
              </>
            )}
          </div>
        </div>

        {/* 🧠 Session Feedback Section */}
        {feedback.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Session Feedback</h2>
            {feedback.map((fb) => (
              <div key={fb.sessionId} className="border p-4 rounded mb-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-blue-700">
                  Session on {new Date(fb.sessionDate).toLocaleDateString()}
                </h3>
                <p><strong>Focus Area:</strong> {fb.focusArea}</p>
                <p><strong>Coach Notes:</strong> {fb.notes}</p>
                <p><strong>Coach Rating:</strong></p>
                <ul className="list-disc ml-6">
                  {Object.entries(fb.rating || {}).map(([skill, value]) => (
                    <li key={skill}>{skill}: {value}</li>
                  ))}
                </ul>
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
        )}

        {/* 📊 Progress Chart */}
        {validEntries.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Skill Progress Chart</h2>

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

            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;