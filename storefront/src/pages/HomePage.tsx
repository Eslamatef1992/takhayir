import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { ProductCard, ProductSummary } from '../components/ProductCard';
import { HeroBanner } from '../components/HeroBanner';
import { Reveal } from '../components/Reveal';
import { ShieldIcon, StoreIcon, TagIcon, TruckIcon } from '../components/Icons';
import { useLanguage } from '../i18n/LanguageContext';

const STORE_GRADIENTS = [
  'linear-gradient(135deg, #f9622c, #d6247a)',
  'linear-gradient(135deg, #d6247a, #6a2ce0)',
  'linear-gradient(135deg, #6a2ce0, #2c7be5)',
  'linear-gradient(135deg, #2c7be5, #12b886)'
];

interface Category {
  id: number;
  name: string;
  name_ar?: string | null;
  slug: string;
  image: string | null;
  children: Category[];
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

interface VendorSummary {
  id: number;
  store_name: string;
  store_name_ar?: string | null;
  store_slug: string;
  store_logo: string | null;
  description: string | null;
  description_ar?: string | null;
  is_featured?: boolean;
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
  { icon: ShieldIcon, title: 'Secure checkout', copy: 'Cards, KNET, Apple Pay, BNPL & COD' },
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
  const { t, pick } = useLanguage();
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
        <div className="why-grid">
          {TRUST_POINTS.map(({ icon: Icon, title, copy }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="why-card">
                <div className="why-icon">
                  <Icon size={21} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 2 }}>{t(title)}</div>
                  <div className="text-muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{t(copy)}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <Reveal>
          <div className="section-head">
            <div>
              <span className="eyebrow">{t('Curated for you')}</span>
              <h2>{t('Shop by Popular Categories')}</h2>
            </div>
          </div>
        </Reveal>
        <div className="category-tile-grid">
          {categories.slice(0, 6).map((cat, idx) => {
            const imageUrl = cat.image
              ? cat.image.startsWith('http')
                ? cat.image
                : `${API_ORIGIN}${cat.image}`
              : null;
            return (
              <Reveal key={cat.id} delay={idx * 60}>
                <Link
                  to={`/categories/${cat.slug}`}
                  className="category-tile"
                  style={!imageUrl ? { background: CATEGORY_GRADIENTS[idx % CATEGORY_GRADIENTS.length] } : undefined}
                >
                  {imageUrl && <img src={imageUrl} alt={cat.name} className="category-tile-img" />}
                  <span className="category-tile-scrim" />
                  <span className="category-tile-label">{pick(cat.name, cat.name_ar)}</span>
                </Link>
              </Reveal>
            );
          })}
          {categories.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton category-tile" />)}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="section-head">
            <div>
              <span className="eyebrow">{t('Hand-picked')}</span>
              <h2>{t(sectionTitle)}</h2>
            </div>
            <Link to="/search?q=" className="section-link">
              {t('View all')} &rarr;
            </Link>
          </div>
        </Reveal>
        {loading ? (
          <div className="grid-products">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <p className="text-muted">{t('No products yet — check back soon as vendors add their catalogs.')}</p>
          </div>
        ) : (
          <div className="grid-products">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 50}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="section-head">
            <div>
              <span className="eyebrow">{t('Trusted sellers')}</span>
              <h2>{t('Featured stores')}</h2>
            </div>
            <Link to="/vendors" className="section-link">
              {t('View all')} &rarr;
            </Link>
          </div>
        </Reveal>
        {storesLoading ? (
          <div className="category-tile-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton category-tile" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <p className="text-muted">{t('No stores yet — check back soon.')}</p>
          </div>
        ) : (
          <div className="category-tile-grid">
            {stores.map((v, idx) => (
              <Reveal key={v.id} delay={idx * 50}>
                <Link to={`/vendors/${v.store_slug}`} className="card card-premium store-card">
                  {v.is_featured && <span className="store-card-featured-tag">{t('Featured')}</span>}
                  {v.store_logo ? (
                    <div className="store-card-icon store-card-icon-logo">
                      <img
                        src={v.store_logo.startsWith('http') ? v.store_logo : `${API_ORIGIN}${v.store_logo}`}
                        alt={v.store_name}
                      />
                    </div>
                  ) : (
                    <div
                      className="store-card-icon"
                      style={{ background: STORE_GRADIENTS[idx % STORE_GRADIENTS.length] }}
                    >
                      <StoreIcon size={38} />
                    </div>
                  )}
                  <div className="store-card-name">{pick(v.store_name, v.store_name_ar)}</div>
                  {v.description && <p className="store-card-desc">{pick(v.description, v.description_ar)}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <Reveal>
        <section className="vendor-cta">
          <div className="vendor-cta-text">
            <span className="eyebrow eyebrow-light">{t('Sell on Takhayir')}</span>
            <h2 style={{ marginTop: 10 }}>{t('Have something to sell?')}</h2>
            <p>
              {t('Open your own store on Takhayir and reach customers across every category, with your own dashboard for products, orders and payouts.')}
            </p>
          </div>
          <a
            href={import.meta.env.VITE_VENDOR_URL || 'https://vendor.takhayir.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn hero-cta vendor-cta-btn"
          >
            {t('Become a vendor')}
          </a>
        </section>
      </Reveal>
    </div>
  );
}
