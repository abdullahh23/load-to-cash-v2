import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout, AuthInput, AuthButton, AuthLink } from '../../components/auth/AuthLayout';
import { isValidEmail, isStrongPassword, sanitizeName, checkRateLimit, formatRateLimitTime } from '../../lib/security';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const { signUp, signIn }      = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ── Validate name ──
    const cleanName = sanitizeName(fullName);
    if (cleanName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    // ── Validate email ──
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // ── Validate password strength ──
    const { valid, message } = isStrongPassword(password);
    if (!valid) {
      setError(message);
      return;
    }

    // ── Rate limiting: max 3 signups per 5 min from same email ──
    const rateKey = `signup:${email.toLowerCase()}`;
    const { allowed, remainingMs } = checkRateLimit(rateKey, 3, 300_000);
    if (!allowed) {
      setError(`Too many attempts. Please wait ${formatRateLimitTime(remainingMs)}.`);
      return;
    }

    setLoading(true);

    // ── Sign up ──
    const { error: signUpErr } = await signUp(email.trim().toLowerCase(), password, cleanName);
    if (signUpErr) {
      setLoading(false);
      setError(signUpErr);
      return;
    }

    // ── Auto sign in immediately (no email verification needed) ──
    const { error: signInErr, role } = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);

    if (signInErr) {
      // Account created but auto-login failed — send to login
      navigate('/login');
      return;
    }

    // ── Go straight to dashboard ──
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <AuthLayout title="Create account" subtitle="Start managing your dispatch loads">
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
        <AuthInput
          label="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          autoComplete="name"
          maxLength={100}
          placeholder="John Smith"
        />
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          maxLength={254}
          placeholder="john@example.com"
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          maxLength={128}
          placeholder="Min 8 chars, 1 uppercase, 1 number"
        />
        {error && <p role="alert" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <AuthButton loading={loading}>Create Account</AuthButton>
        <p className="text-center text-sm text-steel">
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </p>
        <p className="text-center text-[10px] text-steel/70 pt-2 border-t border-steel/10 mt-2">
          By creating an account, you agree to our{' '}
          <AuthLink to="/privacy">Privacy & Security Policy</AuthLink>
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <svg className="w-3 h-3 text-signal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[10px] text-signal font-semibold">256-bit encrypted • End-to-end secure</span>
        </div>
      </form>
    </AuthLayout>
  );
}
