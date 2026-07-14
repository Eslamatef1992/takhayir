import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price_snapshot: string;
  product?: { id: number; name: string; slug: string };
  variant?: { id: number; name: string } | null;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number, variantId?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<ApiEnvelope<{ cart_id: number; items: CartItem[] }>>('/cart');
      setItems(res.data.data.items);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(productId: number, quantity = 1, variantId?: number) {
    await apiClient.post('/cart', { product_id: productId, quantity, variant_id: variantId });
    await refresh();
  }

  async function updateItem(itemId: number, quantity: number) {
    await apiClient.put(`/cart/${itemId}`, { quantity });
    await refresh();
  }

  async function removeItem(itemId: number) {
    await apiClient.delete(`/cart/${itemId}`);
    await refresh();
  }

  async function clear() {
    await apiClient.delete('/cart');
    await refresh();
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + Number(i.price_snapshot) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, loading, refresh, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
