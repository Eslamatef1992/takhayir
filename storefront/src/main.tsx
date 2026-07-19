import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Fade out and remove the static splash loader once React has painted the app.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const loader = document.getElementById('app-loader');
    if (!loader) return;
    loader.classList.add('loader-hidden');
    setTimeout(() => loader.remove(), 500);
  });
});
