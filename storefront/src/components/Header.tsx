import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 20 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 20px' }}>
        <Link to="/">
          <Logo size={42} />
        </Link>

        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, categories, stores..."
            style={{ width: '100%' }}
          />
        </form>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 18, marginLeft: 'auto' }}>
          <Link to="/vendors" className="text-muted" style={{ fontSize: 14, fontWeight: 600 }}>
            Stores
          </Link>
          <Link to="/wishlist" className="text-muted" style={{ fontSize: 14, fontWeight: 600 }}>
            Wishlist
          </Link>
          <Link to="/cart" style={{ fontSize: 14, fontWeight: 700, position: 'relative' }}>
            Cart
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -16,
                  background: 'var(--brand-magenta)',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 11,
                  padding: '1px 6px'
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/orders" className="text-muted" style={{ fontSize: 14, fontWeight: 600 }}>
                My Orders
              </Link>
              <button className="btn btn-outline" onClick={logout}>
                Log out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-outline">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
