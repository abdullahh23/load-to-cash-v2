import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout, AuthInput, AuthButton, AuthLink } from '../../components/auth/AuthLayout';
import { checkRateLimit, formatRateLimitTime, isValidEmail } from '../../lib/security';

export function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const { signIn } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ── Validate email format ──
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // ── Rate limiting: max 5 attempts per minute ──
    const rateKey = `login:${email.toLowerCase()}`;
    const { allowed, remainingMs } = checkRateLimit(rateKey, 5, 60_000);
    if (!allowed) {
      setError(`Too many login attempts. Please wait ${formatRateLimitTime(remainingMs)} before trying again.`);
      return;
    }

    setLoading(true);
    const { error: err, role } = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);

    if (err) {
      // Generic error — don't reveal if email exists or not (security best practice)
      setError('Invalid email or password. Please try again.');
      return;
    }

    navigate(from ?? (role === 'admin' ? '/admin' : '/dashboard'));
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your dispatch dashboard">
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          maxLength={254}
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          maxLength={128}
        />
        {error && <p role="alert" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex justify-end">
          <AuthLink to="/forgot-password">Forgot password?</AuthLink>
        </div>
        <AuthButton loading={loading}>Sign In</AuthButton>
        <p className="text-center text-sm text-steel">
          No account? <AuthLink to="/signup">Sign up free</AuthLink>
        </p>
        <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-steel/10 mt-2">
          <svg className="w-3.5 h-3.5 text-signal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <AuthLink to="/privacy">Your data is encrypted & secure — Privacy Policy</AuthLink>
        </div>
      </form>
    </AuthLayout>
  );
}
