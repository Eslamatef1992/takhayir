import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { useCart } from '../context/CartContext';

interface Address {
  id: number;
  label: string | null;
  full_name: string;
  phone: string;
  city: string;
  street: string | null;
  is_default: boolean;
}

const PAYMENT_METHODS = [
  { value: 'tap', label: 'Card / Mada / Apple Pay (Tap Payments)' },
  { value: 'deema', label: 'Deema — pay in installments' },
  { value: 'taly', label: 'Taly — pay in installments' },
  { value: 'cod', label: 'Cash on delivery' }
];

export default function CheckoutPage() {
  const { items, total, refresh } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('tap');
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', country: 'Saudi Arabia', city: '', street: '' });
  const [showNewAddress, setShowNewAddress] = useState(false);

  useEffect(() => {
    apiClient.get<ApiEnvelope<Address[]>>('/addresses').then((res) => {
      setAddresses(res.data.data);
      const def = res.data.data.find((a) => a.is_default) || res.data.data[0];
      if (def) setAddressId(def.id);
      else setShowNewAddress(true);
    });
  }, []);

  async function handleSaveAddress() {
    const res = await apiClient.post<ApiEnvelope<Address>>('/addresses', { ...newAddress, is_default: addresses.length === 0 });
    setAddresses((prev) => [...prev, res.data.data]);
    setAddressId(res.data.data.id);
    setShowNewAddress(false);
  }

  async function handleCheckout() {
    if (!addressId) {
      setError('Please select or add a shipping address.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.post<ApiEnvelope<{ order: { order_number: string }; payment: { checkout_url: string | null } }>>(
        '/orders/checkout',
        { shipping_address_id: addressId, payment_method: paymentMethod, coupon_code: couponCode || undefined }
      );
      await refresh();
      const { order, payment } = res.data.data;
      if (payment.checkout_url) {
        window.location.href = payment.checkout_url;
      } else {
        navigate(`/orders/confirmation?order=${order.order_number}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-muted">Your cart is empty.</p>;
  }

  return (
    <div className="split-checkout">
      <div>
        <h1 style={{ fontSize: 20, marginBottom: 16 }}>Shipping address</h1>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          {addresses.map((a) => (
            <label key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', fontWeight: 400 }}>
              <input type="radio" checked={addressId === a.id} onChange={() => setAddressId(a.id)} style={{ width: 'auto', marginTop: 4 }} />
              <span>
                <strong>{a.full_name}</strong> — {a.phone}
                <br />
                <span className="text-muted">{[a.street, a.city].filter(Boolean).join(', ')}</span>
              </span>
            </label>
          ))}
          <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => setShowNewAddress((v) => !v)}>
            + Add new address
          </button>

          {showNewAddress && (
            <div style={{ marginTop: 16 }}>
              <div className="form-group">
                <label>Full name</label>
                <input value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Street / building</label>
                <input value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
              </div>
              <button className="btn btn-primary" onClick={handleSaveAddress}>
                Save address
              </button>
            </div>
          )}
        </div>

        <h1 style={{ fontSize: 20, marginBottom: 16 }}>Payment method</h1>
        <div className="card" style={{ padding: 16 }}>
          {PAYMENT_METHODS.map((m) => (
            <label key={m.value} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', fontWeight: 400 }}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === m.value}
                onChange={() => setPaymentMethod(m.value)}
                style={{ width: 'auto' }}
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Order summary</h2>
          <div className="form-group">
            <label>Coupon code</label>
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Optional" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="text-muted">Subtotal</span>
            <span>KWD {total.toFixed(3)}</span>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={submitting} onClick={handleCheckout}>
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}
