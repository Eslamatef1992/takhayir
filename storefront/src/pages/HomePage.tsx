import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { ProductCard, ProductSummary } from '../components/ProductCard';
import { HeroBanner } from '../components/HeroBanner';
import { ShieldIcon, StoreIcon, TagIcon, TruckIcon } from '../components/Icons';

const STORE_GRADIENTS = [
  'linear-gradient(135deg, #f9622c, #d6247a)',
  'linear-gradient(135deg, #d6247a, #6a2ce0)',
  'linear-gradient(135deg, #6a2ce0, #2c7be5)',
  'linear-gradient(135deg, #2c7be5, #12b886)'
];

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  children: Category[];
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

interface VendorSummary {
  id: number;
  store_name: string;
  store_slug: string;
  description: string | null;
}

const CATEGORY_GRADIENTS = [
  'linear-gradient(135deg, #f9622c, #d6247a)',
  'linear-gradient(135deg, #d6247a, #6a2ce0)',
  'linear-gradient(135deg, #6a2ce0, #2c7be5)',
  'linear-gradient(135deg, #2c7be5, #12b886)',
  'linear-gradient(135deg, #f9622c, #6a2ce0)',
  'linear-gradient(135deg, #12b886, #d6247a)'
];

const TRUST_POINTS = [
  { icon: TruckIcon, title: 'Fast delivery', copy: 'Tracked shipping from every vendor' },
  { icon: ShieldIcon, title: 'Secure checkout', copy: 'Cards, Mada, Apple Pay, BNPL & COD' },
  { icon: StoreIcon, title: 'Verified stores', copy: 'Every vendor is reviewed before listing' },
  { icon: TagIcon, title: 'Real variety', copy: 'Fashion, electronics, home & more' }
];

function ProductCardSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '1 / 1' }} />
      <div style={{ padding: 12 }}>
        <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<ProductSummary[]>([]);
  const [sectionTitle, setSectionTitle] = useState('Featured products');
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<VendorSummary[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<ApiEnvelope<Category[]>>('/categories'),
      apiClient.get<ApiEnvelope<ProductSummary[]>>('/products?featured=true&limit=8')
    ])
      .then(async ([catRes, prodRes]) => {
        setCategories(catRes.data.data);
        if (prodRes.data.data.length > 0) {
          setFeatured(prodRes.data.data);
        } else {
          const fallback = await apiClient.get<ApiEnvelope<ProductSummary[]>>('/products?limit=8');
          setFeatured(fallback.data.data);
          setSectionTitle('New arrivals');
        }
      })
      .finally(() => setLoading(false));

    apiClient
      .get<ApiEnvelope<VendorSummary[]>>('/vendors?featured=true&limit=6')
      .then(async (res) => {
        if (res.data.data.length > 0) {
          setStores(res.data.data);
        } else {
          const fallback = await apiClient.get<ApiEnvelope<VendorSummary[]>>('/vendors?limit=6');
          setStores(fallback.data.data);
        }
      })
      .finally(() => setStoresLoading(false));
  }, []);

  return (
    <div>
      <HeroBanner />

      <section className="section" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {TRUST_POINTS.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 18 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'var(--brand-gradient-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-purple)',
                  flexShrink: 0
                }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
                <div className="text-muted" style={{ fontSize: 12.5 }}>{copy}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <h2>Shop by Popular Categories</h2>
        </div>
        <div className="category-tile-grid">
          {categories.slice(0, 6).map((cat, idx) => {
            const imageUrl = cat.image
              ? cat.image.startsWith('http')
                ? cat.image
                : `${API_ORIGIN}${cat.image}`
              : null;
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="category-tile"
                style={!imageUrl ? { background: CATEGORY_GRADIENTS[idx % CATEGORY_GRADIENTS.length] } : undefined}
              >
                {imageUrl && <img src={imageUrl} alt={cat.name} className="category-tile-img" />}
                <span className="category-tile-scrim" />
                <span className="category-tile-label">{cat.name}</span>
              </Link>
            );
          })}
          {categories.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton category-tile" />)}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <h2>{sectionTitle}</h2>
          <Link to="/search?q=" className="text-muted" style={{ fontSize: 13, fontWeight: 700 }}>
            View all &rarr;
          </Link>
        </div>
        {loading ? (
          <div className="grid-products">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <p className="text-muted">No products yet — check back soon as vendors add their catalogs.</p>
          </div>
        ) : (
          <div className="grid-products">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <h2>Featured stores</h2>
          <Link to="/vendors" className="text-muted" style={{ fontSize: 13, fontWeight: 700 }}>
            View all &rarr;
          </Link>
        </div>
        {storesLoading ? (
          <div className="grid-products">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120 }} />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <p className="text-muted">No stores yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid-products">
            {stores.map((v, idx) => (
              <Link key={v.id} to={`/vendors/${v.store_slug}`} className="card" style={{ padding: 18 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: STORE_GRADIENTS[idx % STORE_GRADIENTS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    marginBottom: 10
                  }}
                >
                  <StoreIcon size={20} />
                </div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{v.store_name}</div>
                {v.description && (
                  <p
                    className="text-muted"
                    style={{
                      fontSize: 13,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {v.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section
        className="card"
        style={{
          background: 'var(--brand-gradient)',
          color: '#fff',
          border: 'none',
          padding: 'clamp(28px, 5vw, 48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 24
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 8px' }}>Have something to sell?</h2>
          <p style={{ opacity: 0.92, maxWidth: 420 }}>
            Open your own store on Takhayir and reach customers across every category, with your own
            dashboard for products, orders and payouts.
          </p>
        </div>
        <a
          href={import.meta.env.VITE_VENDOR_URL || 'https://vendor.takhayir.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ background: '#fff', color: 'var(--brand-navy)', flexShrink: 0 }}
        >
          Become a vendor
        </a>
      </section>
    </div>
  );
}
