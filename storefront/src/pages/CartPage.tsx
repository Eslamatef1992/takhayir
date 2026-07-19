import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartIcon } from '../components/Icons';

export default function CartPage() {
  const { items, updateItem, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="card" style={{ padding: 'clamp(32px, 6vw, 64px)', textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'var(--brand-gradient-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-purple)'
          }}
        >
          <CartIcon size={26} />
        </div>
        <h1 style={{ marginBottom: 8 }}>Your cart is empty</h1>
        <p className="text-muted" style={{ marginBottom: 20 }}>Browse the marketplace and add something you like.</p>
        <Link to="/" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Your cart</h1>
      <div className="card" style={{ padding: '4px clamp(12px, 3vw, 20px)' }}>
        {items.map((item) => (
          <div key={item.id} className="cart-row">
            <div className="cart-row-name">
              <div style={{ fontWeight: 700 }}>{item.product?.name}</div>
              {item.variant && <div className="text-muted" style={{ fontSize: 12 }}>{item.variant.name}</div>}
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(item.id, Math.max(1, Number(e.target.value)))}
              className="cart-row-qty"
            />
            <div className="cart-row-price">KWD {(Number(item.price_snapshot) * item.quantity).toFixed(3)}</div>
            <button className="btn btn-outline btn-sm" onClick={() => removeItem(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 20,
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ fontSize: 18 }}>
          Subtotal: <strong>KWD {total.toFixed(3)}</strong>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
