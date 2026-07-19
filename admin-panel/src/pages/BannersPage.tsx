import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Banner {
  id: number;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', title_ar: '', subtitle: '', subtitle_ar: '', link_url: '', image_url: '' });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function load() {
    setLoading(true);
    apiClient
      .get<ApiEnvelope<Banner[]>>('/banners/admin/all')
      .then((res) => setBanners(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await apiClient.post<ApiEnvelope<{ url: string }>>('/banners/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((f) => ({ ...f, image_url: res.data.data.url }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.image_url) {
      window.alert('Upload an image first.');
      return;
    }
    await apiClient.post('/banners', form);
    setForm({ title: '', title_ar: '', subtitle: '', subtitle_ar: '', link_url: '', image_url: '' });
    load();
  }

  async function toggleActive(banner: Banner) {
    await apiClient.put(`/banners/${banner.id}`, { is_active: !banner.is_active });
    load();
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this banner?')) return;
    await apiClient.delete(`/banners/${id}`);
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Homepage banners</h1>
      <p className="text-muted" style={{ marginBottom: 20, fontSize: 13 }}>
        Active banners appear as the hero image on the storefront homepage, in order.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div>
          {loading ? (
            <div className="spinner">Loading...</div>
          ) : banners.length === 0 ? (
            <p className="text-muted">No banners yet — add your first one.</p>
          ) : (
            banners.map((b) => (
              <div key={b.id} className="card" style={{ display: 'flex', gap: 16, padding: 16, marginBottom: 12, alignItems: 'center' }}>
                <img
                  src={`${API_ORIGIN}${b.image_url}`}
                  alt={b.title || 'Banner'}
                  style={{ width: 160, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{b.title || <span className="text-muted">(no title)</span>}</div>
                  {b.subtitle && <div className="text-muted" style={{ fontSize: 13 }}>{b.subtitle}</div>}
                  <span className={`badge ${b.is_active ? 'badge-active' : 'badge-suspended'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button className="btn btn-outline" onClick={() => toggleActive(b)}>
                    {b.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(b.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleCreate} className="card" style={{ padding: 16, height: 'fit-content' }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Add banner</h2>

          <div className="form-group">
            <label>Image</label>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
            {uploading && <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>Uploading...</p>}
            {form.image_url && (
              <img
                src={`${API_ORIGIN}${form.image_url}`}
                alt="Preview"
                style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Title (optional)</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Title (Arabic, optional)</label>
            <input dir="rtl" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} placeholder="العنوان بالعربية" />
          </div>
          <div className="form-group">
            <label>Subtitle (optional)</label>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Subtitle (Arabic, optional)</label>
            <input dir="rtl" value={form.subtitle_ar} onChange={(e) => setForm({ ...form, subtitle_ar: e.target.value })} placeholder="العنوان الفرعي بالعربية" />
          </div>
          <div className="form-group">
            <label>Link URL (optional)</label>
            <input
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              placeholder="/categories/electronics"
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
            Add banner
          </button>
        </form>
      </div>
    </div>
  );
}
