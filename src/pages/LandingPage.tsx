import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Truck, ArrowRight, UploadCloud, Cpu, CheckSquare, FileSpreadsheet,
  DollarSign, Star, Menu, X, Shield, Zap, Clock,
  BarChart3, FileText, Users, Cloud, Quote,
  TrendingUp, CheckCircle, XCircle, ChevronDown,
  Phone, Mail, MapPin, Download, HardDrive, MessageSquare, Key, Laptop,
} from 'lucide-react';

/* ─── smooth-scroll helper ─────────────────────────────── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/* ─── Counter ───────────────────────────────────────────── */
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

/* ─── FadeUp wrapper ────────────────────────────────────── */
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

/* ─── Data ─────────────────────────────────────────────── */
const features = [
  { icon: Cpu,           title: 'AI Data Extraction',   desc: 'Upload any rate confirmation PDF — our AI instantly reads carrier name, load number, rate, and routing. Zero typing required.' },
  { icon: FileText,      title: '4 Invoice Templates',  desc: 'Classic, Minimalist, Executive Cargo, and Emerald Steel. Pick your style and generate a print-ready PDF in one click.' },
  { icon: BarChart3,     title: 'Weekly Dashboard',     desc: 'Track every load, gross revenue, dispatch fees, and outstanding payments in a clean real-time table.' },
  { icon: DollarSign,    title: 'Auto Fee Calculator',  desc: 'Dispatch fee calculated automatically on every load. No mental math, no formula errors — ever again.' },
  { icon: Users,         title: 'Carrier History',      desc: 'Every carrier organized — pull up past loads, rates, and invoices instantly. Build long-term relationships.' },
  { icon: Cloud,         title: 'Secure Cloud',         desc: 'Data encrypted on AWS, accessible from any device. SOC 2 compliant infrastructure used by Fortune 500 companies.' },
];

const steps = [
  { icon: UploadCloud,     num: '01', title: 'Upload PDF',       desc: 'Drop your rate confirmation. Any carrier format.' },
  { icon: Cpu,             num: '02', title: 'AI Extracts',      desc: 'Fields filled in under 3 seconds, automatically.' },
  { icon: CheckSquare,     num: '03', title: 'Review & Edit',    desc: 'Confirm data on your clean dashboard.' },
  { icon: FileSpreadsheet, num: '04', title: 'Generate Invoice', desc: 'Pick a template. Render a professional PDF instantly.' },
  { icon: DollarSign,      num: '05', title: 'Get Paid',         desc: 'Send, track, collect. Faster than ever before.' },
];

const beforeAfter = [
  { task: 'Enter carrier info',     before: 'Type manually every time (~5 min)',   after: 'AI reads and fills instantly' },
  { task: 'Calculate dispatch fee', before: 'Mental math or calculator (~2 min)',  after: 'Auto-calculated at your rate' },
  { task: 'Create invoice',         before: 'Build from Excel/Word (~20 min)',     after: 'One-click PDF generation' },
  { task: 'Track loads',            before: 'Spreadsheet with manual updates',     after: 'Live real-time dashboard' },
  { task: 'Carrier history',        before: 'Dig through emails and files',        after: 'Instant searchable history' },
  { task: 'Billing errors',         before: 'Common — wrong load number, rate',   after: 'Zero — AI extracts accurately' },
  { task: 'Time per week',          before: '5–8 hours of admin work',             after: 'Under 30 minutes total' },
];

const stats = [
  { value: 5,   suffix: '+',   label: 'Hours Saved Weekly' },
  { value: 100, suffix: '%',   label: 'Extraction Accuracy' },
  { value: 4,   suffix: '',    label: 'Invoice Templates' },
  { value: 30,  suffix: 'min', label: 'Admin per Week' },
];

