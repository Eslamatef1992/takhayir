import logoFull from '../assets/brand/logo-full.svg';
import logoDark from '../assets/brand/logo-dark.svg';

// Full Takhayir lockup (icon + wordmark + Arabic tagline). `size` sets the
// rendered height in px; width scales automatically with the logo's aspect ratio.
// Pass variant="onDark" when placing the logo on a dark background (the
// wordmark switches from navy to white so it stays legible).
export function Logo({ size = 40, variant = 'default' }: { size?: number; variant?: 'default' | 'onDark' }) {
  return (
    <img
      src={variant === 'onDark' ? logoDark : logoFull}
      alt="Takhayir"
      style={{ height: size, width: 'auto', display: 'block' }}
    />
  );
}
