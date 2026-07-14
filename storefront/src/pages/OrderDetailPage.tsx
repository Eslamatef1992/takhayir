import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';

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
    vendor: { store_name: string };
    items: { id: number; product_name_snapshot: string; quantity: number; total: string }[];
  }[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    apiClient.get<ApiEnvelope<OrderDetail>>(`/orders/${id}`).then((res) => setOrder(res.data.data));
  }, [id]);

  if (!order) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Order {order.order_number}</h1>
      <p className="text-muted" style={{ marginBottom: 24, textTransform: 'capitalize' }}>
        Status: {order.status} &middot; Payment: {order.payment_status}
      </p>

      {order.vendorGroups.map((group) => (
        <div key={group.id} className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            {group.vendor.store_name} <span className="text-muted" style={{ fontWeight: 400, textTransform: 'capitalize' }}>— {group.status}</span>
          </div>
          {group.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>{item.product_name_snapshot} &times; {item.quantity}</span>
              <span>SAR {Number(item.total).toFixed(2)}</span>
            </div>
          ))}
        </div>
      ))}

      <div style={{ textAlign: 'right', fontSize: 18, fontWeight: 800 }}>
        Total: {order.currency} {Number(order.grand_total).toFixed(2)}
      </div>
    </div>
  );
}
