import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Truck, LayoutDashboard, Users, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-ink text-white' : 'text-steel hover:text-ink hover:bg-lane'
  }`;

export function AdminLayout() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-lane">
      <div className="flex">
        <aside className="w-56 min-h-screen bg-white border-r border-steel/10 shadow-sm flex flex-col">
          <div className="p-5 border-b border-steel/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
                <Truck size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-ink">Admin Panel</div>
                <div className="text-xs text-steel">Load to Cash</div>
              </div>
            </div>
          </div>
          <nav className="p-3 space-y-1 flex-1">
            <NavLink to="/admin" end className={navClass}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={navClass}>
              <Users size={16} /> Users
            </NavLink>
          </nav>
          <div className="p-3 border-t border-steel/10">
            <div className="text-xs text-steel truncate mb-2">{profile?.email}</div>
            <button
              onClick={async () => { await signOut(); navigate('/login'); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-steel hover:text-red-600 rounded-lg"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </aside>
        <main className="flex-1 p-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
