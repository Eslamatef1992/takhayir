import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

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
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Reset your password</h1>
      <div className="card" style={{ padding: 24 }}>
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
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
      <p style={{ marginTop: 16 }} className="text-muted">
        <Link to="/login">Back to log in</Link>
      </p>
    </div>
  );
}
