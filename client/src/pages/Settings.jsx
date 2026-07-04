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
    owner: { bg: 'bg-transparent border border-border text-accent-ocre', label: 'Owner' },
    admin_plus: { bg: 'bg-transparent border border-border text-accent-blue', label: 'Admin+' },
    admin: { bg: 'bg-transparent border border-border text-accent-sage', label: 'Admin' },
    member: { bg: 'bg-transparent border border-border text-text-secondary', label: 'Member' },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif font-normal text-2xl text-text mb-1">Settings</h1>
        <p className="text-text-secondary text-xs tracking-[0.15em]">{user?.organization?.name}</p>
      </div>

      <div className="bg-panel border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rotate-45 bg-accent-blue" />
          <div>
            <h2 className="font-serif font-normal text-text">Invite Code</h2>
            <p className="text-text-secondary text-xs">Share this code with people you want to invite</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <code className="bg-[#1a1f29] border border-border text-text text-xs tracking-widest font-mono px-5 py-3 flex-1 text-center">{inviteCode}</code>
          <button onClick={copyCode}
            className="bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-3">
            Copy
          </button>
        </div>
      </div>

      <div className="bg-panel border border-border">
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
          <div>
            <h2 className="font-serif font-normal text-text">Members ({members.length})</h2>
            <p className="text-text-secondary text-xs">Manage your team</p>
          </div>
          {isOwner && (
            <button onClick={() => setShowTransfer(true)}
              className="text-accent-ocre border border-border text-xs px-3 py-1.5">
              Transfer ownership
            </button>
          )}
        </div>
        <div className="divide-y divide-border-light">
          {members.map((m) => {
            const badge = roleBadge[m.role] || roleBadge.member;
            return (
              <div key={m._id} className="px-6 py-4 flex items-center justify-between hover:bg-[#1a1f29]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a1f29] flex items-center justify-center text-sm font-bold text-text-secondary">
                    {m.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{m.name}</p>
                    <p className="text-xs text-text-secondary">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.role === 'owner' ? (
                    <span className={`text-xs px-2.5 py-1 font-medium ${badge.bg}`}>Owner</span>
                  ) : canManageRoles ? (
                    <select value={m.role} onChange={(e) => updateRole(m._id, e.target.value)}
                      className="bg-transparent border border-border text-text-secondary text-xs px-3 py-1.5 outline-none">
                      <option value="admin_plus">Admin+</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  ) : (
                    <span className={`text-xs px-2.5 py-1 font-medium ${badge.bg}`}>{badge.label}</span>
                  )}
                  {canManageRoles && m.role !== 'owner' && (
                    <button onClick={() => removeMember(m._id)}
                      className="text-accent-terracotta border border-border text-xs tracking-[0.15em] uppercase font-sans px-2 py-1 ml-1">
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
        <div className="px-6 py-4 bg-[#1a1f29] border border-border text-accent-ocre text-xs mb-4">
          You will become <strong className="font-medium">Admin+</strong>. The selected member will become the new <strong className="font-medium">Owner</strong>.
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-text-secondary text-xs tracking-[0.22em] uppercase mb-1.5">New Owner</label>
            <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-border text-text text-xs outline-none">
              <option value="">Select a member...</option>
              {members.filter((m) => m.role !== 'owner').map((m) => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setShowTransfer(false)}
              className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5">Cancel</button>
            <button onClick={transferOwnership} disabled={!transferTarget}
              className="bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5 disabled:opacity-50">
              Transfer Ownership
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
