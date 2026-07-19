import { useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Stats {
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  pendingProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiClient.get<ApiEnvelope<Stats>>('/dashboard/admin').then((res) => setStats(res.data.data));
  }, []);

  if (!stats) return <div className="spinner">Loading...</div>;

  const cards = [
    { label: 'Approved vendors', value: stats.totalVendors },
    { label: 'Pending vendor approvals', value: stats.pendingVendors },
    { label: 'Active products', value: stats.totalProducts },
    { label: 'Products awaiting review', value: stats.pendingProducts },
    { label: 'Total orders', value: stats.totalOrders },
    { label: 'Customers', value: stats.totalCustomers },
    { label: 'Total revenue (paid orders)', value: `KWD ${Number(stats.totalRevenue).toFixed(3)}` }
  ];

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <div key={c.label} className="card stat-card">
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
