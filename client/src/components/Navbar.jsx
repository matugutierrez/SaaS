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
    owner: 'bg-accent-ocre text-page',
    admin_plus: 'bg-accent-sage text-page',
    admin: 'bg-accent-blue text-page',
    member: 'bg-panel text-text-secondary border border-border-light',
  };

  return (
    <header className="bg-panel border-b border-border px-6 py-2.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-secondary">{user?.organization?.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={toggle} title={dark ? 'Modo dia' : 'Modo noche'}
          className="w-9 h-9 flex items-center justify-center rounded-sm border border-border bg-panel text-text-secondary hover:text-text transition-all">
          {dark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="relative">
          <button onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
            className="relative p-2 text-text-secondary hover:text-text hover:bg-[#1a1f29] rounded-sm transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-accent-terracotta text-page text-[10px] font-sans font-bold rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>}
          </button>
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-panel border-border z-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-light">
                <span className="font-serif text-sm text-text">Notifications</span>
                {unread > 0 && <button onClick={markAllRead} className="text-xs text-accent-blue hover:underline">Mark all read</button>}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border-light">
                {notifications.length === 0 ? (
                  <p className="text-center text-text-secondary text-xs py-10">No notifications</p>
                ) : notifications.slice(0, 20).map((n) => (
                  <a key={n._id} href={n.link || '#'}
                    className={`block px-5 py-3.5 text-xs hover:bg-[#1a1f29] transition ${!n.read ? 'bg-[#1a1f29]' : ''}`}>
                    <p className="text-text">{n.message}</p>
                    <p className="text-xs text-text-secondary mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
            className="flex items-center gap-2.5 hover:bg-[#1a1f29] rounded-sm px-3 py-1.5 transition-all">
            <div className="w-8 h-8 bg-accent-blue text-page rounded-sm flex items-center justify-center text-sm font-sans">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-sans text-text">{user?.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-sans ${roleBadge[user?.role] || 'bg-panel text-text-secondary border border-border-light'}`}>
                {user?.role === 'admin_plus' ? 'Admin+' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-panel border-border z-50 py-2">
              <div className="px-5 py-3 border-b border-border-light">
                <p className="text-sm font-serif text-text">{user?.name}</p>
                <p className="text-xs text-text-secondary">{user?.email}</p>
              </div>
              <button onClick={logout}
                className="w-full text-left px-5 py-2.5 text-xs text-accent-terracotta hover:bg-[#1a1f29] transition font-sans flex items-center gap-2">
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
