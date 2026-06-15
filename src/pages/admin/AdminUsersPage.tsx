import { useEffect, useState } from 'react';
import { fetchAdminUsers, approveUser, suspendUser, updateUserLimit, setUserDisabled } from '../../lib/invoices';
import { useAuth } from '../../contexts/AuthContext';
import { Users, AlertCircle, RefreshCw, Search, CheckCircle, XCircle, Edit3, Save } from 'lucide-react';

type AdminUser = Awaited<ReturnType<typeof fetchAdminUsers>>[number];

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [limitValue, setLimitValue] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    fetchAdminUsers()
      .then(setUsers)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load user list.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (userId: string) => {
    try {
      await approveUser(userId, user?.id ?? '');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approval failed.');
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await suspendUser(userId);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suspend failed.');
    }
  };

  const handleToggleDisabled = async (u: AdminUser) => {
    try {
      await setUserDisabled(u.id, !u.is_disabled);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed.');
    }
  };

  const handleSaveLimit = async (userId: string) => {
    try {
      const val = parseInt(limitValue, 10);
      if (isNaN(val) || val < 0) {
        setError('Limit must be a positive number (0 = unlimited).');
        return;
      }
      await updateUserLimit(userId, val);
      setEditingLimit(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed.');
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q);
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
      approved: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', dot: 'bg-green-500', label: 'Approved' },
      suspended: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Suspended' },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink font-outfit">User Accounts</h1>
          <p className="text-steel text-sm mt-0.5">Manage dispatch platform accounts, approvals, and upload limits.</p>
        </div>
        <button
          onClick={load}
          className="p-2 text-steel hover:text-signal hover:bg-lane rounded-xl transition-all"
          title="Refresh User Data"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-steel/15 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-signal/30 focus:border-signal transition-all"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl shadow-sm animate-fade-in">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-steel/10 bg-white shadow-card">
        {loading ? (
          <div className="p-12 text-center text-steel text-xs font-semibold">Loading platform users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-steel text-xs font-semibold">
            {search ? 'No users match your search.' : 'No users registered yet.'}
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-lane/50 border-b border-steel/10 text-steel text-[11px] font-bold uppercase tracking-wider">
                <th className="px-5 py-4 text-left">Email Address</th>
                <th className="px-5 py-4 text-left">Full Name</th>
                <th className="px-5 py-4 text-left">Role</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-center">Uploads</th>
                <th className="px-5 py-4 text-center">Limit</th>
                <th className="px-5 py-4 text-right">Loads</th>
                <th className="px-5 py-4 text-right">Invoices</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel/5">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-lane/30 transition-all">
                  <td className="px-5 py-4 font-semibold text-ink text-xs">{u.email}</td>
                  <td className="px-5 py-4 text-road font-medium">{u.full_name || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                      u.role === 'admin'
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">{statusBadge(u.status || 'approved')}</td>
                  <td className="px-5 py-4 text-center font-mono font-semibold text-road text-xs">
                    {u.uploads_used ?? 0}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {editingLimit === u.id ? (
                      <div className="flex items-center gap-1 justify-center">
                        <input
                          type="number"
                          min="0"
                          value={limitValue}
                          onChange={e => setLimitValue(e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-steel/20 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-signal"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveLimit(u.id); if (e.key === 'Escape') setEditingLimit(null); }}
                        />
                        <button
                          onClick={() => handleSaveLimit(u.id)}
                          className="p-1 text-signal hover:bg-signal/10 rounded-lg transition-all"
                          title="Save"
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingLimit(u.id); setLimitValue(String(u.monthly_upload_limit ?? 50)); }}
                        className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-road hover:text-signal transition-all"
                        title="Edit limit (0 = unlimited)"
                      >
                        {(u.monthly_upload_limit ?? 50) === 0 ? '∞' : u.monthly_upload_limit ?? 50}
                        <Edit3 size={10} className="text-steel" />
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-semibold text-road">{u.loadCount}</td>
                  <td className="px-5 py-4 text-right font-mono font-semibold text-road">{u.invoiceCount}</td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center gap-1.5 justify-end flex-wrap">
                      {(u.status === 'pending' || u.status === 'suspended') && (
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all border bg-signal/5 text-signal border-signal/20 hover:bg-signal hover:text-white"
                          title="Approve user"
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                      )}
                      {u.status === 'approved' && u.role !== 'admin' && (
                        <button
                          onClick={() => handleSuspend(u.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all border bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white"
                          title="Suspend user"
                        >
                          <XCircle size={12} /> Suspend
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleDisabled(u)}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all border ${
                            u.is_disabled
                              ? 'bg-signal/5 text-signal border-signal/20 hover:bg-signal hover:text-white'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-600 hover:text-white'
                          }`}
                        >
                          {u.is_disabled ? 'Enable' : 'Disable'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
