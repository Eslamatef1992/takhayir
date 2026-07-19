import { FormEvent, useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ADMIN_ROLE_LABELS, ADMIN_ROLE_OPTIONS } from '../utils/permissions';
import type { AdminRole } from '../context/AuthContext';

interface AdminAccount {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  admin_role: AdminRole;
  status: string;
  created_at: string;
}

const emptyForm = { first_name: '', last_name: '', email: '', phone: '', password: '', admin_role: 'support' as AdminRole };

export default function AdminsPage() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    setLoadError('');
    apiClient
      .get<ApiEnvelope<AdminAccount[]>>('/admin-users')
      .then((res) => setAdmins(res.data.data))
      .catch((err) => setLoadError(err?.response?.data?.message || 'Could not load admin accounts.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(a: AdminAccount) {
    setEditingId(a.id);
    setForm({ first_name: a.first_name, last_name: a.last_name || '', email: a.email, phone: a.phone || '', password: '', admin_role: a.admin_role });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editingId) {
        const payload: Record<string, unknown> = {
          first_name: form.first_name,
          last_name: form.last_name || null,
          phone: form.phone || null,
          admin_role: form.admin_role
        };
        if (form.password) payload.password = form.password;
        await apiClient.put(`/admin-users/${editingId}`, payload);
      } else {
        await apiClient.post('/admin-users', {
          first_name: form.first_name,
          last_name: form.last_name || null,
          email: form.email,
          phone: form.phone || null,
          password: form.password,
          admin_role: form.admin_role
        });
      }
      closeForm();
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Could not save this admin account.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleSuspend(a: AdminAccount) {
    await apiClient.put(`/admin-users/${a.id}`, { status: a.status === 'active' ? 'suspended' : 'active' });
    load();
  }

  async function handleDelete(a: AdminAccount) {
    if (!window.confirm(`Remove ${a.first_name}'s admin account? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/admin-users/${a.id}`);
      load();
    } catch (err: any) {
      window.alert(err?.response?.data?.message || 'Could not remove this admin account.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20 }}>Admins</h1>
        <button className="btn btn-primary" onClick={openAddForm}>+ Add admin</button>
      </div>

      <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
        Each admin account is assigned one fixed role. Super Admin has full access; the others are limited to their area.
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 16, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>{editingId ? 'Edit admin' : 'Add admin'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>First name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Last name</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editingId} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.admin_role} onChange={(e) => setForm({ ...form, admin_role: e.target.value as AdminRole })}>
                {ADMIN_ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{editingId ? 'New password (optional)' : 'Password'}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingId}
                minLength={8}
              />
            </div>
          </div>
          {formError && <p className="error-text">{formError}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editingId ? 'Save changes' : 'Create admin'}</button>
            <button type="button" className="btn btn-outline" onClick={closeForm}>Cancel</button>
          </div>
        </form>
      )}

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
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.first_name} {a.last_name}</td>
                  <td>{a.email}</td>
                  <td>{ADMIN_ROLE_LABELS[a.admin_role]}</td>
                  <td><span className={`badge badge-${a.status === 'active' ? 'active' : 'rejected'}`}>{a.status}</span></td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={() => openEditForm(a)}>Edit</button>
                    <button className="btn btn-outline" onClick={() => handleToggleSuspend(a)}>
                      {a.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                    {a.id !== currentUser?.id && (
                      <button className="btn btn-danger" onClick={() => handleDelete(a)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">No admin accounts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
