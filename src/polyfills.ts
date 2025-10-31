// Safari polyfills for better compatibility

// Debug Safari loading issues
console.log('🔧 Safari polyfills loading...', {
  userAgent: navigator.userAgent,
  isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio
  }
});

// Polyfill for ResizeObserver (Safari < 13.1)
if (!window.ResizeObserver) {
  console.log('🔧 Adding ResizeObserver polyfill');
  window.ResizeObserver = class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      // Basic implementation - just call callback once
      setTimeout(() => callback([], this), 0);
    } 
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Polyfill for IntersectionObserver (Safari < 12.1)
if (!window.IntersectionObserver) {
  console.log('🔧 Adding IntersectionObserver polyfill');
  // @ts-ignore - Simple polyfill
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      // Basic implementation
      setTimeout(() => callback([], this as any), 0);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
  };
}

// Safari localStorage fix
try {
  localStorage.setItem('__test__', 'test');
  localStorage.removeItem('__test__');
} catch (e) {
  console.warn('🚨 localStorage not available, using memory storage');
  const memoryStorage: { [key: string]: string } = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => { memoryStorage[key] = value; },
      removeItem: (key: string) => { delete memoryStorage[key]; },
      clear: () => { Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]); },
      key: (index: number) => Object.keys(memoryStorage)[index] || null,
      get length() { return Object.keys(memoryStorage).length; }
    }
  });
}

// Fix for iOS Safari viewport height issues
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  console.log('📐 Viewport height updated:', { vh: `${vh}px`, innerHeight: window.innerHeight });
};

// Set initial viewport height
setViewportHeight();

// Update on resize and orientation change with debouncing
let resizeTimeout: number;
const debouncedSetViewportHeight = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(setViewportHeight, 100);
};

window.addEventListener('resize', debouncedSetViewportHeight);
window.addEventListener('orientationchange', () => {
  // Delay to ensure viewport has settled after orientation change
  setTimeout(setViewportHeight, 500);
});

// Fix for Safari window resize issues
window.addEventListener('resize', () => {
  // Force repaint to fix Safari rendering issues
  const body = document.body;
  body.style.display = 'none';
  body.offsetHeight; // Trigger reflow
  body.style.display = '';
});

// Fix for iOS Safari scroll bounce - DISABLED TO ALLOW SCROLLING
// This was preventing all scrolling on mobile
// document.addEventListener('touchmove', (e) => {
//   const target = e.target as HTMLElement;
//   const scrollable = target.closest('.overflow-auto, .overflow-y-auto, .overflow-x-auto');
//   
//   if (!scrollable) {
//     e.preventDefault();
//   }
// }, { passive: false });

// Fix for iOS Safari form input zoom
const preventZoom = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    target.style.fontSize = '16px';
  }
};

document.addEventListener('focusin', preventZoom);
document.addEventListener('focusout', (e) => {
  const target = e.target as HTMLInputElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    target.style.fontSize = '';
  }
});

// Export for TypeScript
export {};
