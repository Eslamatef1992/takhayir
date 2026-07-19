import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

export interface VendorProfile {
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  rejection_reason: string | null;
  store_name: string;
}

export interface VendorUser {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  vendorProfile?: VendorProfile;
}

interface AuthContextValue {
  user: VendorUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VendorUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('takhayir_vendor_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient
      .get<ApiEnvelope<VendorUser>>('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => localStorage.removeItem('takhayir_vendor_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await apiClient.post<ApiEnvelope<{ user: VendorUser; accessToken: string }>>('/auth/login', { email, password });
    if (res.data.data.user.role !== 'vendor') {
      throw new Error('This account is not a vendor account.');
    }
    localStorage.setItem('takhayir_vendor_token', res.data.data.accessToken);
    // /auth/login doesn't include the vendor's approval status - fetch the full profile.
    const me = await apiClient.get<ApiEnvelope<VendorUser>>('/auth/me');
    setUser(me.data.data);
  }

  async function register(payload: Record<string, unknown>) {
    const res = await apiClient.post<ApiEnvelope<{ user: VendorUser; accessToken: string }>>('/auth/register', {
      ...payload,
      role: 'vendor'
    });
    localStorage.setItem('takhayir_vendor_token', res.data.data.accessToken);
    const me = await apiClient.get<ApiEnvelope<VendorUser>>('/auth/me');
    setUser(me.data.data);
  }

  function logout() {
    localStorage.removeItem('takhayir_vendor_token');
    setUser(null);
  }

  async function refreshUser() {
    const me = await apiClient.get<ApiEnvelope<VendorUser>>('/auth/me');
    setUser(me.data.data);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
