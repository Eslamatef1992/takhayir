import { useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Order {
  id: number;
  order_number: string;
  grand_total: string;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<Order[]>>('/orders/admin/all')
      .then((res) => setOrders(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Orders</h1>
      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>{o.currency} {Number(o.grand_total).toFixed(2)}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td>{o.payment_status}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
