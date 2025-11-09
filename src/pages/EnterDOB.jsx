import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EnterDOB = () => {
  const [dob, setDob] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'https://cricket-academy-backend.onrender.com/api/player/dob',
        { dob },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        'https://cricket-academy-backend.onrender.com/api/player/update-age',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/player-dashboard');
    } catch (err) {
      console.error('DOB submission failed:', err);
      alert('Failed to save DOB. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Enter Your Date of Birth</h2>
        <p className="text-gray-600 mb-4">This is required to access your dashboard.</p>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default EnterDOB;