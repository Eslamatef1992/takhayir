import { NavLink, Outlet } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/store', label: 'Store settings' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
  { to: '/coupons', label: 'Coupons' }
];

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid var(--border-color)', padding: '20px 16px', flexShrink: 0 }}>
        <div style={{ marginBottom: 32, padding: '0 4px' }}>
          <Logo />
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>Vendor Panel</div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                background: isActive ? 'var(--bg-page)' : 'transparent',
                color: isActive ? 'var(--brand-purple)' : 'var(--text-main)'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid var(--border-color)', padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          <span className="text-muted" style={{ fontSize: 13 }}>{user?.first_name} {user?.last_name}</span>
          <button className="btn btn-outline" onClick={logout}>Log out</button>
        </header>
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
