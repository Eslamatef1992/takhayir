import { Link } from 'react-router-dom';

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  rating_avg: string;
  rating_count: number;
  images?: { url: string; is_primary: boolean }[];
  vendor?: { store_name: string; store_slug: string };
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export function ProductCard({ product }: { product: ProductSummary }) {
  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
  const imageUrl = primaryImage ? `${API_ORIGIN}${primaryImage.url}` : null;

  return (
    <Link to={`/products/${product.slug}`} className="card" style={{ display: 'block', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '1 / 1', background: '#f2f0f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span className="text-muted" style={{ fontSize: 13 }}>
            No image
          </span>
        )}
      </div>
      <div style={{ padding: 12 }}>
        {product.vendor && (
          <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>
            {product.vendor.store_name}
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 800 }}>SAR {Number(product.price).toFixed(2)}</span>
          {product.compare_at_price && (
            <span className="text-muted" style={{ textDecoration: 'line-through', fontSize: 12 }}>
              SAR {Number(product.compare_at_price).toFixed(2)}
            </span>
          )}
        </div>
        {Number(product.rating_count) > 0 && (
          <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
            ★ {Number(product.rating_avg).toFixed(1)} ({product.rating_count})
          </div>
        )}
      </div>
    </Link>
  );
}
