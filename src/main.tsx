import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './polyfills'

// Safari loading timeout fallback
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isSafari || isIOS) {
  console.log('🍎 Safari/iOS detected - adding loading timeout protection');
  
  // Set a timeout to detect if React fails to load
  const loadingTimeout = setTimeout(() => {
    console.error('🚨 App failed to load within timeout - showing fallback');
    document.body.innerHTML = `
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: center; 
        min-height: 100vh; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <div>
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">HirePlan</h1>
          <p style="margin-bottom: 2rem;">Loading issue detected on Safari/iOS</p>
          <button onclick="window.location.reload()" style="
            background: rgba(255,255,255,0.2);
            border: 2px solid white;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          ">Refresh Page</button>
        </div>
      </div>
    `;
  }, 10000); // 10 second timeout

  // Clear timeout if app loads successfully
  window.addEventListener('load', () => {
    clearTimeout(loadingTimeout);
  });
}

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }
  
  createRoot(root).render(<App />);
  
  // Clear timeout on successful render
  if (isSafari || isIOS) {
    setTimeout(() => {
      if (document.querySelector('[data-reactroot], [data-react-root]') || 
          document.querySelector('#root').children.length > 0) {
        console.log('✅ React app loaded successfully on Safari/iOS');
      }
    }, 1000);
  }
} catch (error) {
  console.error('🚨 Failed to initialize React app:', error);
  
  // Show fallback UI
  document.body.innerHTML = `
    <div style="
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      background: #f5f5f5;
      color: #333;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      text-align: center;
      padding: 2rem;
    ">
      <div>
        <h1 style="color: #e74c3c; margin-bottom: 1rem;">Loading Error</h1>
        <p style="margin-bottom: 2rem;">Failed to load HirePlan. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" style="
          background: #3498db;
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
        ">Refresh Page</button>
      </div>
    </div>
  `;
}
