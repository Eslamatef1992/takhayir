import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from '../components/Icons';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Log in to Takhayir"
      subtitle="Welcome back — pick up right where you left off."
      footer={
        <>
          Don't have an account? <Link to="/register">Sign up</Link>. Want to sell?{' '}
          <a href={import.meta.env.VITE_VENDOR_URL || 'https://vendor.takhayir.com'}>Become a vendor</a>.
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <MailIcon size={17} />
            </span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <LockIcon size={17} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
          </div>
        </div>
        <p style={{ marginTop: -8, marginBottom: 16 }}>
          <Link to="/forgot-password" className="text-muted" style={{ fontSize: 13 }}>
            Forgot password?
          </Link>
        </p>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}
