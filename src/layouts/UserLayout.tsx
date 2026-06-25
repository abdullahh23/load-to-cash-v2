import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, LayoutDashboard, FileText, Settings, LogOut,
  Shield, Menu, X, ChevronLeft, ChevronRight,
  Sun, Moon, History, MessageCircle, Phone, Mail, Headphones,
} from 'lucide-react';
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
    const openSidebar  = () => setMobileOpen(true);
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
    { to: '/dashboard',      label: 'Weekly Loads',       icon: LayoutDashboard },
    { to: '/invoice',        label: 'Invoice Statements', icon: FileText },
    { to: '/settings',       label: 'Company Settings',   icon: Settings },
    { to: '/carrier-history',label: 'Carrier History',    icon: History },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Portal', icon: Shield });
  }

  const userInitial = profile?.full_name?.charAt(0).toUpperCase()
    || profile?.email?.charAt(0).toUpperCase()
    || 'U';

  // ── Sidebar inner content ─────────────────────────────────────────────
  const sidebarContent = (
    <div className="h-full flex flex-col no-print" style={{ background: '#0d1f3c' }}>

      {/* ── Brand Header ── */}
      <div
        className="flex items-center justify-between px-4 py-5 relative"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          {/* Logo image — full when expanded, icon-only when collapsed */}
          {collapsed ? (
            <img
              src="/logo.png"
              alt="LoadToCash"
              className="w-9 h-9 rounded-lg object-contain shrink-0"
              style={{ background: '#1d55b0', padding: '2px' }}
            />
          ) : (
            <img
              src="/logo.png"
              alt="LoadToCash"
              className="h-10 w-auto object-contain shrink-0"
              style={{ maxWidth: '140px' }}
            />
          )}
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-5 w-6 h-6 bg-white rounded-full items-center justify-center text-gray-500 hover:text-signal shadow-md transition-all z-10"
          style={{ border: '1px solid rgba(0,0,0,0.12)' }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {/* Section label */}
        {!collapsed && (
          <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>
            Main
          </div>
        )}

        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              data-tour={`nav-${item.to.replace('/', '')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'font-medium hover:text-white'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'rgba(255,255,255,0.12)', color: '#ffffff' }
                : { color: 'rgba(255,255,255,0.58)' }
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active left bar indicator */}
                  {isActive && (
                    <span
                      className="absolute left-0 w-0.5 h-7 rounded-r"
                      style={{ background: '#5b9df9' }}
                    />
                  )}
                  <Icon
                    size={17}
                    className="shrink-0"
                    style={{ color: isActive ? '#7db8ff' : 'rgba(255,255,255,0.55)' }}
                  />
                  {!collapsed && <span className="flex-1 min-w-0 truncate">{item.label}</span>}
                  {!collapsed && item.to === '/dashboard' && loads.length > 0 && (
                    <span
                      className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(29,85,176,0.6)', color: '#a5c8ff' }}
                    >
                      {loads.length}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Sidebar Footer ── */}
      <div
        className="px-2 py-3 space-y-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* User identity row */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-md" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white"
            style={{ background: '#1d55b0' }}
          >
            {userInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {profile?.full_name || 'My Account'}
              </div>
              <div className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.40)' }}>
                {profile?.email}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.50)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {darkMode
            ? <Sun size={15} className="shrink-0" style={{ color: 'rgba(255,255,255,0.50)' }} />
            : <Moon size={15} className="shrink-0" style={{ color: 'rgba(255,255,255,0.50)' }} />
          }
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.50)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.50)'; }}
        >
          <LogOut size={15} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-lane text-ink font-sans">

      {/* ── Desktop Permanent Sidebar ── */}
      <aside
        className={`hidden md:block transition-all duration-200 shrink-0 no-print ${collapsed ? 'w-16' : 'w-56'}`}
      >
        <div className="fixed top-0 bottom-0 left-0 z-20 transition-all duration-200" style={{ width: collapsed ? '4rem' : '14rem' }}>
          {sidebarContent}
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-30 no-print"
        style={{ background: '#0d1f3c', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#1d55b0' }}>
            <Truck size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">Load to Cash</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white/60 hover:text-white rounded-md transition-colors"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40 no-print"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-60 z-50 no-print"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        <main className="flex-1 p-4 md:p-7 max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* ── Privacy & Onboarding ── */}
      <PrivacyModal />
      <OnboardingTour />

      {/* ── Floating Support Widget ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 no-print">
        <AnimatePresence>
          {contactOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="bg-white dark:bg-gray-900 border border-steel/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden w-72"
            >
              {/* Header */}
              <div className="px-5 py-4" style={{ background: '#1d55b0' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Headphones size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Need Assistance?</div>
                    <div className="text-blue-100 text-xs mt-0.5">We typically reply within minutes</div>
                  </div>
                </div>
              </div>

              {/* Contact options */}
              <div className="p-3 space-y-2">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/16023451572"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 transition-colors group"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                    <MessageCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-green-800">WhatsApp Chat</div>
                    <div className="text-[11px] text-green-600">+1 (602) 345-1572</div>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </a>

                {/* Phone */}
                <a
                  href="tel:+16023451528"
                  className="flex items-center gap-3 p-3 rounded-lg bg-lane hover:bg-signal/5 border border-steel/10 hover:border-signal/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-signal/10 border border-signal/20 flex items-center justify-center shrink-0 group-hover:bg-signal transition-colors">
                    <Phone size={15} className="text-signal group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink">Main Office</div>
                    <div className="text-[11px] text-steel">(602) 345-1528</div>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:Nickindispatch@gmail.com"
                  className="flex items-center gap-3 p-3 rounded-lg bg-lane hover:bg-signal/5 border border-steel/10 hover:border-signal/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-signal/10 border border-signal/20 flex items-center justify-center shrink-0 group-hover:bg-signal transition-colors">
                    <Mail size={15} className="text-signal group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink">Email Us</div>
                    <div className="text-[11px] text-steel">Nickindispatch@gmail.com</div>
                  </div>
                </a>
              </div>

              <div className="px-4 pb-3">
                <div className="text-[10px] text-center text-steel/60">Mon–Fri · 9 AM – 6 PM EST</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB button */}
        <motion.button
          onClick={() => setContactOpen(v => !v)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="w-13 h-13 text-white rounded-xl shadow-lg flex items-center justify-center transition-colors relative"
          style={{
            width: '52px',
            height: '52px',
            background: contactOpen ? '#1a4c9e' : '#1d55b0',
          }}
          title="Contact Support"
        >
          <AnimatePresence mode="wait">
            {contactOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle size={20} />
              </motion.div>
            )}
          </AnimatePresence>
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
