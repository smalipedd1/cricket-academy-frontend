import { useState } from 'react';
import axios from 'axios';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/change-password', {
        oldPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  // Inline styles
  const containerStyle = {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif'
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: '600',
    color: '#333'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyle = {
    marginTop: '10px',
    fontWeight: '500'
  };

  const inputStyle = {
    padding: '10px',
    marginTop: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  };

  const buttonStyle = {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const buttonDisabledStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  };

  const feedbackStyle = {
    marginTop: '15px',
    color: message?.includes('successfully') ? 'green' : 'red',
    fontWeight: '500',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Change Password</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        <label style={labelStyle}>Old Password</label>
        <input
          type="password"
          style={inputStyle}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />

        <label style={labelStyle}>New Password</label>
        <input
          type="password"
          style={inputStyle}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          style={loading ? buttonDisabledStyle : buttonStyle}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Change Password'}
        </button>

        {message && <div style={feedbackStyle}>{message}</div>}
      </form>
    </div>
  );
}

export default ChangePassword;