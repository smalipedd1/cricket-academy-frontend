import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CoachPlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`https://cricket-academy-backend.onrender.com/api/coach/player/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setForm(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Player fetch error:', err.response?.data || err.message);
        alert('Failed to load player profile.');
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    const token = localStorage.getItem('token');
    axios
      .patch(`https://cricket-academy-backend.onrender.com/api/coach/player/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert('Player updated successfully');
        navigate('/coach/dashboard');
      })
      .catch((err) => {
        console.error('Player update error:', err.response?.data || err.message);
        alert('Failed to update player.');
      });
  };

  if (loading) return <p className="p-6">Loading player profile...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Player Profile</h1>

      <div className="space-y-4">
        <Input label="Username" name="username" value={form.username} onChange={handleChange} />
        <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
        <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
        <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
        <Input label="Age" name="age" type="number" value={form.age} onChange={handleChange} />
        <Input label="Email Address" name="emailAddress" type="email" value={form.emailAddress} onChange={handleChange} />
        <Input label="CricClubs ID" name="cricclubsID" value={form.cricclubsID} onChange={handleChange} />

        <Dropdown
          label="Role"
          name="role"
          value={form.role}
          onChange={handleChange}
          options={['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper']}
        />

        <Dropdown
          label="Academy Level"
          name="academyLevel"
          value={form.academyLevel}
          onChange={handleChange}
          options={['Beginner', 'Intermediate', 'Advanced']}
        />

        <Dropdown
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={['Active', 'Inactive', 'Suspended', 'Graduated']}
        />

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            onClick={() => navigate('/coach/dashboard')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Reusable Input Component
const Input = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-gray-700">{label}</label>
    <input
      name={name}
      type={type}
      value={value || ''}
      onChange={onChange}
      className="w-full border px-4 py-2 rounded"
    />
  </div>
);

// ✅ Reusable Dropdown Component
const Dropdown = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-gray-700">{label}</label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full border px-4 py-2 rounded"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default CoachPlayerProfile;