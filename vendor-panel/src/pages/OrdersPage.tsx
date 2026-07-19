import { useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface OrderGroup {
  id: number;
  status: string;
  subtotal: string;
  payout_amount: string;
  tracking_number: string | null;
  order: { order_number: string; created_at: string };
  items: { id: number; product_name_snapshot: string; quantity: number; total: string }[];
}

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function OrdersPage() {
  const [groups, setGroups] = useState<OrderGroup[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiClient
      .get<ApiEnvelope<OrderGroup[]>>('/orders/vendor/mine')
      .then((res) => setGroups(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateStatus(id: number, status: string) {
    let tracking_number: string | undefined;
    if (status === 'shipped') {
      tracking_number = window.prompt('Tracking number (optional)') || undefined;
    }
    await apiClient.patch(`/orders/vendor/groups/${id}/status`, { status, tracking_number });
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>My orders</h1>
      {loading ? (
        <div className="spinner">Loading...</div>
      ) : groups.length === 0 ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        groups.map((g) => (
          <div key={g.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <strong>{g.order.order_number}</strong>{' '}
                <span className="text-muted" style={{ fontSize: 12 }}>{new Date(g.order.created_at).toLocaleDateString()}</span>
              </div>
              <span className={`badge badge-${g.status}`}>{g.status}</span>
            </div>
            {g.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                <span>{item.product_name_snapshot} &times; {item.quantity}</span>
                <span>KWD {Number(item.total).toFixed(3)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <span className="text-muted" style={{ fontSize: 12 }}>Payout: KWD {Number(g.payout_amount).toFixed(3)}</span>
              <select value={g.status} onChange={(e) => updateStatus(g.id, e.target.value)} style={{ width: 160 }}>
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
