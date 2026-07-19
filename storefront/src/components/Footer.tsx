import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import logoDark from '../assets/brand/logo-dark.svg';
import { FacebookIcon, InstagramIcon, TwitterIcon, WhatsAppIcon } from './Icons';
import knetIcon from '../assets/payments/knet.svg';
import visaIcon from '../assets/payments/visa.svg';
import mastercardIcon from '../assets/payments/mastercard.svg';
import { useLanguage } from '../i18n/LanguageContext';

const SOCIAL_LINKS = [
  { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com/takhayir' },
  { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com/takhayir' },
  { icon: TwitterIcon, label: 'X (Twitter)', href: 'https://x.com/takhayir' },
  { icon: WhatsAppIcon, label: 'WhatsApp', href: 'https://wa.me/965' }
];

interface Category {
  id: number;
  name: string;
  name_ar?: string | null;
  slug: string;
}

const VENDOR_URL = import.meta.env.VITE_VENDOR_URL || 'https://vendor.takhayir.com';

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { t, pick } = useLanguage();

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<Category[]>>('/categories', { params: { flat: true } })
      .then((res) => setCategories(res.data.data.slice(0, 6)))
      .catch(() => undefined);
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <img src={logoDark} alt="Takhayir" style={{ height: 64, marginBottom: 14, marginLeft: -6 }} />
            <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 280, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
              {t('A marketplace for every kind of business — fashion, electronics, home goods and more, all from independent vendors, one cart, one checkout.')}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="footer-social-btn"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-heading">{t('Shop')}</div>
            <div className="footer-links">
              {categories.map((c) => (
                <Link key={c.id} to={`/categories/${c.slug}`}>
                  {pick(c.name, c.name_ar)}
                </Link>
              ))}
              <Link to="/vendors">{t('All stores')}</Link>
            </div>
          </div>

          <div>
            <div className="footer-heading">{t('My account')}</div>
            <div className="footer-links">
              <Link to="/orders">{t('My orders')}</Link>
              <Link to="/wishlist">{t('Wishlist')}</Link>
              <Link to="/cart">{t('Cart')}</Link>
              <Link to="/login">{t('Sign in')}</Link>
              <Link to="/register">{t('Create account')}</Link>
            </div>
          </div>

          <div>
            <div className="footer-heading">{t('Sell on Takhayir')}</div>
            <div className="footer-links">
              <a href={VENDOR_URL} target="_blank" rel="noopener noreferrer">
                {t('Become a vendor')}
              </a>
              <a href={VENDOR_URL} target="_blank" rel="noopener noreferrer">
                {t('Vendor sign in')}
              </a>
              <a href="https://teknulugy.com" target="_blank" rel="noopener noreferrer">
                Teknulugy
              </a>
            </div>
          </div>

          <div>
            <div className="footer-heading">{t('Company')}</div>
            <div className="footer-links">
              <Link to="/pages/about-us">{t('About us')}</Link>
              <Link to="/pages/terms-conditions">{t('Terms & Conditions')}</Link>
              <Link to="/pages/privacy-policy">{t('Privacy Policy')}</Link>
              <Link to="/pages/faq">{t('FAQ')}</Link>
              <Link to="/pages/returns-policy">{t('Contact & Returns')}</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} Takhayir. {t('All rights reserved.')}</div>
          <div className="footer-payments">
            <img src={knetIcon} alt="KNET" className="footer-payment-icon" />
            <img src={visaIcon} alt="Visa" className="footer-payment-icon" />
            <img src={mastercardIcon} alt="Mastercard" className="footer-payment-icon" />
          </div>
          <a
            href="https://teknulugy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-brand-badge"
            style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}
          >
            {t('Powered by')} <span className="footer-brand-badge">Teknulugy</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
