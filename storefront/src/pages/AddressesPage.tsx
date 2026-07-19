import { FormEvent, useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Address {
  id: number;
  label: string | null;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  area: string | null;
  street: string | null;
  building: string | null;
  notes: string | null;
  is_default: boolean;
}

const emptyForm = {
  label: '',
  full_name: '',
  phone: '',
  country: '',
  city: '',
  area: '',
  street: '',
  building: '',
  notes: '',
  is_default: false
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    apiClient
      .get<ApiEnvelope<Address[]>>('/addresses')
      .then((res) => setAddresses(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function openEditForm(a: Address) {
    setEditingId(a.id);
    setForm({
      label: a.label || '',
      full_name: a.full_name,
      phone: a.phone,
      country: a.country,
      city: a.city,
      area: a.area || '',
      street: a.street || '',
      building: a.building || '',
      notes: a.notes || '',
      is_default: a.is_default
    });
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        label: form.label || null,
        full_name: form.full_name,
        phone: form.phone,
        country: form.country,
        city: form.city,
        area: form.area || null,
        street: form.street || null,
        building: form.building || null,
        notes: form.notes || null,
        is_default: form.is_default
      };
      if (editingId) {
        await apiClient.put(`/addresses/${editingId}`, payload);
      } else {
        await apiClient.post('/addresses', payload);
      }
      closeForm();
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save address.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this address?')) return;
    await apiClient.delete(`/addresses/${id}`);
    load();
  }

  async function handleSetDefault(a: Address) {
    await apiClient.put(`/addresses/${a.id}`, { is_default: true });
    load();
  }

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20 }}>My addresses</h1>
        <button className="btn btn-primary" onClick={() => (showForm ? closeForm() : openAddForm())}>
          {showForm ? 'Cancel' : '+ Add address'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>{editingId ? 'Edit address' : 'Add address'}</h2>
          {error && <p className="error-text" style={{ marginBottom: 14 }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Label (e.g. Home, Work)</label>
              <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Full name</label>
              <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label>City</label>
              <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Area</label>
              <input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} />
            </div>

            <div className="form-group">
              <label>Street</label>
              <input value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Building</label>
              <input value={form.building} onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))} />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              />
              Set as default address
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Add address'}
            </button>
            <button type="button" className="btn btn-outline" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p className="text-muted">You haven't saved any addresses yet.</p>
        </div>
      )}

      {addresses.map((a) => (
        <div key={a.id} className="card" style={{ padding: 18, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
                {a.label || 'Address'}
                {a.is_default && (
                  <span className="badge" style={{ fontSize: 10, textTransform: 'uppercase' }}>Default</span>
                )}
              </div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>
                {a.full_name} &middot; {a.phone}
                <br />
                {[a.building, a.street, a.area, a.city, a.country].filter(Boolean).join(', ')}
                {a.notes && (
                  <>
                    <br />
                    {a.notes}
                  </>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {!a.is_default && (
                <button className="btn btn-outline" onClick={() => handleSetDefault(a)}>
                  Set as default
                </button>
              )}
              <button className="btn btn-outline" onClick={() => openEditForm(a)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
