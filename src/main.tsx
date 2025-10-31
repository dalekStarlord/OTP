import React from 'react';
import ReactDOM from 'react-dom/client';
import AppEnhanced from './AppEnhanced';
import './styles.css';
import './i18n/config';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppEnhanced />
  </React.StrictMode>
);
