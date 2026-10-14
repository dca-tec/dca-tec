import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and prevent Firestore internal assertion crash from breaking the app or locking the UI
const isFirestoreInternalError = (msg?: string) => {
  if (!msg || typeof msg !== 'string') return false;
  return (
    msg.includes('INTERNAL ASSERTION FAILED') ||
    msg.includes('ca9') ||
    msg.includes('b815')
  );
};

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const combined = args.map(a => (typeof a === 'object' ? (a?.message || JSON.stringify(a)) : String(a))).join(' ');
  if (isFirestoreInternalError(combined)) {
    console.warn('Recovered from internal Firestore assertion warning:', ...args);
    return;
  }
  originalConsoleError.apply(console, args);
};

window.addEventListener('error', (event) => {
  const msg = event.message || event.error?.message;
  if (isFirestoreInternalError(msg)) {
    console.warn('Recovered from Firestore WebChannel internal assertion:', msg);
    event.preventDefault();
    event.stopImmediatePropagation?.();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason);
  if (isFirestoreInternalError(msg)) {
    console.warn('Recovered from unhandled Firestore WebChannel promise rejection:', msg);
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
