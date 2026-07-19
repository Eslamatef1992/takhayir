import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
      <div style={{ width: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Logo size={64} />
        </div>
        <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
          <h1 style={{ fontSize: 18, marginBottom: 20 }}>{t('Vendor sign in')}</h1>
          <div className="form-group">
            <label>{t('Email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>{t('Password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('Signing in...') : t('Sign in')}
          </button>
        </form>
        <p className="text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
          {t('New seller?')} <Link to="/register">{t('Create a store')}</Link>
        </p>
      </div>
    </div>
  );
}
