import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, LayoutDashboard, FileText, Settings, LogOut, Shield, Menu, X, ChevronLeft, ChevronRight, Sun, Moon, History, MessageCircle, Phone, Mail, Headphones } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DataProvider, useAppLoads } from '../contexts/DataContext';
import { PrivacyModal } from '../components/PrivacyModal';
import { OnboardingTour } from '../components/OnboardingTour';

function UserLayoutInner() {
  const { signOut, profile, isAdmin } = useAuth();
  const { loads } = useAppLoads();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  
  // Responsive sidebar states
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Allow onboarding tour to open/close mobile sidebar
  useEffect(() => {
    const openSidebar = () => setMobileOpen(true);
    const closeSidebar = () => setMobileOpen(false);
    window.addEventListener('tour:open-sidebar', openSidebar);
    window.addEventListener('tour:close-sidebar', closeSidebar);
    return () => {
      window.removeEventListener('tour:open-sidebar', openSidebar);
      window.removeEventListener('tour:close-sidebar', closeSidebar);
    };
  }, []);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Weekly Loads', icon: LayoutDashboard },
    { to: '/invoice', label: 'Invoice statements', icon: FileText },
    { to: '/settings', label: 'Company settings', icon: Settings },
    { to: '/carrier-history', label: 'Carrier History', icon: History },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Portal', icon: Shield });
  }

  const userInitial = profile?.full_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U';

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-[#0f1419]/80 dark:backdrop-blur-xl border-r border-steel/10 dark:border-white/5 shadow-sm relative no-print">
      {/* Top Header Logo */}
      <div className="p-4 border-b border-steel/10 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-9 h-9 bg-signal rounded-xl flex items-center justify-center shadow-sm shrink-0"
          >
            <Truck size={18} className="text-white" />
          </motion.div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-sm font-bold text-ink leading-tight tracking-tight">Load to Cash</span>
              <span className="text-[10px] text-steel font-semibold uppercase tracking-wider">Dispatch System</span>
            </motion.div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-5 w-6 h-6 bg-white border border-steel/15 hover:border-signal rounded-full items-center justify-center text-steel hover:text-signal shadow-sm transition-all"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              data-tour={`nav-${item.to.replace('/', '')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-signal text-white shadow-sm shadow-signal/20 font-semibold'
                    : 'text-steel hover:text-ink hover:bg-lane'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
              {!collapsed && item.to === '/dashboard' && loads.length > 0 && (
                <span className="ml-auto text-xxs px-2 py-0.5 rounded-full bg-signal/15 text-signal font-bold">
                  {loads.length}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-steel/10 space-y-3 bg-lane/50 dark:bg-[#0a0f14]/50">
        <div className="flex items-center gap-3 px-2">
          {/* User Avatar Initial */}
          <div className="w-8 h-8 rounded-full bg-signal/10 border border-signal/20 text-signal flex items-center justify-center font-bold text-xs shrink-0">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-ink truncate" title={profile?.full_name || 'User Profile'}>
                {profile?.full_name || 'My Dispatch Account'}
              </div>
              <div className="text-[10px] text-steel truncate" title={profile?.email}>
                {profile?.email}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-steel hover:text-signal hover:bg-signal/5 rounded-xl transition-all"
        >
          {darkMode ? <Sun size={16} className="shrink-0" /> : <Moon size={16} className="shrink-0" />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-steel hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Security Badge */}
        {!collapsed && (
          <div className="text-center pt-2 border-t border-steel/8">
            <p className="text-[8px] text-steel/40 leading-relaxed font-medium">
              Protected by AWS · Secured by SSL
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-lane text-ink font-sans">
      {/* Desktop Permanent Sidebar Container */}
      <aside className={`hidden md:block transition-all duration-300 ${collapsed ? 'w-18' : 'w-60'} no-print`}>
        <div className="h-full fixed top-0 bottom-0 left-0 z-20">
          <div className={`h-full flex flex-col transition-all duration-300 ${collapsed ? 'w-18' : 'w-60'}`}>
            {sidebarContent}
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0f1419]/90 dark:backdrop-blur-xl border-b border-steel/10 dark:border-white/5 px-4 flex items-center justify-between z-30 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center">
            <Truck size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm text-ink uppercase tracking-wider">Load to Cash</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-ink hover:bg-lane rounded-xl transition-all"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40 no-print"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-64 z-50 no-print"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* First-login Privacy Modal */}
      <PrivacyModal />
      {/* Step-by-step onboarding tour */}
      <OnboardingTour />

      {/* ── Floating Contact / Support Widget ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 no-print">
        <AnimatePresence>
          {contactOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="bg-white dark:bg-[#0f1419]/90 dark:backdrop-blur-xl border border-steel/10 dark:border-white/5 rounded-2xl shadow-2xl shadow-ink/10 overflow-hidden w-72"
            >
              {/* Header */}
              <div className="bg-signal px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Headphones size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Need Assistance?</div>
                    <div className="text-teal-100 text-xs">We typically reply within minutes</div>
                  </div>
                </div>
              </div>

              {/* Contact options */}
              <div className="p-4 space-y-2">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/16023451572"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 transition-all group"
                >
                  <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-green-800">WhatsApp Chat</div>
                    <div className="text-[11px] text-green-600">+1 (602) 345-1572</div>
                  </div>
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:+16023451528"
                  className="flex items-center gap-3 p-3 rounded-xl bg-lane hover:bg-signal/5 border border-steel/10 hover:border-signal/30 transition-all group"
                >
                  <div className="w-9 h-9 bg-signal/10 border border-signal/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-signal group-hover:text-white transition-all">
                    <Phone size={16} className="text-signal group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">Main Office</div>
                    <div className="text-[11px] text-steel">(602) 345-1528</div>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:Nickindispatch@gmail.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-lane hover:bg-signal/5 border border-steel/10 hover:border-signal/30 transition-all group"
                >
                  <div className="w-9 h-9 bg-signal/10 border border-signal/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-signal transition-all">
                    <Mail size={16} className="text-signal group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">Email Us</div>
                    <div className="text-[11px] text-steel">Nickindispatch@gmail.com</div>
                  </div>
                </a>
              </div>

              <div className="px-4 pb-4">
                <div className="text-[10px] text-center text-steel/60">Mon–Fri · 9 AM – 6 PM EST</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle FAB button */}
        <motion.button
          onClick={() => setContactOpen(v => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-signal hover:bg-teal-500 text-white rounded-2xl shadow-xl shadow-signal/40 flex items-center justify-center transition-colors relative"
          title="Contact Support"
        >
          <AnimatePresence mode="wait">
            {contactOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <MessageCircle size={22} />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Pulse ring when closed */}
          {!contactOpen && (
            <span className="absolute inset-0 rounded-2xl animate-ping bg-signal/30 pointer-events-none" />
          )}
        </motion.button>
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
