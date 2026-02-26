import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// Auto-register service worker; refresh prompt handled silently (autoUpdate)
registerSW({ onNeedRefresh() {}, onOfflineReady() {} });

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
