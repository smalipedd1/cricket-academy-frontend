import { io } from 'socket.io-client';

export const socket = io('https://cricket-academy-backend.onrender.com', {
  query: {
    userId: localStorage.getItem('userId'), // or use token if your backend maps it
  },
  transports: ['websocket'],
});