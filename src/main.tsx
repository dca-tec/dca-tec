import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and prevent Firestore internal assertion crash from breaking the app
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('INTERNAL ASSERTION FAILED') || 
    event.error?.message?.includes('INTERNAL ASSERTION FAILED') ||
    event.message?.includes('ca9') ||
    event.message?.includes('b815')
  ) {
    console.warn('Recovered from Firestore WebChannel internal assertion:', event.message || event.error?.message);
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('INTERNAL ASSERTION FAILED') ||
    event.reason?.message?.includes('ca9') ||
    event.reason?.message?.includes('b815')
  ) {
    console.warn('Recovered from unhandled Firestore WebChannel promise rejection:', event.reason?.message);
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
