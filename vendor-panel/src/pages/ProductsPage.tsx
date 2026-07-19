import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  status: string;
  images: { url: string; is_primary: boolean }[];
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', stock_quantity: '', category_id: '' });
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    apiClient
      .get<ApiEnvelope<Product[]>>('/products/mine')
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    apiClient.get<ApiEnvelope<Category[]>>('/categories', { params: { flat: true } }).then((res) => setCategories(res.data.data));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/products', {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity || 0),
        category_id: form.category_id ? Number(form.category_id) : null
      });
      setForm({ name: '', description: '', price: '', stock_quantity: '', category_id: '' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create product. Make sure your store is approved.');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this product?')) return;
    await apiClient.delete(`/products/${id}`);
    load();
  }

  function triggerUpload(id: number) {
    setUploadTargetId(id);
    uploadInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId) return;
    const data = new FormData();
    data.append('image', file);
    await apiClient.post(`/products/${uploadTargetId}/images`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    e.target.value = '';
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>My products</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">— Select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Price (KWD)</label>
              <input type="number" step="0.001" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Stock quantity</label>
              <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary">Create product (goes to pending review)</button>
        </form>
      )}

      <input type="file" accept="image/*" ref={uploadInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = p.images?.find((i) => i.is_primary) || p.images?.[0];
                return (
                  <tr key={p.id}>
                    <td>
                      {img ? (
                        <img src={`${API_ORIGIN}${img.url}`} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <span className="text-muted" style={{ fontSize: 11 }}>None</span>
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>KWD {Number(p.price).toFixed(3)}</td>
                    <td>{p.stock_quantity}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline" onClick={() => triggerUpload(p.id)}>Upload image</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">No products yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
