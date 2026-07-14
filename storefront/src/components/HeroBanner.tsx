import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';

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
    const timer = setInterval(() => setActive((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Fallback while loading or if no banners have been uploaded yet (Admin > Banners)
  if (!loaded || banners.length === 0) {
    return (
      <section
        style={{
          background: 'var(--brand-gradient)',
          borderRadius: 16,
          padding: '48px 32px',
          color: '#fff',
          marginBottom: 32
        }}
      >
        <h1 style={{ fontSize: 32, margin: '0 0 8px' }}>Shop everything, from every vendor.</h1>
        <p style={{ opacity: 0.9, margin: 0 }}>Fashion, electronics, home goods and more — all in one marketplace.</p>
      </section>
    );
  }

  const banner = banners[active];
  const imageUrl = isExternal(banner.image_url) ? banner.image_url : `${API_ORIGIN}${banner.image_url}`;

  const content = (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        height: 320,
        marginBottom: 16,
        background: '#f2f0f7'
      }}
    >
      <img
        src={imageUrl}
        alt={banner.title || 'Takhayir'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {(banner.title || banner.subtitle) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(20,18,43,0.65) 0%, rgba(20,18,43,0.15) 55%, rgba(20,18,43,0) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 40px',
            color: '#fff'
          }}
        >
          {banner.title && <h1 style={{ fontSize: 30, margin: '0 0 8px', maxWidth: 460 }}>{banner.title}</h1>}
          {banner.subtitle && <p style={{ opacity: 0.95, margin: 0, maxWidth: 420 }}>{banner.subtitle}</p>}
        </div>
      )}
    </div>
  );

  return (
    <section style={{ marginBottom: 16 }}>
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          {banners.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setActive(idx)}
              aria-label={`Show banner ${idx + 1}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                background: idx === active ? 'var(--brand-purple)' : 'var(--border-color)'
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
