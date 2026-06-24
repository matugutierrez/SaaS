import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';

export default function Settings() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');

  const isOwner = user?.role === 'owner';
  const canManageRoles = user?.role === 'owner' || user?.role === 'admin_plus';

  useEffect(() => {
    api.get('/organizations/members').then((res) => setMembers(res.data.members)).catch(() => {});
    api.get('/organizations/invite-code').then((res) => setInviteCode(res.data.inviteCode)).catch(() => {});
  }, []);

  const updateRole = async (userId, role) => {
    try {
      const res = await api.put('/organizations/members/role', { userId, role });
      setMembers((prev) => prev.map((m) => m._id === userId ? res.data.user : m));
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/organizations/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m._id !== userId));
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  const transferOwnership = async () => {
    if (!transferTarget) return;
    try {
      await api.post('/organizations/transfer-ownership', { userId: transferTarget });
      alert('Ownership transferred! You are now Admin+.');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    alert('Copied!');
  };

  const roleBadge = {
    owner: { bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Owner' },
    admin_plus: { bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Admin+' },
    admin: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Admin' },
    member: { bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', label: 'Member' },
  };

  const roleGradient = {
    owner: 'from-yellow-400 to-yellow-500',
    admin_plus: 'from-purple-400 to-purple-500',
    admin: 'from-blue-400 to-blue-500',
    member: 'from-gray-400 to-gray-500',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Settings</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">{user?.organization?.name}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm dark:shadow-gray-900/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-lg">🔗</div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Invite Code</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">Share this code with people you want to invite</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <code className="text-lg font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-3 rounded-xl flex-1 text-center tracking-widest text-primary-700 dark:text-primary-400 font-bold">{inviteCode}</code>
          <button onClick={copyCode}
            className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all active:scale-95">
            Copy
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-gray-900/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Members ({members.length})</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">Manage your team</p>
          </div>
          {isOwner && (
            <button onClick={() => setShowTransfer(true)}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3 py-1.5 rounded-lg transition">
              Transfer ownership
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {members.map((m) => {
            const badge = roleBadge[m.role] || roleBadge.member;
            return (
              <div key={m._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${roleGradient[m.role] || roleGradient.member} rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                    {m.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.role === 'owner' ? (
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${badge.bg}`}>Owner</span>
                  ) : canManageRoles ? (
                    <select value={m.role} onChange={(e) => updateRole(m._id, e.target.value)}
                      className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-medium">
                      <option value="admin_plus">Admin+</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  ) : (
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${badge.bg}`}>{badge.label}</span>
                  )}
                  {canManageRoles && m.role !== 'owner' && (
                    <button onClick={() => removeMember(m._id)}
                      className="text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition font-medium ml-1">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={showTransfer} onClose={() => setShowTransfer(false)} title="Transfer Ownership">
        <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl mb-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            You will become <strong>Admin+</strong>. The selected member will become the new <strong>Owner</strong>.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Owner</label>
            <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition">
              <option value="">Select a member...</option>
              {members.filter((m) => m.role !== 'owner').map((m) => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setShowTransfer(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Cancel</button>
            <button onClick={transferOwnership} disabled={!transferTarget}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-200 dark:shadow-amber-900/30 transition-all active:scale-95 disabled:opacity-50">
              Transfer Ownership
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
