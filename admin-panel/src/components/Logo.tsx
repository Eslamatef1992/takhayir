import logoFull from '../assets/brand/logo-full.svg';

// Full Takhayir lockup (icon + wordmark + Arabic tagline). `size` sets the
// rendered height in px; width scales automatically with the logo's aspect ratio.
export function Logo({ size = 40 }: { size?: number }) {
  return <img src={logoFull} alt="Takhayir" style={{ height: size, width: 'auto', display: 'block' }} />;
}
