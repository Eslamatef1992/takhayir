import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApprovalStatusPage from '../pages/ApprovalStatusPage';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // A vendor account exists, but the store hasn't been approved by admin yet -
  // block the dashboard/products/orders until that happens.
  if (user.vendorProfile && user.vendorProfile.status !== 'approved') {
    return <ApprovalStatusPage />;
  }

  return <>{children}</>;
}
