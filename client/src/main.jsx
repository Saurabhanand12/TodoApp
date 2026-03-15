import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics';
import './index.css'
import App from './App.jsx'

// ── Global Error Catching ───────────────────────────────────
window.onerror = (msg, url, line, col, error) => {
  console.error('GLOBAL ERROR:', { msg, url, line, col, error });
  // Force a visible error if our React app hasn't mounted
  const rootDiv = document.getElementById('root');
  if (rootDiv && !rootDiv.innerHTML.trim()) {
    rootDiv.innerHTML = `
      <div style="padding: 20px; background: #800; color: white; font-family: sans-serif;">
        <h1 style="margin:0">App Launch Failed</h1>
        <p style="opacity:0.8">${msg}</p>
        <button onclick="window.location.reload()" style="background:white; color:#800; border:none; padding:8px 16px; border-radius:4px; font-weight:bold; cursor:pointer">Reload</button>
      </div>
    `;
  }
};

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
