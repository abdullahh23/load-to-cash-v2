import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, FileText, UserCheck } from 'lucide-react';
import { fetchAdminStats } from '../../lib/invoices';

function StatCard({ label, value, icon: Icon, delay }: { label: string; value: number; icon: typeof Users; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-2xl shadow-panel p-6 flex items-start gap-4"
    >
      <div className="w-11 h-11 bg-lane rounded-xl flex items-center justify-center">
        <Icon size={20} className="text-signal" />
      </div>
      <div>
        <div className="text-xs text-steel uppercase tracking-wide">{label}</div>
        <div className="text-3xl font-bold text-ink mt-1">{value.toLocaleString()}</div>
      </div>
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalLoads: 0, totalInvoices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-steel text-sm">Loading statistics…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
        <p className="text-steel text-sm mt-1">Platform overview and statistics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} delay={0} />
        <StatCard label="Active Users" value={stats.activeUsers} icon={UserCheck} delay={0.05} />
        <StatCard label="Total Loads" value={stats.totalLoads} icon={Package} delay={0.1} />
        <StatCard label="Total Invoices" value={stats.totalInvoices} icon={FileText} delay={0.15} />
      </div>
    </div>
  );
}
