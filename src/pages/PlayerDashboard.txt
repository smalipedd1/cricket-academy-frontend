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
  const [dob, setDob] = useState(null);
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
  const [feedbackStartDate, setFeedbackStartDate] = useState('');
  const [feedbackEndDate, setFeedbackEndDate] = useState('');
  const [showUnrespondedOnly, setShowUnrespondedOnly] = useState(false);

  const [evaluations, setEvaluations] = useState([]);
  const [evalStartDate, setEvalStartDate] = useState('');
  const [evalEndDate, setEvalEndDate] = useState('');
  const [evalResponseText, setEvalResponseText] = useState('');
  const [selectedEvalId, setSelectedEvalId] = useState(null);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.error('Profile fetch error:', err));

    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/dob', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!res.data.dob) {
          navigate('/enter-dob');
        } else {
          setDob(res.data.dob);
        }
      });

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

  useEffect(() => {
    if (!profile._id) return;
    const token = localStorage.getItem('token');
    axios
      .get(`https://cricket-academy-backend.onrender.com/api/evaluations/player/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEvaluations(res.data))
      .catch((err) => console.error('Evaluation fetch error:', err));
  }, [profile._id]);

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

  const handleEvaluationResponseSubmit = (evaluationId) => {
    const token = localStorage.getItem('token');
    axios.post(
  		`https://cricket-academy-backend.onrender.com/api/evaluations/${evaluationId}/respond`,
        { playerResponse: evalResponseText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert('Response submitted!');
        setEvalResponseText('');
        setSelectedEvalId(null);
        return axios.get(`https://cricket-academy-backend.onrender.com/api/evaluations/player/${profile._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => setEvaluations(res.data))
      .catch((err) => {
        console.error('Evaluation response error:', err);
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
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Rating (1–10)' },
      },
      x: {
        title: { display: true, text: 'Session Date' },
      },
    },
    plugins: {
      legend: { display: true, position: 'top' },
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
            <p><strong>First Name:</strong> {profile.firstName}</p>
            <p><strong>Last Name:</strong> {profile.lastName}</p>
            {dob && (
              <>
                <p><strong>Date of Birth:</strong> {new Date(dob).toLocaleDateString()}</p>
                <p><strong>Age:</strong> {calculateAge(dob)}</p>
              </>
            )}
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Academy Level:</strong> {profile.academyLevel}</p>
            <p><strong>CricClubs ID:</strong> {profile.cricclubsID}</p>
            <p><strong>Status:</strong> {profile.status}</p>

            {editMode ? (
              <>
                <input
                  type="email"
                  name="emailAddress"
                  placeholder="Email"
                  defaultValue={profile.emailAddress}
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
                <p><strong>Email:</strong> {profile.emailAddress}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit Email
                </button>
              </>
            )}
          </div>
        </div>
        {/* 🧠 Session Feedback Section */}
        {feedback.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Session Feedback</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="date"
                value={feedbackStartDate}
                onChange={(e) => setFeedbackStartDate(e.target.value)}
                className="border px-4 py-2 rounded"
              />
              <input
                type="date"
                value={feedbackEndDate}
                onChange={(e) => setFeedbackEndDate(e.target.value)}
                className="border px-4 py-2 rounded"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUnrespondedOnly}
                  onChange={(e) => setShowUnrespondedOnly(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">Show only unresponded</span>
              </label>
            </div>

            {feedback
              .filter((fb) => {
                const sessionDate = new Date(fb.sessionDate);
                const start = feedbackStartDate ? new Date(feedbackStartDate) : null;
                const end = feedbackEndDate ? new Date(feedbackEndDate) : null;
                const withinDateRange =
                  (!start || sessionDate >= start) &&
                  (!end || sessionDate <= end);
                const matchesResponseFilter =
                  !showUnrespondedOnly || !fb.playerResponse;
                return withinDateRange && matchesResponseFilter;
              })
              .map((fb) => (
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

        {/* 📋 Coach Evaluations Section */}
        {evaluations.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Coach Evaluations</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="date"
                value={evalStartDate}
                onChange={(e) => setEvalStartDate(e.target.value)}
                className="border px-4 py-2 rounded"
              />
              <input
                type="date"
                value={evalEndDate}
                onChange={(e) => setEvalEndDate(e.target.value)}
                className="border px-4 py-2 rounded"
              />
            </div>

            {evaluations
              .filter((ev) => {
                const date = new Date(ev.dateOfEvaluation);
                const start = evalStartDate ? new Date(evalStartDate) : null;
                const end = evalEndDate ? new Date(evalEndDate) : null;
                return (!start || date >= start) && (!end || date <= end);
              })
              .map((ev) => (
                <div key={ev._id} className="border p-4 rounded mb-4 bg-gray-50">
                  <h3 className="text-lg font-semibold text-blue-700">
                    Evaluation on {new Date(ev.dateOfEvaluation).toLocaleDateString()}
                  </h3>
                  <p><strong>Coach:</strong> {ev.coachName || '—'}</p>
                  <p><strong>Coach Comments:</strong> {ev.coachComments || '—'}</p>
                  <p><strong>Games Played:</strong> {ev.gamesPlayed}</p>
                  <p><strong>Total Runs:</strong> {ev.totalRuns}</p>
                  <p><strong>Total Wickets:</strong> {ev.totalWickets}</p>

                  {['batting', 'bowling', 'mindset', 'fitness'].map((group) => (
                    <div key={group} className="mt-4">
                      <h4 className="text-md font-semibold text-gray-700 capitalize">{group}</h4>
                      <p><strong>Score:</strong> {ev.feedback?.[group]?.score}</p>
                      <p><strong>Comments:</strong> {ev.feedback?.[group]?.comments}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mt-2">
                        {ev.categories?.[group] &&
                          Object.entries(ev.categories[group]).map(([field, value]) => (
                            <div key={field}>
                              <strong>{field.replace(/([A-Z])/g, ' $1')}:</strong> {value}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}

                  <p className="mt-4"><strong>Your Response:</strong> {ev.playerResponse || 'No response yet'}</p>

                  {!ev.playerResponse && (
                    <>
                      <textarea
                        placeholder="Write your response to the coach..."
                        value={selectedEvalId === ev._id ? evalResponseText : ''}
                        onChange={(e) => {
                          setSelectedEvalId(ev._id);
                          setEvalResponseText(e.target.value);
                        }}
                        className="border w-full p-2 mt-2 rounded"
                      />
                      <button
                        onClick={() => handleEvaluationResponseSubmit(ev._id)}
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