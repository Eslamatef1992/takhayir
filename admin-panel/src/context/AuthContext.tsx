import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
}

interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('takhayir_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient
      .get<ApiEnvelope<AdminUser>>('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => localStorage.removeItem('takhayir_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await apiClient.post<ApiEnvelope<{ user: AdminUser; accessToken: string }>>('/auth/login', { email, password });
    if (res.data.data.user.role !== 'admin') {
      throw new Error('This account is not an admin account.');
    }
    localStorage.setItem('takhayir_admin_token', res.data.data.accessToken);
    setUser(res.data.data.user);
  }

  function logout() {
    localStorage.removeItem('takhayir_admin_token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
