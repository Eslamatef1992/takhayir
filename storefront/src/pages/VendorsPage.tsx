import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { StoreIcon } from '../components/Icons';

interface Vendor {
  id: number;
  store_name: string;
  store_slug: string;
  store_logo: string | null;
  description: string | null;
  rating_avg: string;
  is_featured?: boolean;
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

const STORE_GRADIENTS = [
  'linear-gradient(135deg, #f9622c, #d6247a)',
  'linear-gradient(135deg, #d6247a, #6a2ce0)',
  'linear-gradient(135deg, #6a2ce0, #2c7be5)',
  'linear-gradient(135deg, #2c7be5, #12b886)'
];

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
        <div className="category-tile-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton category-tile" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p className="text-muted">No stores yet.</p>
        </div>
      ) : (
        <div className="category-tile-grid">
          {vendors.map((v, idx) => (
            <Link key={v.id} to={`/vendors/${v.store_slug}`} className="card card-premium store-card">
              {v.is_featured && <span className="store-card-featured-tag">Featured</span>}
              {v.store_logo ? (
                <div className="store-card-icon store-card-icon-logo">
                  <img
                    src={v.store_logo.startsWith('http') ? v.store_logo : `${API_ORIGIN}${v.store_logo}`}
                    alt={v.store_name}
                  />
                </div>
              ) : (
                <div className="store-card-icon" style={{ background: STORE_GRADIENTS[idx % STORE_GRADIENTS.length] }}>
                  <StoreIcon size={38} />
                </div>
              )}
              <div className="store-card-name">{v.store_name}</div>
              {v.description && <p className="store-card-desc">{v.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
