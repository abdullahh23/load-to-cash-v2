import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings, Upload, FileText, History, PenLine,
  ChevronRight, ChevronLeft, X, Sparkles, CheckCircle,
} from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  action?: string;
  route?: string;
  tip?: string;
}

const steps: Step[] = [
  {
    title: 'Welcome to Load to Cash',
    description: 'This quick guide will walk you through the platform so you can start generating invoices right away. It only takes a minute.',
    icon: Sparkles,
    gradient: 'from-teal-500 to-emerald-600',
    tip: 'You can restart this guide anytime from your settings.',
  },
  {
    title: 'Step 1 — Company Settings',
    description: 'First, set up your dispatch company details. Add your company name, address, phone, payment methods (Zelle, Cash App, Payoneer), and your dispatch fee percentage. This information appears on every invoice you generate.',
    icon: Settings,
    gradient: 'from-blue-500 to-indigo-600',
    route: '/settings',
    action: 'Go to Company Settings',
    tip: 'You can also upload your company logo for professional invoices.',
  },
  {
    title: 'Step 2 — Add Carrier Details',
    description: 'On the same Settings page, scroll down to add your carrier information — carrier name, MC number, address, and phone. You can save multiple carriers and select them when creating invoices.',
    icon: PenLine,
    gradient: 'from-violet-500 to-purple-600',
    route: '/settings',
    action: 'Go to Settings',
    tip: 'Saved carriers can be reused across all invoices.',
  },
  {
    title: 'Step 3 — Upload Rate Confirmations',
    description: 'Go to the Dashboard and upload your rate confirmation PDFs. Our AI will automatically extract the load number, broker name, pickup date, gross amount, and route details. You can also add loads manually using the "Manual Load Entry" button.',
    icon: Upload,
    gradient: 'from-amber-500 to-orange-600',
    route: '/dashboard',
    action: 'Go to Dashboard',
    tip: 'You can upload files or enter loads manually — both count separately toward your limits.',
  },
  {
    title: 'Step 4 — Generate Invoices',
    description: 'Once your loads are added, go to Invoice Statements. Select a professional template, choose your carrier, and generate your dispatch fee invoice. You can print it, download it as PDF, or save it to your records.',
    icon: FileText,
    gradient: 'from-rose-500 to-pink-600',
    route: '/invoice',
    action: 'Go to Invoices',
    tip: '4 professional templates available: Classic, Executive, Minimal, and Tech.',
  },
  {
    title: 'Step 5 — Track Carrier History',
    description: 'The Carrier History page shows a complete breakdown for each carrier — total loads, invoices, gross revenue, dispatch fees, and paid vs. unpaid amounts. Click any carrier card to see their full load history.',
    icon: History,
    gradient: 'from-cyan-500 to-teal-600',
    route: '/carrier-history',
    action: 'Go to Carrier History',
    tip: 'Mark invoices as paid or unpaid to keep your records accurate.',
  },
  {
    title: 'You are all set',
    description: 'You are ready to start using Load to Cash. Begin by setting up your company details, then upload your first rate confirmation and watch the AI do the work.',
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-green-600',
    route: '/settings',
    action: 'Start Setup',
  },
];

export function OnboardingTour() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!user) return;
    // Show after a small delay so privacy modal shows first
    const timer = setTimeout(() => {
      const privacyKey = `privacy_accepted_${user.id}`;
      const tourKey = `onboarding_done_${user.id}`;
      // Only show if privacy is accepted and tour not done
      if (localStorage.getItem(privacyKey) && !localStorage.getItem(tourKey)) {
        setShow(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = () => {
    if (user) localStorage.setItem(`onboarding_done_${user.id}`, 'true');
    setShow(false);
  };

  const handleNext = () => {
    if (step === steps.length - 1) {
      handleClose();
      if (steps[step].route) navigate(steps[step].route!);
      return;
    }
    setDirection(1);
    setStep(s => s + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setStep(s => Math.max(0, s - 1));
  };

  const handleAction = () => {
    const current = steps[step];
    if (current.route) {
      handleClose();
      navigate(current.route);
    }
  };

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-steel/10">

              {/* Header with gradient */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={`bg-gradient-to-r ${current.gradient} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Icon size={22} className="text-white" />
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold tracking-tight">{current.title}</h2>
                          <p className="text-white/60 text-[10px] font-semibold mt-0.5">
                            Step {step + 1} of {steps.length}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <p className="text-sm text-road leading-relaxed">{current.description}</p>

                    {current.tip && (
                      <div className="mt-4 bg-lane rounded-xl p-3 border border-steel/8">
                        <p className="text-[11px] text-steel font-medium leading-relaxed">
                          <span className="font-bold text-ink">Tip:</span> {current.tip}
                        </p>
                      </div>
                    )}

                    {current.action && !isFirst && (
                      <button
                        onClick={handleAction}
                        className={`mt-4 w-full bg-gradient-to-r ${current.gradient} text-white py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all`}
                      >
                        {current.action}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Footer */}
              <div className="px-6 pb-5 flex items-center justify-between">
                {/* Progress dots */}
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step
                          ? `w-6 bg-gradient-to-r ${current.gradient}`
                          : i < step
                          ? 'w-1.5 bg-signal'
                          : 'w-1.5 bg-steel/15'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  {!isFirst && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-1 text-[11px] font-bold text-steel hover:text-ink px-3 py-2 rounded-xl hover:bg-lane transition-all"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                  )}
                  {isFirst && (
                    <button
                      onClick={handleClose}
                      className="text-[11px] font-bold text-steel hover:text-ink px-3 py-2 rounded-xl hover:bg-lane transition-all"
                    >
                      Skip Tour
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className={`flex items-center gap-1 text-[11px] font-bold text-white px-4 py-2 rounded-xl transition-all bg-gradient-to-r ${current.gradient} hover:opacity-90`}
                  >
                    {isLast ? 'Get Started' : 'Next'} <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
