import { FormEvent, useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface VendorProfile {
  id: number;
  store_name: string;
  store_slug: string;
  description: string | null;
  business_type: string | null;
  tax_number: string | null;
  iban: string | null;
  status: string;
}

export default function StoreSettingsPage() {
  const [form, setForm] = useState<Partial<VendorProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiClient.get<ApiEnvelope<VendorProfile>>('/vendors/me').then((res) => setForm(res.data.data)).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiClient.put('/vendors/me', form);
      setMessage('Store settings saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Store settings</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
        <div className="form-group">
          <label>Store name</label>
          <input value={form.store_name || ''} onChange={(e) => setForm({ ...form, store_name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows={4} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Business type</label>
          <input value={form.business_type || ''} onChange={(e) => setForm({ ...form, business_type: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Tax number</label>
          <input value={form.tax_number || ''} onChange={(e) => setForm({ ...form, tax_number: e.target.value })} />
        </div>
        <div className="form-group">
          <label>IBAN (for payouts)</label>
          <input value={form.iban || ''} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
        </div>
        {message && <p className="text-muted">{message}</p>}
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
