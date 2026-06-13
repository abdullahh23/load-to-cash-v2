import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-lane">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-signal to-teal-900 text-white p-12 flex-col justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Truck size={20} />
          </div>
          <span className="text-xl font-bold">Load to Cash</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Dispatch invoicing, simplified.</h1>
          <p className="text-white/80 text-lg">Upload rate confirmations, track weekly loads, and generate professional dispatch fee invoices.</p>
        </div>
        <p className="text-white/50 text-sm">© Load to Cash</p>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center">
              <Truck size={16} className="text-white" />
            </div>
            <span className="font-bold text-ink">Load to Cash</span>
          </div>
          <h2 className="text-2xl font-bold text-ink">{title}</h2>
          <p className="text-steel text-sm mt-1 mb-6">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function AuthInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-semibold text-steel uppercase tracking-wide mb-1">{label}</label>
      <input
        {...props}
        className="w-full border border-steel/25 rounded-xl px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal transition-shadow"
      />
    </div>
  );
}

export function AuthButton({ children, loading, ...props }: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full bg-signal text-white py-2.5 rounded-xl font-semibold hover:bg-signal/90 transition-colors disabled:opacity-60"
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="text-signal hover:underline text-sm font-medium">{children}</Link>;
}
