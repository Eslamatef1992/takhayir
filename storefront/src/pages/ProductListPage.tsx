import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { ProductCard, ProductSummary } from '../components/ProductCard';

export default function ProductListPage({ mode }: { mode: 'category' | 'search' | 'vendor' }) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    setLoading(true);
    const query: Record<string, string> = { limit: '24' };
    if (mode === 'category') {
      query.category = params.slug || '';
      setTitle(`Category: ${params.slug}`);
    } else if (mode === 'vendor') {
      query.vendor = params.slug || '';
      setTitle(`Store: ${params.slug}`);
    } else {
      query.q = searchParams.get('q') || '';
      setTitle(`Search results for "${query.q}"`);
    }

    apiClient
      .get<ApiEnvelope<ProductSummary[]>>('/products', { params: query })
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false));
  }, [mode, params.slug, searchParams]);

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>{title}</h1>
      {loading ? (
        <div className="spinner">Loading...</div>
      ) : products.length === 0 ? (
        <p className="text-muted">No products found.</p>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
