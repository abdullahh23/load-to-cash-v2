import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Truck, ArrowRight, UploadCloud, Cpu, CheckSquare, FileSpreadsheet,
  DollarSign, Star, Menu, X, ChevronRight, Shield, Zap, Clock,
  BarChart3, FileText, Users, Cloud, Mail, Phone, MapPin, Quote,
  TrendingUp, AlertTriangle, CheckCircle, Sparkles, XCircle, Eye, ZoomIn
} from 'lucide-react';

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Quotes data ──────────────────────────────────────────────────────────────
const quotes = [
  { text: "Still manually entering carrier names and load numbers? That's 3 hours of your week — every week.", icon: AlertTriangle, color: 'text-amberline', bg: 'bg-amberline/10 border-amberline/20' },
  { text: "Every minute you spend typing is a minute not spent finding the next load.", icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { text: "Top dispatchers don't type faster — they let AI do the heavy lifting.", icon: Zap, color: 'text-signal', bg: 'bg-signal/10 border-signal/20' },
  { text: "Your competitors are already automating. Are you still using spreadsheets?", icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { text: "Load-to-Cash means zero data entry. Upload. Review. Invoice. Done.", icon: CheckCircle, color: 'text-signal', bg: 'bg-signal/10 border-signal/20' },
];

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  { icon: Cpu, title: 'AI Data Extraction', desc: 'Upload a rate confirmation PDF and our AI instantly pulls carrier name, load number, rate, and routing — zero typing.' },
  { icon: FileText, title: '4 Invoice Templates', desc: 'Classic, Minimalist, Executive, and Cyber — choose your style and generate a print-ready PDF in one click.' },
  { icon: BarChart3, title: 'Weekly Load Dashboard', desc: 'Track every load in a clean table. See gross revenue, dispatch fees, and outstanding payments at a glance.' },
  { icon: DollarSign, title: 'Auto Dispatch Fee Calc', desc: 'Automatically calculates your 6% dispatch fee on every load. No more mental math or formula errors.' },
  { icon: Users, title: 'Carrier History', desc: "Every carrier you've worked with, organized. Pull up past loads, rates, and invoices in seconds." },
  { icon: Cloud, title: 'Secure Cloud Storage', desc: 'All your data encrypted and backed up on AWS. Access from any device, anywhere, anytime.' },
];

// ─── Steps ────────────────────────────────────────────────────────────────────
const steps = [
  { icon: UploadCloud, title: 'Upload PDF', desc: 'Drag & drop your rate confirmation. Any carrier format accepted.' },
  { icon: Cpu, title: 'AI Extracts', desc: 'Neural network reads and fills all fields instantly.' },
  { icon: CheckSquare, title: 'Review', desc: 'Verify the auto-filled data on your dashboard.' },
  { icon: FileSpreadsheet, title: 'Generate Invoice', desc: 'Pick a template and render a pro PDF.' },
  { icon: DollarSign, title: 'Get Paid', desc: 'Send, track, and collect — faster than ever.' },
];

// ─── Invoice Templates — real screenshots from the app ────────────────────────
const templates = [
  {
    id: 'classic',
    name: 'Corporate Classic',
    desc: 'Traditional clean layout with navy header and gold accents. Trusted by independent carriers.',
    badge: 'Most Popular',
    color: 'from-blue-900 to-blue-800',
    accent: '#b8960c',
    preview: {
      headerBg: '#1e3a5f',
      accentLine: '#b8960c',
      style: 'classic',
    },
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    desc: 'Borderless modern style focusing on typography. Perfect for simple logistics operations.',
    badge: 'Clean & Simple',
    color: 'from-slate-800 to-slate-700',
    accent: '#0d9488',
    preview: {
      headerBg: '#111827',
      accentLine: '#374151',
      style: 'modern',
    },
  },
  {
    id: 'cargo',
    name: 'Executive Cargo',
    desc: 'Double-column layout with dark header and amber amount highlights. Made for fee-separators.',
    badge: 'Professional',
    color: 'from-gray-900 to-gray-800',
    accent: '#f59e0b',
    preview: {
      headerBg: '#1f2937',
      accentLine: '#f59e0b',
      style: 'cargo',
    },
  },
  {
    id: 'teal',
    name: 'Emerald Steel',
    desc: 'High-contrast template with teal system billing badge and bold elements. Modern voice AI style.',
    badge: 'Bold & Modern',
    color: 'from-teal-900 to-slate-900',
    accent: '#0d9488',
    preview: {
      headerBg: '#134e4a',
      accentLine: '#0d9488',
      style: 'teal',
    },
  },
];

// ─── Inline Invoice Preview (SVG-based mock) ─────────────────────────────────
function InvoicePreviewMock({ template }: { template: typeof templates[0] }) {
  const isClassic = template.id === 'classic';
  const isModern = template.id === 'modern';
  const isCargo = template.id === 'cargo';
  const isTeal = template.id === 'teal';

  return (
    <div className="bg-white rounded-lg overflow-hidden text-[6px] font-sans shadow-2xl" style={{ width: '100%', aspectRatio: '0.77' }}>
      {/* Header */}
      {isClassic && (
        <div style={{ background: '#1e3a5f' }} className="p-3 flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Truck size={8} className="text-white" />
            </div>
            <div>
              <div className="text-white font-black text-[8px]">ABC COMPANY</div>
              <div className="text-blue-300 text-[5px] uppercase tracking-widest">Dispatch Fee Invoice</div>
            </div>
          </div>
          <div className="text-right text-[5px] text-blue-200 space-y-0.5">
            <div>Invoice # <span className="text-white font-bold">INV-20260620-213</span></div>
            <div>Invoice Date <span className="text-white">06/20/2026</span></div>
            <div>Due Date <span className="text-white">06/27/2026</span></div>
          </div>
        </div>
      )}
      {isModern && (
        <div className="p-3 flex items-start justify-between border-b border-gray-200">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <Truck size={8} className="text-gray-600" />
            </div>
            <div>
              <div className="text-gray-900 font-black text-[8px]">ABC COMPANY</div>
              <div className="text-gray-400 text-[5px]">Dispatch Fee Invoice</div>
            </div>
          </div>
          <div className="text-right text-[5px] text-gray-500 space-y-0.5">
            <div>INV: <span className="text-gray-900 font-bold">INV-20260620-213</span></div>
            <div>Date: <span className="text-gray-700">06/20/2026</span></div>
            <div>Due: <span className="text-gray-700">06/27/2026</span></div>
          </div>
        </div>
      )}
      {isCargo && (
        <div style={{ background: '#1f2937' }} className="p-3 flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
              <Truck size={8} className="text-white" />
            </div>
            <div>
              <div className="text-white font-black text-[9px]">ABC COMPANY</div>
              <div className="text-gray-400 text-[5px]">Dispatch Fee Invoice</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-[5px] uppercase tracking-wider">Invoice Number</div>
            <div className="text-white font-black text-[9px]">INV-20260620-213</div>
          </div>
        </div>
      )}
      {isTeal && (
        <div className="p-3 flex items-start justify-between border-b-2" style={{ borderColor: '#0d9488' }}>
          <div>
            <div className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 rounded px-1.5 py-0.5 mb-1.5">
              <div className="w-1 h-1 rounded-full bg-teal-500" />
              <span className="text-[5px] text-teal-700 font-bold uppercase tracking-wider">System Billing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                <Truck size={8} className="text-gray-600" />
              </div>
              <div>
                <div className="text-gray-900 font-black text-[8px]">ABC COMPANY</div>
                <div className="text-gray-400 text-[5px]">Dispatch Fee Invoice</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-1.5 text-[5px] text-gray-500 space-y-0.5">
            <div>Invoice <span className="font-bold text-gray-900">INV-20260620-213</span></div>
            <div>Issued <span className="text-gray-700">06/20/2026</span></div>
            <div>Due <span className="text-gray-700">06/27/2026</span></div>
          </div>
        </div>
      )}

      {/* Gold/accent divider for classic */}
      {isClassic && <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${template.accent}, transparent)` }} />}

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* From / Bill To */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: isClassic ? 'FROM' : isTeal ? 'ISSUED BY' : 'BILLING FROM', name: 'ABCD COMPANY' },
            { label: isClassic ? 'BILL TO' : isTeal ? 'BILL TO CARRIER' : 'BILL TO', name: 'ABCD' },
          ].map(box => (
            <div key={box.label} className="border border-gray-200 rounded p-1.5 space-y-0.5">
              <div className="text-[4.5px] uppercase tracking-widest" style={{ color: isCargo ? template.accent : isTeal ? '#0d9488' : '#64748b' }}>{box.label}</div>
              <div className="font-black text-gray-900 text-[6.5px]">{box.name}</div>
              <div className="text-gray-400 text-[5px]">ABCD@gmail.com</div>
              <div className="text-gray-400 text-[5px]">Phone: 0000000</div>
            </div>
          ))}
        </div>

        {/* Load table */}
        <div>
          <div className="text-[5px] font-bold text-gray-600 uppercase mb-1">
            {isTeal ? 'LOGISTICS LOAD DETAILS' : `WEEKLY LOAD SUMMARY — 06/20/2026`}
          </div>
          <div className="rounded overflow-hidden">
            <div className="grid grid-cols-4 gap-0 text-[5px] font-bold text-white px-1.5 py-1" style={{ background: '#1e293b' }}>
              <span>#</span><span>Load #</span><span>Broker</span><span className="text-right">Amount</span>
            </div>
            <div className="grid grid-cols-4 gap-0 text-[5px] px-1.5 py-1 bg-gray-50 border-b border-gray-200">
              <span className="text-gray-400">1</span>
              <span className="font-bold text-gray-900">OGRE45711</span>
              <span className="text-gray-600">SHIP AMINO</span>
              <span className="text-right font-bold text-gray-900">$1,850.00</span>
            </div>
            <div className="grid grid-cols-4 gap-0 text-[5px] px-1.5 py-1 bg-gray-100">
              <span className="col-span-3 font-bold text-gray-700 uppercase">Total Weekly Gross</span>
              <span className="text-right font-black text-gray-900">$1,850.00</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-0.5">
          <div className="flex justify-between text-[5px] text-gray-500">
            <span>Dispatch Fee @ 6%</span><span>$111.00</span>
          </div>
          <div className="flex justify-between items-center rounded px-1.5 py-1 text-white text-[6px] font-black" style={{ background: '#1e293b' }}>
            <span>TOTAL DUE</span>
            <span style={{ color: template.accent }}>$111.00</span>
          </div>
        </div>

        {/* Payment */}
        <div className="border border-gray-200 rounded p-1.5">
          <div className="text-[4.5px] uppercase tracking-widest text-gray-400 mb-0.5">Payment Options</div>
          <div className="text-[5px] text-gray-600">Zelle: <span className="font-bold text-gray-900">ABCD@gmail.com</span></div>
          <div className="text-[5px] text-gray-500">Account Holder: ABCD</div>
        </div>
      </div>
    </div>
  );
}

// ─── Before vs After table data ───────────────────────────────────────────────
const beforeAfter = [
  { task: 'Enter carrier info', before: 'Type manually every time (5 min)', after: 'AI reads & fills instantly', icon: XCircle, good: CheckCircle },
  { task: 'Calculate dispatch fee', before: 'Mental math or calculator (2 min)', after: 'Auto-calculated at 6%', icon: XCircle, good: CheckCircle },
  { task: 'Create invoice', before: 'Build from Excel/Word (20 min)', after: 'One-click PDF generation', icon: XCircle, good: CheckCircle },
  { task: 'Track loads', before: 'Spreadsheet with manual updates', after: 'Real-time dashboard', icon: XCircle, good: CheckCircle },
  { task: 'Carrier history', before: 'Dig through email/files', after: 'Instant searchable history', icon: XCircle, good: CheckCircle },
  { task: 'Billing errors', before: 'Common — wrong load #, rate', after: 'Zero — AI extracts accurately', icon: XCircle, good: CheckCircle },
  { task: 'Time per week', before: '~5–8 hours of admin work', after: 'Under 30 minutes total', icon: XCircle, good: CheckCircle },
];

// ─── Benefits ─────────────────────────────────────────────────────────────────
const benefits = [
  { icon: Zap, title: 'Save 5+ Hours Weekly', desc: 'Eliminate manual data entry, template building, and fee calculations — all automated.' },
  { icon: Shield, title: 'Zero Billing Errors', desc: 'AI extracts data directly from your rate confirmation — no transcription mistakes.' },
  { icon: TrendingUp, title: 'Get Paid Faster', desc: 'Professional invoices sent in minutes, not hours. Carriers pay faster when they look legit.' },
  { icon: BarChart3, title: 'Full Business Visibility', desc: 'See your total gross, fees, and unpaid amounts at a glance — never miss a payment.' },
  { icon: Users, title: 'Carrier Relationships', desc: "Track every carrier you've ever worked with, their load history, and payment status." },
  { icon: FileText, title: 'Professional Brand Image', desc: '4 premium invoice templates that make your dispatch business look established and trustworthy.' },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  { quote: "I used to spend Sunday nights doing invoices. Now it takes 10 minutes on Monday morning. Load-to-Cash changed my entire workflow.", name: 'Marcus T.', role: 'Independent Dispatcher, TX', stars: 5 },
  { quote: "The AI actually reads the carrier's rate sheet correctly every time. I haven't had a billing error since I switched.", name: 'Priya S.', role: 'Fleet Manager, 12 trucks', stars: 5 },
  { quote: "The dispatch fee auto-calc alone saves me from arguments with carriers. Everything is transparent and professional.", name: 'Jerome W.', role: 'Owner-Operator Dispatcher', stars: 5 },
];

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeQuote, setActiveQuote] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[0] | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveQuote(q => (q + 1) % quotes.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = previewTemplate ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [previewTemplate]);

  return (
    <div className="min-h-screen bg-ink text-white font-sans overflow-x-hidden">

      {/* Ambient orbs + dot grid */}
      <div className="fixed inset-0 pointer-events-none z-0 dot-grid">
        <div className="absolute -top-20 left-[15%] w-[700px] h-[700px] bg-signal rounded-full blur-[120px] opacity-[0.12]" />
        <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-[0.08]" />
        <div className="absolute bottom-[10%] left-[25%] w-[400px] h-[400px] bg-amberline rounded-full blur-[100px] opacity-[0.06]" />
      </div>

      {/* ════════════════ NAVBAR ════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-ink/90 backdrop-blur-xl border-b border-white/5 shadow-xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-signal rounded-xl flex items-center justify-center shadow-lg shadow-signal/30">
                <Truck className="text-white" size={20} />
              </div>
              <div>
                <div className="text-base font-bold text-white leading-none">Load to Cash</div>
                <div className="text-[9px] text-signal font-bold uppercase tracking-widest mt-0.5">AI Dispatch Billing</div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {['home', 'features', 'templates', 'workflow', 'about', 'contact'].map(item => (
                <a key={item} href={`#${item}`} className="text-slate-400 hover:text-signal transition-colors capitalize">{item}</a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all">Log In</Link>
              <Link to="/signup" className="glow-btn px-5 py-2.5 text-white font-bold rounded-xl text-sm flex items-center gap-2">
                <Sparkles size={14} /> Start Free Trial
              </Link>
            </div>
            <button onClick={() => setMobileOpen(v => !v)} className="md:hidden text-slate-400 p-2">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-ink/95 backdrop-blur-xl border-b border-white/5 px-4 pb-6 overflow-hidden">
              <div className="pt-4 space-y-1">
                {['home', 'features', 'templates', 'workflow', 'about', 'contact'].map(item => (
                  <a key={item} href={`#${item}`} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-slate-400 hover:text-signal hover:bg-white/5 capitalize">{item}</a>
                ))}
              </div>
              <div className="pt-4 mt-2 border-t border-white/5 flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-center py-3 border border-white/10 rounded-xl text-sm font-semibold text-slate-400">Log In</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="block text-center py-3 glow-btn rounded-xl text-sm font-bold text-white">Start Free Trial</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section id="home" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        {/* No light gradient in dark theme */}

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-signal/10 border border-signal/20 text-signal px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles size={12} className="animate-pulse" /> AI-Powered · Zero Manual Entry
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
                Turn Rate Confirmations<br />into <span className="text-signal">Cash</span> Instantly.
              </h1>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Upload your rate confirmation PDF. Our AI extracts every field and generates a professional dispatch invoice in <strong className="text-white">under 10 seconds</strong>. No typing. No errors. No wasted Sunday nights.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/signup')} className="group glow-btn px-8 py-4 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-3 text-base">
                Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/login')} className="glass px-8 py-4 text-slate-300 hover:text-white font-bold rounded-xl transition-all">
                Login to Dashboard
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="pt-6 border-t border-white/5 grid grid-cols-3 gap-6">
              {[{ val: 500, suf: '+', label: 'Dispatchers' }, { val: 10000, suf: '+', label: 'Invoices Generated' }, { val: 99, suf: '.9%', label: 'Uptime' }].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-signal"><Counter target={s.val} suffix={s.suf} /></div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            {/* Browser-style dashboard mockup — dark dashboard inside light page for contrast */}
            <div className="relative glass-card shadow-2xl rounded-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-3 h-6 bg-white/5 rounded-md flex items-center px-3">
                  <span className="text-[10px] text-slate-500">loadtocash.online/dashboard</span>
                </div>
              </div>
              {/* Dashboard content — stays dark */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 space-y-4">
                {/* Dashboard header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest">Weekly Dashboard</div>
                    <div className="text-lg font-black text-white mt-0.5">Week of June 16, 2026</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 px-3 bg-signal/10 border border-signal/30 rounded-lg flex items-center gap-1.5 text-xs text-signal font-bold"><UploadCloud size={12} /> Upload PDF</div>
                    <div className="h-8 px-3 bg-white/5 border border-white/10 rounded-lg flex items-center text-xs text-slate-400 font-medium">+ Add Load</div>
                  </div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: 'Gross Revenue', val: '$7,450.00', color: 'text-white' }, { label: 'Dispatch Fee (6%)', val: '$447.00', color: 'text-signal' }, { label: 'Total Loads', val: '4', color: 'text-amberline' }].map(s => (
                    <div key={s.label} className="glass-card rounded-xl p-3">
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest">{s.label}</div>
                      <div className={`text-base font-black mt-1 ${s.color}`}>{s.val}</div>
                    </div>
                  ))}
                </div>
                {/* Mini table */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 gap-0 text-[10px] font-bold text-slate-400 px-3 py-2 bg-white/[0.02] border-b border-white/5 uppercase tracking-wider">
                    <span>Load #</span><span>Broker</span><span>Route</span><span className="text-right">Amount</span>
                  </div>
                  {[{ ln: 'OGRE45711', broker: 'CH Robinson', route: 'Dallas → Memphis', amt: '$2,150' },
                    { ln: 'XPO88234', broker: 'TQL Freight', route: 'Houston → Atlanta', amt: '$1,850' },
                    { ln: 'JBH99102', broker: 'Echo Global', route: 'Phoenix → LA', amt: '$1,950' }].map((row, i) => (
                    <div key={i} className={`grid grid-cols-4 gap-0 text-[10px] px-3 py-2 ${i % 2 ? 'bg-white/[0.01]' : ''} border-b border-white/[0.03]`}>
                      <span className="font-bold text-white">{row.ln}</span>
                      <span className="text-slate-400">{row.broker}</span>
                      <span className="text-slate-500">{row.route}</span>
                      <span className="text-right font-bold text-signal">{row.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating AI badge */}
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3 flex items-center gap-3 shadow-xl">
                <div className="w-10 h-10 bg-signal/20 border border-signal/30 text-signal rounded-lg flex items-center justify-center shrink-0">
                  <Cpu size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white uppercase tracking-wider">AI Processor Active</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Rate confirmation scanned — invoice ready</div>
                </div>
                <div className="ml-auto flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ scaleY: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} className="w-1 h-4 bg-signal rounded-full" />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ SEO KEYWORD SECTION — Free Dispatch Templates ════════════════ */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — SEO Text Content */}
            <FadeIn>
              <div className="space-y-5">
                <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                  Free Dispatch Invoice Templates<br />
                  <span className="text-signal">for Freight Dispatchers</span>
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Looking for a <strong className="text-white">free dispatch invoice template</strong>? Load to Cash gives you <strong className="text-white">4 professional trucking invoice templates</strong> — completely free to use. No Word file, no Excel spreadsheet. Just upload your rate confirmation and your invoice is ready in seconds.
                </p>
                <ul className="space-y-3">
                  {[
                    'Free dispatch fee invoice template — auto-calculates 6%',
                    'Free trucking invoice template with carrier & broker details',
                    'Rate confirmation to invoice in under 10 seconds',
                    'Download as PDF instantly — no design skills needed',
                    'Works for owner-operators, fleet managers & dispatchers',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-signal/10 border border-signal/30 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={11} className="text-signal" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button onClick={() => navigate('/signup')} className="glow-btn px-6 py-3 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2">
                    <FileText size={15} /> Get Free Templates
                  </button>
                  <a href="#templates" className="glass px-6 py-3 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition-all">
                    Preview Templates →
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Right — Template badges grid */}
            <FadeIn delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Corporate Classic', tag: 'FREE', color: 'border-white/10 glass-card', tagColor: 'bg-blue-500', desc: 'Navy header, gold accents. Most popular.' },
                  { name: 'Modern Minimalist', tag: 'FREE', color: 'border-white/10 glass-card', tagColor: 'bg-slate-500', desc: 'Clean borderless design. Simple & sharp.' },
                  { name: 'Executive Cargo', tag: 'FREE', color: 'border-white/10 glass-card', tagColor: 'bg-amberline', desc: 'Dark header with amber totals.' },
                  { name: 'Emerald Steel', tag: 'FREE', color: 'border-white/10 glass-card', tagColor: 'bg-signal', desc: 'Bold teal system billing style.' },
                ].map((t, i) => (
                  <div key={i} className={`rounded-2xl border p-5 hover:shadow-lg ${t.color} hover:-translate-y-1 transition-all duration-200 cursor-pointer`} onClick={() => navigate('/signup')}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`text-[10px] font-black px-2.5 py-1 rounded-full text-white ${t.tagColor}`}>{t.tag}</div>
                      <FileText size={16} className="text-slate-500" />
                    </div>
                    <div className="font-bold text-white text-sm mb-1">{t.name}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{t.desc}</div>
                    <div className="mt-3 text-xs text-signal font-semibold flex items-center gap-1">
                      Use for free <ArrowRight size={11} />
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* SEO keyword tags */}
          <FadeIn delay={0.3}>
            <div className="mt-10 pt-8 border-t border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4 text-center">Also searched for</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'free dispatch invoice template',
                  'trucking invoice template free download',
                  'dispatch fee invoice',
                  'freight dispatcher billing template',
                  'rate confirmation invoice',
                  'dispatcher invoice PDF',
                  'free trucking invoice',
                  'load confirmation template',
                  'dispatch billing software free',
                  'owner operator invoice template',
                ].map((tag, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-white/5 border border-white/5 text-slate-500 rounded-full hover:text-slate-300 hover:border-white/10 transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════ MOTIVATIONAL QUOTES ════════════════ */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-center text-xs text-slate-400 uppercase tracking-widest font-bold mb-8">Why dispatchers switch to Load-to-Cash</p>
          </FadeIn>
          <AnimatePresence mode="wait">
            <motion.div key={activeQuote} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
              className={`${quotes[activeQuote].bg} border rounded-2xl p-8 flex items-start gap-6`}>
              <Quote size={28} className={`shrink-0 mt-1 ${quotes[activeQuote].color}`} />
              <p className={`text-xl font-bold leading-relaxed ${quotes[activeQuote].color}`}>{quotes[activeQuote].text}</p>
              {(() => { const Icon = quotes[activeQuote].icon; return <Icon size={32} className={`shrink-0 ml-auto mt-1 ${quotes[activeQuote].color} opacity-60`} />; })()}
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {quotes.map((_, i) => (
              <button key={i} onClick={() => setActiveQuote(i)} className={`rounded-full transition-all ${i === activeQuote ? 'w-6 h-2 bg-signal' : 'w-2 h-2 bg-slate-600'}`} />
            ))}
          </div>
        </div>
        {/* All quote cards */}
        <div className="max-w-7xl mx-auto mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.map((q, i) => {
            const Icon = q.icon;
            return (
              <FadeIn key={i} delay={i * 0.08}>
                <div className={`${q.bg} border rounded-xl p-5 flex items-start gap-4 h-full`}>
                  <Icon size={18} className={`shrink-0 mt-0.5 ${q.color}`} />
                  <p className="text-sm text-slate-400 leading-relaxed">{q.text}</p>
                </div>
              </FadeIn>
            );
          })}
          <FadeIn delay={0.45}>
            <div className="glass-card border border-signal/30 rounded-xl p-5 flex flex-col gap-4 justify-between h-full">
              <div className="flex items-start gap-4">
                <Sparkles size={18} className="shrink-0 mt-0.5 text-signal" />
                <p className="text-sm text-slate-400 leading-relaxed">Ready to stop wasting time? Join 500+ dispatchers already saving 3+ hours every week.</p>
              </div>
              <button onClick={() => navigate('/signup')} className="glow-btn px-5 py-2.5 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2">
                Start Free <ArrowRight size={12} />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs text-signal uppercase tracking-widest font-bold mb-3">Simple 5-Step Process</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white">How It Works</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">From upload to invoice in under 60 seconds. No training required.</p>
          </FadeIn>
          <div className="relative grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="relative group glass-card gradient-border hover:shadow-lg rounded-2xl p-6 text-left transition-all hover:-translate-y-1 h-full flex flex-col">
                    <div className="w-12 h-12 bg-signal/10 border border-signal/20 text-signal rounded-xl flex items-center justify-center mb-4 group-hover:bg-signal group-hover:text-white transition-all">
                      <Icon size={22} />
                    </div>
                    <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Step {i + 1}</div>
                    <h3 className="font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed flex-1">{step.desc}</p>
                    {i < steps.length - 1 && <div className="hidden lg:block absolute top-8 -right-3 text-slate-400 z-10"><ChevronRight size={20} /></div>}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ INVOICE TEMPLATES ════════════════ */}
      <section id="templates" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs text-signal uppercase tracking-widest font-bold mb-3">4 Premium Designs</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white">Choose Your Invoice Style</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">All templates include your company branding, carrier details, dispatch fee breakdown, and payment terms. Click to preview.</p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((t, i) => (
              <FadeIn key={t.id} delay={i * 0.1}>
                <div className="group glass-card hover:border-signal/40 hover:shadow-xl rounded-2xl overflow-hidden transition-all hover:-translate-y-2 flex flex-col">
                  {/* Template mini-preview */}
                  <div className="relative overflow-hidden bg-white p-3 cursor-pointer" onClick={() => setPreviewTemplate(t)}>
                    <div className="pointer-events-none" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                      <InvoicePreviewMock template={t} />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-signal/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <div className="bg-signal text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg">
                        <ZoomIn size={16} /> Full Preview
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-signal text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{t.badge}</div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 border-t border-white/5">
                    <h3 className="font-bold text-white mb-1">{t.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed flex-1">{t.desc}</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setPreviewTemplate(t)}
                        className="flex-1 py-2.5 border border-signal/30 hover:bg-signal/5 text-signal text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5">
                        <Eye size={12} /> Preview
                      </button>
                      <button onClick={() => navigate('/signup')}
                        className="flex-1 py-2.5 bg-signal hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-all">
                        Use This
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ WORKFLOW DIAGRAM ════════════════ */}
      <section id="workflow" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-white/5 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn className="text-center mb-20">
            <p className="text-xs text-signal uppercase tracking-widest font-bold mb-3">Step-by-Step Process</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white">Your Dispatch Workflow</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">From a raw PDF to a paid invoice — everything automated in one clean flow.</p>
          </FadeIn>

          {/* Row 1: Steps 1-2-3 → */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              { step: '01', icon: UploadCloud, title: 'Upload Rate Confirmation', desc: "Drag & drop your carrier's rate confirmation PDF. Any format, any broker accepted.", color: 'from-signal/10 to-signal/5', border: 'border-signal/30', iconBg: 'bg-signal', tag: 'START', tagColor: 'bg-signal text-white', detail: 'Supports PDF, scans & multi-page docs' },
              { step: '02', icon: Cpu, title: 'AI Reads & Extracts Data', desc: 'AI engine reads the PDF and instantly fills carrier name, load #, broker, route, and gross amount.', color: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-500/30', iconBg: 'bg-purple-500', tag: 'AI AUTOMATED', tagColor: 'bg-purple-500 text-white', detail: '< 10 seconds processing time' },
              { step: '03', icon: CheckSquare, title: 'Review & Save to Dashboard', desc: 'Verify the auto-filled load details. Edit anything if needed, then save to your weekly tracker.', color: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/30', iconBg: 'bg-blue-500', tag: 'VERIFY', tagColor: 'bg-blue-500 text-white', detail: 'Loads saved to weekly load tracker' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={i} delay={i * 0.15} className="relative">
                  <div className={`bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-6 h-full relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                    <div className="absolute top-3 right-4 text-6xl font-black text-white/5 select-none">{item.step}</div>
                    <span className={`inline-flex text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 ${item.tagColor}`}>{item.tag}</span>
                    <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon size={26} className="text-white" />
                    </div>
                    <h3 className="text-white font-black text-base mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-white/10 pt-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-signal shrink-0" />{item.detail}
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-slate-800 border border-signal/30 rounded-full items-center justify-center shadow-lg">
                      <ChevronRight size={16} className="text-signal" />
                    </div>
                  )}
                </FadeIn>
              );
            })}
          </div>

          {/* Down arrow connector */}
          <FadeIn delay={0.5}>
            <div className="flex justify-end pr-4 md:pr-[17%] mb-6">
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-8 bg-gradient-to-b from-blue-500/40 to-amberline/40" />
                <div className="w-8 h-8 bg-slate-800 border border-amberline/40 rounded-full flex items-center justify-center shadow-lg">
                  <ChevronRight size={16} className="text-amberline rotate-90" />
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-amberline/40 to-transparent" />
              </div>
            </div>
          </FadeIn>

          {/* Row 2: Steps 4-5-6 ← (reversed) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '06', icon: TrendingUp, title: 'Track Payments & History', desc: 'Monitor payment status in Carrier History. Mark paid, track earnings, see all carriers at a glance.', color: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/30', iconBg: 'bg-emerald-500', tag: 'TRACK', tagColor: 'bg-emerald-500 text-white', detail: 'Full carrier history & payment dashboard' },
              { step: '05', icon: DollarSign, title: 'Download & Send Invoice', desc: 'Download your professional PDF and send it to the carrier. Dispatch fee auto-calculated at 6%.', color: 'from-amberline/10 to-amberline/5', border: 'border-amberline/30', iconBg: 'bg-amberline', tag: 'GET PAID', tagColor: 'bg-amberline text-ink', detail: 'One-click PDF export, ready to send' },
              { step: '04', icon: FileSpreadsheet, title: 'Select Invoice Template', desc: 'Pick from 4 professional invoice templates. Company info, carrier, and load table fill automatically.', color: 'from-orange-500/10 to-orange-500/5', border: 'border-orange-500/30', iconBg: 'bg-orange-500', tag: 'DESIGN', tagColor: 'bg-orange-500 text-white', detail: '4 premium templates available' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={i} delay={i * 0.15 + 0.6} className="relative">
                  <div className={`bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-6 h-full relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                    <div className="absolute top-3 right-4 text-6xl font-black text-white/5 select-none">{item.step}</div>
                    <span className={`inline-flex text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 ${item.tagColor}`}>{item.tag}</span>
                    <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon size={26} className="text-white" />
                    </div>
                    <h3 className="text-white font-black text-base mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-white/10 pt-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amberline shrink-0" />{item.detail}
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-slate-800 border border-amberline/30 rounded-full items-center justify-center shadow-lg">
                      <ChevronRight size={16} className="text-amberline rotate-180" />
                    </div>
                  )}
                </FadeIn>
              );
            })}
          </div>

          {/* Bottom CTA strip */}
          <FadeIn delay={1.0}>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 glass border border-signal/20 rounded-2xl px-8 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-signal/10 border border-signal/20 rounded-xl flex items-center justify-center">
                  <Zap size={18} className="text-signal" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Total time: Under 2 minutes</div>
                  <div className="text-slate-400 text-xs">From PDF upload to professional invoice ready to send</div>
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/10" />
              <button onClick={() => navigate('/signup')} className="glow-btn px-6 py-3 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 shrink-0">
                Try the Workflow Free <ArrowRight size={14} />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════ BENEFITS ════════════════ */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs text-signal uppercase tracking-widest font-bold mb-3">Built for Growth</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white">Why Load-to-Cash Wins</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Every feature is designed around how real freight dispatchers actually work — and what slows them down.</p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="group glass-card gradient-border hover:shadow-lg rounded-2xl p-7 transition-all hover:-translate-y-1 h-full">
                    <div className="w-12 h-12 bg-signal/10 border border-signal/20 text-signal rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs text-signal uppercase tracking-widest font-bold mb-3">Real Dispatchers</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white">What They're Saying</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div className="glass-card hover:border-signal/20 rounded-2xl p-7 transition-all h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={14} className="text-amberline fill-amberline" />)}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm italic flex-1">"{t.quote}"</p>
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.role}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ ABOUT US ════════════════ */}
      <section id="about" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="relative glass-card rounded-2xl overflow-hidden p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-signal rounded-xl flex items-center justify-center shadow-lg shadow-signal/30">
                    <Truck size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">LoadToCash</div>
                    <div className="text-xs text-signal font-bold uppercase tracking-widest">AI Dispatch Billing</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Upload PDF', 'AI Extraction', 'Invoice Generation', 'Payment Tracking'].map((f, i) => (
                    <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-signal/10 border border-signal/20 rounded-lg flex items-center justify-center text-signal">
                        <CheckCircle size={14} />
                      </div>
                      <span className="text-sm text-slate-400 font-medium">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                  <Shield size={12} className="text-signal" />
                  <span>AWS-encrypted · SOC2 compliant · 99.9% uptime</span>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="space-y-6">
              <p className="text-xs text-signal uppercase tracking-widest font-bold">Our Story</p>
              <h2 className="text-4xl lg:text-5xl font-black text-white">Built by Dispatchers,<br />for Dispatchers</h2>
              <p className="text-slate-400 leading-relaxed">We were tired of watching owner-operators and independent dispatchers spend hours every week doing data entry that a computer should handle. Load-to-Cash was built from real dispatching pain — manual invoice errors, billing disputes, and Sunday-night paperwork marathons.</p>
              <p className="text-slate-400 leading-relaxed">Our mission is simple: <strong className="text-white">zero manual typing</strong>. Upload your rate confirmation. We handle the rest.</p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[{ val: 500, suf: '+', label: 'Active Users' }, { val: 10000, suf: '+', label: 'Invoices Made' }, { val: 99, suf: '.9%', label: 'Uptime' }].map(s => (
                  <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-signal"><Counter target={s.val} suffix={s.suf} /></div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════ CONTACT ════════════════ */}
      <section id="contact" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
          <FadeIn>
            <div className="space-y-8">
              <div>
                <p className="text-xs text-signal uppercase tracking-widest font-bold mb-3">Get in Touch</p>
                <h2 className="text-4xl lg:text-5xl font-black text-white">Contact Us</h2>
                <p className="text-slate-400 mt-3">Have questions? We'd love to hear from you.</p>
              </div>
              <div className="space-y-6">
                {[{ icon: Phone, label: 'Main Office', val: '(602) 345-1528' }, { icon: Mail, label: 'Email', val: 'Nickindispatch@gmail.com' }, { icon: Phone, label: 'WhatsApp', val: '+1 (602) 345-1572' }, { icon: MapPin, label: 'Location', val: 'United States — Remote-first' }].map(item => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-signal/10 border border-signal/20 text-signal rounded-xl flex items-center justify-center shrink-0">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">{item.label}</div>
                      <div className="text-white font-semibold mt-0.5">{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-signal/5 border border-signal/20 rounded-2xl flex gap-4 items-start">
                <Shield size={20} className="text-signal shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">Your data is encrypted and secure. Protected by AWS with SSL encryption. We never share your information.</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="glass-card shadow-lg rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Send a Message</h3>
              <div className="space-y-4">
                {[{ label: 'Full Name', type: 'text', placeholder: 'Your full name' }, { label: 'Email', type: 'email', placeholder: 'your@email.com' }].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">{field.label}</label>
                    <input type={field.type} placeholder={field.placeholder} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/10 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Message</label>
                  <textarea rows={4} placeholder="How can we help you?" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/10 transition-all resize-none" />
                </div>
                <button className="w-full py-3.5 glow-btn text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  <Mail size={16} /> Send Message
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════ FINAL CTA — KEPT DARK (Stripe pattern) ════════════════ */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-16 relative overflow-hidden border border-signal/20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-signal to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-signal/10 via-purple-600/5 to-transparent rounded-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-signal/10 border border-signal/20 text-signal px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} /> Free to Start · No Credit Card
              </div>
              <h2 className="text-5xl font-black text-white">Stop Typing.<br /><span className="text-signal">Start Billing.</span></h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">Join 500+ dispatchers who eliminated manual data entry and reclaimed their time.</p>
              <button onClick={() => navigate('/signup')} className="group glow-btn px-10 py-4 text-white font-black rounded-xl text-lg transition-all flex items-center justify-center gap-3 mx-auto">
                Get Started for Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ════════════════ FOOTER — KEPT DARK ════════════════ */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-900/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-signal/20 border border-signal/30 text-signal rounded-lg flex items-center justify-center">
              <Truck size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">LOAD TO CASH</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest">AI Dispatch Billing</div>
            </div>
          </Link>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <a href="#about" className="hover:text-signal transition-colors">About us</a>
            <a href="#contact" className="hover:text-signal transition-colors">Contact</a>
            <Link to="/privacy" className="hover:text-signal transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Load to Cash Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* ════════════════ TEMPLATE PREVIEW MODAL — KEPT AS-IS ════════════════ */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setPreviewTemplate(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/10">
                <div>
                  <h3 className="text-white font-bold">{previewTemplate.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{previewTemplate.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/signup')} className="px-4 py-2 bg-signal hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all">
                    Use Template
                  </button>
                  <button onClick={() => setPreviewTemplate(null)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* Full invoice preview */}
              <div className="p-6 bg-gray-100">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <InvoicePreviewMock template={previewTemplate} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
