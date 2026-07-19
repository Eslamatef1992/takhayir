import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { useCart } from '../context/CartContext';

interface OrderDetail {
  id: number;
  order_number: string;
  grand_total: string;
  currency: string;
  status: string;
  payment_status: string;
  vendorGroups: {
    id: number;
    status: string;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    vendor: { store_name: string };
    items: { id: number; product_id: number | null; product_name_snapshot: string; quantity: number; total: string }[];
  }[];
}

const TRACK_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

function TrackingProgress({ status }: { status: string }) {
  const stepIndex = TRACK_STEPS.indexOf(status);
  if (stepIndex === -1) return null; // cancelled/refunded - no linear progress to show

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0' }}>
      {TRACK_STEPS.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: i <= stepIndex ? '#fff' : 'var(--text-faint)',
              background: i <= stepIndex ? 'var(--brand-gradient, #6a2ce0)' : 'var(--bg-subtle)'
            }}
          >
            {i < stepIndex ? '✓' : i + 1}
          </div>
          {i < TRACK_STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < stepIndex ? 'var(--brand-gradient, #6a2ce0)' : 'var(--bg-subtle)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, closeDrawer } = useCart();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient.get<ApiEnvelope<OrderDetail>>(`/orders/${id}`).then((res) => setOrder(res.data.data));
  }, [id]);

  async function handleReorder() {
    if (!order) return;
    setReordering(true);
    try {
      const items = order.vendorGroups.flatMap((g) => g.items).filter((i) => i.product_id);
      for (const item of items) {
        await addItem(item.product_id as number, item.quantity);
      }
      closeDrawer();
      navigate('/cart');
    } finally {
      setReordering(false);
    }
  }

  if (!order) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Order {order.order_number}</h1>
          <p className="text-muted" style={{ textTransform: 'capitalize' }}>
            Status: {order.status} &middot; Payment: {order.payment_status}
          </p>
        </div>
        <button className="btn btn-outline" onClick={handleReorder} disabled={reordering}>
          {reordering ? 'Adding to cart...' : 'Reorder'}
        </button>
      </div>

      {order.vendorGroups.map((group) => (
        <div key={group.id} className="card" style={{ padding: 16, marginBottom: 16, marginTop: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {group.vendor.store_name} <span className="text-muted" style={{ fontWeight: 400, textTransform: 'capitalize' }}>— {group.status}</span>
          </div>

          <TrackingProgress status={group.status} />

          {(group.tracking_number || group.shipped_at || group.delivered_at) && (
            <div className="text-muted" style={{ fontSize: 12.5, marginBottom: 10, lineHeight: 1.6 }}>
              {group.tracking_number && <>Tracking number: <strong>{group.tracking_number}</strong><br /></>}
              {group.shipped_at && <>Shipped: {new Date(group.shipped_at).toLocaleString()}<br /></>}
              {group.delivered_at && <>Delivered: {new Date(group.delivered_at).toLocaleString()}</>}
            </div>
          )}

          {group.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>{item.product_name_snapshot} &times; {item.quantity}</span>
              <span>KWD {Number(item.total).toFixed(3)}</span>
            </div>
          ))}
        </div>
      ))}

      <div style={{ textAlign: 'right', fontSize: 18, fontWeight: 800 }}>
        Total: {order.currency} {Number(order.grand_total).toFixed(3)}
      </div>
    </div>
  );
}
