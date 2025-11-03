// Scoped data loading manager - NO GLOBAL DOM MANIPULATION
export class DataLoadingManager {
  private static activeLoaders = new Map<string, { element: HTMLElement; timestamp: number }>();
  private static loadingTimeouts = new Map<string, NodeJS.Timeout>();
  
  // Device-specific minimum loading times
  private static getMinLoadingTime(): number {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSlowConnection = (navigator as any).connection?.effectiveType === '2g' || 
                            (navigator as any).connection?.effectiveType === 'slow-2g';
    
    if (!isMobile) return 0; // No artificial delay on desktop
    if (isSlowConnection) return 150; // Shorter delay even on slow mobile
    return 100; // Much shorter delay for normal mobile
  }
  
  static startLoading(key: string, element?: HTMLElement) {
    // REQUIRE explicit element - no global fallbacks
    if (!element) {
      console.warn(`⚠️ DataLoadingManager: No element provided for ${key}. Skipping to prevent global impact.`);
      return;
    }
    
    // Clear any pending timeout for this key
    const existingTimeout = this.loadingTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.loadingTimeouts.delete(key);
    }
    
    const timestamp = Date.now();
    this.activeLoaders.set(key, { element, timestamp });
    
    // ONLY affect the specific element - NO GLOBAL CLASSES
    element.classList.add('loading-in-progress');
    element.setAttribute('data-loading-key', key);
    
    console.log(`🔄 Scoped loading started: ${key} on element`);
  }
  
  static finishLoading(key: string, element?: HTMLElement) {
    const loader = this.activeLoaders.get(key);
    if (!loader) {
      return; // Already finished or never started
    }
    
    const targetElement = element || loader.element;
    const elapsed = Date.now() - loader.timestamp;
    const minLoadingTime = this.getMinLoadingTime();
    const remainingTime = Math.max(0, minLoadingTime - elapsed);
    
    // Ensure minimum loading time only if needed (mobile + slow)
    const timeout = setTimeout(() => {
      this.activeLoaders.delete(key);
      this.loadingTimeouts.delete(key);
      
      // ONLY remove from specific element
      targetElement.classList.remove('loading-in-progress');
      targetElement.removeAttribute('data-loading-key');
      
      console.log(`✅ Scoped loading finished: ${key}`);
    }, remainingTime);
    
    this.loadingTimeouts.set(key, timeout);
  }
  
  static async wrapAsyncOperation<T>(
    key: string,
    asyncFn: () => Promise<T>,
    element?: HTMLElement
  ): Promise<T> {
    this.startLoading(key, element);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      this.finishLoading(key, element);
    }
  }
}

// React hook for easy integration
export function useDataLoading() {
  const startLoading = (key: string, element?: HTMLElement) => {
    DataLoadingManager.startLoading(key, element);
  };
  
  const finishLoading = (key: string, element?: HTMLElement) => {
    DataLoadingManager.finishLoading(key, element);
  };
  
  const wrapAsync = async <T>(
    key: string,
    asyncFn: () => Promise<T>,
    element?: HTMLElement
  ): Promise<T> => {
    return DataLoadingManager.wrapAsyncOperation(key, asyncFn, element);
  };
  
  return { startLoading, finishLoading, wrapAsync };
}
