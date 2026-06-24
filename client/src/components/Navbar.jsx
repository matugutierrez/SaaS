import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then((res) => {
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnread((prev) => prev + 1);
    };
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket]);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const roleLabel = {
    owner: 'Owner',
    admin_plus: 'Admin+',
    admin: 'Admin',
    member: 'Member',
  };

  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.organization?.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>}
          </button>
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="font-semibold text-sm">Notifications</span>
                {unread > 0 && <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">Mark all read</button>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">No notifications</p>
                ) : notifications.slice(0, 20).map((n) => (
                  <a key={n._id} href={n.link || '#'} className={`block px-4 py-3 text-sm hover:bg-gray-50 border-b last:border-0 ${!n.read ? 'bg-blue-50' : ''}`}>
                    <p className="text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }} className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="text-left">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{roleLabel[user?.role] || 'Member'}</p>
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border z-50 py-1">
              <div className="px-4 py-2 border-b">
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
