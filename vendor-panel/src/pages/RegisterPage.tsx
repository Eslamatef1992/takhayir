import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', store_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: '40px 0' }}>
      <div style={{ width: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Logo size={64} />
        </div>
        <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
          <h1 style={{ fontSize: 18, marginBottom: 4 }}>Apply to sell on Takhayir</h1>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
            Submit your details below. Our team will review your application and approve your
            store before you can sign in and start selling.
          </p>
          <div className="form-group">
            <label>Store name</label>
            <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>First name</label>
            <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Last name</label>
            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit application'}
          </button>
        </form>
        <p className="text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
          Already have a store? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
