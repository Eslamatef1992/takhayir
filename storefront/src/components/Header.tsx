import { FormEvent, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiClient, ApiEnvelope } from '../api/client';
import { CartIcon, ChevronDownIcon, HeartIcon, SearchIcon, UserIcon } from './Icons';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryNode extends Category {
  children?: Category[];
}

export function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<CategoryNode[]>>('/categories')
      .then((res) => setCategoryTree(res.data.data))
      .catch(() => undefined);
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="site-header">
      <div className="announce-bar">Shop from every vendor on Takhayir — one cart, endless stores.</div>

      <div className="header-inner">
        <Link to="/" className="header-logo">
          <Logo size={68} />
        </Link>

        <nav className="primary-nav">
          <NavLink to="/" end className={({ isActive }) => `primary-nav-link${isActive ? ' active' : ''}`}>
            Home
          </NavLink>

          <div
            className="mega-wrap"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              className={`primary-nav-link mega-trigger${megaOpen ? ' active' : ''}`}
              onClick={() => setMegaOpen((o) => !o)}
            >
              Categories <ChevronDownIcon size={14} />
            </button>
          </div>

          <NavLink to="/vendors" className={({ isActive }) => `primary-nav-link${isActive ? ' active' : ''}`}>
            Vendors
          </NavLink>
        </nav>

        <form onSubmit={handleSearch} className="header-search">
          <SearchIcon size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, categories, stores..."
          />
        </form>

        <div className="header-icons">
          <Link to="/wishlist" className="icon-link" aria-label="Wishlist">
            <HeartIcon size={21} />
          </Link>

          <Link to="/cart" className="icon-link" aria-label="Cart">
            <CartIcon size={21} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          <div
            className="account-wrap"
            onMouseEnter={() => setAccountOpen(true)}
            onMouseLeave={() => setAccountOpen(false)}
          >
            <button className="icon-link icon-btn" aria-label="Account" onClick={() => setAccountOpen((o) => !o)}>
              <UserIcon size={21} />
            </button>

            {accountOpen && (
              <div className="account-panel">
                {user ? (
                  <>
                    <Link to="/orders" className="account-panel-link" onClick={() => setAccountOpen(false)}>
                      My orders
                    </Link>
                    <button
                      className="account-panel-link account-panel-btn"
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                      }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="account-panel-link" onClick={() => setAccountOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/register" className="account-panel-link" onClick={() => setAccountOpen(false)}>
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {megaOpen && categoryTree.length > 0 && (
        <div className="mega-panel-full" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
          <div className="mega-panel-inner">
            {categoryTree.map((cat) => (
              <div key={cat.id} className="mega-col">
                <Link to={`/categories/${cat.slug}`} className="mega-col-title" onClick={() => setMegaOpen(false)}>
                  {cat.name}
                </Link>
                {cat.children?.map((child) => (
                  <Link
                    key={child.id}
                    to={`/categories/${child.slug}`}
                    className="mega-col-link"
                    onClick={() => setMegaOpen(false)}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
