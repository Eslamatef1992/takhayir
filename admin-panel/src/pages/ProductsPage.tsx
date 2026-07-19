import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';
import { getAttributeFieldsForCategory } from '../data/categoryAttributes';

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface Vendor {
  id: number;
  store_name: string;
  status: string;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  price: string;
  compare_at_price: string | null;
  stock_quantity: number;
  weight_kg: string | null;
  category_id: number | null;
  status: string;
  attributes: Record<string, string> | null;
  vendor: { id: number; store_name: string };
  images: { url: string; is_primary: boolean }[];
  variants?: { id: number; name: string; price: string | null; stock_quantity: number }[];
}

interface VariantType {
  id: number;
  name: string;
  values: { id: number; value: string }[];
}

interface VariantRow {
  key: string;
  name: string;
  price: string;
  stock_quantity: string;
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

const emptyForm = {
  vendor_id: '',
  name: '',
  category_id: '',
  price: '',
  compare_at_price: '',
  stock_quantity: '',
  weight_kg: '',
  sku: '',
  description: ''
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [variantTypeId, setVariantTypeId] = useState('');
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const newImageInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCategoryName = categories.find((c) => String(c.id) === form.category_id)?.name;
  const attributeFields = useMemo(() => getAttributeFieldsForCategory(selectedCategoryName), [selectedCategoryName]);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setLoadError('');
    apiClient
      .get<ApiEnvelope<Product[]>>('/products/admin/all', { params: filter ? { status: filter } : {} })
      .then((res) => setProducts(res.data.data))
      .catch((err) => setLoadError(err?.response?.data?.message || 'Could not load products.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  useEffect(() => {
    apiClient.get<ApiEnvelope<Vendor[]>>('/vendors/admin/all').then((res) => setVendors(res.data.data));
    apiClient.get<ApiEnvelope<Category[]>>('/categories', { params: { flat: true } }).then((res) => setCategories(res.data.data));
    apiClient.get<ApiEnvelope<VariantType[]>>('/variant-types').then((res) => setVariantTypes(res.data.data)).catch(() => {});
  }, []);

  function toggleVariantValue(typeName: string, valueId: number, valueLabel: string) {
    const key = `${typeName}:${valueId}`;
    setVariantRows((rows) => {
      const exists = rows.some((r) => r.key === key);
      if (exists) return rows.filter((r) => r.key !== key);
      return [...rows, { key, name: valueLabel, price: '', stock_quantity: '0' }];
    });
  }

  function updateVariantRow(key: string, field: 'price' | 'stock_quantity', value: string) {
    setVariantRows((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setAttributeValues({});
    setVariantRows([]);
    setVariantTypeId('');
    setPendingImage(null);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(p: Product) {
    setEditingId(p.id);
    setVariantRows(
      (p.variants || []).map((v) => ({
        key: `existing:${v.id}`,
        name: v.name,
        price: v.price != null ? String(v.price) : '',
        stock_quantity: String(v.stock_quantity ?? 0)
      }))
    );
    setVariantTypeId('');
    setForm({
      vendor_id: String(p.vendor.id),
      name: p.name,
      category_id: p.category_id ? String(p.category_id) : '',
      price: p.price,
      compare_at_price: p.compare_at_price || '',
      stock_quantity: String(p.stock_quantity ?? 0),
      weight_kg: p.weight_kg || '',
      sku: p.sku || '',
      description: p.description || ''
    });
    setAttributeValues(p.attributes || {});
    setPendingImage(null);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setAttributeValues({});
    setVariantRows([]);
    setVariantTypeId('');
    setPendingImage(null);
    setFormError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const attributes = Object.fromEntries(Object.entries(attributeValues).filter(([, v]) => v));
      const variants = variantRows.map((r) => ({
        name: r.name,
        price: r.price ? Number(r.price) : null,
        stock_quantity: Number(r.stock_quantity || 0)
      }));
      const payload = {
        name: form.name,
        category_id: form.category_id ? Number(form.category_id) : null,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : 0,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        variants,
        sku: form.sku || null,
        description: form.description || null,
        attributes: Object.keys(attributes).length ? attributes : null
      };

      let productId = editingId;
      if (editingId) {
        await apiClient.put(`/products/admin/${editingId}`, { ...payload, vendor_id: Number(form.vendor_id) });
      } else {
        const res = await apiClient.post<ApiEnvelope<{ id: number }>>('/products/admin', {
          ...payload,
          vendor_id: Number(form.vendor_id)
        });
        productId = res.data.data.id;
      }

      if (pendingImage && productId) {
        const data = new FormData();
        data.append('image', pendingImage);
        await apiClient.post(`/products/admin/${productId}/images`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      closeForm();
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Could not save product. Please check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this product?')) return;
    await apiClient.delete(`/products/admin/${id}`);
    load();
  }

  async function updateStatus(id: number, status: string) {
    let rejection_reason: string | undefined;
    if (status === 'rejected') {
      rejection_reason = window.prompt('Reason for rejection (optional)') || undefined;
    }
    await apiClient.patch(`/products/${id}/status`, { status, rejection_reason });
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
    await apiClient.post(`/products/admin/${uploadTargetId}/images`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    e.target.value = '';
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>Products</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 200 }}>
            <option value="">All statuses</option>
            <option value="pending">Pending review</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
          <button className="btn btn-primary" onClick={() => (showForm ? closeForm() : openAddForm())}>
            {showForm ? 'Cancel' : '+ Add product'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>{editingId ? 'Edit product' : 'Add product'}</h2>

          {formError && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 14 }}>{formError}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Vendor</label>
              <select value={form.vendor_id} onChange={(e) => setForm((f) => ({ ...f, vendor_id: e.target.value }))} required>
                <option value="">— Select vendor —</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.store_name}{v.status !== 'approved' ? ` (${v.status})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={form.category_id}
                onChange={(e) => {
                  setForm((f) => ({ ...f, category_id: e.target.value }));
                  setAttributeValues({});
                }}
              >
                <option value="">— Select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent_id ? '— ' : ''}
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
            </div>
            {attributeFields.map((f) =>
              f.type === 'select' ? (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <select
                    value={attributeValues[f.key] || ''}
                    onChange={(e) => setAttributeValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  >
                    <option value="">— Select —</option>
                    {f.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    value={attributeValues[f.key] || ''}
                    onChange={(e) => setAttributeValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                </div>
              )
            )}

            <div className="form-group">
              <label>Price (KWD)</label>
              <input
                type="number"
                step="0.001"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Compare-at price (KWD)</label>
              <input
                type="number"
                step="0.001"
                value={form.compare_at_price}
                onChange={(e) => setForm((f) => ({ ...f, compare_at_price: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label>Stock quantity</label>
              <input
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={form.weight_kg}
                onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="form-group">
              <label>{editingId ? 'Add another image' : 'Product image'}</label>
              <input
                type="file"
                accept="image/*"
                ref={newImageInputRef}
                onChange={(e) => setPendingImage(e.target.files?.[0] || null)}
              />
            </div>

            {variantTypes.length > 0 && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Variants (optional)</label>
                <select value={variantTypeId} onChange={(e) => setVariantTypeId(e.target.value)}>
                  <option value="">— Add variant options from a type —</option>
                  {variantTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {variantTypeId && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {variantTypes.find((t) => String(t.id) === variantTypeId)?.values.map((v) => {
                      const typeName = variantTypes.find((t) => String(t.id) === variantTypeId)!.name;
                      const key = `${typeName}:${v.id}`;
                      const active = variantRows.some((r) => r.key === key);
                      return (
                        <button
                          type="button"
                          key={v.id}
                          onClick={() => toggleVariantValue(typeName, v.id, v.value)}
                          className={active ? 'btn btn-primary' : 'btn btn-outline'}
                          style={{ padding: '5px 12px', fontSize: 12 }}
                        >
                          {v.value}
                        </button>
                      );
                    })}
                  </div>
                )}
                {variantRows.length > 0 && (
                  <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                    {variantRows.map((r) => (
                      <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="Price override (optional)"
                          value={r.price}
                          onChange={(e) => updateVariantRow(r.key, 'price', e.target.value)}
                          style={{ width: 170 }}
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={r.stock_quantity}
                          onChange={(e) => updateVariantRow(r.key, 'stock_quantity', e.target.value)}
                          style={{ width: 90 }}
                        />
                        <button type="button" className="btn btn-outline" onClick={() => setVariantRows((rows) => rows.filter((row) => row.key !== r.key))}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Create product'}
            </button>
            <button type="button" className="btn btn-outline" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <input type="file" accept="image/*" ref={uploadInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : loadError ? (
        <div className="card" style={{ padding: 20 }}>
          <p className="error-text" style={{ margin: 0 }}>{loadError}</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Vendor</th>
                <th>Price</th>
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
                    <td>{p.vendor?.store_name}</td>
                    <td>KWD {Number(p.price).toFixed(3)}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-outline" onClick={() => openEditForm(p)}>Edit</button>
                      <button className="btn btn-outline" onClick={() => triggerUpload(p.id)}>Upload image</button>
                      {p.status !== 'active' && (
                        <button className="btn btn-success" onClick={() => updateStatus(p.id, 'active')}>Approve</button>
                      )}
                      {p.status !== 'rejected' && (
                        <button className="btn btn-danger" onClick={() => updateStatus(p.id, 'rejected')}>Reject</button>
                      )}
                      <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
