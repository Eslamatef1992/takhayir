import { MouseEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { useCart } from '../context/CartContext';

interface OrderSummary {
  id: number;
  order_number: string;
  grand_total: string;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  vendorGroups: {
    items: { product_id: number | null; quantity: number }[];
  }[];
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<OrderSummary[]>>('/orders')
      .then((res) => setOrders(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  async function handleReorder(e: MouseEvent, o: OrderSummary) {
    e.preventDefault();
    e.stopPropagation();
    setReorderingId(o.id);
    try {
      const items = o.vendorGroups.flatMap((g) => g.items).filter((i) => i.product_id);
      for (const item of items) {
        await addItem(item.product_id as number, item.quantity);
      }
      navigate('/cart');
    } finally {
      setReorderingId(null);
    }
  }

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>My orders</h1>
      {orders.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p className="text-muted">You haven't placed any orders yet.</p>
        </div>
      )}
      {orders.map((o) => (
        <Link
          key={o.id}
          to={`/orders/${o.id}`}
          className="card"
          style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: 18, marginBottom: 12 }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>{o.order_number}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>{o.currency} {Number(o.grand_total).toFixed(3)}</div>
              <div className="text-muted" style={{ fontSize: 12, textTransform: 'capitalize' }}>{o.status} &middot; {o.payment_status}</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={(e) => handleReorder(e, o)} disabled={reorderingId === o.id}>
              {reorderingId === o.id ? 'Adding...' : 'Reorder'}
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
