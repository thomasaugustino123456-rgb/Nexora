import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Bulletproof Storage Safety Polyfill / Fallback for QuotaExceededError and restricted sandboxes
(function() {
  // Mock Storage interface implementation
  class MockStorage implements Storage {
    private store: { [key: string]: string } = {};
    
    get length(): number {
      return Object.keys(this.store).length;
    }
    
    clear(): void {
      this.store = {};
    }
    
    getItem(key: string): string | null {
      return key in this.store ? this.store[key] : null;
    }
    
    key(index: number): string | null {
      const keys = Object.keys(this.store);
      return index >= 0 && index < keys.length ? keys[index] : null;
    }
    
    removeItem(key: string): void {
      delete this.store[key];
    }
    
    setItem(key: string, value: string): void {
      this.store[key] = String(value);
    }
    
    [name: string]: any;
  }

  // Helper to wrap real storage with an in-memory fallback
  function createSafeStorage(type: 'localStorage' | 'sessionStorage'): Storage {
    const memoryStore = new MockStorage();
    let realStorage: Storage | null = null;
    
    try {
      // Test if accessing and using the real storage is allowed
      const storage = window[type];
      if (storage) {
        const testKey = `__safe_storage_test_${type}__`;
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        realStorage = storage;
      }
    } catch (e) {
      console.warn(`Real ${type} is inaccessible/restricted in this sandbox environment. Using 100% in-memory storage fallback.`, e);
    }

    return {
      get length(): number {
        if (realStorage) {
          try {
            return realStorage.length;
          } catch (e) {}
        }
        return memoryStore.length;
      },
      clear(): void {
        if (realStorage) {
          try {
            realStorage.clear();
          } catch (e) {}
        }
        memoryStore.clear();
      },
      getItem(key: string): string | null {
        if (realStorage) {
          try {
            const val = realStorage.getItem(key);
            if (val !== null) {
              // Populate memory cache for high performance
              memoryStore.setItem(key, val);
              return val;
            }
          } catch (e) {}
        }
        return memoryStore.getItem(key);
      },
      key(index: number): string | null {
        if (realStorage) {
          try {
            return realStorage.key(index);
          } catch (e) {}
        }
        return memoryStore.key(index);
      },
      removeItem(key: string): void {
        if (realStorage) {
          try {
            realStorage.removeItem(key);
          } catch (e) {}
        }
        memoryStore.removeItem(key);
      },
      setItem(key: string, value: string): void {
        // Direct mirror to memory first to ensure synchronicity and fallback reliability
        memoryStore.setItem(key, value);
        
        if (realStorage) {
          try {
            realStorage.setItem(key, value);
          } catch (e: any) {
            console.warn(
              `${type}.setItem failed for key "${key}" under sandbox/quota limits. Using in-memory state transparently.`, 
              e
            );
            // Suppress the QuotaExceededError or DOMException without throwing
          }
        }
      }
    };
  }

  // Definitively override the standard window API properties to use our safe, self-healing wraps
  try {
    const safeLocal = createSafeStorage('localStorage');
    Object.defineProperty(window, 'localStorage', {
      value: safeLocal,
      writable: true,
      configurable: true
    });
  } catch (e) {
    console.error("Failed to redefine localStorage:", e);
  }

  try {
    const safeSession = createSafeStorage('sessionStorage');
    Object.defineProperty(window, 'sessionStorage', {
      value: safeSession,
      writable: true,
      configurable: true
    });
  } catch (e) {
    console.error("Failed to redefine sessionStorage:", e);
  }
})();

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
  try {
    localStorage.setItem("nexora_pwa_installed", "false");
  } catch (err) {
    console.error("Failed to reset installation local storage:", err);
  }
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
  const msg = event.message || '';
  console.error('Global Error Captured:', msg, 'at', event.filename);
  
  if (
    msg.includes('quota') || 
    msg.includes('Quota') || 
    msg.includes('Storage') || 
    msg.includes('storage') || 
    msg.includes('exceeded') ||
    msg.includes('ResizeObserver') ||
    msg.includes('extension') ||
    msg.includes('Extension') ||
    msg.includes('dispatcher is null') ||
    msg.includes('useContext') ||
    msg.includes('Invalid hook call') ||
    !event.filename ||
    event.filename.includes('extension')
  ) {
    console.warn('Ignored transient or extension-related warning in global handler:', msg);
    return;
  }
  
  // Create beautiful fallback banner only for truly unhandled raw errors
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.zIndex = '999999';
  errDiv.style.background = '#FEF2F2';
  errDiv.style.color = '#991B1B';
  errDiv.style.borderBottom = '3px solid #EF4444';
  errDiv.style.padding = '12px 24px';
  errDiv.style.fontFamily = 'monospace';
  errDiv.style.fontSize = '12px';
  errDiv.style.width = '100%';
  errDiv.style.boxSizing = 'border-box';
  errDiv.textContent = 'System Note: ' + event.message + ' (Self-healing active, please refresh if needed)';
  document.body.appendChild(errDiv);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
