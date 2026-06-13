import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout, AuthButton, AuthLink } from '../../components/auth/AuthLayout';
import { MailCheck } from 'lucide-react';

export function VerifyEmailPage() {
  const { user, resendVerification, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error: err } = await resendVerification();
    setLoading(false);
    if (err) setError(err);
    else setMessage('Verification email sent.');
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Check your inbox to activate your account">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-signal/10 rounded-full flex items-center justify-center mx-auto">
          <MailCheck className="text-signal" size={28} />
        </div>
        <p className="text-steel text-sm">
          We sent a verification link to <strong className="text-ink">{user?.email}</strong>
        </p>
        {message && <p className="text-signal text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <AuthButton loading={loading} onClick={handleResend}>Resend Verification Email</AuthButton>
        <button onClick={() => signOut()} className="block w-full text-sm text-steel hover:text-ink mt-2">
          Sign out
        </button>
        <AuthLink to="/login">Back to sign in</AuthLink>
      </div>
    </AuthLayout>
  );
}
