import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
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

  const roleBadge = {
    owner: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    admin_plus: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    member: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{user?.organization?.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={toggle} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
          <span className="text-lg">{dark ? '💡' : '🌙'}</span>
        </button>

        <div className="relative">
          <button onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
            className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-rose-500 to-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-red-900/50">{unread}</span>}
          </button>
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-gray-800">
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">Notifications</span>
                {unread > 0 && <button onClick={markAllRead} className="text-xs text-primary-600 font-medium hover:underline">Mark all read</button>}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-10">No notifications</p>
                ) : notifications.slice(0, 20).map((n) => (
                  <a key={n._id} href={n.link || '#'}
                    className={`block px-5 py-3.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''}`}>
                    <p className="text-gray-800 dark:text-gray-200">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
            className="flex items-center gap-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-3 py-1.5 transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-xl flex items-center justify-center text-sm font-medium shadow-sm">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleBadge[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                {user?.role === 'admin_plus' ? 'Admin+' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 py-2 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button onClick={logout}
                className="w-full text-left px-5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
