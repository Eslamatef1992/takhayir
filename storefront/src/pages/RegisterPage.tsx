import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from '../components/Icons';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const trimmedName = fullName.trim();
    const [first_name, ...rest] = trimmedName.split(/\s+/);
    const last_name = rest.join(' ') || undefined;

    setLoading(true);
    try {
      await register({ first_name, last_name, email, phone, password, role: 'customer' });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands shopping across every Takhayir store."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full name</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <UserIcon size={17} />
            </span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
        </div>
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
          <label>Phone number</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <PhoneIcon size={17} />
            </span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
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
          <label>Retype password</label>
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
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </AuthLayout>
  );
}
