import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [role, setRole] = useState('player');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const backendURL = 'https://cricket-academy-backend.onrender.com';
    const endpoint = `${backendURL}/api/${role}/login`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Unexpected response: ${text}`);
      }

      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', role.toLowerCase());

      console.log('✅ Logged in as:', role);
      console.log('🔐 Token:', data.token);

      // ✅ SPA-safe redirect with delay to avoid race condition
      setTimeout(() => {
        navigate(
          role === 'admin' ? '/admin/dashboard' :
          role === 'coach' ? '/coach/dashboard' :
          '/player/dashboard',
          { replace: true }
        );
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <div className="mb-4">
          <label htmlFor="role" className="block mb-1 font-medium">Role</label>
          <select
            id="role"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="player">Player</option>
            <option value="coach">Coach</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="username" className="block mb-1 font-medium">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block mb-1 font-medium">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your password"
          />
        </div>

        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}