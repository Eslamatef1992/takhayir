import { useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Product {
  id: number;
  name: string;
  price: string;
  status: string;
  vendor: { store_name: string };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiClient
      .get<ApiEnvelope<Product[]>>('/products/admin/all', { params: filter ? { status: filter } : {} })
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  async function updateStatus(id: number, status: string) {
    let rejection_reason: string | undefined;
    if (status === 'rejected') {
      rejection_reason = window.prompt('Reason for rejection (optional)') || undefined;
    }
    await apiClient.patch(`/products/${id}/status`, { status, rejection_reason });
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>Products</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 200 }}>
          <option value="">All statuses</option>
          <option value="pending">Pending review</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Vendor</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.vendor?.store_name}</td>
                  <td>KWD {Number(p.price).toFixed(3)}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {p.status !== 'active' && (
                      <button className="btn btn-success" onClick={() => updateStatus(p.id, 'active')}>Approve</button>
                    )}
                    {p.status !== 'rejected' && (
                      <button className="btn btn-danger" onClick={() => updateStatus(p.id, 'rejected')}>Reject</button>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
