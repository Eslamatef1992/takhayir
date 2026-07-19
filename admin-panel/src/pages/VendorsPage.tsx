import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
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

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

const emptyForm = {
  owner_name: '',
  email: '',
  password: '',
  store_name: '',
  store_name_ar: '',
  iban: '',
  category_id: '',
  commission_rate: '10',
  is_featured: false,
  store_logo: '',
  business_license_url: ''
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [licenseUploading, setLicenseUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const licenseInputRef = useRef<HTMLInputElement | null>(null);

  function load() {
    setLoading(true);
    apiClient
      .get<ApiEnvelope<Vendor[]>>('/vendors/admin/all', { params: filter ? { status: filter } : {} })
      .then((res) => setVendors(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<Category[]>>('/categories', { params: { flat: true } })
      .then((res) => setCategories(res.data.data))
      .catch(() => undefined);
  }, []);

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

  async function uploadFile(file: File): Promise<string> {
    const data = new FormData();
    data.append('file', file);
    const res = await apiClient.post<ApiEnvelope<{ url: string }>>('/vendors/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data.url;
  }

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, store_logo: url }));
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  }

  async function handleLicenseChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicenseUploading(true);
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, business_license_url: url }));
    } finally {
      setLicenseUploading(false);
      e.target.value = '';
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await apiClient.post('/vendors', {
        owner_name: form.owner_name,
        email: form.email,
        password: form.password,
        store_name: form.store_name,
        store_name_ar: form.store_name_ar || null,
        iban: form.iban || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        commission_rate: form.commission_rate ? Number(form.commission_rate) : 10,
        is_featured: form.is_featured,
        store_logo: form.store_logo || null,
        business_license_url: form.business_license_url || null
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Could not create vendor. Please check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>Vendors</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 200 }}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ Add vendor'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Add vendor</h2>

          {formError && (
            <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 14 }}>{formError}</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Owner name</label>
              <input
                value={form.owner_name}
                onChange={(e) => setForm((f) => ({ ...f, owner_name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Login email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Login password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                minLength={8}
                placeholder="Min 8 characters"
                required
              />
            </div>
            <div className="form-group">
              <label>Vendor name (English)</label>
              <input
                value={form.store_name}
                onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Vendor name (Arabic)</label>
              <input
                dir="rtl"
                value={form.store_name_ar}
                onChange={(e) => setForm((f) => ({ ...f, store_name_ar: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>IBAN</label>
              <input
                value={form.iban}
                onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))}
                placeholder="KW..."
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent_id ? '— ' : ''}
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Commission (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={form.commission_rate}
                onChange={(e) => setForm((f) => ({ ...f, commission_rate: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Featured vendor</label>
              <select
                value={form.is_featured ? 'yes' : 'no'}
                onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.value === 'yes' }))}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div />

            <div className="form-group">
              <label>Vendor logo</label>
              <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoChange} />
              {logoUploading && <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>Uploading...</p>}
              {form.store_logo && (
                <img
                  src={`${API_ORIGIN}${form.store_logo}`}
                  alt="Logo preview"
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                />
              )}
            </div>

            <div className="form-group">
              <label>Business license</label>
              <input type="file" accept="image/*,application/pdf" ref={licenseInputRef} onChange={handleLicenseChange} />
              {licenseUploading && <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>Uploading...</p>}
              {form.business_license_url && (
                <a
                  href={`${API_ORIGIN}${form.business_license_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, marginTop: 6, display: 'inline-block' }}
                >
                  View uploaded file
                </a>
              )}
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={submitting || logoUploading || licenseUploading}>
            {submitting ? 'Creating...' : 'Create vendor'}
          </button>
        </form>
      )}

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
