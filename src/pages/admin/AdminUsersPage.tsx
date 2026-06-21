import { useEffect, useState } from 'react';
import { fetchAdminUsers, suspendUser, approveUser, updateUserManualLimit, updateUserFileLimit, deleteUser } from '../../lib/invoices';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, RefreshCw, Search, CheckCircle, XCircle, Edit3, Save, FileUp, PenLine, Trash2 } from 'lucide-react';

type AdminUser = Awaited<ReturnType<typeof fetchAdminUsers>>[number];

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingManualLimit, setEditingManualLimit] = useState<string | null>(null);
  const [editingFileLimit, setEditingFileLimit]     = useState<string | null>(null);
  const [limitValues, setLimitValues]               = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId]       = useState<string | null>(null);
  const [deleting, setDeleting]                     = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchAdminUsers()
      .then(setUsers)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load user list.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSuspend = async (userId: string) => {
    try { await suspendUser(userId); load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Suspend failed.'); }
  };

  const handleApprove = async (userId: string) => {
    try { await approveUser(userId, user?.id ?? ''); load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Approve failed.'); }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleting(true);
    try {
      await deleteUser(userId);
      setConfirmDeleteId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed. Add SUPABASE_SERVICE_ROLE_KEY to Railway env.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveManualLimit = async (userId: string) => {
    try {
      const val = parseInt(limitValues[userId] ?? '', 10);
      if (isNaN(val) || val < 0) { setError('Limit must be a positive number (0 = unlimited).'); return; }
      await updateUserManualLimit(userId, val);
      setEditingManualLimit(null);
      load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Update failed.'); }
  };

  const handleSaveFileLimit = async (userId: string) => {
    try {
      const val = parseInt(limitValues[userId] ?? '', 10);
      if (isNaN(val) || val < 0) { setError('Limit must be a positive number (0 = unlimited).'); return; }
      await updateUserFileLimit(userId, val);
      setEditingFileLimit(null);
      load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Update failed.'); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q);
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      pending:   { bg: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-500',  label: 'Pending'   },
      approved:  { bg: 'bg-green-50 border-green-200',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Approved'  },
      suspended: { bg: 'bg-red-50 border-red-200',      text: 'text-red-700',    dot: 'bg-red-500',    label: 'Suspended' },
    };
    const s = map[status] || map.approved;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  const LimitEditor = ({ userId, currentLimit, currentUsed, editing, setEditing, onSave, icon: Icon, label }: {
    userId: string; currentLimit: number; currentUsed: number;
    editing: string | null; setEditing: (v: string | null) => void;
    onSave: (id: string) => void; icon: any; label: string;
  }) => {
    if (editing === userId) {
      return (
        <div className="flex items-center gap-1 justify-center">
          <input
            type="number" min="0" value={limitValues[userId] ?? ''}
            onChange={e => setLimitValues(prev => ({ ...prev, [userId]: e.target.value }))}
            className="w-14 px-1.5 py-1 text-xs border border-steel/20 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-signal"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') onSave(userId); if (e.key === 'Escape') setEditing(null); }}
          />
          <button onClick={() => onSave(userId)} className="p-1 text-signal hover:bg-signal/10 rounded-lg transition-all" title="Save"><Save size={12} /></button>
        </div>
      );
    }
    return (
      <button
        onClick={() => { setEditing(userId); setLimitValues(prev => ({ ...prev, [userId]: String(currentLimit) })); }}
        className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-road hover:text-signal transition-all"
        title={`Edit ${label} limit (0 = unlimited)`}
      >
        <Icon size={10} className="text-steel" />
        <span className="text-steel/70">{currentUsed}/</span>
        {currentLimit === 0 ? '∞' : currentLimit}
        <Edit3 size={9} className="text-steel/50" />
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink font-outfit">User Accounts</h1>
          <p className="text-steel text-sm mt-0.5">Manage accounts, approvals, and load limits.</p>
        </div>
        <button onClick={load} className="p-2 text-steel hover:text-signal hover:bg-lane rounded-xl transition-all" title="Refresh User Data">
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
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-lane/50 border-b border-steel/10 text-steel text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-4 text-left">Email</th>
                <th className="px-4 py-4 text-left">Name</th>
                <th className="px-4 py-4 text-left">Role</th>
                <th className="px-4 py-4 text-left">Status</th>
                <th className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1"><PenLine size={10} /> Manual Limit</div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1"><FileUp size={10} /> File Limit</div>
                </th>
                <th className="px-4 py-4 text-right">Loads</th>
                <th className="px-4 py-4 text-right">Invoices</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel/5">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-lane/30 transition-all">
                  <td className="px-4 py-4 font-semibold text-ink text-xs">{u.email}</td>
                  <td className="px-4 py-4 text-road font-medium">{u.full_name || '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                      u.role === 'admin'
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">{statusBadge(u.status || 'approved')}</td>

                  {/* Manual Load Limit */}
                  <td className="px-4 py-4 text-center">
                    <LimitEditor
                      userId={u.id} currentLimit={(u as any).manual_load_limit ?? 2}
                      currentUsed={(u as any).manual_loads_used ?? 0}
                      editing={editingManualLimit} setEditing={setEditingManualLimit}
                      onSave={handleSaveManualLimit} icon={PenLine} label="manual"
                    />
                  </td>

                  {/* File Upload Limit */}
                  <td className="px-4 py-4 text-center">
                    <LimitEditor
                      userId={u.id} currentLimit={(u as any).file_upload_limit ?? 2}
                      currentUsed={(u as any).file_uploads_used ?? 0}
                      editing={editingFileLimit} setEditing={setEditingFileLimit}
                      onSave={handleSaveFileLimit} icon={FileUp} label="file"
                    />
                  </td>

                  <td className="px-4 py-4 text-right font-mono font-semibold text-road">{u.loadCount}</td>
                  <td className="px-4 py-4 text-right font-mono font-semibold text-road">{u.invoiceCount}</td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center gap-1.5 justify-end flex-wrap">
                      {u.role !== 'admin' && (
                        u.status === 'suspended' || u.is_disabled ? (
                          /* Suspended → Approve button (green) */
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all border bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white"
                            title="Approve / Re-enable user"
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                        ) : (
                          /* Active → Suspend button (amber) */
                          <button
                            onClick={() => handleSuspend(u.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-600 hover:text-white"
                            title="Suspend user"
                          >
                            <XCircle size={12} /> Suspend
                          </button>
                        )
                      )}

                      {/* Delete — always visible for non-admins */}
                      {u.role !== 'admin' && (
                        confirmDeleteId === u.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-red-600 font-bold">Sure?</span>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deleting}
                              className="text-[10px] font-bold px-2 py-1.5 rounded-xl bg-red-600 text-white border border-red-700 hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                              {deleting ? '...' : 'Yes, Delete'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] font-bold px-2 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(u.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all border bg-red-50 text-red-700 border-red-200 hover:bg-red-700 hover:text-white"
                            title="Permanently delete user"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        )
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
