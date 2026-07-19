import { useEffect, useMemo, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface OrderListItem {
  id: number;
  order_number: string;
  grand_total: string;
  currency: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  shipping_full_name: string | null;
  customer: { id: number; first_name: string; last_name: string | null; email: string; phone: string | null } | null;
  vendorGroups: { id: number; status: string; vendor: { id: number; store_name: string } | null }[];
}

interface OrderItemDetail {
  id: number;
  product_name_snapshot: string;
  sku_snapshot: string | null;
  quantity: number;
  price: string;
  total: string;
  product?: { id: number; name: string; slug: string } | null;
}

interface OrderDetail extends OrderListItem {
  subtotal: string;
  shipping_total: string;
  discount_total: string;
  tax_total: string;
  guest_phone: string | null;
  shipping_phone: string | null;
  shipping_country: string | null;
  shipping_city: string | null;
  shipping_area: string | null;
  shipping_street: string | null;
  shipping_building: string | null;
  shipping_notes: string | null;
  vendorGroups: (OrderListItem['vendorGroups'][number] & { subtotal: string; items: OrderItemDetail[] })[];
  shippingAddress: { full_name: string; phone: string; city: string; street: string | null } | null;
}

interface Vendor {
  id: number;
  store_name: string;
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'failed', 'refunded'];

const emptyFilters = { status: '', payment_status: '', vendor_id: '', date_from: '', date_to: '', q: '' };

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filters, setFilters] = useState(emptyFilters);

  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusDraft, setStatusDraft] = useState({ status: '', payment_status: '' });
  const [savingStatus, setSavingStatus] = useState(false);

  function load() {
    setLoading(true);
    setLoadError('');
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    apiClient
      .get<ApiEnvelope<OrderListItem[]>>('/orders/admin/all', { params })
      .then((res) => setOrders(res.data.data))
      .catch((err) => setLoadError(err?.response?.data?.message || 'Could not load orders.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filters]);

  useEffect(() => {
    apiClient.get<ApiEnvelope<Vendor[]>>('/vendors/admin/all').then((res) => setVendors(res.data.data)).catch(() => {});
  }, []);

  const activeChips = useMemo(() => {
    const chips: { key: keyof typeof filters; label: string }[] = [];
    if (filters.status) chips.push({ key: 'status', label: `Status: ${filters.status}` });
    if (filters.payment_status) chips.push({ key: 'payment_status', label: `Payment: ${filters.payment_status}` });
    if (filters.vendor_id) {
      const v = vendors.find((x) => String(x.id) === filters.vendor_id);
      chips.push({ key: 'vendor_id', label: `Vendor: ${v?.store_name || filters.vendor_id}` });
    }
    if (filters.date_from) chips.push({ key: 'date_from', label: `From: ${filters.date_from}` });
    if (filters.date_to) chips.push({ key: 'date_to', label: `To: ${filters.date_to}` });
    if (filters.q) chips.push({ key: 'q', label: `Search: "${filters.q}"` });
    return chips;
  }, [filters, vendors]);

  function clearFilter(key: keyof typeof filters) {
    setFilters({ ...filters, [key]: '' });
  }

  async function openDetail(id: number) {
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const res = await apiClient.get<ApiEnvelope<OrderDetail>>(`/orders/admin/${id}`);
      setSelectedOrder(res.data.data);
      setStatusDraft({ status: res.data.data.status, payment_status: res.data.data.payment_status });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSaveStatus() {
    if (!selectedOrder) return;
    setSavingStatus(true);
    try {
      const res = await apiClient.patch<ApiEnvelope<OrderDetail>>(`/orders/admin/${selectedOrder.id}/status`, statusDraft);
      setSelectedOrder(res.data.data);
      load();
    } finally {
      setSavingStatus(false);
    }
  }

  function customerLabel(o: { customer: OrderListItem['customer']; guest_name: string | null; guest_email: string | null; shipping_full_name: string | null }) {
    if (o.customer) return { name: `${o.customer.first_name} ${o.customer.last_name || ''}`.trim(), sub: o.customer.email, guest: false };
    return { name: o.guest_name || o.shipping_full_name || 'Guest', sub: o.guest_email || '', guest: true };
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Orders</h1>

      <div className="card filters-bar">
        <div className="form-group grow">
          <label>Search</label>
          <input
            placeholder="Order #, customer name or email"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Payment</label>
          <select value={filters.payment_status} onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}>
            <option value="">All payment statuses</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Vendor</label>
          <select value={filters.vendor_id} onChange={(e) => setFilters({ ...filters, vendor_id: e.target.value })}>
            <option value="">All vendors</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.store_name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>From</label>
          <input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} />
        </div>
        <div className="form-group">
          <label>To</label>
          <input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} />
        </div>
        {activeChips.length > 0 && (
          <button className="btn btn-outline" onClick={() => setFilters(emptyFilters)}>Clear all</button>
        )}
      </div>

      {activeChips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {activeChips.map((c) => (
            <span key={c.key} className="filter-chip">
              {c.label}
              <button onClick={() => clearFilter(c.key)} aria-label={`Remove ${c.label} filter`}>&times;</button>
            </span>
          ))}
        </div>
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
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Vendor(s)</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const c = customerLabel(o);
                return (
                  <tr key={o.id}>
                    <td>{o.order_number}</td>
                    <td>{formatDate(o.created_at)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name} {c.guest && <span className="text-muted" style={{ fontWeight: 400, fontSize: 11 }}>(guest)</span>}</div>
                      {c.sub && <div className="text-muted" style={{ fontSize: 12 }}>{c.sub}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {o.vendorGroups.map((g) => (
                          <span key={g.id} className="filter-chip" style={{ fontSize: 11, padding: '2px 8px' }}>
                            {g.vendor?.store_name || '—'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{o.currency} {Number(o.grand_total).toFixed(2)}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td><span className={`badge badge-${o.payment_status}`}>{o.payment_status}</span></td>
                    <td><button className="btn btn-outline" onClick={() => openDetail(o.id)}>View</button></td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-muted">No orders match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(detailLoading || selectedOrder) && (
        <div className="slide-over-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="slide-over-panel" onClick={(e) => e.stopPropagation()}>
            {detailLoading || !selectedOrder ? (
              <div className="spinner">Loading...</div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 18 }}>{selectedOrder.order_number}</h2>
                    <p className="text-muted" style={{ fontSize: 13, margin: '4px 0 0' }}>{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Close</button>
                </div>

                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', marginBottom: 10 }}>Customer</h3>
                  {selectedOrder.customer ? (
                    <>
                      <div style={{ fontWeight: 600 }}>{selectedOrder.customer.first_name} {selectedOrder.customer.last_name}</div>
                      <div className="text-muted" style={{ fontSize: 13 }}>{selectedOrder.customer.email}</div>
                      {selectedOrder.customer.phone && <div className="text-muted" style={{ fontSize: 13 }}>{selectedOrder.customer.phone}</div>}
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600 }}>{selectedOrder.guest_name || selectedOrder.shipping_full_name} <span className="filter-chip" style={{ fontSize: 10, padding: '1px 6px', marginLeft: 6 }}>Guest</span></div>
                      {selectedOrder.guest_email && <div className="text-muted" style={{ fontSize: 13 }}>{selectedOrder.guest_email}</div>}
                      {(selectedOrder.guest_phone || selectedOrder.shipping_phone) && <div className="text-muted" style={{ fontSize: 13 }}>{selectedOrder.guest_phone || selectedOrder.shipping_phone}</div>}
                    </>
                  )}
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                    <div className="text-muted" style={{ marginBottom: 2 }}>Shipping to</div>
                    {selectedOrder.shippingAddress ? (
                      <div>{selectedOrder.shippingAddress.full_name} — {[selectedOrder.shippingAddress.street, selectedOrder.shippingAddress.city].filter(Boolean).join(', ')}</div>
                    ) : (
                      <div>{[selectedOrder.shipping_street, selectedOrder.shipping_building, selectedOrder.shipping_area, selectedOrder.shipping_city, selectedOrder.shipping_country].filter(Boolean).join(', ') || '—'}</div>
                    )}
                    {selectedOrder.shipping_notes && <div className="text-muted" style={{ marginTop: 4 }}>Note: {selectedOrder.shipping_notes}</div>}
                  </div>
                </div>

                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', marginBottom: 10 }}>Update status</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Order status</label>
                      <select value={statusDraft.status} onChange={(e) => setStatusDraft({ ...statusDraft, status: e.target.value })}>
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Payment status</label>
                      <select value={statusDraft.payment_status} onChange={(e) => setStatusDraft({ ...statusDraft, payment_status: e.target.value })}>
                        {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={savingStatus} onClick={handleSaveStatus}>
                    {savingStatus ? 'Saving...' : 'Save status'}
                  </button>
                </div>

                {selectedOrder.vendorGroups.map((g) => (
                  <div key={g.id} className="card" style={{ padding: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700 }}>{g.vendor?.store_name || 'Unknown vendor'}</h3>
                      <span className={`badge badge-${g.status}`}>{g.status}</span>
                    </div>
                    {g.items.map((it) => (
                      <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderTop: '1px solid var(--border-color)' }}>
                        <span>{it.product_name_snapshot} × {it.quantity}</span>
                        <span>{Number(it.total).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 13, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                      <span>Subtotal</span>
                      <span>{Number(g.subtotal).toFixed(2)}</span>
                    </div>
                  </div>
                ))}

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span className="text-muted">Subtotal</span><span>{selectedOrder.currency} {Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span className="text-muted">Shipping</span><span>{selectedOrder.currency} {Number(selectedOrder.shipping_total).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span className="text-muted">Discount</span><span>-{selectedOrder.currency} {Number(selectedOrder.discount_total).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                    <span>Total</span><span>{selectedOrder.currency} {Number(selectedOrder.grand_total).toFixed(2)}</span>
                  </div>
                  {selectedOrder.payment_method && (
                    <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>Payment method: {selectedOrder.payment_method}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
