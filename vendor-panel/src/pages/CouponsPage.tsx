import { FormEvent, useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percent';
  value: string;
  is_active: boolean;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '' });
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiClient.get<ApiEnvelope<Coupon[]>>('/coupons').then((res) => setCoupons(res.data.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await apiClient.post('/coupons', { ...form, value: Number(form.value) });
    setForm({ code: '', type: 'percent', value: '' });
    load();
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this coupon?')) return;
    await apiClient.delete(`/coupons/${id}`);
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>My coupons</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div className="card" style={{ overflow: 'auto' }}>
          <table>
            <thead>
              <tr><th>Code</th><th>Type</th><th>Value</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {loading ? null : coupons.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.type}</td>
                  <td>{c.type === 'percent' ? `${c.value}%` : `SAR ${c.value}`}</td>
                  <td>{c.is_active ? 'Active' : 'Inactive'}</td>
                  <td><button className="btn btn-outline" onClick={() => handleDelete(c.id)}>Delete</button></td>
                </tr>
              ))}
              {!loading && coupons.length === 0 && (
                <tr><td colSpan={5} className="text-muted">No coupons yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <form onSubmit={handleCreate} className="card" style={{ padding: 16, height: 'fit-content' }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>New coupon</h2>
          <div className="form-group">
            <label>Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <div className="form-group">
            <label>Value</label>
            <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>Create coupon</button>
        </form>
      </div>
    </div>
  );
}
