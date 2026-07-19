import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Category {
  id: number;
  name: string;
  name_ar: string | null;
  slug: string;
  parent_id: number | null;
  is_active: boolean;
  image: string | null;
  children: Category[];
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [rowUploadingId, setRowUploadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rowFileInputRef = useRef<HTMLInputElement | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      apiClient.get<ApiEnvelope<Category[]>>('/categories', { params: { includeInactive: true } }),
      apiClient.get<ApiEnvelope<Category[]>>('/categories', { params: { flat: true, includeInactive: true } })
    ])
      .then(([tree, list]) => {
        setCategories(tree.data.data);
        setFlat(list.data.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function uploadImage(file: File): Promise<string> {
    const data = new FormData();
    data.append('image', file);
    const res = await apiClient.post<ApiEnvelope<{ url: string }>>('/categories/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data.url;
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setImageUrl(await uploadImage(file));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await apiClient.post('/categories', { name, name_ar: nameAr || null, parent_id: parentId ? Number(parentId) : null, image: imageUrl || null });
    setName('');
    setNameAr('');
    setParentId('');
    setImageUrl('');
    load();
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this category?')) return;
    await apiClient.delete(`/categories/${id}`);
    load();
  }

  function triggerRowUpload(id: number) {
    setRowUploadingId(id);
    rowFileInputRef.current?.click();
  }

  async function handleRowFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = rowUploadingId;
    if (!file || id === null) return;
    try {
      const url = await uploadImage(file);
      await apiClient.put(`/categories/${id}`, { image: url });
      load();
    } finally {
      setRowUploadingId(null);
      e.target.value = '';
    }
  }

  function renderTree(nodes: Category[], depth = 0) {
    return nodes.map((c) => (
      <div key={c.id}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '8px 0', paddingLeft: depth * 20, borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {c.image ? (
              <img src={`${API_ORIGIN}${c.image}`} alt={c.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-subtle)' }} />
            )}
            <span>{c.name} <span className="text-muted" style={{ fontSize: 12 }}>/{c.slug}</span></span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-outline" onClick={() => triggerRowUpload(c.id)} disabled={rowUploadingId === c.id}>
              {rowUploadingId === c.id ? 'Uploading...' : c.image ? 'Change image' : 'Set image'}
            </button>
            <button className="btn btn-outline" onClick={() => handleDelete(c.id)}>Delete</button>
          </div>
        </div>
        {c.children?.length > 0 && renderTree(c.children, depth + 1)}
      </div>
    ));
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Categories</h1>
      <input
        type="file"
        accept="image/*"
        ref={rowFileInputRef}
        onChange={handleRowFileChange}
        style={{ display: 'none' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          {loading ? <div className="spinner">Loading...</div> : renderTree(categories)}
        </div>
        <form onSubmit={handleCreate} className="card" style={{ padding: 16, height: 'fit-content' }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Add category</h2>
          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Arabic name (optional)</label>
            <input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="الاسم بالعربية" />
          </div>
          <div className="form-group">
            <label>Parent (optional)</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— Top level —</option>
              {flat.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tile image (optional)</label>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
            {uploading && <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>Uploading...</p>}
            {imageUrl && (
              <img
                src={`${API_ORIGIN}${imageUrl}`}
                alt="Preview"
                style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
              />
            )}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>Add category</button>
        </form>
      </div>
    </div>
  );
}
