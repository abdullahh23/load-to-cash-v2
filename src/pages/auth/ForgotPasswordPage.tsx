import { useState } from 'react';
import { AuthLayout, AuthInput, AuthButton, AuthLink } from '../../components/auth/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Mail } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await resetPassword(email);
    setLoading(false);
    if (err) setError(err);
    else setSent(true);
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-signal/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="text-signal" size={24} />
          </div>
          <p className="text-steel text-sm">Check your email for a password reset link.</p>
          <AuthLink to="/login">Back to sign in</AuthLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <AuthButton loading={loading}>Send Reset Link</AuthButton>
          <p className="text-center text-sm text-steel">
            <AuthLink to="/login">Back to sign in</AuthLink>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
