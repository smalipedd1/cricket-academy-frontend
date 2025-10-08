import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('coach'); // or 'admin'
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const endpoint =
      role === 'admin' ? '/api/login' :
      role === 'coach' ? '/api/coach/login' :
      '/api/player/login'; // ✅ includes player route

    const res = await axios.post(`https://cricket-academy-backend.onrender.com${endpoint}`, {
      username, // ✅ use 'username' for all roles
      password
    });

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', role);

    if (role === 'coach') {
      navigate('/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/player/dashboard');
    }
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
    setError(err.response?.data?.message || 'Invalid credentials');
  }
};

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="coach">Coach</option>
          <option value="admin">Admin</option>
	  <option value="player">Player</option>
        </select>
        <br />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;