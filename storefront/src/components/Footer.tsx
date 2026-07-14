import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import logoDark from '../assets/brand/logo-dark.svg';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const VENDOR_URL = import.meta.env.VITE_VENDOR_URL || 'https://vendor.takhayir.com';

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<Category[]>>('/categories', { params: { flat: true } })
      .then((res) => setCategories(res.data.data.slice(0, 6)))
      .catch(() => undefined);
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <img src={logoDark} alt="Takhayir" style={{ height: 64, marginBottom: 14, marginLeft: -6 }} />
            <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 280, color: 'rgba(255,255,255,0.6)' }}>
              A marketplace for every kind of business — fashion, electronics, home goods and more,
              all from independent vendors, one cart, one checkout.
            </p>
          </div>

          <div>
            <div className="footer-heading">Shop</div>
            <div className="footer-links">
              {categories.map((c) => (
                <Link key={c.id} to={`/categories/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
              <Link to="/vendors">All stores</Link>
            </div>
          </div>

          <div>
            <div className="footer-heading">My account</div>
            <div className="footer-links">
              <Link to="/orders">My orders</Link>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </div>
          </div>

          <div>
            <div className="footer-heading">Sell on Takhayir</div>
            <div className="footer-links">
              <a href={VENDOR_URL} target="_blank" rel="noopener noreferrer">
                Become a vendor
              </a>
              <a href={VENDOR_URL} target="_blank" rel="noopener noreferrer">
                Vendor sign in
              </a>
              <a href="https://teknulugy.com" target="_blank" rel="noopener noreferrer">
                Teknulugy
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} Takhayir. All rights reserved.</div>
          <div className="footer-payments">
            <span>Cards</span>
            <span>Mada</span>
            <span>Apple Pay</span>
            <span>Deema</span>
            <span>Taly</span>
            <span>Cash on delivery</span>
          </div>
          <a
            href="https://teknulugy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-brand-badge"
            style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}
          >
            Powered by <span className="footer-brand-badge">Teknulugy</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
