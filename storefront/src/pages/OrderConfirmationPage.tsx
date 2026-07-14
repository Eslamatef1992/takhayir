import { Link, useSearchParams } from 'react-router-dom';

export default function OrderConfirmationPage() {
  const [params] = useSearchParams();
  const orderNumber = params.get('order');

  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <h1 style={{ fontSize: 26 }}>Thank you for your order!</h1>
      {orderNumber && <p className="text-muted">Order reference: {orderNumber}</p>}
      <Link to="/orders" className="btn btn-primary" style={{ marginTop: 20 }}>
        View my orders
      </Link>
    </div>
  );
}
