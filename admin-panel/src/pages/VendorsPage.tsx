import { useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Vendor {
  id: number;
  store_name: string;
  store_slug: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  commission_rate: string;
  is_featured: boolean;
  user: { email: string; first_name: string };
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiClient
      .get<ApiEnvelope<Vendor[]>>('/vendors/admin/all', { params: filter ? { status: filter } : {} })
      .then((res) => setVendors(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  async function updateStatus(id: number, status: string) {
    let rejection_reason: string | undefined;
    if (status === 'rejected') {
      rejection_reason = window.prompt('Reason for rejection (optional)') || undefined;
    }
    await apiClient.patch(`/vendors/${id}/status`, { status, rejection_reason });
    load();
  }

  async function updateCommission(id: number, current: string) {
    const value = window.prompt('New commission rate (%)', current);
    if (value === null) return;
    await apiClient.patch(`/vendors/${id}/commission`, { commission_rate: Number(value) });
    load();
  }

  async function toggleFeatured(id: number) {
    await apiClient.patch(`/vendors/${id}/featured`);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>Vendors</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 200 }}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Commission</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td>{v.store_name}</td>
                  <td>{v.user?.email}</td>
                  <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  <td>
                    {v.commission_rate}%{' '}
                    <button className="btn btn-outline" onClick={() => updateCommission(v.id, v.commission_rate)}>
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className={v.is_featured ? 'btn btn-success' : 'btn btn-outline'}
                      onClick={() => toggleFeatured(v.id)}
                    >
                      {v.is_featured ? '★ Featured' : '☆ Feature'}
                    </button>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {v.status !== 'approved' && (
                      <button className="btn btn-success" onClick={() => updateStatus(v.id, 'approved')}>Approve</button>
                    )}
                    {v.status !== 'suspended' && (
                      <button className="btn btn-danger" onClick={() => updateStatus(v.id, 'suspended')}>Suspend</button>
                    )}
                    {v.status !== 'rejected' && (
                      <button className="btn btn-outline" onClick={() => updateStatus(v.id, 'rejected')}>Reject</button>
                    )}
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">No vendors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
