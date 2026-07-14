import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, updateItem, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: 20 }}>Your cart is empty</h1>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Your cart</h1>
      <div className="card" style={{ padding: 16 }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
              {item.variant && <div className="text-muted" style={{ fontSize: 12 }}>{item.variant.name}</div>}
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(item.id, Math.max(1, Number(e.target.value)))}
              style={{ width: 64 }}
            />
            <div style={{ width: 90, textAlign: 'right', fontWeight: 700 }}>
              SAR {(Number(item.price_snapshot) * item.quantity).toFixed(2)}
            </div>
            <button className="btn btn-outline" onClick={() => removeItem(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 18 }}>
          Subtotal: <strong>SAR {total.toFixed(2)}</strong>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
