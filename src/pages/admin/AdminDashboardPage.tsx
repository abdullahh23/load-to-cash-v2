import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, FileText, UserCheck, RefreshCw, Clock, Bell, Check } from 'lucide-react';
import { fetchAdminStats, fetchAdminNotifications, markNotificationRead } from '../../lib/invoices';

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function StatCard({ label, value, icon: Icon, delay, highlight }: { label: string; value: number; icon: typeof Users; delay: number; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`bg-white border rounded-2xl p-6 shadow-card hover:shadow-panel transition-all duration-300 flex items-start gap-4 ${
        highlight && value > 0 ? 'border-amber-200 ring-2 ring-amber-100' : 'border-steel/10'
      }`}
    >
      <div className={`w-12 h-12 border rounded-xl flex items-center justify-center shrink-0 shadow-xxs ${
        highlight && value > 0
          ? 'bg-amber-50 border-amber-200 text-amber-600'
          : 'bg-lane border-steel/5 text-signal'
      }`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-xxs font-bold text-steel uppercase tracking-widest">{label}</div>
        <div className={`text-3xl font-extrabold mt-1 ${highlight && value > 0 ? 'text-amber-700' : 'text-ink'}`}>
          {value.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalLoads: 0, totalInvoices: 0, pendingApprovals: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = () => {
    setLoading(true);
    Promise.all([
      fetchAdminStats(),
      fetchAdminNotifications(10).catch(() => []),
    ])
      .then(([s, n]) => {
        setStats(s);
        setNotifications(n);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      // silently fail
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink font-outfit">Admin Dashboard</h1>
          <p className="text-steel text-sm mt-0.5">Platform overview and user statistics</p>
        </div>
        <button
          onClick={loadStats}
          className="p-2 text-steel hover:text-signal hover:bg-lane rounded-xl transition-all"
          title="Refresh statistics"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-steel text-xs font-semibold">Loading platform statistics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <StatCard label="Total Registrations" value={stats.totalUsers} icon={Users} delay={0} />
            <StatCard label="Active Accounts" value={stats.activeUsers} icon={UserCheck} delay={0.05} />
            <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={Clock} delay={0.1} highlight />
            <StatCard label="Weekly Loads" value={stats.totalLoads} icon={Package} delay={0.15} />
            <StatCard label="Total Invoices" value={stats.totalInvoices} icon={FileText} delay={0.2} />
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="bg-white border border-steel/10 rounded-2xl shadow-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-steel/5 pb-3">
                <Bell size={16} className="text-signal" />
                <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
                  Recent Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-signal text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs transition-all ${
                      n.is_read
                        ? 'bg-lane/30 text-steel'
                        : 'bg-amber-50 border border-amber-100 text-amber-800 font-semibold'
                    }`}
                  >
                    <div className="flex-1">
                      <span>{n.message}</span>
                      <span className="text-steel ml-2 text-[10px]">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1 text-signal hover:bg-signal/10 rounded-lg transition-all ml-2 shrink-0"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
