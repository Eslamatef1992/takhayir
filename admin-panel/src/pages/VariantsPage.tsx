import { FormEvent, useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface VariantValue {
  id: number;
  value: string;
}

interface VariantType {
  id: number;
  name: string;
  values: VariantValue[];
}

export default function VariantsPage() {
  const [types, setTypes] = useState<VariantType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTypeName, setNewTypeName] = useState('');
  const [newValueByType, setNewValueByType] = useState<Record<number, string>>({});

  function load() {
    setLoading(true);
    apiClient
      .get<ApiEnvelope<VariantType[]>>('/variant-types')
      .then((res) => setTypes(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAddType(e: FormEvent) {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    await apiClient.post('/variant-types', { name: newTypeName.trim() });
    setNewTypeName('');
    load();
  }

  async function handleDeleteType(id: number) {
    if (!window.confirm('Delete this variant type and all its values? Products already using it keep their existing variants.')) return;
    await apiClient.delete(`/variant-types/${id}`);
    load();
  }

  async function handleAddValue(typeId: number) {
    const value = (newValueByType[typeId] || '').trim();
    if (!value) return;
    await apiClient.post(`/variant-types/${typeId}/values`, { value });
    setNewValueByType({ ...newValueByType, [typeId]: '' });
    load();
  }

  async function handleDeleteValue(id: number) {
    await apiClient.delete(`/variant-types/values/${id}`);
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 6 }}>Variant Options</h1>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
        Manage the types (Color, Storage, Size...) and values vendors pick from when adding product variants.
      </p>

      <form onSubmit={handleAddType} className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>New variant type</label>
          <input value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} placeholder="e.g. Material" />
        </div>
        <button className="btn btn-primary">+ Add type</button>
      </form>

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {types.map((t) => (
            <div key={t.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h2 style={{ fontSize: 15 }}>{t.name}</h2>
                <button className="btn btn-outline" onClick={() => handleDeleteType(t.id)}>Delete type</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {t.values.map((v) => (
                  <span
                    key={v.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'var(--bg-page)',
                      fontSize: 13
                    }}
                  >
                    {v.value}
                    <button
                      onClick={() => handleDeleteValue(v.id)}
                      aria-label={`Remove ${v.value}`}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, lineHeight: 1, padding: 0 }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {t.values.length === 0 && <span className="text-muted" style={{ fontSize: 13 }}>No values yet.</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={newValueByType[t.id] || ''}
                  onChange={(e) => setNewValueByType({ ...newValueByType, [t.id]: e.target.value })}
                  placeholder={`Add a ${t.name.toLowerCase()} value`}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddValue(t.id);
                    }
                  }}
                />
                <button className="btn btn-outline" onClick={() => handleAddValue(t.id)}>Add</button>
              </div>
            </div>
          ))}
          {types.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p className="text-muted">No variant types yet. Add one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
