import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout, AuthInput, AuthButton, AuthLink } from '../../components/auth/AuthLayout';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email, password, fullName);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    navigate('/verify-email');
  };

  return (
    <AuthLayout title="Create account" subtitle="Start managing your dispatch loads">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required autoComplete="name" />
        <AuthInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <AuthInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <AuthButton loading={loading}>Create Account</AuthButton>
        <p className="text-center text-sm text-steel">
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </p>
      </form>
    </AuthLayout>
  );
}
