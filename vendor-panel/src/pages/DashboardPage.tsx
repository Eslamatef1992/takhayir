import { useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

interface Stats {
  storeStatus: 'pending' | 'approved' | 'suspended' | 'rejected';
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  commissionRate: string;
  ratingAvg: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiClient.get<ApiEnvelope<Stats>>('/dashboard/vendor').then((res) => setStats(res.data.data));
  }, []);

  if (!stats) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ marginBottom: 20 }}>
        Store status: <span className={`badge badge-${stats.storeStatus}`}>{stats.storeStatus}</span>
        {stats.storeStatus === 'pending' && (
          <span className="text-muted" style={{ marginLeft: 8, fontSize: 13 }}>
            Your store is awaiting admin approval before you can list products.
          </span>
        )}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        <div className="card stat-card">
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total products</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{stats.activeProducts}</div>
          <div className="stat-label">Active products</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{stats.pendingProducts}</div>
          <div className="stat-label">Pending review</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{stats.commissionRate}%</div>
          <div className="stat-label">Commission rate</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{Number(stats.ratingAvg).toFixed(1)}</div>
          <div className="stat-label">Store rating</div>
        </div>
      </div>
    </div>
  );
}
