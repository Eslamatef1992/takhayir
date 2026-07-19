import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from '../components/Icons';
import OrdersPage from './OrdersPage';
import AddressesPage from './AddressesPage';
import CustomerCouponsPage from './CustomerCouponsPage';
import ChangePasswordPage from './ChangePasswordPage';

const TABS = [
  { key: 'orders', label: 'My orders' },
  { key: 'addresses', label: 'My addresses' },
  { key: 'coupons', label: 'My coupons' },
  { key: 'password', label: 'Update password' }
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) || 'orders';

  function setTab(tab: TabKey) {
    setSearchParams({ tab });
  }

  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <aside className="card" style={{ width: 240, flexShrink: 0, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}
          >
            <UserIcon size={19} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div className="text-muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`profile-tab-link${activeTab === t.key ? ' active' : ''}`}
            >
              {t.label}
            </button>
          ))}
          <button onClick={logout} className="profile-tab-link profile-tab-logout">
            Log out
          </button>
        </nav>
      </aside>

      <div style={{ flex: 1, minWidth: 280 }}>
        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'addresses' && <AddressesPage />}
        {activeTab === 'coupons' && <CustomerCouponsPage />}
        {activeTab === 'password' && <ChangePasswordPage />}
      </div>
    </div>
  );
}
