import { Link } from 'react-router-dom';
import { StarIcon } from './Icons';

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
  const price = Number(product.price);
  const comparePrice = product.compare_at_price ? Number(product.compare_at_price) : null;
  const discountPct = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;

  return (
    <Link to={`/products/${product.slug}`} className="card card-premium product-card">
      <div className="product-card-media">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="product-card-img" />
        ) : (
          <span className="text-faint" style={{ fontSize: 13 }}>No image</span>
        )}
        {discountPct !== null && <span className="product-card-badge">-{discountPct}%</span>}
      </div>
      <div className="product-card-body">
        {product.vendor && <div className="product-card-vendor">{product.vendor.store_name}</div>}
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price-row">
          <span className="product-card-price">SAR {price.toFixed(2)}</span>
          {comparePrice && <span className="product-card-compare">SAR {comparePrice.toFixed(2)}</span>}
        </div>
        {Number(product.rating_count) > 0 && (
          <div className="product-card-rating">
            <StarIcon size={13} />
            {Number(product.rating_avg).toFixed(1)}
            <span className="text-faint">({product.rating_count})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
