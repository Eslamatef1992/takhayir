import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compare_at_price: string | null;
  stock_quantity: number;
  rating_avg: string;
  rating_count: number;
  images: { url: string; is_primary: boolean }[];
  variants: { id: number; name: string; price: string | null; stock_quantity: number }[];
  vendor: { id: number; store_name: string; store_slug: string };
  category: { id: number; name: string; slug: string } | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  author: { first_name: string; last_name: string | null };
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export default function ProductPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!slug) return;
    apiClient.get<ApiEnvelope<ProductDetail>>(`/products/${slug}`).then((res) => {
      setProduct(res.data.data);
      apiClient
        .get<ApiEnvelope<Review[]>>(`/reviews/product/${res.data.data.id}`)
        .then((r) => setReviews(r.data.data));
    });
  }, [slug]);

  if (!product) return <div className="spinner">Loading...</div>;

  const image = product.images[activeImage];
  const imageUrl = image ? `${API_ORIGIN}${image.url}` : null;

  async function handleAddToCart() {
    if (!user) {
      setMessage('Please log in to add items to your cart.');
      return;
    }
    setAdding(true);
    try {
      await addItem(product!.id, qty);
      setMessage('Added to cart!');
    } catch {
      setMessage('Could not add to cart.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <div className="split-2">
        <div>
          <div className="card" style={{ aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="text-muted">No image</span>
            )}
          </div>
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className="card"
                  style={{ width: 56, height: 56, padding: 0, overflow: 'hidden', border: idx === activeImage ? '2px solid var(--brand-purple)' : undefined }}
                >
                  <img src={`${API_ORIGIN}${img.url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link to={`/vendors/${product.vendor.store_slug}`} className="text-muted" style={{ fontSize: 13, fontWeight: 600 }}>
            {product.vendor.store_name}
          </Link>
          <h1 style={{ fontSize: 24, margin: '4px 0 12px' }}>{product.name}</h1>
          {Number(product.rating_count) > 0 && (
            <div className="text-muted" style={{ marginBottom: 12 }}>
              ★ {Number(product.rating_avg).toFixed(1)} ({product.rating_count} reviews)
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 26, fontWeight: 800 }}>SAR {Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-muted" style={{ textDecoration: 'line-through' }}>
                SAR {Number(product.compare_at_price).toFixed(2)}
              </span>
            )}
          </div>

          {product.description && <p style={{ lineHeight: 1.6 }}>{product.description}</p>}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '20px 0' }}>
            <input
              type="number"
              min={1}
              max={product.stock_quantity}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              style={{ width: 70 }}
            />
            <button className="btn btn-primary" disabled={adding || product.stock_quantity === 0} onClick={handleAddToCart}>
              {product.stock_quantity === 0 ? 'Out of stock' : adding ? 'Adding...' : 'Add to cart'}
            </button>
          </div>
          {message && <p className="text-muted">{message}</p>}
        </div>
      </div>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Reviews</h2>
        {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
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
