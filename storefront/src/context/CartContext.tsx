import { createContext, ReactNode, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price_snapshot: string;
  product?: { id: number; name: string; slug: string; images?: { url: string; is_primary: boolean }[] };
  variant?: { id: number; name: string } | null;
}

export interface GuestProductInfo {
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  variantName?: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number, variantId?: number, productInfo?: GuestProductInfo) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const GUEST_CART_KEY = 'takhayir_guest_cart';

function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore (private browsing / storage full)
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const mergedForUser = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems(loadGuestCart());
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

  // On login, fold any items added as a guest into the real server cart
  // exactly once per session, then clear local storage.
  useEffect(() => {
    async function run() {
      if (user && mergedForUser.current !== user.id) {
        mergedForUser.current = user.id;
        const guestItems = loadGuestCart();
        if (guestItems.length) {
          for (const gi of guestItems) {
            try {
              await apiClient.post('/cart', {
                product_id: gi.product_id,
                quantity: gi.quantity,
                variant_id: gi.variant_id ?? undefined
              });
            } catch {
              // product may no longer be available — skip it
            }
          }
          saveGuestCart([]);
        }
      }
      await refresh();
    }
    run();
  }, [user, refresh]);

  async function addItem(productId: number, quantity = 1, variantId?: number, productInfo?: GuestProductInfo) {
    if (!user) {
      const current = loadGuestCart();
      const idx = current.findIndex((i) => i.product_id === productId && (i.variant_id ?? null) === (variantId ?? null));
      if (idx >= 0) {
        current[idx] = { ...current[idx], quantity: current[idx].quantity + quantity };
      } else {
        current.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          product_id: productId,
          variant_id: variantId ?? null,
          quantity,
          price_snapshot: String(productInfo?.price ?? 0),
          product: productInfo
            ? {
                id: productId,
                name: productInfo.name,
                slug: productInfo.slug,
                images: productInfo.image ? [{ url: productInfo.image, is_primary: true }] : []
              }
            : undefined,
          variant: variantId && productInfo?.variantName ? { id: variantId, name: productInfo.variantName } : null
        });
      }
      saveGuestCart(current);
      setItems(current);
      setIsDrawerOpen(true);
      return;
    }

    await apiClient.post('/cart', { product_id: productId, quantity, variant_id: variantId });
    await refresh();
    setIsDrawerOpen(true);
  }

  async function updateItem(itemId: number, quantity: number) {
    if (!user) {
      const current = loadGuestCart().map((i) => (i.id === itemId ? { ...i, quantity } : i));
      saveGuestCart(current);
      setItems(current);
      return;
    }
    await apiClient.put(`/cart/${itemId}`, { quantity });
    await refresh();
  }

  async function removeItem(itemId: number) {
    if (!user) {
      const current = loadGuestCart().filter((i) => i.id !== itemId);
      saveGuestCart(current);
      setItems(current);
      return;
    }
    await apiClient.delete(`/cart/${itemId}`);
    await refresh();
  }

  async function clear() {
    if (!user) {
      saveGuestCart([]);
      setItems([]);
      return;
    }
    await apiClient.delete('/cart');
    await refresh();
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + Number(i.price_snapshot) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        loading,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        refresh,
        addItem,
        updateItem,
        removeItem,
        clear
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
