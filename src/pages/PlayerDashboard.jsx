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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
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
        {entries.length > 0 && (
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

            <Line
              data={chartData}
              options={{
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
              }}
            />
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