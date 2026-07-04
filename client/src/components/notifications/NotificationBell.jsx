import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export default function NotificationBell() {
  const socket = useSocket();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get('/notifications').then((res) => {
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      api.get('/notifications').then((res) => {
        setNotifications(res.data.notifications);
        setUnread(res.data.unread);
      }).catch(() => {});
    };
    socket.on('notifications:updated', handler);
    return () => socket.off('notifications:updated', handler);
  }, [socket]);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-text-secondary hover:text-text border border-border">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-accent-terracotta text-page text-xs w-5 h-5 flex items-center justify-center">{unread}</span>}
      </button>
    </div>
  );
}
