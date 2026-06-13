import { useEffect, useState } from 'react';
import { fetchAdminUsers, setUserDisabled } from '../../lib/invoices';

type AdminUser = Awaited<ReturnType<typeof fetchAdminUsers>>[number];

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchAdminUsers()
      .then(setUsers)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleDisabled = async (user: AdminUser) => {
    try {
      await setUserDisabled(user.id, !user.is_disabled);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Users</h1>
        <p className="text-steel text-sm mt-1">Manage accounts and access</p>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <div className="bg-white rounded-2xl shadow-panel overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-steel text-sm">Loading users…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-lane text-steel text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-right">Loads</th>
                <th className="px-4 py-3 text-right">Invoices</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-steel/10">
                  <td className="px-4 py-3 text-ink">{u.email}</td>
                  <td className="px-4 py-3 text-road">{u.full_name || '—'}</td>
                  <td className="px-4 py-3 text-road capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-right">{u.loadCount}</td>
                  <td className="px-4 py-3 text-right">{u.invoiceCount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {u.is_disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleDisabled(u)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        u.is_disabled ? 'bg-signal/10 text-signal hover:bg-signal/20' : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {u.is_disabled ? 'Enable' : 'Disable'}
                    </button>
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
