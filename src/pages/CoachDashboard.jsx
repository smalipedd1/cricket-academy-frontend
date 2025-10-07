import { useEffect, useState } from 'react';
import axios from 'axios';

const CoachDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('https://cricket-academy-backend.onrender.com/api/dashboard?role=coach', {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGU5MThmMzE0YTU0NzQ3NTU0Y2E5MiIsInJvbGUiOiJjb2FjaCIsImlhdCI6MTc1OTg1Mjc4NiwiZXhwIjoxNzU5ODU2Mzg2fQ.OUrF7RsG2Pd4R4FT-9Cz3CKih7RJDcwBMo5nSxMYKRI'
      }
    })
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {data.name}</h1>
      <p>Total Sessions: {data.totalSessions}</p>
      <p>Total Players: {data.totalPlayers}</p>
      <h2>Recent Sessions</h2>
      <ul>
        {data.recentSessions.map((s, i) => (
          <li key={i}>
            {s.date} - {s.focusArea} ({s.playerCount} players)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoachDashboard;