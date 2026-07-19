import { useState } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function ApprovalStatusPage() {
  const { user, logout, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const status = user?.vendorProfile?.status;

  const copy =
    status === 'rejected'
      ? {
          title: 'Your application was not approved',
          body:
            user?.vendorProfile?.rejection_reason ||
            'Our team reviewed your store application and it was not approved this time. Contact support if you think this is a mistake.'
        }
      : status === 'suspended'
      ? {
          title: 'Your store is suspended',
          body: 'Your store account has been suspended. Contact support for more information.'
        }
      : {
          title: 'Your application is under review',
          body:
            "Thanks for applying to sell on Takhayir. Our team is reviewing your store details and will approve your account shortly - you'll be able to sign in and manage your store as soon as that happens."
        };

  async function handleCheckStatus() {
    setChecking(true);
    try {
      await refreshUser();
    } finally {
      setChecking(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
        padding: '40px 20px'
      }}
    >
      <div style={{ width: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Logo size={64} />
        </div>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              margin: '0 auto 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              background: status === 'rejected' || status === 'suspended' ? '#fdecea' : 'var(--bg-subtle)'
            }}
          >
            {status === 'rejected' || status === 'suspended' ? '⚠️' : '⏳'}
          </div>
          <h1 style={{ fontSize: 18, marginBottom: 10 }}>{copy.title}</h1>
          <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            {copy.body}
          </p>
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }} onClick={handleCheckStatus} disabled={checking}>
            {checking ? 'Checking...' : 'Check status again'}
          </button>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
