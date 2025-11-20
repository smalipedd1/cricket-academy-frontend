import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket'; // ✅ Socket.IO connection

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawRole = localStorage.getItem('role');
    const role = rawRole?.toLowerCase();

    const fetchNotifications = () => {
      axios
        .get('https://cricket-academy-backend.onrender.com/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const all = Array.isArray(res.data) ? res.data : res.data.notifications;
          const filtered = role
            ? all.filter((n) => n.recipientRole === role)
            : all;
          setNotifications(filtered);
        })
        .catch((err) => console.error('Notification fetch error:', err));
    };

    if (token && role) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    socket.on('new-evaluation', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on('new-player-response', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('new-evaluation');
      socket.off('new-player-response');
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = async (notification) => {
    const token = localStorage.getItem('token');
    const rawRole = localStorage.getItem('role');
    const role = rawRole?.toLowerCase();

    try {
      await axios.patch(
        `https://cricket-academy-backend.onrender.com/api/notifications/${notification._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (notification.link) {
        navigate(notification.link);
      } else if (notification.session?._id) {
        if (role === 'coach') {
          navigate(`/coach/feedback/${notification.session._id}`);
        } else {
          navigate(`/player/session/${notification.session._id}`);
        }
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `https://cricket-academy-backend.onrender.com/api/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'feedback-submitted':
        return '📝';
      case 'evaluation':
        return '📊';
      case 'player-response':
        return '✅';
      default:
        return '📣';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-white bg-blue-600 px-3 py-2 rounded-full"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded p-4 z-50">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>

          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`cursor-pointer p-2 rounded flex justify-between items-start ${
                    n.isRead ? 'bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'
                  } transition duration-200`}
                >
                  <div>
                    <p className="text-sm">
                      {getIcon(n.type)} {n.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n._id);
                    }}
                    className="text-xs text-red-500 hover:underline ml-2"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;