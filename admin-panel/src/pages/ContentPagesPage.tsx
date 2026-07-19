import { FormEvent, useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Page {
  id: number;
  slug: string;
  title: string;
  title_ar: string | null;
  body: string;
  body_ar: string | null;
  meta_description: string | null;
  updated_at: string;
}

export default function ContentPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', title_ar: '', body: '', body_ar: '', meta_description: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function load() {
    setLoading(true);
    apiClient
      .get<ApiEnvelope<Page[]>>('/cms/pages')
      .then((res) => setPages(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openEdit(p: Page) {
    setEditingSlug(p.slug);
    setForm({ title: p.title, title_ar: p.title_ar || '', body: p.body, body_ar: p.body_ar || '', meta_description: p.meta_description || '' });
    setSaveError('');
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editingSlug) return;
    setSaving(true);
    setSaveError('');
    try {
      await apiClient.put(`/cms/pages/${editingSlug}`, {
        title: form.title,
        title_ar: form.title_ar || null,
        body: form.body,
        body_ar: form.body_ar || null,
        meta_description: form.meta_description || null
      });
      setEditingSlug(null);
      load();
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Could not save this page.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 6 }}>Content Pages</h1>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
        Edit the static pages shown on the storefront (About, Terms, Privacy, FAQ, Contact). Content supports basic HTML.
      </p>

      {editingSlug && (
        <form onSubmit={handleSave} className="card" style={{ padding: 16, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Editing: {editingSlug}</h2>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Title (Arabic, optional)</label>
            <input dir="rtl" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} placeholder="العنوان بالعربية" />
          </div>
          <div className="form-group">
            <label>Meta description (optional, for search engines)</label>
            <input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Page content (HTML supported)</label>
            <textarea rows={14} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} style={{ fontFamily: 'monospace', fontSize: 13 }} required />
          </div>
          <div className="form-group">
            <label>Page content (Arabic, optional, HTML supported)</label>
            <textarea dir="rtl" rows={14} value={form.body_ar} onChange={(e) => setForm({ ...form, body_ar: e.target.value })} style={{ fontFamily: 'monospace', fontSize: 13 }} placeholder="المحتوى بالعربية" />
          </div>
          {saveError && <p className="error-text">{saveError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save page'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setEditingSlug(null)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th>Slug</th>
                <th>Last updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td className="text-muted">/{p.slug}</td>
                  <td>{new Date(p.updated_at).toLocaleDateString()}</td>
                  <td><button className="btn btn-outline" onClick={() => openEdit(p)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
