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

  const roleOptions = ['admin_plus', 'admin', 'member'];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Settings</h1>
        <p className="text-sm text-gray-500">{user?.organization?.name}</p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Invite Code</h2>
        <div className="flex items-center gap-3">
          <code className="text-lg font-mono bg-gray-100 px-4 py-2 rounded-lg">{inviteCode}</code>
          <button onClick={() => { navigator.clipboard.writeText(inviteCode); }} className="text-sm text-primary-600 hover:underline">
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Share this code with people you want to invite. They enter it during registration.</p>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Members ({members.length})</h2>
          {isOwner && (
            <button onClick={() => setShowTransfer(true)} className="text-sm text-orange-600 hover:underline">Transfer ownership</button>
          )}
        </div>
        <div className="divide-y">
          {members.map((m) => (
            <div key={m._id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                  {m.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {m.role === 'owner' ? (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-medium">Owner</span>
                ) : canManageRoles ? (
                  <select
                    value={m.role}
                    onChange={(e) => updateRole(m._id, e.target.value)}
                    className="text-xs px-2 py-1 border rounded focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {roleOptions.map((r) => <option key={r} value={r}>{r === 'admin_plus' ? 'Admin+' : r === 'admin' ? 'Admin' : 'Member'}</option>)}
                  </select>
                ) : (
                  <span className="text-xs text-gray-500 capitalize">{m.role}</span>
                )}
                {canManageRoles && m.role !== 'owner' && (
                  <button onClick={() => removeMember(m._id)} className="text-xs text-red-500 hover:underline ml-2">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showTransfer} onClose={() => setShowTransfer(false)} title="Transfer Ownership">
        <p className="text-sm text-gray-600 mb-4">You will become Admin+. The selected member will become the new Owner.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Owner</label>
            <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Select a member</option>
              {members.filter((m) => m.role !== 'owner').map((m) => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowTransfer(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={transferOwnership} disabled={!transferTarget}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50">
              Transfer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
