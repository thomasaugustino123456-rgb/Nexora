import {StrictMode} from 'react';
console.log("main.tsx: Imports completed");
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

console.log("main.tsx is running...");
const rootElement = document.getElementById('root');
console.log("main.tsx: rootElement found:", !!rootElement);
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error("main.tsx: rootElement NOT found!");
}
