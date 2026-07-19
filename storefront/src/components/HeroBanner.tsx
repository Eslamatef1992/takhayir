import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { ArrowRightIcon, StoreIcon } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';

interface Banner {
  id: number;
  title: string | null;
  title_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
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
  const { t, pick } = useLanguage();
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
              <StoreIcon size={13} /> {t('Every vendor, one marketplace')}
            </span>
            <h1 className="hero-title">
              {t('Shop everything,')}
              <br />
              {t('from')} <span className="text-gradient hero-title-accent">{t('every vendor.')}</span>
            </h1>
            <p className="hero-subtitle">
              {t('Fashion, electronics, home goods and more — all in one marketplace, one cart, one checkout.')}
            </p>
            <div className="hero-actions">
              <Link to="/search?q=" className="hero-cta">
                {t('Shop now')} <ArrowRightIcon size={17} />
              </Link>
              <Link to="/vendors" className="btn btn-glass">
                {t('Explore stores')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const banner = banners[active];
  const imageUrl = isExternal(banner.image_url) ? banner.image_url : `${API_ORIGIN}${banner.image_url}`;

  const bannerTitle = pick(banner.title || '', banner.title_ar);
  const bannerSubtitle = pick(banner.subtitle || '', banner.subtitle_ar);

  const content = (
    <section className="hero-shell">
      <img src={imageUrl} alt={bannerTitle || 'Takhayir'} className="hero-bg-img" />
      {(bannerTitle || bannerSubtitle) && (
        <div className="hero-scrim">
          <div className="hero-content">
            <span className="hero-badge">{t('Special offer')}</span>
            {bannerTitle && <h1 className="hero-title hero-title-sm">{bannerTitle}</h1>}
            {bannerSubtitle && <p className="hero-subtitle">{bannerSubtitle}</p>}
            <span className="hero-cta">
              {t('Shop now')} <ArrowRightIcon size={17} />
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
