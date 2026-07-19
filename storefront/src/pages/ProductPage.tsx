import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FacebookIcon, HeartIcon, MailIcon, TwitterIcon, WhatsAppIcon } from '../components/Icons';
import talyIcon from '../assets/payments/taly.svg';
import { useLanguage } from '../i18n/LanguageContext';

interface ProductDetail {
  id: number;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  description_ar: string | null;
  sku: string | null;
  attributes: Record<string, string> | null;
  price: string;
  compare_at_price: string | null;
  stock_quantity: number;
  rating_avg: string;
  rating_count: number;
  images: { url: string; is_primary: boolean }[];
  variants: { id: number; name: string; price: string | null; stock_quantity: number }[];
  vendor: { id: number; store_name: string; store_name_ar?: string | null; store_slug: string };
  category: { id: number; name: string; name_ar?: string | null; slug: string } | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  author: { first_name: string; last_name: string | null };
}

interface WishlistItem {
  id: number;
  product: { id: number };
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');
const DESCRIPTION_PREVIEW_LENGTH = 220;

export default function ProductPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { t, pick } = useLanguage();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [descExpanded, setDescExpanded] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setActiveImage(0);
    setQty(1);
    setDescExpanded(false);
    apiClient.get<ApiEnvelope<ProductDetail>>(`/products/${slug}`).then((res) => {
      const p = res.data.data;
      setProduct(p);
      setSelectedVariantId(p.variants?.[0]?.id ?? null);
      apiClient.get<ApiEnvelope<Review[]>>(`/reviews/product/${p.id}`).then((r) => setReviews(r.data.data));

      if (user) {
        apiClient.get<ApiEnvelope<WishlistItem[]>>('/wishlist').then((res2) => {
          const match = res2.data.data.find((w) => w.product.id === p.id);
          setWishlistItemId(match ? match.id : null);
        });
      }
    });
  }, [slug, user]);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.id === selectedVariantId) || null,
    [product, selectedVariantId]
  );

  if (!product) return <div className="spinner">{t('Loading...')}</div>;

  const image = product.images[activeImage];
  const imageUrl = image ? `${API_ORIGIN}${image.url}` : null;
  const price = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price);
  const comparePrice = product.compare_at_price ? Number(product.compare_at_price) : null;
  const discountPct = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;
  const stock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const inStock = stock > 0;
  const talyInstallment = price / 4;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const productName = pick(product.name, product.name_ar);
  const description = pick(product.description || '', product.description_ar);
  const isLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const shownDescription = descExpanded || !isLongDescription ? description : `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`;

  async function handleAddToCart() {
    setAdding(true);
    setMessage('');
    try {
      await addItem(product!.id, qty, selectedVariant?.id, {
        name: product!.name,
        slug: product!.slug,
        price,
        image: product!.images[0]?.url,
        variantName: selectedVariant?.name
      });
    } catch {
      setMessage(t('Could not add to cart.'));
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleWishlist() {
    if (!user) {
      setMessage(t('Please log in to save items to your wishlist.'));
      return;
    }
    setWishlistBusy(true);
    try {
      if (wishlistItemId) {
        await apiClient.delete(`/wishlist/${wishlistItemId}`);
        setWishlistItemId(null);
      } else {
        const res = await apiClient.post<ApiEnvelope<{ id: number }>>('/wishlist', { product_id: product!.id });
        setWishlistItemId(res.data.data.id);
      }
    } finally {
      setWishlistBusy(false);
    }
  }

  return (
    <div>
      <div className="pdp-breadcrumbs">
        <Link to="/">{t('Home')}</Link>
        {product.category && (
          <>
            <span className="sep">&gt;</span>
            <Link to={`/categories/${product.category.slug}`}>{pick(product.category.name, product.category.name_ar)}</Link>
          </>
        )}
        <span className="sep">&gt;</span>
        <span className="current">{productName}</span>
      </div>

      <div className="split-2">
        <div className="pdp-gallery">
          {product.images.length > 1 && (
            <div className="pdp-thumbs">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`pdp-thumb${idx === activeImage ? ' active' : ''}`}
                >
                  <img src={`${API_ORIGIN}${img.url}`} alt="" />
                </button>
              ))}
            </div>
          )}
          <div className="pdp-main-image">
            {discountPct !== null && <span className="pdp-save-badge">{t('You save')} {discountPct}%</span>}
            {imageUrl ? <img src={imageUrl} alt={productName} /> : <span className="text-muted">{t('No image')}</span>}
          </div>
        </div>

        <div>
          <Link to={`/vendors/${product.vendor.store_slug}`} className="pdp-vendor">
            {pick(product.vendor.store_name, product.vendor.store_name_ar)}
          </Link>
          <h1 className="pdp-title">{productName}</h1>
          {Number(product.rating_count) > 0 && (
            <div className="text-muted" style={{ marginBottom: 10 }}>
              ★ {Number(product.rating_avg).toFixed(1)} ({product.rating_count} {t('reviews')})
            </div>
          )}

          <div className="pdp-price-row">
            <span className="pdp-price">KWD {price.toFixed(3)}</span>
            {comparePrice && <span className="pdp-price-compare">KWD {comparePrice.toFixed(3)}</span>}
            {discountPct !== null && <span className="pdp-discount-chip">-{discountPct}%</span>}
          </div>

          {product.sku && <div className="pdp-meta-row">{t('SKU')}: {product.sku}</div>}

          <div className={`pdp-stock ${inStock ? 'in' : 'out'}`}>
            <span className="pdp-stock-dot" />
            {inStock ? t('In stock') : t('Out of stock')}
          </div>

          {product.variants.length > 0 && (
            <>
              <div className="pdp-attr-label">{t('Options')}: {selectedVariant?.name}</div>
              <div className="pdp-swatches">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    className={`pdp-swatch${v.id === selectedVariantId ? ' active' : ''}`}
                    disabled={v.stock_quantity === 0}
                    onClick={() => setSelectedVariantId(v.id)}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="pdp-taly">
            <img src={talyIcon} alt="Taly" className="pdp-taly-badge-img" />
            <div className="pdp-taly-text">
              <div className="pdp-taly-title">{t('Split into 4 payments of')} KWD {talyInstallment.toFixed(3)}</div>
              <div className="pdp-taly-sub">{t('0% Interest, 100% Shariah-compliant.')}</div>
            </div>
          </div>

          <div className="pdp-buy-row">
            <div className="pdp-qty-stepper">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                &minus;
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(stock || q + 1, q + 1))}>
                +
              </button>
            </div>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={adding || !inStock} onClick={handleAddToCart}>
              {!inStock ? t('Sold out') : adding ? t('Adding...') : t('Add to cart')}
            </button>
            <button
              className="btn btn-outline"
              aria-label="Add to wishlist"
              onClick={handleToggleWishlist}
              disabled={wishlistBusy}
              style={{ padding: '0 14px', color: wishlistItemId ? 'var(--brand-magenta)' : undefined }}
            >
              <HeartIcon size={18} />
            </button>
          </div>
          {message && <p className="text-muted">{message}</p>}

          <div className="pdp-share-row">
            <span className="text-muted" style={{ fontSize: 13, fontWeight: 600 }}>
              {t('Share')}:
            </span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
            >
              <FacebookIcon size={16} />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
            >
              <TwitterIcon size={16} />
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(shareUrl)}`} aria-label="Share by email">
              <MailIcon size={16} />
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${product.name} ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
            >
              <WhatsAppIcon size={16} />
            </a>
          </div>
        </div>
      </div>

      {description && (
        <section className="pdp-description">
          <h2 className="pdp-description-heading">{productName}</h2>
          <p style={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>{shownDescription}</p>
          {isLongDescription && (
            <button
              className="pdp-readmore"
              onClick={() => setDescExpanded((v) => !v)}
            >
              {descExpanded ? t('Read less') : t('Read more')}
            </button>
          )}
        </section>
      )}

      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>{t('Specifications')}</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {Object.entries(product.attributes).map(([key, value], idx) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderTop: idx === 0 ? undefined : '1px solid var(--border-color)',
                  fontSize: 13.5
                }}
              >
                <span className="text-muted" style={{ textTransform: 'capitalize' }}>{key}</span>
                <span style={{ fontWeight: 600 }}>{String(value)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>{t('Reviews')}</h2>
        {reviews.length === 0 && <p className="text-muted">{t('No reviews yet.')}</p>}
        {reviews.map((r) => (
          <div key={r.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} — {r.author.first_name}
            </div>
            {r.comment && <p style={{ margin: 0 }}>{r.comment}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
