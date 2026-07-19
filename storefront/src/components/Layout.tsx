import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

export function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }} className="container">
        <div className="section">
          <Outlet />
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
