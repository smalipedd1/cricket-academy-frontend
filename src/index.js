import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// ✅ Configure axios globally
axios.defaults.baseURL =
  process.env.REACT_APP_API_BASE_URL || 'https://cricket-academy-backend.onrender.com';
axios.defaults.withCredentials = true; // include cookies/JWT if you use them

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);