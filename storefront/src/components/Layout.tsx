import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }} className="container">
        <div style={{ padding: '24px 0' }}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
