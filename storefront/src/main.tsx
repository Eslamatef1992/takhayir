import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const loaderStartedAt = Date.now();
const MIN_LOADER_MS = 1100;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Fade out and remove the static splash loader once React has painted the
// app AND it's been shown for at least MIN_LOADER_MS, so it doesn't just
// flash by on fast connections.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const loader = document.getElementById('app-loader');
    if (!loader) return;
    const elapsed = Date.now() - loaderStartedAt;
    const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
    setTimeout(() => {
      loader.classList.add('loader-hidden');
      setTimeout(() => loader.remove(), 500);
    }, remaining);
  });
});
