import { useEffect, useState } from 'react';
import {
  fetchAdminUsers,
  suspendUser,
  approveUser,
  updateUserManualLimit,
  updateUserFileLimit,
  deleteUser,
  fetchLicenseKeys,
  createLicenseKey,
  toggleLicenseKeyStatus,
  updateLicenseKeyLimit,
  deleteLicenseKey,
  type LicenseKeyRecord
} from '../../lib/invoices';
import { useAuth } from '../../contexts/AuthContext';
import {
  AlertCircle, RefreshCw, Search, CheckCircle, XCircle, Edit3, Save, FileUp, PenLine, Trash2,
  Key, Plus, Copy, Check, ShieldAlert, Laptop, Users as UsersIcon, Clock
} from 'lucide-react';

type AdminUser = Awaited<ReturnType<typeof fetchAdminUsers>>[number];

export function AdminUsersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'web' | 'desktop'>('web');

  // Web Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [editingManualLimit, setEditingManualLimit] = useState<string | null>(null);
  const [editingFileLimit, setEditingFileLimit] = useState<string | null>(null);
  const [limitValues, setLimitValues] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Desktop License Keys state
  const [keys, setKeys] = useState<LicenseKeyRecord[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keySearch, setKeySearch] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [editingKeyLimitId, setEditingKeyLimitId] = useState<string | null>(null);
  const [keyLimitValues, setKeyLimitValues] = useState<Record<string, string>>({});

  // Generate Key Modal state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newUploadLimit, setNewUploadLimit] = useState('20');
  const [newExpiryDays, setNewExpiryDays] = useState('30'); // Default 1 Month
  const [generating, setGenerating] = useState(false);
  const [generatedSuccessKey, setGeneratedSuccessKey] = useState<string | null>(null);

  const loadUsers = () => {
    setLoadingUsers(true);
    setUserError(null);
    fetchAdminUsers()
      .then(setUsers)
      .catch(e => setUserError(e instanceof Error ? e.message : 'Failed to load user list.'))
      .finally(() => setLoadingUsers(false));
  };

  const loadKeys = () => {
    setLoadingKeys(true);
    setKeyError(null);
    fetchLicenseKeys()
      .then(setKeys)
      .catch(e => setKeyError(e instanceof Error ? e.message : 'Failed to load license keys.'))
      .finally(() => setLoadingKeys(false));
  };

  useEffect(() => {
    loadUsers();
    loadKeys();
  }, []);

  // Web Users handlers
  const handleSuspend = async (userId: string) => {
    try { await suspendUser(userId); loadUsers(); }
    catch (e) { setUserError(e instanceof Error ? e.message : 'Suspend failed.'); }
  };

  const handleApprove = async (userId: string) => {
    try { await approveUser(userId, user?.id ?? ''); loadUsers(); }
    catch (e) { setUserError(e instanceof Error ? e.message : 'Approve failed.'); }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleting(true);
    try {
      await deleteUser(userId);
      setConfirmDeleteId(null);
      loadUsers();
    } catch (e) {
      setUserError(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveManualLimit = async (userId: string) => {
    try {
      const val = parseInt(limitValues[userId] ?? '', 10);
      if (isNaN(val) || val < 0) { setUserError('Limit must be a positive number.'); return; }
      await updateUserManualLimit(userId, val);
      setEditingManualLimit(null);
      loadUsers();
    } catch (e) { setUserError(e instanceof Error ? e.message : 'Update failed.'); }
  };

  const handleSaveFileLimit = async (userId: string) => {
    try {
      const val = parseInt(limitValues[userId] ?? '', 10);
      if (isNaN(val) || val < 0) { setUserError('Limit must be a positive number.'); return; }
      await updateUserFileLimit(userId, val);
      setEditingFileLimit(null);
      loadUsers();
    } catch (e) { setUserError(e instanceof Error ? e.message : 'Update failed.'); }
  };

  // License Key handlers
  const handleGenerateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setKeyError(null);
    try {
      const record = await createLicenseKey({
        customerName: newCustomerName || 'Customer',
        customerEmail: newCustomerEmail,
        uploadLimit: parseInt(newUploadLimit, 10) || 20,
        expiresInDays: parseInt(newExpiryDays, 10) || 30,
      });
      setGeneratedSuccessKey(record.license_key);
      setNewCustomerName('');
      setNewCustomerEmail('');
      setNewUploadLimit('20');
      setNewExpiryDays('30');
      setIsGenerateModalOpen(false);
      loadKeys();
    } catch (e) {
      setKeyError(e instanceof Error ? e.message : 'Failed to generate key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleKeyStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleLicenseKeyStatus(id, !currentStatus);
      loadKeys();
    } catch (e) {
      setKeyError(e instanceof Error ? e.message : 'Failed to update key status.');
    }
  };

  const handleSaveKeyLimit = async (id: string) => {
    try {
      const val = parseInt(keyLimitValues[id] ?? '', 10);
      if (isNaN(val) || val < 0) { setKeyError('Limit must be a positive number.'); return; }
      await updateLicenseKeyLimit(id, val);
      setEditingKeyLimitId(null);
      loadKeys();
    } catch (e) { setKeyError(e instanceof Error ? e.message : 'Failed to update key limit.'); }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteLicenseKey(id);
      loadKeys();
    } catch (e) { setKeyError(e instanceof Error ? e.message : 'Failed to delete key.'); }
  };

  const copyToClipboard = (keyStr: string, id: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q);
  });

  const filteredKeys = keys.filter(k => {
    const q = keySearch.toLowerCase();
    return k.license_key.toLowerCase().includes(q) ||
           (k.customer_name || '').toLowerCase().includes(q) ||
           (k.customer_email || '').toLowerCase().includes(q);
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

  const keyStatusBadge = (rec: LicenseKeyRecord) => {
    const isExpired = rec.expires_at && new Date(rec.expires_at) < new Date();
    if (!rec.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 border-red-200 text-red-700">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Suspended
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 border-amber-200 text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Expired (30 Days)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-green-50 border-green-200 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink font-outfit flex items-center gap-2">
            User Accounts & Desktop Licenses
          </h1>
          <p className="text-steel text-sm mt-0.5">Manage web accounts, desktop activation keys, and upload limits.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { loadUsers(); loadKeys(); }}
            className="p-2 text-steel hover:text-signal hover:bg-lane rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={(loadingUsers || loadingKeys) ? 'animate-spin' : ''} />
          </button>
          {activeTab === 'desktop' && (
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} /> Generate New Key
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-steel/15 pb-1">
        <button
          onClick={() => setActiveTab('web')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'web'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <UsersIcon size={16} /> Web Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('desktop')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'desktop'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Key size={16} /> Desktop License Keys ({keys.length})
        </button>
      </div>

      {/* Generated Success Key Banner */}
      {generatedSuccessKey && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
              <Check size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">New License Key Created!</div>
              <div className="text-sm font-mono font-extrabold text-emerald-700 mt-0.5">{generatedSuccessKey}</div>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(generatedSuccessKey, 'new_gen')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            {copiedKeyId === 'new_gen' ? <Check size={14} /> : <Copy size={14} />}
            {copiedKeyId === 'new_gen' ? 'Copied!' : 'Copy Key'}
          </button>
        </div>
      )}

      {/* TAB 1: WEB ACCOUNTS */}
      {activeTab === 'web' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
            <input
              type="text"
              placeholder="Search web accounts by email or name..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-steel/15 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-signal/30 focus:border-signal transition-all"
            />
          </div>

          {userError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} /> {userError}
            </div>
          )}

          <div className="bg-white border border-steel/15 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-lane text-steel font-bold uppercase tracking-wider border-b border-steel/10">
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Manual Limit</th>
                    <th className="py-3 px-4 text-center">File Limit</th>
                    <th className="py-3 px-4 text-center">Loads</th>
                    <th className="py-3 px-4 text-center">Invoices</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel/10 text-road font-medium">
                  {loadingUsers ? (
                    <tr><td colSpan={10} className="py-8 text-center text-steel">Loading web users...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={10} className="py-8 text-center text-steel">No web accounts found.</td></tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-lane/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-ink">{u.email}</td>
                        <td className="py-3 px-4">{u.full_name || '—'}</td>
                        <td className="py-3 px-4 text-steel">{u.phone || '—'}</td>
                        <td className="py-3 px-4 font-mono uppercase text-[10px] text-steel">{u.role}</td>
                        <td className="py-3 px-4">{statusBadge(u.status)}</td>

                        {/* Manual Limit — editable */}
                        <td className="py-3 px-4 text-center">
                          {editingManualLimit === u.id ? (
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number" min="0" value={limitValues[u.id] ?? ''}
                                onChange={e => setLimitValues(prev => ({ ...prev, [u.id]: e.target.value }))}
                                className="w-14 px-1.5 py-1 text-xs border border-signal/40 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-signal"
                                autoFocus
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveManualLimit(u.id); if (e.key === 'Escape') setEditingManualLimit(null); }}
                              />
                              <button onClick={() => handleSaveManualLimit(u.id)} className="p-1 text-signal hover:bg-signal/10 rounded-lg" title="Save"><Save size={12} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingManualLimit(u.id); setLimitValues(prev => ({ ...prev, [u.id]: String(u.manual_load_limit ?? 15) })); }}
                              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-road hover:text-signal transition-all"
                              title="Edit manual limit (0 = unlimited)"
                            >
                              <PenLine size={10} className="text-steel" />
                              <span className="text-steel/70">{u.manual_loads_used ?? 0}/</span>
                              {(u.manual_load_limit ?? 15) === 0 ? '∞' : (u.manual_load_limit ?? 15)}
                              <Edit3 size={9} className="text-steel/50" />
                            </button>
                          )}
                        </td>

                        {/* File Limit — editable */}
                        <td className="py-3 px-4 text-center">
                          {editingFileLimit === u.id ? (
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number" min="0" value={limitValues[u.id] ?? ''}
                                onChange={e => setLimitValues(prev => ({ ...prev, [u.id]: e.target.value }))}
                                className="w-14 px-1.5 py-1 text-xs border border-signal/40 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-signal"
                                autoFocus
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveFileLimit(u.id); if (e.key === 'Escape') setEditingFileLimit(null); }}
                              />
                              <button onClick={() => handleSaveFileLimit(u.id)} className="p-1 text-signal hover:bg-signal/10 rounded-lg" title="Save"><Save size={12} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingFileLimit(u.id); setLimitValues(prev => ({ ...prev, [u.id]: String(u.file_upload_limit ?? 20) })); }}
                              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-road hover:text-signal transition-all"
                              title="Edit file limit (0 = unlimited)"
                            >
                              <FileUp size={10} className="text-steel" />
                              <span className="text-steel/70">{u.file_uploads_used ?? 0}/</span>
                              {(u.file_upload_limit ?? 20) === 0 ? '∞' : (u.file_upload_limit ?? 20)}
                              <Edit3 size={9} className="text-steel/50" />
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-ink">{u.loadCount}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-ink">{u.invoiceCount}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.status === 'pending' && (
                              <button onClick={() => handleApprove(u.id)} className="px-2.5 py-1 bg-green-600 text-white rounded-lg font-bold text-[10px]">Approve</button>
                            )}
                            {u.status === 'approved' && u.role !== 'admin' && (
                              <button onClick={() => handleSuspend(u.id)} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold text-[10px]">Suspend</button>
                            )}
                            {u.status === 'suspended' && (
                              <button onClick={() => handleApprove(u.id)} className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg font-bold text-[10px]">Re-Activate</button>
                            )}
                            {u.role !== 'admin' && (
                              confirmDeleteId === u.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDeleteUser(u.id)} disabled={deleting} className="px-2 py-1 bg-red-600 text-white rounded-lg font-bold text-[10px]">
                                    {deleting ? '...' : 'Confirm'}
                                  </button>
                                  <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 text-steel rounded-lg text-[10px]">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteId(u.id)} className="p-1 text-steel/40 hover:text-red-500 rounded-lg" title="Delete User">
                                  <Trash2 size={13} />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DESKTOP LICENSE KEYS */}
      {activeTab === 'desktop' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
            <input
              type="text"
              placeholder="Search desktop license keys by key code, customer name, or email..."
              value={keySearch}
              onChange={e => setKeySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-steel/15 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-signal/30 focus:border-signal transition-all"
            />
          </div>

          {keyError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} /> {keyError}
            </div>
          )}

          <div className="bg-white border border-steel/15 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">License Key Code</th>
                    <th className="py-3 px-4">Customer Name / Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Upload Limit</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {loadingKeys ? (
                    <tr><td colSpan={6} className="py-8 text-center text-steel">Loading desktop license keys...</td></tr>
                  ) : filteredKeys.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-steel">No desktop license keys found. Click "+ Generate New Key" to create one!</td></tr>
                  ) : (
                    filteredKeys.map(k => {
                      const expDateStr = k.expires_at ? new Date(k.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';
                      return (
                        <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-extrabold text-blue-600">
                            <div className="flex items-center gap-2">
                              <span>{k.license_key}</span>
                              <button
                                onClick={() => copyToClipboard(k.license_key, k.id)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                title="Copy Key"
                              >
                                {copiedKeyId === k.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{k.customer_name || 'Customer'}</div>
                            {k.customer_email && <div className="text-[11px] text-slate-400">{k.customer_email}</div>}
                          </td>
                          <td className="py-3 px-4">{keyStatusBadge(k)}</td>
                          <td className="py-3 px-4 text-center">
                            {editingKeyLimitId === k.id ? (
                              <div className="flex items-center gap-1 justify-center">
                                <input
                                  type="number" min="1"
                                  value={keyLimitValues[k.id] ?? String(k.upload_limit)}
                                  onChange={e => setKeyLimitValues({ ...keyLimitValues, [k.id]: e.target.value })}
                                  className="w-14 px-1.5 py-1 border border-blue-400 rounded text-center text-xs font-bold"
                                  autoFocus
                                  onKeyDown={e => { if (e.key === 'Enter') handleSaveKeyLimit(k.id); }}
                                />
                                <button onClick={() => handleSaveKeyLimit(k.id)} className="p-1 text-blue-600"><Save size={12} /></button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingKeyLimitId(k.id); setKeyLimitValues({ ...keyLimitValues, [k.id]: String(k.upload_limit) }); }}
                                className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 hover:text-blue-600"
                                title="Click to edit limit"
                              >
                                <span>{k.uploads_used}/</span>
                                <span className="text-blue-600">{k.upload_limit}</span>
                                <Edit3 size={10} className="text-slate-400" />
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {expDateStr}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleKeyStatus(k.id, k.is_active)}
                              className={`px-2 py-1 rounded font-bold text-[10px] border ${
                                k.is_active
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-green-50 text-green-700 border-green-200'
                              }`}
                            >
                              {k.is_active ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteKey(k.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded"
                              title="Delete Key"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE LICENSE KEY MODAL */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Generate Desktop License Key
              </h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateKeySubmit} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Customer / Dispatcher Name *</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Usman Dispatch Services"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-600 text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Customer Email (Optional)</label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={e => setNewCustomerEmail(e.target.value)}
                  placeholder="usman@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Upload Limit *</label>
                  <input
                    type="number" min="1"
                    value={newUploadLimit}
                    onChange={e => setNewUploadLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-600 text-slate-800 font-bold"
                    required
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">Default: 20 Rate Con uploads</div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Expiry Duration *</label>
                  <select
                    value={newExpiryDays}
                    onChange={e => setNewExpiryDays(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-600 text-slate-800 font-bold"
                  >
                    <option value="30">1 Month (30 Days)</option>
                    <option value="90">3 Months (90 Days)</option>
                    <option value="180">6 Months (180 Days)</option>
                    <option value="365">1 Year (365 Days)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Key will be formatted as <strong>LTCK-XXXX-YYYY</strong> and will automatically expire in <strong>{newExpiryDays} days</strong>.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
