import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import NotificationBell from './NotificationBell';

const PlayerDashboard = () => {
  const [profile, setProfile] = useState({});
  const [dob, setDob] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [responseText, setResponseText] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [evalResponseText, setEvalResponseText] = useState('');
  const [selectedEvalId, setSelectedEvalId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [evalStartDate, setEvalStartDate] = useState('');
  const [evalEndDate, setEvalEndDate] = useState('');
  const [feedbackStartDate, setFeedbackStartDate] = useState('');
  const [feedbackEndDate, setFeedbackEndDate] = useState('');
  const [showUnrespondedOnly, setShowUnrespondedOnly] = useState(false);
  const [skill, setSkill] = useState('batting');
  const [activeSection, setActiveSection] = useState('profile');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const savedSection = localStorage.getItem('activeSection');
    if (savedSection) setActiveSection(savedSection);
  }, []);

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  useEffect(() => {
    axios
      .get('https://cricket-academy-backend.onrender.com/api/player/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log('✅ Player profile loaded:', res.data);
        setProfile(res.data);
      })
      .catch((err) => {
        console.error('❌ Profile fetch error:', err.response?.data || err.message);
      });
  }, []);

  useEffect(() => {
    if (!profile._id) {
      console.warn('⏳ Waiting for profile._id before fetching evaluations');
      return;
    }

    console.log('📥 Fetching evaluations for player:', profile._id);

    axios
      .get(`https://cricket-academy-backend.onrender.com/api/evaluations/player/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log('✅ Evaluations loaded:', res.data);
        setEvaluations(res.data);
      })
      .catch((err) => {
        console.error('❌ Evaluation fetch error:', err.response?.data || err.message);
      });
  }, [profile._id]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleContactChange = (e) => {
    setProfile({ ...profile, emailAddress: e.target.value });
  };

  const handleContactSave = () => {
    axios
      .put(
        'https://cricket-academy-backend.onrender.com/api/player/update-contact',
        { emailAddress: profile.emailAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => setEditMode(false))
      .catch((err) => console.error('Contact update error:', err));
  };

  const handleResponseSubmit = (sessionId) => {
    axios
      .patch(
        `https://cricket-academy-backend.onrender.com/api/player/respond/${sessionId}`,
        { playerResponse: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setFeedback((prev) =>
          prev.map((fb) =>
            fb.sessionId === sessionId
              ? { ...fb, playerResponse: responseText }
              : fb
          )
        );
        setResponseText('');
        setSelectedSessionId(null);
      })
      .catch((err) => console.error('Response submit error:', err));
  };

  const handleEvaluationResponseSubmit = (evaluationId) => {
    axios
      .post(
        `https://cricket-academy-backend.onrender.com/api/evaluations/${evaluationId}/respond`,
        { playerResponse: evalResponseText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setEvaluations((prev) =>
          prev.map((ev) =>
            ev._id === evaluationId
              ? { ...ev, playerResponse: evalResponseText }
              : ev
          )
        );
        setEvalResponseText('');
        setSelectedEvalId(null);
      })
      .catch((err) => console.error('Evaluation response error:', err));
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
        {/* 📋 Coach Evaluations Section */}
        {activeSection === 'evaluations' && (
          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-blue-600">Coach Evaluations</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div key={ev._id} className="border p-4 rounded bg-gray-50">
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
                          Object.entries(ev.categories[group]).map(([field, value]) => {
                            const level = typeof value === 'object' ? value?.level : value;
                            return (
                              <div key={field}>
                                <strong>{field.replace(/([A-Z])/g, ' $1')}:</strong> {level || '—'}
                              </div>
                            );
                          })}
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
      </div>
    </div>
  );
};

export default PlayerDashboard;