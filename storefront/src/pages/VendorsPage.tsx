import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { StoreIcon } from '../components/Icons';

interface Vendor {
  id: number;
  store_name: string;
  store_slug: string;
  description: string | null;
  rating_avg: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<Vendor[]>>('/vendors')
      .then((res) => setVendors(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>All stores</h1>
      <p className="text-muted" style={{ marginBottom: 20 }}>Independent vendors, one checkout.</p>

      {loading ? (
        <div className="grid-products">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120 }} />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p className="text-muted">No stores yet.</p>
        </div>
      ) : (
        <div className="grid-products">
          {vendors.map((v) => (
            <Link key={v.id} to={`/vendors/${v.store_slug}`} className="card" style={{ padding: 18 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'var(--brand-gradient-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-purple)',
                  marginBottom: 10
                }}
              >
                <StoreIcon size={19} />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{v.store_name}</div>
              {v.description && (
                <p className="text-muted" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {v.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
