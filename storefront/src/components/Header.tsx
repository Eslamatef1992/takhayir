import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiClient, ApiEnvelope } from '../api/client';
import { CartIcon, ChevronDownIcon, CloseIcon, GridIcon, HeartIcon, MenuIcon, SearchIcon, StoreIcon, UserIcon } from './Icons';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<Category[]>>('/categories', { params: { flat: true } })
      .then((res) => setCategories(res.data.data.slice(0, 8)))
      .catch(() => undefined);

    apiClient
      .get<ApiEnvelope<CategoryNode[]>>('/categories')
      .then((res) => setCategoryTree(res.data.data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="site-header">
      <div className="announce-bar">Shop from every vendor on Takhayir — one cart, endless stores.</div>

      <div className="header-inner">
        <button className="mobile-menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <MenuIcon />
        </button>

        <Link to="/">
          <Logo size={56} />
        </Link>

        <nav className="header-nav">
          <button className="icon-link icon-btn" aria-label="Search" onClick={() => setMenuOpen(true)}>
            <SearchIcon size={20} />
          </button>

          <Link to="/wishlist" className="icon-link" aria-label="Wishlist">
            <HeartIcon size={21} />
          </Link>

          <Link to="/cart" className="icon-link" aria-label="Cart">
            <CartIcon size={21} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          <Link to={user ? '/orders' : '/login'} className="icon-link" aria-label="Account">
            <UserIcon size={21} />
          </Link>
        </nav>
      </div>

      {categoryTree.length > 0 && (
        <div className="mega-bar hide-mobile">
          <div className="container mega-bar-row">
            <div
              className="mega-wrap"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button className="mega-trigger" onClick={() => setMegaOpen((o) => !o)}>
                <GridIcon size={16} /> Categories <ChevronDownIcon size={14} />
              </button>

              {megaOpen && (
                <div className="mega-panel">
                  {categoryTree.map((cat) => (
                    <div key={cat.id} className="mega-col">
                      <Link to={`/categories/${cat.slug}`} className="mega-col-title" onClick={() => setMegaOpen(false)}>
                        {cat.name}
                      </Link>
                      {cat.children?.slice(0, 6).map((child) => (
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
              )}
            </div>

            <Link to="/vendors" className="mega-side-link">
              All stores
            </Link>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="mobile-drawer" onClick={() => setMenuOpen(false)}>
          <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Logo size={44} />
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none' }}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSearch} className="header-search" style={{ display: 'block', maxWidth: 'none', margin: '8px 0 4px' }}>
              <SearchIcon size={17} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, categories, stores..." />
            </form>

            <Link to="/" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/vendors" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <StoreIcon size={18} /> &nbsp;All stores
            </Link>
            <Link to="/wishlist" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <HeartIcon size={18} /> &nbsp;Wishlist
            </Link>

            {!user && (
              <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
                <Link to="/login" className="btn btn-outline btn-block" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-block" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
              </div>
            )}

            {user && (
              <Link to="/orders" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
                <UserIcon size={18} /> &nbsp;My orders
              </Link>
            )}

            {categories.length > 0 && (
              <>
                <div className="text-faint" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginTop: 16, marginBottom: 4 }}>
                  Categories
                </div>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/categories/${c.slug}`}
                    className="mobile-drawer-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {c.name}
                  </Link>
                ))}
              </>
            )}

            {user && (
              <button
                className="btn btn-outline btn-block"
                style={{ marginTop: 16 }}
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
              >
                Log out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
