import { Link } from 'react-router-dom';
import { StarIcon } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';

export interface ProductSummary {
  id: number;
  name: string;
  name_ar?: string | null;
  slug: string;
  price: string;
  compare_at_price: string | null;
  rating_avg: string;
  rating_count: number;
  images?: { url: string; is_primary: boolean }[];
  vendor?: { store_name: string; store_name_ar?: string | null; store_slug: string };
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export function ProductCard({ product }: { product: ProductSummary }) {
  const { t, pick } = useLanguage();
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
          <span className="text-faint" style={{ fontSize: 13 }}>{t('No image')}</span>
        )}
        {discountPct !== null && <span className="product-card-badge">-{discountPct}%</span>}
      </div>
      <div className="product-card-body">
        {product.vendor && <div className="product-card-vendor">{pick(product.vendor.store_name, product.vendor.store_name_ar)}</div>}
        <div className="product-card-name">{pick(product.name, product.name_ar)}</div>
        <div className="product-card-price-row">
          <span className="product-card-price">KWD {price.toFixed(3)}</span>
          {comparePrice && <span className="product-card-compare">KWD {comparePrice.toFixed(3)}</span>}
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
