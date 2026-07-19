import { ReactNode } from 'react';
import { Logo } from './Logo';
import { ShieldIcon, StoreIcon, TruckIcon } from './Icons';

const FEATURES = [
  { icon: TruckIcon, text: 'Fast, tracked delivery from every vendor' },
  { icon: ShieldIcon, text: 'Secure checkout — cards, KNET, Apple Pay & installments' },
  { icon: StoreIcon, text: 'Hundreds of verified independent stores' }
];

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-glow auth-brand-glow-1" />
        <div className="auth-brand-glow auth-brand-glow-2" />
        <div className="auth-brand-content">
          <div className="auth-logo-animated">
            <Logo size={64} variant="onDark" />
          </div>
          <h2 className="auth-brand-title">One cart. Every store in Kuwait.</h2>
          <p className="auth-brand-sub">
            Join Takhayir to shop fashion, electronics, home goods and more from independent vendors — all in a
            single checkout.
          </p>
          <ul className="auth-brand-features">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span className="auth-brand-feature-icon">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="auth-form-col">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>{title}</h1>
            {subtitle && <p className="text-muted">{subtitle}</p>}
          </div>
          <div className="auth-form-card">{children}</div>
          {footer && <div className="auth-form-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
