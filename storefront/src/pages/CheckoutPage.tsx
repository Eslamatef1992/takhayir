import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { KUWAIT_AREAS, KUWAIT_GOVERNORATES } from '../data/kuwaitAreas';
import { CashIcon } from '../components/Icons';
import talyIcon from '../assets/payments/taly.svg';
import visaIcon from '../assets/payments/visa.svg';
import mastercardIcon from '../assets/payments/mastercard.svg';
import knetIcon from '../assets/payments/knet.svg';
import applePayIcon from '../assets/payments/apple-pay.svg';

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
  {
    value: 'tap',
    label: 'Card / Mada / Apple Pay (Tap Payments)',
    icons: [
      { src: visaIcon, alt: 'Visa' },
      { src: mastercardIcon, alt: 'Mastercard' },
      { src: knetIcon, alt: 'KNET' },
      { src: applePayIcon, alt: 'Apple Pay' }
    ]
  },
  { value: 'deema', label: 'Deema — pay in installments', badge: 'deema' },
  { value: 'taly', label: 'Taly — pay in installments', icons: [{ src: talyIcon, alt: 'Taly' }] },
  { value: 'cod', label: 'Cash on delivery', cash: true }
];

const emptyGuestInfo = { full_name: '', email: '', phone: '', city: '', area: '', street: '', building: '', notes: '' };

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, refresh, clear } = useCart();
  const navigate = useNavigate();

  // Logged-in flow: pick a saved address, or quick-add one.
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', country: 'Kuwait', city: '', area: '', street: '' });
  const [showNewAddress, setShowNewAddress] = useState(false);

  // Guest flow: fill shipping + contact info inline.
  const [guestInfo, setGuestInfo] = useState(emptyGuestInfo);

  const [paymentMethod, setPaymentMethod] = useState('tap');
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    apiClient.get<ApiEnvelope<Address[]>>('/addresses').then((res) => {
      setAddresses(res.data.data);
      const def = res.data.data.find((a) => a.is_default) || res.data.data[0];
      if (def) setAddressId(def.id);
      else setShowNewAddress(true);
    });
  }, [user]);

  async function handleSaveAddress() {
    const res = await apiClient.post<ApiEnvelope<Address>>('/addresses', { ...newAddress, is_default: addresses.length === 0 });
    setAddresses((prev) => [...prev, res.data.data]);
    setAddressId(res.data.data.id);
    setShowNewAddress(false);
  }

  async function handleCheckout() {
    setError('');

    if (user) {
      if (!addressId) {
        setError('Please select or add a shipping address.');
        return;
      }
      setSubmitting(true);
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
      return;
    }

    // Guest checkout
    if (!guestInfo.full_name || !guestInfo.email || !guestInfo.phone || !guestInfo.city) {
      setError('Please fill in your name, email, phone and city.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post<ApiEnvelope<{ order: { order_number: string }; payment: { checkout_url: string | null } }>>(
        '/orders/guest-checkout',
        {
          items: items.map((i) => ({ product_id: i.product_id, variant_id: i.variant_id ?? undefined, quantity: i.quantity })),
          guest: { full_name: guestInfo.full_name, email: guestInfo.email, phone: guestInfo.phone },
          shipping: {
            country: 'Kuwait',
            city: guestInfo.city,
            area: guestInfo.area || undefined,
            street: guestInfo.street || undefined,
            building: guestInfo.building || undefined,
            notes: guestInfo.notes || undefined
          },
          payment_method: paymentMethod,
          coupon_code: couponCode || undefined
        }
      );
      await clear();
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
        {!user && (
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Checking out as a guest. <Link to="/login">Log in</Link> for faster checkout next time, or continue below.
          </p>
        )}

        <h1 style={{ fontSize: 20, marginBottom: 16 }}>{user ? 'Shipping address' : 'Contact & shipping details'}</h1>

        {user ? (
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
                  <select
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value, area: '' })}
                  >
                    <option value="" disabled>
                      Select city
                    </option>
                    {KUWAIT_GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Area</label>
                  <select
                    value={newAddress.area}
                    onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                    disabled={!newAddress.city}
                  >
                    <option value="">Select area</option>
                    {(KUWAIT_AREAS[newAddress.city] || []).map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
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
        ) : (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Full name</label>
                <input value={guestInfo.full_name} onChange={(e) => setGuestInfo({ ...guestInfo, full_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={guestInfo.phone} onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Email</label>
                <input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input value="Kuwait" disabled />
              </div>
              <div className="form-group">
                <label>City</label>
                <select
                  value={guestInfo.city}
                  onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value, area: '' })}
                  required
                >
                  <option value="" disabled>
                    Select city
                  </option>
                  {KUWAIT_GOVERNORATES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Area</label>
                <select
                  value={guestInfo.area}
                  onChange={(e) => setGuestInfo({ ...guestInfo, area: e.target.value })}
                  disabled={!guestInfo.city}
                >
                  <option value="">Select area</option>
                  {(KUWAIT_AREAS[guestInfo.city] || []).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Street</label>
                <input value={guestInfo.street} onChange={(e) => setGuestInfo({ ...guestInfo, street: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Building</label>
                <input value={guestInfo.building} onChange={(e) => setGuestInfo({ ...guestInfo, building: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea rows={2} value={guestInfo.notes} onChange={(e) => setGuestInfo({ ...guestInfo, notes: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        <h1 style={{ fontSize: 20, marginBottom: 16 }}>Payment method</h1>
        <div className="card" style={{ padding: 16 }}>
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.value}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                fontWeight: 400,
                borderTop: m.value === 'tap' ? undefined : '1px solid var(--border-color)'
              }}
            >
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === m.value}
                  onChange={() => setPaymentMethod(m.value)}
                  style={{ width: 'auto' }}
                />
                {m.label}
              </span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {m.icons?.map((icon) => (
                  <img key={icon.alt} src={icon.src} alt={icon.alt} style={{ height: 20, width: 'auto' }} />
                ))}
                {m.badge && (
                  <span
                    style={{
                      fontFamily: 'inherit',
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: '-0.02em',
                      color: 'var(--brand-magenta, #d6249f)',
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: 'rgba(214, 36, 159, 0.08)',
                      textTransform: 'lowercase'
                    }}
                  >
                    {m.badge}
                  </span>
                )}
                {m.cash && <CashIcon size={20} className="text-muted" />}
              </span>
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
