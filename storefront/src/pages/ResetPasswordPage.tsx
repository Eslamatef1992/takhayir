import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { AuthLayout } from '../components/AuthLayout';
import { EyeIcon, EyeOffIcon, LockIcon } from '../components/Icons';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Make it something you'll remember."
      footer={<Link to="/login">Back to log in</Link>}
    >
      {!token ? (
        <p className="error-text">
          This reset link is missing its token. Please use the link from your email, or{' '}
          <Link to="/forgot-password">request a new one</Link>.
        </p>
      ) : done ? (
        <p style={{ lineHeight: 1.6 }}>Your password has been reset. Redirecting you to log in...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <LockIcon size={17} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
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
          <div className="form-group">
            <label>Retype new password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <LockIcon size={17} />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
              </button>
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Saving...' : 'Reset password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
