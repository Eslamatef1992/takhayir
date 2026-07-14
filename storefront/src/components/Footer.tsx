export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', marginTop: 60, padding: '32px 0', background: '#fff' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div className="text-muted" style={{ fontSize: 13 }}>
          &copy; {new Date().getFullYear()} Takhayir. All rights reserved.
        </div>
        <a
          href="https://teknulugy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted"
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          Powered by Teknulugy
        </a>
      </div>
    </footer>
  );
}
