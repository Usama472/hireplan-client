// Safari polyfills for better compatibility

// Polyfill for ResizeObserver (Safari < 13.1)
if (!window.ResizeObserver) {
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
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      // Basic implementation
      setTimeout(() => callback([], this), 0);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
  };
}

// Fix for iOS Safari viewport height issues
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Set initial viewport height
setViewportHeight();

// Update on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

// Fix for iOS Safari scroll bounce
document.addEventListener('touchmove', (e) => {
  const target = e.target as HTMLElement;
  const scrollable = target.closest('.overflow-auto, .overflow-y-auto, .overflow-x-auto');
  
  if (!scrollable) {
    e.preventDefault();
  }
}, { passive: false });

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
