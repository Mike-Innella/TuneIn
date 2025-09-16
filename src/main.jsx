import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Filter out known external console noise in development
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';

    // Filter out known external issues that don't affect functionality
    const ignoredPatterns = [
      'Permissions-Policy header',
      'www-embed-player.js',
      'www-widgetapi.js',
      'net::ERR_BLOCKED_BY_CLIENT',
      'chrome-extension://',
      'Unchecked runtime.lastError'
    ];

    if (ignoredPatterns.some(pattern => message.includes(pattern))) {
      return; // Suppress these external errors
    }

    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
