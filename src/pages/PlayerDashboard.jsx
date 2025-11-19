import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from './NotificationBell';

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [dob, setDob] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [contactUpdates, setContactUpdates] = useState({});
  const [sessions, setSessions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [responseText, setResponseText] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [feedbackStartDate, setFeedbackStartDate] = useState('');
  const [feedbackEndDate, setFeedbackEndDate] = useState('');
  const [showUnrespondedOnly, setShowUnrespondedOnly] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const token = localStorage.getItem('token');

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
    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data));

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
    axios
      .patch(
        `https://cricket-academy-backend.onrender.com/api/player/feedback/${sessionId}`,
        { playerResponse: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        const updated = feedback.map((fb) =>
          fb.sessionId === sessionId ? { ...fb, playerResponse: responseText } : fb
        );
        setFeedback(updated);
        setResponseText('');
        setSelectedSessionId(null);
      })
      .catch((err) => {
        console.error('Response submit error:', err.response?.data || err.message);
        alert('Failed to submit response.');
      });
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

        {/* Section Toggle Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setActiveSection('profile')}
            className={`p-6 rounded-xl shadow text-center font-semibold ${
              activeSection === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
            }`}
          >
            🧍 My Profile
          </button>
          <button
            onClick={() => setActiveSection('feedback')}
            className={`p-6 rounded-xl shadow text-center font-semibold ${
              activeSection === 'feedback' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
            }`}
          >
            🧠 Session Feedback
          </button>
          <button
            onClick={() => setActiveSection('evaluations')}
            className={`p-6 rounded-xl shadow text-center font-semibold ${
              activeSection === 'evaluations' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
            }`}
          >
            📋 Coach Evaluations
          </button>
        </div>

        {/* Profile Section */}
        {activeSection === 'profile' && (
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
        )}
        {/* 🧠 Session Feedback Section */}
        {activeSection === 'feedback' && (
          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-blue-600">Session Feedback</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* 📋 Coach Evaluations Section → Navigation Button */}
        {activeSection === 'evaluations' && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Coach Evaluations</h2>
            <p className="text-gray-700 mb-6">
              View your full evaluation history, coach feedback, and skill breakdowns on a dedicated page.
            </p>
            <button
              onClick={() => navigate('/player/evaluations')}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Go to Coach Evaluations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;