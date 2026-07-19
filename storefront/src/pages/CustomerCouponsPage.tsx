import { useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percent';
  value: string;
  min_order_amount: string;
  expires_at: string | null;
  vendor: { id: number; store_name: string } | null;
}

export default function CustomerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<Coupon[]>>('/coupons/available')
      .then((res) => setCoupons(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 1500);
  }

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>My coupons</h1>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
        Enter one of these codes at checkout to get the discount.
      </p>

      {coupons.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p className="text-muted">No coupons are available right now — check back later.</p>
        </div>
      )}

      {coupons.map((c) => (
        <div
          key={c.id}
          className="card"
          style={{ padding: 18, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '0.03em' }}>{c.code}</div>
            <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
              {c.type === 'percent' ? `${c.value}% off` : `KWD ${Number(c.value).toFixed(3)} off`}
              {Number(c.min_order_amount) > 0 && ` on orders over KWD ${Number(c.min_order_amount).toFixed(3)}`}
              {c.vendor ? ` — ${c.vendor.store_name}` : ' — Sitewide'}
              {c.expires_at && ` · Expires ${new Date(c.expires_at).toLocaleDateString()}`}
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => copyCode(c.code)}>
            {copiedCode === c.code ? 'Copied!' : 'Copy code'}
          </button>
        </div>
      ))}
    </div>
  );
}
