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
        {/* 📝 Feedback Summary with Date Filter */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Feedback Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

          {feedback.length === 0 ? (
            <p className="text-gray-500 italic">No feedback available yet.</p>
          ) : (
            <div className="space-y-6">
              {feedback
                .filter((entry) => {
                  const date = new Date(entry.sessionDate);
                  const matchStart = !startDate || date >= new Date(startDate);
                  const matchEnd = !endDate || date <= new Date(endDate);
                  return matchStart && matchEnd;
                })
                .map((entry, index) => (
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

                    <p className="mt-3 text-gray-700">
                      <span className="font-semibold">Your Response:</span> {entry.playerResponse || 'No response yet.'}
                    </p>

                    <textarea
                      placeholder="Write your response..."
                      value={entry.responseText || ''}
                      onChange={(e) => {
                        const updated = [...feedback];
                        updated[index].responseText = e.target.value;
                        setFeedback(updated);
                      }}
                      className="border rounded w-full p-2 mt-2"
                    />

                    <button
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        axios
                          .patch(
                            `https://cricket-academy-backend.onrender.com/api/player/feedback-response/${entry.sessionId}`,
                            {
                              playerId: profile._id,
                              responseText: entry.responseText || '',
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                          )
                          .then(() => {
                            alert('Response submitted!');
                            const updated = [...feedback];
                            updated[index].playerResponse = entry.responseText;
                            updated[index].responseText = '';
                            setFeedback(updated);
                          })
                          .catch((err) => {
                            console.error('Response error:', err.response?.data || err.message);
                            alert('Failed to submit response.');
                          });
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
                    >
                      Submit Response
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
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

export default PlayerDashboard;