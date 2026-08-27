import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Truck, ArrowRight, UploadCloud, Cpu, CheckSquare, FileSpreadsheet,
  DollarSign, Star, Menu, X, Shield, Zap, Clock,
  BarChart3, FileText, Users, Cloud, Quote,
  TrendingUp, CheckCircle, Sparkles, XCircle, ChevronDown,
  Phone, Mail, MapPin, Download, HardDrive, MessageSquare, Key, Laptop, Send, ShieldCheck
} from 'lucide-react';

/* ─── smooth-scroll helper ──────────────────────────────────────────────────── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/* ─── Counter ────────────────────────────────────────────────────────────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 80));
    const t = setInterval(() => {
      n = Math.min(n + step, target);
      setCount(n);
      if (n >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── FadeUp wrapper ─────────────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const features = [
  { icon: Cpu,          title: 'AI Data Extraction',    desc: 'Upload any rate confirmation PDF — our AI instantly reads carrier name, load #, rate, and routing. Zero typing required.' },
  { icon: FileText,     title: '4 Invoice Templates',   desc: 'Classic, Minimalist, Executive Cargo, and Emerald Steel. Pick your style, generate a print-ready PDF in one click.' },
  { icon: BarChart3,    title: 'Weekly Dashboard',      desc: 'Track every load, gross revenue, dispatch fees, and outstanding payments in a clean real-time table.' },
  { icon: DollarSign,   title: 'Auto Fee Calculator',   desc: 'Dispatch fee calculated automatically on every load. No mental math, no formula errors — ever again.' },
  { icon: Users,        title: 'Carrier History',       desc: 'Every carrier organized — pull up past loads, rates, and invoices instantly. Build long-term relationships.' },
  { icon: Cloud,        title: 'Secure Cloud',          desc: 'Data encrypted on AWS, accessible from any device. SOC 2 compliant infrastructure used by Fortune 500 companies.' },
];

const steps = [
  { icon: UploadCloud,    num: '01', title: 'Upload PDF',         desc: 'Drop your rate confirmation. Any carrier format.' },
  { icon: Cpu,            num: '02', title: 'AI Extracts',        desc: 'Fields filled in under 3 seconds, automatically.' },
  { icon: CheckSquare,    num: '03', title: 'Review & Edit',      desc: 'Confirm data on your clean dashboard.' },
  { icon: FileSpreadsheet,num: '04', title: 'Generate Invoice',   desc: 'Pick a template. Render a pro PDF instantly.' },
  { icon: DollarSign,     num: '05', title: 'Get Paid',           desc: 'Send, track, collect. Faster than ever before.' },
];

const beforeAfter = [
  { task: 'Enter carrier info',      before: 'Type manually every time (~5 min)',    after: 'AI reads & fills instantly' },
  { task: 'Calculate dispatch fee',  before: 'Mental math or calculator (~2 min)',   after: 'Auto-calculated at your %' },
  { task: 'Create invoice',          before: 'Build from Excel/Word (~20 min)',      after: 'One-click PDF generation' },
  { task: 'Track loads',             before: 'Spreadsheet with manual updates',      after: 'Live real-time dashboard' },
  { task: 'Carrier history',         before: 'Dig through emails & files',           after: 'Instant searchable history' },
  { task: 'Billing errors',          before: 'Common — wrong load #, rate',          after: 'Zero — AI extracts accurately' },
  { task: 'Time per week',           before: '5–8 hours of admin work',              after: 'Under 30 minutes total' },
];

const stats = [
  { value: 5, suffix: '+', label: 'Hours saved weekly' },
  { value: 100, suffix: '%', label: 'Extraction accuracy' },
  { value: 4, suffix: '', label: 'Invoice templates' },
  { value: 30, suffix: 'min', label: 'Admin per week' },
];

const testimonials = [
  { quote: "I used to spend Sunday nights doing invoices. Now it takes 10 minutes on Monday morning. Load-to-Cash completely changed my workflow.", name: 'Marcus T.', role: 'Independent Dispatcher, TX', stars: 5 },
  { quote: "The AI reads every carrier's rate sheet correctly. I haven't had a billing error since I switched — carriers actually trust my invoices now.", name: 'Priya S.', role: 'Fleet Manager, 12 trucks', stars: 5 },
  { quote: "The dispatch fee auto-calc alone saves me from arguments with carriers. Everything is transparent, professional, and fast.", name: 'Jerome W.', role: 'Owner-Operator Dispatcher', stars: 5 },
];

/* ═════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */
export function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  const navLinks = [
    { label: 'Features',  id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Comparison', id: 'comparison' },
    { label: 'Testimonials', id: 'testimonials' },
  ];

  return (
    <div className="min-h-screen bg-[#060b14] text-white font-sans overflow-x-hidden">

      {/* ── Background ambience ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-[10%] w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(29,85,176,0.18) 0%, transparent 70%)' }} />
        <div className="absolute top-[35%] right-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[5%] left-[20%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(29,85,176,0.08) 0%, transparent 70%)' }} />
        {/* grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ════════════ NAVBAR ════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#060b14]/90 backdrop-blur-xl border-b border-white/6 shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="LoadToCash" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className="text-sm text-white/60 hover:text-white transition-colors font-medium">
                  {l.label}
                </button>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm text-white/70 hover:text-white font-medium transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link to="/signup"
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1d55b0, #2563eb)' }}>
                Get Started Free <ArrowRight size={14} />
              </Link>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="md:hidden bg-[#0a1020]/95 backdrop-blur-xl border-t border-white/6 px-6 py-6 space-y-4">
              {navLinks.map(l => (
                <button key={l.id} onClick={() => { scrollTo(l.id); setMobileOpen(false); }}
                  className="block w-full text-left text-sm text-white/70 hover:text-white font-medium py-2 transition-colors">
                  {l.label}
                </button>
              ))}
              <div className="pt-4 flex flex-col gap-3 border-t border-white/8">
                <Link to="/login" className="text-center py-2.5 text-sm font-medium text-white/70 hover:text-white border border-white/15 rounded-xl">
                  Sign In
                </Link>
                <Link to="/signup"
                  className="text-center py-2.5 text-sm font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #1d55b0, #2563eb)' }}>
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto text-center space-y-8">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold"
            style={{ background: 'rgba(29,85,176,0.12)', borderColor: 'rgba(29,85,176,0.35)', color: '#7eb3ff' }}>
            <Sparkles size={12} />
            AI-Powered Dispatch Automation · Built for Owner-Operators
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
            From Rate Con<br />
            <span className="relative inline-block">
              <span style={{ background: 'linear-gradient(135deg, #4d9fff, #7b61ff, #4d9fff)', backgroundSize: '200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                to Invoice
              </span>
            </span>{' '}
            in <span className="text-white/90">Seconds</span>
          </motion.h1>

          {/* Subline */}
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.2 }}
            className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed font-medium">
            Upload a rate confirmation PDF. Our AI extracts every field, calculates your dispatch fee, and generates a
            professional invoice — all before you finish your coffee.
          </motion.p>

          {/* CTA row */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#desktop-app"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1d55b0, #2563eb)', boxShadow: '0 8px 32px rgba(29,85,176,0.45)' }}>
              <Download size={18} />
              Download Desktop App (.exe)
            </a>
            <Link to="/signup"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold text-white/90 bg-white/10 hover:bg-white/15 border border-white/15 transition-all">
              <Sparkles size={16} className="text-yellow-400" />
              Try Online Web Version
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {[
              { icon: Shield, text: 'Bank-grade encryption' },
              { icon: Zap,    text: 'AI extracts in < 3s' },
              { icon: Clock,  text: 'Save 5+ hrs/week' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-white/40 font-medium">
                <Icon size={13} className="text-white/30" /> {text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero dashboard mock */}
        <motion.div initial={{ opacity: 0, y: 60, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-16 w-full max-w-4xl mx-auto px-4">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #0d1f3c 0%, #0a1628 100%)', boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(29,85,176,0.2)' }}>
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="ml-4 flex-1 h-5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="text-[10px] text-white/30 px-3 leading-5">load-to-cash.com/dashboard</div>
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="p-5 space-y-4">
              {/* Stat cards row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Weekly Loads', val: '7', icon: Truck, color: '#1d55b0', bg: 'rgba(29,85,176,0.12)' },
                  { label: 'Gross Revenue', val: '$12,400', icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
                  { label: 'Dispatch Fee', val: '$744', icon: DollarSign, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                  { label: 'Total Paid', val: '$620', icon: CheckCircle, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
                ].map(card => (
                  <div key={card.label} className="rounded-xl p-4 border border-white/6" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{card.label}</div>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                        <card.icon size={13} style={{ color: card.color }} />
                      </div>
                    </div>
                    <div className="text-lg font-bold text-white">{card.val}</div>
                  </div>
                ))}
              </div>
              {/* Table mock */}
              <div className="rounded-xl border border-white/6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="grid grid-cols-5 gap-0 px-4 py-2.5 border-b border-white/6 text-[10px] text-white/30 font-semibold uppercase tracking-wider">
                  <span>Load #</span><span>Broker</span><span>Route</span><span className="text-right">Amount</span><span className="text-right">Status</span>
                </div>
                {[
                  { num: 'OGRE45711', broker: 'Ship Amino',    route: 'TX → FL', amt: '$1,850', status: 'Paid',   sc: '#10b981', sb: 'rgba(16,185,129,0.15)' },
                  { num: 'JB98823-A', broker: 'Echo Global',  route: 'IL → GA', amt: '$2,100', status: 'Unpaid', sc: '#ef4444', sb: 'rgba(239,68,68,0.15)' },
                  { num: 'COYOTE411', broker: 'Coyote Log.',  route: 'CA → TX', amt: '$3,200', status: 'Paid',   sc: '#10b981', sb: 'rgba(16,185,129,0.15)' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-5 gap-0 px-4 py-2.5 border-b border-white/4 text-[10px] text-white/60 hover:bg-white/[0.02] transition-colors">
                    <span className="font-semibold text-white/80">{row.num}</span>
                    <span>{row.broker}</span>
                    <span className="text-white/40">{row.route}</span>
                    <span className="text-right font-semibold text-white/80">{row.amt}</span>
                    <span className="text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold" style={{ color: row.sc, background: row.sb }}>{row.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow under dashboard */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full blur-3xl -z-10"
            style={{ background: 'rgba(29,85,176,0.25)' }} />
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/25">
          <span className="text-[10px] font-medium uppercase tracking-widest">Scroll to explore</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ STATS STRIP ════════════ */}
      <section className="relative z-10" style={{ background: 'rgba(29,85,176,0.06)', boxShadow: 'inset 0 1px 0 rgba(29,85,176,0.18), inset 0 -1px 0 rgba(29,85,176,0.18)' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.08} className="text-center">
                <div className="text-4xl font-black text-white mb-1">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-white/45 font-medium">{s.label}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" className="relative z-10 py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(29,85,176,0.12)', border: '1px solid rgba(29,85,176,0.30)', color: '#7eb3ff' }}>
              <Zap size={11} /> Everything You Need
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Built for dispatch. <br className="hidden md:block"/>
              <span style={{ background: 'linear-gradient(135deg, #4d9fff, #7b61ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Perfected for profit.
              </span>
            </h2>
            <p className="text-white/45 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Every feature was built from real dispatcher pain points. No fluff — just tools that save time and make money.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.07}>
                <div className="group h-full p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-default"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(29,85,176,0.5)'; (e.currentTarget as HTMLElement).style.background = 'rgba(29,85,176,0.07)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(29,85,176,0.15)', border: '1px solid rgba(29,85,176,0.25)' }}>
                    <f.icon size={20} style={{ color: '#5b9df9' }} />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ DESKTOP VERSION & PRIVACY SECTION ════════════ */}
      <section id="desktop-app" className="relative z-10 py-24 px-4 bg-gradient-to-b from-blue-950/20 via-[#091325] to-[#060b14]">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#60a5fa' }}>
              <Laptop size={12} /> Desktop Application Edition
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              100% Local Data Security. <br className="hidden md:block" />
              <span className="text-blue-400">Your System. Your Rules.</span>
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Prefer keeping your load logs, carrier rates, and invoices strictly on your own computer? Download our standalone Windows Desktop App — zero cloud data sharing!
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Desktop Card */}
            <FadeUp delay={0.1}>
              <div className="h-full p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-900/20 to-slate-900/40 relative overflow-hidden flex flex-col justify-between shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <HardDrive className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30">
                      Windows Native App (.exe)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">LoadToCash Desktop App</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      All carrier details, gross pay logs, and generated invoices are saved <strong className="text-white">100% locally on your system</strong> (<code className="text-blue-300 text-xs bg-slate-800 px-1.5 py-0.5 rounded">AppData/Roaming</code>). Zero database cloud leaks.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      <span><strong>100% Local Storage:</strong> Total privacy for your load records.</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      <span><strong>Standalone Installer:</strong> Download `.exe` & run natively without commands.</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      <span><strong>Flexible Licensing:</strong> 30-day expirable activation key support.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 space-y-4">
                  <div className="bg-blue-950/60 border border-blue-500/20 rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-bold text-blue-300 flex items-center gap-2">
                      <Key className="w-4 h-4 text-yellow-400" /> How to Get Your License Key & Pricing?
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      For Desktop App License Keys & Custom Pricing, simply <strong>Send us an Email or Text Message</strong>. We generate and text/email your key instantly!
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-white">
                      <a href="mailto:nickdispatch@gmail.com" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 underline">
                        <Mail className="w-3.5 h-3.5" /> Email Us
                      </a>
                      <a href="tel:+10000000000" className="flex items-center gap-1.5 text-green-400 hover:text-green-300 underline">
                        <MessageSquare className="w-3.5 h-3.5" /> Text / Call Us
                      </a>
                    </div>
                  </div>

                  <a
                    href="https://drive.google.com/uc?export=download&id=16YmU_emQZwBkQhP0dbftWce09tRzmesE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" /> Download Desktop App (.exe)
                  </a>
                </div>
              </div>
            </FadeUp>

            {/* Online Version Card */}
            <FadeUp delay={0.2}>
              <div className="h-full p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-slate-900/40 relative overflow-hidden flex flex-col justify-between shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                      <Cloud className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30">
                      Cloud Web Version
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">LoadToCash Web Online</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Instant trial in your web browser — zero installation required! Access from any computer, tablet, or mobile device on the go.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      <span><strong>Zero Install:</strong> Works directly in Chrome, Edge, Safari, or Firefox.</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      <span><strong>Instant Free Trial:</strong> Test AI Rate Con parsing in 5 seconds online.</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      <span><strong>Cloud Access:</strong> Access your account anytime anywhere.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 space-y-4">
                  <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-4 space-y-1">
                    <div className="text-xs font-bold text-purple-300">Want to test features online right now?</div>
                    <p className="text-xs text-slate-300">
                      Try our Online Version for free before downloading the Desktop App!
                    </p>
                  </div>

                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" /> Start Free Online Trial <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how-it-works" className="relative z-10 py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.30)', color: '#a5b4fc' }}>
              <Clock size={11} /> Under 3 minutes, start to finish
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">How It Works</h2>
            <p className="text-white/45 text-lg max-w-xl mx-auto">Five steps. Three minutes. Done.</p>
          </FadeUp>

          <div className="relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(29,85,176,0.4), rgba(29,85,176,0.4), transparent)' }} />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {steps.map((s, i) => (
                <FadeUp key={s.title} delay={i * 0.1} className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10"
                      style={{ background: 'linear-gradient(135deg, rgba(29,85,176,0.25), rgba(29,85,176,0.08))', border: '1px solid rgba(29,85,176,0.35)' }}>
                      <s.icon size={26} style={{ color: '#5b9df9' }} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white z-20"
                      style={{ background: 'linear-gradient(135deg, #1d55b0, #2563eb)' }}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="font-bold text-white text-sm mb-1.5">{s.title}</div>
                  <div className="text-white/40 text-xs leading-relaxed">{s.desc}</div>
                </FadeUp>
              ))}
            </div>
          </div>

          <FadeUp delay={0.5} className="mt-12 text-center">
            <Link to="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1d55b0, #2563eb)', boxShadow: '0 8px 24px rgba(29,85,176,0.40)' }}>
              Try It Free Now <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ════════════ BEFORE vs AFTER ════════════ */}
      <section id="comparison" className="relative z-10 py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <XCircle size={11} /> The Old Way vs The New Way
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Stop Losing Hours to Admin</h2>
            <p className="text-white/45 text-lg max-w-xl mx-auto">See exactly how much time you're wasting — and how fast you'll win it back.</p>
          </FadeUp>

          <FadeUp>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', boxShadow: '0 0 0 1px rgba(29,85,176,0.15)' }}>
              {/* Header row */}
              <div className="grid grid-cols-3 gap-0">
                <div className="py-4 px-5 text-xs font-bold text-white/40 uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(29,85,176,0.15)' }}>Task</div>
                <div className="py-4 px-5" style={{ borderLeft: '1px solid rgba(29,85,176,0.12)', borderBottom: '1px solid rgba(29,85,176,0.15)' }}>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">
                    <XCircle size={12} /> Before (Manual)
                  </span>
                </div>
                <div className="py-4 px-5" style={{ borderLeft: '1px solid rgba(29,85,176,0.12)', borderBottom: '1px solid rgba(29,85,176,0.15)' }}>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ color: '#5b9df9', background: 'rgba(29,85,176,0.15)' }}>
                    <CheckCircle size={12} /> After (Load to Cash)
                  </span>
                </div>
              </div>

              {/* Data rows */}
              {beforeAfter.map((row, i) => (
                <div key={row.task} className="grid grid-cols-3 gap-0" style={i < beforeAfter.length - 1 ? { borderBottom: '1px solid rgba(29,85,176,0.10)' } : {}}>
                  <div className="py-4 px-5 text-sm font-semibold text-white/70">{row.task}</div>
                  <div className="py-4 px-5 text-sm text-red-400/80" style={{ borderLeft: '1px solid rgba(29,85,176,0.10)' }}>{row.before}</div>
                  <div className="py-4 px-5 text-sm font-medium" style={{ borderLeft: '1px solid rgba(29,85,176,0.10)', color: '#6bb3ff' }}>{row.after}</div>
                </div>
              ))}

              {/* Summary footer */}
              <div className="grid grid-cols-3 gap-0" style={{ background: 'rgba(29,85,176,0.08)', borderTop: '1px solid rgba(29,85,176,0.20)' }}>
                <div className="py-4 px-5 text-xs font-bold text-white/50 uppercase tracking-wider">Total Impact</div>
                <div className="py-4 px-5 text-sm font-bold text-red-400" style={{ borderLeft: '1px solid rgba(29,85,176,0.15)' }}>~5–8 hours / week lost</div>
                <div className="py-4 px-5 text-sm font-bold" style={{ borderLeft: '1px solid rgba(29,85,176,0.15)', color: '#5b9df9' }}>Under 30 minutes / week</div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section id="testimonials" className="relative z-10 py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d' }}>
              <Star size={11} fill="currentColor" /> Real Dispatchers, Real Results
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Loved by Dispatchers</h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="h-full p-7 rounded-2xl border flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <Quote size={22} style={{ color: 'rgba(29,85,176,0.5)' }} />
                  <p className="text-white/65 text-sm leading-relaxed flex-1">{t.quote}</p>
                  <div className="pt-2 border-t border-white/6">
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-white/35 text-xs mt-0.5">{t.role}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ BENEFITS GRID ════════════ */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl p-8 md:p-12"
            style={{ background: 'linear-gradient(135deg, rgba(13,31,60,0.95) 0%, rgba(10,22,40,0.98) 100%)', boxShadow: '0 0 0 1px rgba(29,85,176,0.18), 0 20px 60px rgba(0,0,0,0.4)' }}>
            <FadeUp className="text-center mb-10 space-y-3">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight">Why Dispatchers Choose Load to Cash</h2>
              <p className="text-white/45 text-base">The fastest path from rate confirmation to getting paid.</p>
            </FadeUp>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Zap,      title: 'Save 5+ Hours Weekly',      desc: 'Eliminate manual entry, template building, and fee calculations.' },
                { icon: Shield,   title: 'Zero Billing Errors',        desc: 'AI reads directly from rate confirmation — no transcription mistakes.' },
                { icon: TrendingUp,title: 'Get Paid Faster',          desc: 'Pro invoices in minutes. Carriers pay faster when they look legit.' },
                { icon: BarChart3, title: 'Full Business Visibility',  desc: 'Gross, fees, unpaid at a glance — never miss a payment again.' },
                { icon: Users,    title: 'Carrier Relationships',      desc: "Track every carrier you've worked with, their loads, and payment status." },
                { icon: FileText, title: 'Premium Brand Image',        desc: '4 polished invoice templates that make your business look established.' },
              ].map((b, i) => (
                <FadeUp key={b.title} delay={i * 0.06}>
                  <div className="flex gap-4 p-4 rounded-xl transition-colors hover:bg-white/[0.03]">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(29,85,176,0.18)', border: '1px solid rgba(29,85,176,0.3)' }}>
                      <b.icon size={16} style={{ color: '#5b9df9' }} />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm mb-1">{b.title}</div>
                      <div className="text-white/40 text-xs leading-relaxed">{b.desc}</div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="relative z-10 py-28 px-4">
        <FadeUp className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(29,85,176,0.12)', border: '1px solid rgba(29,85,176,0.35)', color: '#7eb3ff' }}>
            <Sparkles size={12} /> Join thousands of dispatchers saving time daily
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Ready to Stop Wasting<br/>
            <span style={{ background: 'linear-gradient(135deg, #4d9fff, #7b61ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Hours Every Week?
            </span>
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto leading-relaxed">
            Create your free account and process your first rate confirmation in under 5 minutes.
            No credit card. No commitment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup"
              className="group flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1d55b0, #2563eb)', boxShadow: '0 12px 40px rgba(29,85,176,0.5)' }}>
              Get Started — It's Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="text-sm text-white/45 hover:text-white/70 transition-colors font-medium">
              Already have an account? Sign in →
            </Link>
          </div>
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {['No credit card required', 'Free to start', 'Cancel anytime'].map(b => (
              <div key={b} className="flex items-center gap-1.5 text-xs text-white/30 font-medium">
                <CheckCircle size={11} className="text-white/20" /> {b}
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ════════════ CONTACT ════════════ */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(29,85,176,0.12)', border: '1px solid rgba(29,85,176,0.30)', color: '#7eb3ff' }}>
              <Mail size={11} /> Get In Touch
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Have Questions? We're Here.</h2>
            <p className="text-white/40 text-base max-w-md mx-auto">Reach out anytime — we respond fast.</p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              {
                icon: Phone,
                label: 'Phone',
                value: '+1 (602) 345-1572',
                sub: 'WhatsApp · Mon–Fri, 8am–6pm CST',
                color: '#5b9df9',
                bg: 'rgba(29,85,176,0.12)',
                border: 'rgba(29,85,176,0.25)',
              },
              {
                icon: Mail,
                label: 'Email',
                value: 'info@loadtocash.online',
                sub: 'We reply within 2 hours',
                color: '#a78bfa',
                bg: 'rgba(99,102,241,0.10)',
                border: 'rgba(99,102,241,0.25)',
              },
              {
                icon: MapPin,
                label: 'Office',
                value: '(602) 345-1528',
                sub: 'Office Line · Mon–Fri',
                color: '#34d399',
                bg: 'rgba(16,185,129,0.10)',
                border: 'rgba(16,185,129,0.25)',
              },
            ].map((c, i) => (
              <FadeUp key={c.label} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${c.border}` }}>
                    <c.icon size={20} style={{ color: c.color }} />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: c.color }}>{c.label}</div>
                  <div className="text-white font-semibold text-sm mb-1">{c.value}</div>
                  <div className="text-white/35 text-xs">{c.sub}</div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Contact hours strip */}
          <FadeUp delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-8 py-6 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.025)', boxShadow: '0 0 0 1px rgba(29,85,176,0.12)' }}>
              {[
                { label: 'Monday – Friday', value: '8:00 AM – 6:00 PM CST' },
                { label: 'Saturday',         value: '9:00 AM – 2:00 PM CST' },
                { label: 'Sunday',           value: 'Closed (Email support only)' },
              ].map(h => (
                <div key={h.label} className="text-center">
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">{h.label}</div>
                  <div className="text-white/65 text-sm font-medium">{h.value}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="relative z-10 px-6 py-10" style={{ borderTop: '1px solid rgba(29,85,176,0.15)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center">
              <img src="/logo.png" alt="LoadToCash" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button onClick={() => scrollTo('features')} className="text-xs text-white/30 hover:text-white/60 transition-colors">Features</button>
              <button onClick={() => scrollTo('how-it-works')} className="text-xs text-white/30 hover:text-white/60 transition-colors">How It Works</button>
              <button onClick={() => scrollTo('comparison')} className="text-xs text-white/30 hover:text-white/60 transition-colors">Comparison</button>
              <button onClick={() => scrollTo('testimonials')} className="text-xs text-white/30 hover:text-white/60 transition-colors">Testimonials</button>
              <Link to="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login"
                className="text-xs font-medium text-white/50 hover:text-white border rounded-lg px-4 py-2 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                Sign In
              </Link>
              <Link to="/signup"
                className="text-xs font-semibold text-white rounded-lg px-4 py-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1d55b0, #2563eb)' }}>
                Get Started
              </Link>
            </div>
          </div>
          <div className="pt-5 flex flex-col md:flex-row items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-[10px] text-white/20 font-medium">
              © {new Date().getFullYear()} Load to Cash. All rights reserved. Built for independent dispatchers.
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-white/20">support@loadtocash.com</span>
              <span className="text-[10px] text-white/20">+1 (800) 555-0192</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
