import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, LayoutDashboard, FileText, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DataProvider, useAppLoads } from '../contexts/DataContext';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive ? 'bg-signal text-white shadow-sm' : 'text-steel hover:text-ink hover:bg-lane'
  }`;

function UserLayoutInner() {
  const { signOut, profile, isAdmin } = useAuth();
  const { loads } = useAppLoads();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-lane">
      <div className="flex">
        <aside className="w-60 min-h-screen bg-white border-r border-steel/10 shadow-sm flex flex-col no-print">
          <div className="p-5 border-b border-steel/10 bg-gradient-to-r from-white to-lane/50">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-9 h-9 bg-signal rounded-xl flex items-center justify-center shadow-sm"
              >
                <Truck size={18} className="text-white" />
              </motion.div>
              <div>
                <div className="text-sm font-bold text-ink leading-tight">Load to Cash</div>
                <div className="text-xs text-steel">Dispatch Invoice</div>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1 flex-1">
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard size={16} /> Loads
            </NavLink>
            <NavLink to="/invoice" className={navClass}>
              <FileText size={16} /> Invoice
            </NavLink>
            <NavLink to="/settings" className={navClass}>
              <Settings size={16} /> Settings
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navClass}>
                <Shield size={16} /> Admin
              </NavLink>
            )}
          </nav>

          <div className="p-3 border-t border-steel/10 space-y-2">
            {loads.length > 0 && (
              <div className="text-xs text-steel text-center">{loads.length} load{loads.length !== 1 ? 's' : ''} this week</div>
            )}
            <div className="text-xs text-steel truncate px-1" title={profile?.email}>{profile?.email}</div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-steel hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export function UserLayout() {
  return (
    <DataProvider>
      <UserLayoutInner />
    </DataProvider>
  );
}
