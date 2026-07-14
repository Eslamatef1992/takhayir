import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { ProductCard, ProductSummary } from '../components/ProductCard';
import { HeroBanner } from '../components/HeroBanner';

interface Category {
  id: number;
  name: string;
  slug: string;
  children: Category[];
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<ApiEnvelope<Category[]>>('/categories'),
      apiClient.get<ApiEnvelope<ProductSummary[]>>('/products?featured=true&limit=8')
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.data);
        setFeatured(prodRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <HeroBanner />

      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Shop by category</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', marginBottom: 40 }}>
        {categories.map((cat) => (
          <Link key={cat.id} to={`/categories/${cat.slug}`} className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{cat.name}</div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Featured products</h2>
      {loading ? (
        <div className="spinner">Loading products...</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {featured.length === 0 && <p className="text-muted">No featured products yet.</p>}
        </div>
      )}
    </div>
  );
}
