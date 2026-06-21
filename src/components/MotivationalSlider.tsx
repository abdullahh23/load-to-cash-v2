import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Clock, Rocket, Target, Sparkles } from 'lucide-react';

const quotes = [
  {
    text: "Work smarter, not harder — automate your invoicing.",
    icon: Zap,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    text: "Every minute saved on paperwork is a minute earned on the road.",
    icon: Clock,
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    text: "Turn rate confirmations into revenue — in seconds, not hours.",
    icon: TrendingUp,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    text: "Professional invoices build trust. Trust builds business.",
    icon: Target,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    text: "Scale your dispatch business without scaling your workload.",
    icon: Rocket,
    gradient: "from-rose-500 to-pink-600",
  },
  {
    text: "Let AI handle the paperwork while you handle the deals.",
    icon: Sparkles,
    gradient: "from-cyan-500 to-teal-600",
  },
];

export function MotivationalSlider() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pausedRef = useRef(false);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setIndex(prev => (prev + 1) % quotes.length);
      }
    }, 5000);
  }, []);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startInterval]);

  const handleDotClick = (i: number) => {
    setIndex(i);
    startInterval(); // Reset the timer so the full 5s plays from this slide
  };

  const handleMouseEnter = () => { pausedRef.current = true; };
  const handleMouseLeave = () => {
    pausedRef.current = false;
    startInterval(); // Reset timer so it doesn't fire immediately after unpause
  };

  const quote = quotes[index];
  const Icon = quote.icon;

  return (
    <div
      className="relative overflow-hidden rounded-2xl no-print"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`bg-gradient-to-r ${quote.gradient} rounded-2xl p-5 flex items-center gap-4`}
        >
          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
            <Icon size={20} className="text-white" />
          </div>
          <p className="flex-1 min-w-0 text-sm font-semibold text-white leading-snug">{quote.text}</p>
          {/* Dots */}
          <div className="flex gap-1.5 shrink-0">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === index ? 'bg-white w-4 h-1.5' : 'bg-white/30 w-1.5 h-1.5'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
