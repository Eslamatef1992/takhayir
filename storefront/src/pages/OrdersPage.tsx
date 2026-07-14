import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';

interface OrderSummary {
  id: number;
  order_number: string;
  grand_total: string;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<OrderSummary[]>>('/orders')
      .then((res) => setOrders(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>My orders</h1>
      {orders.length === 0 && <p className="text-muted">You haven't placed any orders yet.</p>}
      {orders.map((o) => (
        <Link key={o.id} to={`/orders/${o.id}`} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: 16, marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>{o.order_number}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700 }}>{o.currency} {Number(o.grand_total).toFixed(2)}</div>
            <div className="text-muted" style={{ fontSize: 12, textTransform: 'capitalize' }}>{o.status} &middot; {o.payment_status}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
