import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/prevent-layout-shifts'
import './utils/data-loading'
import './polyfills'
import { PerformanceProvider } from './components/providers/performance-provider'
// Enhanced mobile optimizations
import './utils/network-manager'
import './utils/mobile-session-manager'

// Enhanced iOS/Safari detection
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

console.log('🚀 HirePlan initializing...', {
  isSafari,
  isIOS,
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  viewport: { width: window.innerWidth, height: window.innerHeight }
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('🚨 Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

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
    console.error('🚨 Root element #root not found in DOM');
    throw new Error('Root element not found');
  }
  
  console.log('✅ Root element found, creating React root...');
  const reactRoot = createRoot(root);
  
  console.log('✅ React root created, rendering app...');
  reactRoot.render(<App />);
  
  console.log('✅ React render called');
  
  // Clear timeout on successful render
  if (isSafari || isIOS) {
    setTimeout(() => {
      const rootElement = document.querySelector('#root');
      if (rootElement && rootElement.children.length > 0) {
        console.log('✅ React app loaded successfully on Safari/iOS');
        console.log('   Root children count:', rootElement.children.length);
      } else {
        console.error('🚨 React failed to render - root has no children');
      }
    }, 1000);
  }
} catch (error) {
  console.error('🚨 Failed to initialize React app:', error);
  console.error('Error stack:', (error as Error).stack);
  
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
