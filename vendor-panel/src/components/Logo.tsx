export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="takhayirGradientVendor" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f9622c" />
            <stop offset="55%" stopColor="#d6247a" />
            <stop offset="100%" stopColor="#6a2ce0" />
          </linearGradient>
        </defs>
        <path d="M12 28 C 24 12, 55 12, 88 12 L 60 40 L 60 92 L 38 92 L 38 40 L 12 40 Z" fill="url(#takhayirGradientVendor)" />
      </svg>
      <span style={{ fontWeight: 800, fontSize: size * 0.62, letterSpacing: '-0.02em' }}>Takhayir</span>
    </div>
  );
}
