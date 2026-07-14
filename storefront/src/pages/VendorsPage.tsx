import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';

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

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>All stores</h1>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {vendors.map((v) => (
          <Link key={v.id} to={`/vendors/${v.store_slug}`} className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{v.store_name}</div>
            {v.description && <p className="text-muted" style={{ fontSize: 13 }}>{v.description}</p>}
          </Link>
        ))}
        {vendors.length === 0 && <p className="text-muted">No stores yet.</p>}
      </div>
    </div>
  );
}
