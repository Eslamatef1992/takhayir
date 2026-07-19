import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { AuthLayout } from '../components/AuthLayout';
import { MailIcon } from '../components/Icons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a secure link to get back in."
      footer={<Link to="/login">Back to log in</Link>}
    >
      {sent ? (
        <p style={{ lineHeight: 1.6 }}>
          If an account exists for <strong>{email}</strong>, we've sent an email with a link to reset your
          password. Check your inbox (and spam folder).
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Enter the email address on your account and we'll send you a link to reset your password.
          </p>
          <div className="form-group">
            <label>Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <MailIcon size={17} />
              </span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
