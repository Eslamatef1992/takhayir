import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { ArrowRightIcon, StoreIcon } from './Icons';

interface Banner {
  id: number;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

function HeroOrbs() {
  return (
    <>
      <span className="hero-orb hero-orb-1" />
      <span className="hero-orb hero-orb-2" />
      <span className="hero-orb hero-orb-3" />
    </>
  );
}

export function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<Banner[]>>('/banners')
      .then((res) => setBanners(res.data.data))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % banners.length), 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Fallback while loading or if no banners have been uploaded yet (Admin > Banners)
  if (!loaded || banners.length === 0) {
    return (
      <div className="hero-wrap">
        <section className="hero-shell hero-shell-mesh">
          <HeroOrbs />
          <div className="hero-grain" />
          <div className="hero-content">
            <span className="hero-badge">
              <StoreIcon size={13} /> Every vendor, one marketplace
            </span>
            <h1 className="hero-title">
              Shop everything,
              <br />
              from <span className="text-gradient hero-title-accent">every vendor.</span>
            </h1>
            <p className="hero-subtitle">
              Fashion, electronics, home goods and more — all in one marketplace, one cart, one checkout.
            </p>
            <div className="hero-actions">
              <Link to="/search?q=" className="hero-cta">
                Shop now <ArrowRightIcon size={17} />
              </Link>
              <Link to="/vendors" className="btn btn-glass">
                Explore stores
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const banner = banners[active];
  const imageUrl = isExternal(banner.image_url) ? banner.image_url : `${API_ORIGIN}${banner.image_url}`;

  const content = (
    <section className="hero-shell">
      <img src={imageUrl} alt={banner.title || 'Takhayir'} className="hero-bg-img" />
      {(banner.title || banner.subtitle) && (
        <div className="hero-scrim">
          <div className="hero-content">
            <span className="hero-badge">Special offer</span>
            {banner.title && <h1 className="hero-title hero-title-sm">{banner.title}</h1>}
            {banner.subtitle && <p className="hero-subtitle">{banner.subtitle}</p>}
            <span className="hero-cta">
              Shop now <ArrowRightIcon size={17} />
            </span>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <div className="hero-wrap">
      {banner.link_url ? (
        isExternal(banner.link_url) ? (
          <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        ) : (
          <Link to={banner.link_url}>{content}</Link>
        )
      ) : (
        content
      )}

      {banners.length > 1 && (
        <div className="hero-dots">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setActive(idx)}
              aria-label={`Show banner ${idx + 1}`}
              className={`hero-dot${idx === active ? ' hero-dot-active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
