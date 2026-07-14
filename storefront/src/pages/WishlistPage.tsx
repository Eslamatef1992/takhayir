import { useEffect, useState } from 'react';
import { apiClient, ApiEnvelope } from '../api/client';
import { ProductCard, ProductSummary } from '../components/ProductCard';

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

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>My wishlist</h1>
      {items.length === 0 && <p className="text-muted">Your wishlist is empty.</p>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {items.map((i) => (
          <ProductCard key={i.id} product={i.product} />
        ))}
      </div>
    </div>
  );
}