const testimonials = [
  { quote: "I used to spend Sunday nights doing invoices. Now it takes 10 minutes on Monday morning. Load to Cash completely changed my workflow.", name: 'Marcus T.', role: 'Independent Dispatcher, TX', stars: 5 },
  { quote: "The AI reads every carrier's rate sheet correctly. I have not had a billing error since I switched — carriers actually trust my invoices now.", name: 'Priya S.', role: 'Fleet Manager, 12 trucks', stars: 5 },
  { quote: "The dispatch fee auto-calculation alone saves me from arguments with carriers. Everything is transparent, professional, and fast.", name: 'Jerome W.', role: 'Owner-Operator Dispatcher', stars: 5 },
];

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

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
    { label: 'Features',     id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Comparison',   id: 'comparison' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'Contact',      id: 'contact' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">

      {/* ════════ NAVBAR ════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="LoadToCash" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className="text-sm text-gray-600 hover:text-blue-700 transition-colors font-medium">
                  {l.label}
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-700 font-medium transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link to="/signup"
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                Get Started Free <ArrowRight size={14} />
              </Link>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="md:hidden bg-white border-t border-gray-200 px-6 py-6 space-y-4 shadow-lg">
              {navLinks.map(l => (
                <button key={l.id} onClick={() => { scrollTo(l.id); setMobileOpen(false); }}
                  className="block w-full text-left text-sm text-gray-600 hover:text-blue-700 font-medium py-2 transition-colors">
                  {l.label}
                </button>
              ))}
              <div className="pt-4 flex flex-col gap-3 border-t border-gray-200">
                <Link to="/login" className="text-center py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700 border border-gray-300 rounded-xl">
                  Sign In
                </Link>
                <Link to="/signup"
                  className="text-center py-2.5 text-sm font-semibold text-white rounded-xl shadow"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ════════ HERO ════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Full-bleed truck photo background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_truck.jpg"
            alt="Semi truck on highway"
            className="w-full h-full object-cover"
          />
          {/* Overlay: light gradient so text reads well */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(15,30,70,0.78) 0%, rgba(10,20,55,0.62) 60%, rgba(5,12,35,0.45) 100%)' }} />
          {/* Bottom fade into white */}
          <div className="absolute bottom-0 left-0 right-0 h-48"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15))' }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto text-center space-y-8 px-4 pt-24 pb-16">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.35)', color: '#e0eaff' }}>
            <Truck size={12} />
            AI-Powered Dispatch Automation &mdash; Built for Owner-Operators
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight text-white">
            From Rate Con<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              to Invoice
            </span>{' '}
            in <span className="text-white">Seconds</span>
          </motion.h1>

          {/* Subline */}
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.2 }}
            className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed font-medium">
            Upload a rate confirmation PDF. Our AI extracts every field, calculates your dispatch fee, and generates a
            professional invoice — all before you finish your coffee.
          </motion.p>

          {/* CTA row */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#desktop-app"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 8px 32px rgba(37,99,235,0.5)' }}>
              <Download size={18} />
              Download Desktop App (.exe)
            </a>
            <Link to="/signup"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold text-white backdrop-blur-sm border border-white/30 hover:bg-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              Try Online — It's Free <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {[
              { icon: Shield, text: 'Bank-grade encryption' },
              { icon: Zap,    text: 'AI extracts in under 3 seconds' },
              { icon: Clock,  text: 'Save 5+ hours per week' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-white/55 font-medium">
                <Icon size={13} className="text-white/40" /> {text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 z-10">
          <span className="text-[10px] font-medium uppercase tracking-widest">Scroll to explore</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════ STATS STRIP ════════ */}
      <section className="relative z-10 bg-blue-700 py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.08} className="text-center">
                <div className="text-4xl font-black text-white mb-1">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-blue-100 font-medium">{s.label}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section id="features" className="relative z-10 py-28 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">
              <Zap size={11} /> Everything You Need
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">
              Built for dispatch.{' '}
              <span style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Perfected for profit.
              </span>
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Every feature was built from real dispatcher pain points. No fluff — just tools that save time and make money.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.07}>
                <div className="group h-full p-7 rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-300 cursor-default">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-blue-50 border border-blue-100">
                    <f.icon size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TRUCK IMAGE DIVIDER ════════ */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src="/truck_sunset.jpg" alt="Semi truck on open road" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(29,78,216,0.7) 0%, rgba(124,58,237,0.3) 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <FadeUp className="text-center">
            <p className="text-white text-2xl md:text-4xl font-black max-w-2xl leading-tight">
              Stop wasting hours on admin work. Start running your business.
            </p>
          </FadeUp>
        </div>
      </div>

      {/* ════════ DESKTOP APP SECTION ════════ */}
      <section id="desktop-app" className="relative z-10 py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">
              <Laptop size={12} /> Desktop Application Edition
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">
              100% Local Data Security.{' '}
              <span className="text-blue-700">Your System. Your Rules.</span>
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Prefer keeping your load logs, carrier rates, and invoices strictly on your own computer? Download our standalone Windows Desktop App — zero cloud data sharing.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Desktop Card */}
            <FadeUp delay={0.1}>
              <div className="h-full p-8 rounded-3xl border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden flex flex-col justify-between shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                      <HardDrive className="w-6 h-6 text-blue-700" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                      Windows Native App (.exe)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">LoadToCash Desktop App</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      All carrier details, gross pay logs, and generated invoices are saved <strong className="text-gray-900">100% locally on your system</strong> (<code className="text-blue-700 text-xs bg-blue-50 px-1.5 py-0.5 rounded">AppData/Roaming</code>). Zero database cloud leaks.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { label: '100% Local Storage:', detail: 'Total privacy for your load records.' },
                      { label: 'Standalone Installer:', detail: 'Download .exe and run natively without commands.' },
                      { label: 'Flexible Licensing:', detail: '30-day expirable activation key support.' },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">{item.label}</strong> {item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-blue-100 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-bold text-blue-800 flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-600" /> How to Get Your License Key
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      For Desktop App License Keys and Custom Pricing, simply <strong className="text-gray-800">send us an email or text message</strong>. We generate and send your key instantly.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold">
                      <a href="mailto:Nickindispatch@gmail.com" className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 underline">
                        <Mail className="w-3.5 h-3.5" /> Email Us
                      </a>
                      <a href="tel:+16023413327" className="flex items-center gap-1.5 text-green-700 hover:text-green-900 underline">
                        <MessageSquare className="w-3.5 h-3.5" /> Text / Call Us
                      </a>
                    </div>
                  </div>

                  <a
                    href="https://drive.google.com/uc?export=download&id=16YmU_emQZwBkQhP0dbftWce09tRzmesE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
                  >
                    <Download className="w-5 h-5" /> Download Desktop App (.exe)
                  </a>
                </div>
              </div>
            </FadeUp>

            {/* Online Card */}
            <FadeUp delay={0.2}>
              <div className="h-full p-8 rounded-3xl border-2 border-purple-200 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden flex flex-col justify-between shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                      <Cloud className="w-6 h-6 text-purple-700" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                      Cloud Web Version
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">LoadToCash Web Online</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Instant trial in your web browser — zero installation required. Access from any computer, tablet, or mobile device on the go.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { label: 'Zero Install:', detail: 'Works directly in Chrome, Edge, Safari, or Firefox.' },
                      { label: 'Instant Free Trial:', detail: 'Test AI Rate Con parsing in 5 seconds online.' },
                      { label: 'Cloud Access:', detail: 'Access your account anytime, anywhere.' },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">{item.label}</strong> {item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-purple-100 space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                    <div className="text-xs font-bold text-purple-800 mb-1">Want to test features online right now?</div>
                    <p className="text-xs text-gray-600">
                      Try our Online Version for free before downloading the Desktop App.
                    </p>
                  </div>

                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                  >
                    Start Free Online Trial <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section id="how-it-works" className="relative z-10 py-28 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Clock size={11} /> Under 3 minutes, start to finish
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">How It Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Five steps. Three minutes. Done.</p>
          </FadeUp>

          <div className="relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {steps.map((s, i) => (
                <FadeUp key={s.title} delay={i * 0.1} className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 bg-white border-2 border-blue-200 shadow-md">
                      <s.icon size={26} className="text-blue-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white z-20 shadow"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 text-sm mb-1.5">{s.title}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{s.desc}</div>
                </FadeUp>
              ))}
            </div>
          </div>

          <FadeUp delay={0.5} className="mt-12 text-center">
            <Link to="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>
              Try It Free Now <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ════════ FLEET / DISPATCHER PHOTO SECTION ════════ */}
      <section className="relative z-10 py-20 px-4 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <FadeUp className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-green-700">
                <Truck size={11} /> Built for the Trucking Industry
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-tight">
                Designed by dispatchers,<br />
                <span className="text-blue-700">for dispatchers.</span>
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Load to Cash was built with one goal: eliminate the hours of admin work that keep dispatchers from doing what matters — moving freight and growing their business.
              </p>
              <ul className="space-y-3">
                {[
                  'Handles all major broker rate confirmation formats',
                  'Works for owner-operators and multi-truck fleets',
                  'Professional invoices carriers pay without dispute',
                  'Real-time dashboard — know your numbers at a glance',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-blue-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                <img src="/dispatcher.jpg" alt="Dispatcher working at desk" className="w-full h-80 object-cover" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════ BEFORE vs AFTER ════════ */}
      <section id="comparison" className="relative z-10 py-28 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-700">
              <XCircle size={11} /> The Old Way vs The New Way
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">Stop Losing Hours to Admin</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">See exactly how much time you are wasting — and how fast you will win it back.</p>
          </FadeUp>

          <FadeUp>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
              {/* Header row */}
              <div className="grid grid-cols-3 gap-0 bg-gray-50 border-b border-gray-200">
                <div className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Task</div>
                <div className="py-4 px-5 border-l border-gray-200">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                    <XCircle size={12} /> Before (Manual)
                  </span>
                </div>
                <div className="py-4 px-5 border-l border-gray-200">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <CheckCircle size={12} /> After (Load to Cash)
                  </span>
                </div>
              </div>

              {/* Data rows */}
              {beforeAfter.map((row, i) => (
                <div key={row.task} className={`grid grid-cols-3 gap-0 ${i < beforeAfter.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="py-4 px-5 text-sm font-semibold text-gray-700">{row.task}</div>
                  <div className="py-4 px-5 text-sm text-red-500 border-l border-gray-100">{row.before}</div>
                  <div className="py-4 px-5 text-sm font-medium text-blue-700 border-l border-gray-100">{row.after}</div>
                </div>
              ))}

              {/* Summary footer */}
              <div className="grid grid-cols-3 gap-0 bg-blue-50 border-t border-blue-100">
                <div className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Impact</div>
                <div className="py-4 px-5 text-sm font-bold text-red-600 border-l border-blue-100">5–8 hours per week lost</div>
                <div className="py-4 px-5 text-sm font-bold text-blue-700 border-l border-blue-100">Under 30 minutes per week</div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════ TESTIMONIALS ════════ */}
      <section id="testimonials" className="relative z-10 py-28 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">
              <Star size={11} fill="currentColor" /> Real Dispatchers, Real Results
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">Loved by Dispatchers</h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="h-full p-7 rounded-2xl border border-gray-200 bg-white flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote size={22} className="text-blue-200" />
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">{t.quote}</p>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{t.role}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FLEET PHOTO STRIP ════════ */}
      <div className="relative h-64 overflow-hidden">
        <img src="/fleet_trucks.jpg" alt="Fleet of dry van trucks" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-blue-900/50" />
      </div>

      {/* ════════ BENEFITS GRID ════════ */}
      <section className="relative z-10 py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl p-8 md:p-12 bg-white border border-gray-200 shadow-sm">
            <FadeUp className="text-center mb-10 space-y-3">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-gray-900">Why Dispatchers Choose Load to Cash</h2>
              <p className="text-gray-500 text-base">The fastest path from rate confirmation to getting paid.</p>
            </FadeUp>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Zap,        title: 'Save 5+ Hours Weekly',     desc: 'Eliminate manual entry, template building, and fee calculations.' },
                { icon: Shield,     title: 'Zero Billing Errors',       desc: 'AI reads directly from rate confirmation — no transcription mistakes.' },
                { icon: TrendingUp, title: 'Get Paid Faster',           desc: 'Professional invoices in minutes. Carriers pay faster when they look legit.' },
                { icon: BarChart3,  title: 'Full Business Visibility',  desc: 'Gross, fees, unpaid at a glance — never miss a payment again.' },
                { icon: Users,      title: 'Carrier Relationships',     desc: 'Track every carrier you have worked with, their loads, and payment status.' },
                { icon: FileText,   title: 'Premium Brand Image',       desc: '4 polished invoice templates that make your business look established.' },
              ].map((b, i) => (
                <FadeUp key={b.title} delay={i * 0.06}>
                  <div className="flex gap-4 p-4 rounded-xl transition-colors hover:bg-blue-50 border border-transparent hover:border-blue-100">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-blue-50 border border-blue-100">
                      <b.icon size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm mb-1">{b.title}</div>
                      <div className="text-gray-500 text-xs leading-relaxed">{b.desc}</div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="relative z-10 py-28 px-4 bg-gradient-to-br from-blue-700 to-blue-900 overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <FadeUp className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/15 border border-white/30 text-white">
            Join dispatchers saving time daily
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white">
            Ready to Stop Wasting<br />
            <span className="text-blue-200">Hours Every Week?</span>
          </h2>
          <p className="text-blue-100 text-lg max-w-xl mx-auto leading-relaxed">
            Create your free account and process your first rate confirmation in under 5 minutes.
            No credit card. No commitment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup"
              className="group flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-bold text-blue-900 bg-white transition-all hover:scale-105 active:scale-95 shadow-2xl">
              Get Started — It's Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="text-sm text-blue-200 hover:text-white transition-colors font-medium">
              Already have an account? Sign in
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {['No credit card required', 'Free to start', 'Cancel anytime'].map(b => (
              <div key={b} className="flex items-center gap-1.5 text-xs text-blue-200 font-medium">
                <CheckCircle size={11} className="text-blue-300" /> {b}
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ════════ CONTACT ════════ */}
      <section id="contact" className="relative z-10 py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">
              <Mail size={11} /> Get In Touch
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">Have Questions? We Are Here.</h2>
            <p className="text-gray-400 text-base max-w-md mx-auto">Reach out anytime — we respond fast.</p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: Phone,  label: 'Phone',  value: '+1 (602) 341-3327', sub: 'WhatsApp / Mon–Fri, 8am–6pm CST', color: 'blue'  },
              { icon: Mail,   label: 'Email',  value: 'Nickindispatch@gmail.com', sub: 'We reply within 2 hours',   color: 'purple' },
              { icon: MapPin, label: 'Office', value: '(602) 341-3327',    sub: 'Office Line / Mon–Fri',            color: 'green'  },
            ].map((c, i) => {
              const colorMap: Record<string, { bg: string; border: string; icon: string; label: string }> = {
                blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'text-blue-600',   label: 'text-blue-700' },
                purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', label: 'text-purple-700' },
                green:  { bg: 'bg-green-50',  border: 'border-green-200',  icon: 'text-green-600',  label: 'text-green-700' },
              };
              const cm = colorMap[c.color];
              return (
                <FadeUp key={c.label} delay={i * 0.1}>
                  <div className={`flex flex-col items-center text-center p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md border ${cm.bg} ${cm.border}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white border ${cm.border}`}>
                      <c.icon size={20} className={cm.icon} />
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${cm.label}`}>{c.label}</div>
                    <div className="text-gray-900 font-semibold text-sm mb-1">{c.value}</div>
                    <div className="text-gray-400 text-xs">{c.sub}</div>
                  </div>
                </FadeUp>
              );
            })}
          </div>

          {/* Hours strip */}
          <FadeUp delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-8 py-6 rounded-2xl bg-gray-50 border border-gray-200">
              {[
                { label: 'Monday – Friday', value: '8:00 AM – 6:00 PM CST' },
                { label: 'Saturday',         value: '9:00 AM – 2:00 PM CST' },
                { label: 'Sunday',           value: 'Closed (Email support only)' },
              ].map(h => (
                <div key={h.label} className="text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{h.label}</div>
                  <div className="text-gray-700 text-sm font-medium">{h.value}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="relative z-10 px-6 py-10 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center">
              <img src="/logo.png" alt="LoadToCash" style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button onClick={() => scrollTo('features')} className="text-xs text-gray-400 hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollTo('how-it-works')} className="text-xs text-gray-400 hover:text-white transition-colors">How It Works</button>
              <button onClick={() => scrollTo('comparison')} className="text-xs text-gray-400 hover:text-white transition-colors">Comparison</button>
              <button onClick={() => scrollTo('testimonials')} className="text-xs text-gray-400 hover:text-white transition-colors">Testimonials</button>
              <Link to="/privacy" className="text-xs text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login"
                className="text-xs font-medium text-gray-400 hover:text-white border border-gray-600 rounded-lg px-4 py-2 transition-colors">
                Sign In
              </Link>
              <Link to="/signup"
                className="text-xs font-semibold text-white rounded-lg px-4 py-2 transition-all hover:opacity-90 shadow"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                Get Started
              </Link>
            </div>
          </div>
          <div className="pt-5 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-800">
            <div className="text-[10px] text-gray-500 font-medium">
              &copy; {new Date().getFullYear()} Load to Cash. All rights reserved. Built for independent dispatchers.
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-gray-500">Nickindispatch@gmail.com</span>
              <span className="text-[10px] text-gray-500">+1 (602) 341-3327</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
