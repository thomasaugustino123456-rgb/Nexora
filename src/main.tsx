import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker: Registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker: Registration failed with error:', error);
      });
  });
}

// Early capture of beforeinstallprompt to prevent missing it before React loads
(window as any).deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
  // Dispatch custom event for React to listen to if it's already rendered
  window.dispatchEvent(new CustomEvent('pwa-deferred-prompt', { detail: e }));
});

// Handle dynamic import failures (vite chunk loading errors on new deployments)
window.addEventListener('vite:preloadError', (event) => {
  console.log('Vite preload error detected, reloading page to fetch new chunks...');
  event.preventDefault();
  window.location.reload();
});

// Fallback for uncaught chunk errors
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || '';
  if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('loading chunk') || msg.includes('dynamically imported module')) {
    console.log('Unhandled chunk error detected, reloading page...');
    event.preventDefault();
    window.location.reload();
  }
});

window.addEventListener('error', (event) => {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.zIndex = '999999';
  errDiv.style.background = 'red';
  errDiv.style.color = 'white';
  errDiv.style.padding = '20px';
  errDiv.style.overflow = 'auto';
  errDiv.textContent = 'Global Error: ' + event.message + ' at ' + event.filename + ':' + event.lineno;
  document.body.appendChild(errDiv);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
