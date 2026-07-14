import { useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';
import { ProductCard, ProductSummary } from '../components/ProductCard';
import { HeartIcon } from '../components/Icons';

interface WishlistItem {
  id: number;
  product: ProductSummary;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<WishlistItem[]>>('/wishlist')
      .then((res) => setItems(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>My wishlist</h1>

      {loading ? (
        <div className="grid-products">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '3 / 4' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: 'clamp(32px, 6vw, 64px)', textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'var(--brand-gradient-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-purple)'
            }}
          >
            <HeartIcon size={26} />
          </div>
          <p className="text-muted">Your wishlist is empty — tap the heart on any product to save it here.</p>
        </div>
      ) : (
        <div className="grid-products">
          {items.map((i) => (
            <ProductCard key={i.id} product={i.product} />
          ))}
        </div>
      )}
    </div>
  );
}
