import { FormEvent, useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  is_active: boolean;
  children: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(true);

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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await apiClient.post('/categories', { name, parent_id: parentId ? Number(parentId) : null });
    setName('');
    setParentId('');
    load();
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this category?')) return;
    await apiClient.delete(`/categories/${id}`);
    load();
  }

  function renderTree(nodes: Category[], depth = 0) {
    return nodes.map((c) => (
      <div key={c.id}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', paddingLeft: depth * 20, borderBottom: '1px solid var(--border-color)' }}>
          <span>{c.name} <span className="text-muted" style={{ fontSize: 12 }}>/{c.slug}</span></span>
          <button className="btn btn-outline" onClick={() => handleDelete(c.id)}>Delete</button>
        </div>
        {c.children?.length > 0 && renderTree(c.children, depth + 1)}
      </div>
    ));
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Categories</h1>
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
            <label>Parent (optional)</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— Top level —</option>
              {flat.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>Add category</button>
        </form>
      </div>
    </div>
  );
}
