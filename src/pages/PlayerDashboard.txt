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

  // ... (rest of your component remains unchanged)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 space-y-10">
      {/* ... your existing JSX layout */}
    </div>
  );
};

export default PlayerDashboard;