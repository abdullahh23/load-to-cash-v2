import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, AuthInput, AuthButton, AuthLink } from '../../components/auth/AuthLayout';
import { supabase } from '../../lib/supabase';
import { isStrongPassword } from '../../lib/security';
import { Lock, CheckCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Also check if we already have a session (user clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { valid, message } = isStrongPassword(password);
    if (!valid) {
      setError(message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      // Sign out so they log in fresh with new password
      await supabase.auth.signOut();
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  if (!ready) {
    return (
      <AuthLayout title="Reset password" subtitle="Verifying your reset link...">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-signal/10 rounded-full flex items-center justify-center mx-auto">
            <div className="w-5 h-5 border-2 border-signal border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-steel text-sm">Verifying your password reset link...</p>
          <p className="text-steel/60 text-xs">If this takes too long, your link may have expired.</p>
          <AuthLink to="/forgot-password">Request a new reset link</AuthLink>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Password updated" subtitle="Your password has been changed">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <p className="text-steel text-sm">Your password has been updated successfully!</p>
          <p className="text-steel/60 text-xs">Redirecting you to sign in...</p>
          <AuthLink to="/login">Sign in now</AuthLink>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create new password" subtitle="Enter your new password below">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="New Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          required
        />
        <AuthInput
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your new password"
          required
        />
        {error && (
          <p role="alert" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
        <AuthButton loading={loading}>Update Password</AuthButton>
        <p className="text-center text-sm text-steel">
          <AuthLink to="/login">Back to sign in</AuthLink>
        </p>
      </form>
    </AuthLayout>
  );
}
