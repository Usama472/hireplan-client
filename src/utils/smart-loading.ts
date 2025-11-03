// Smart loading system that adapts to device capabilities
// NO GLOBAL DOM MANIPULATION - DESKTOP SAFE

interface LoadingConfig {
  element: HTMLElement;
  showSpinner?: boolean;
  minDuration?: number;
  maxDuration?: number;
  preventInteraction?: boolean;
}

interface DeviceCapabilities {
  isMobile: boolean;
  isLowEnd: boolean;
  connectionSpeed: 'fast' | 'slow' | 'offline';
  prefersReducedMotion: boolean;
}

class SmartLoadingManager {
  private static activeLoaders = new Map<string, {
    element: HTMLElement;
    config: LoadingConfig;
    startTime: number;
    cleanup: () => void;
  }>();

  private static getDeviceCapabilities(): DeviceCapabilities {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const connection = (navigator as any).connection;
    
    // Detect low-end devices
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isLowEnd = memory <= 2 || cores <= 2;
    
    // Connection speed
    let connectionSpeed: 'fast' | 'slow' | 'offline' = 'fast';
    if (!navigator.onLine) {
      connectionSpeed = 'offline';
    } else if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        connectionSpeed = 'slow';
      }
    }
    
    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    return { isMobile, isLowEnd, connectionSpeed, prefersReducedMotion };
  }

  private static getOptimalConfig(userConfig: LoadingConfig): LoadingConfig {
    const capabilities = this.getDeviceCapabilities();
    const config = { ...userConfig };
    
    // Adjust for device capabilities
    if (!capabilities.isMobile) {
      // Desktop: No artificial delays, instant feedback
      config.minDuration = 0;
      config.showSpinner = userConfig.showSpinner ?? true;
    } else if (capabilities.isLowEnd) {
      // Low-end mobile: Minimal loading indicators
      config.minDuration = userConfig.minDuration ?? 50;
      config.showSpinner = userConfig.showSpinner ?? false; // No spinner on low-end
    } else {
      // Normal mobile: Smooth loading experience
      config.minDuration = userConfig.minDuration ?? 100;
      config.showSpinner = userConfig.showSpinner ?? true;
    }
    
    // Respect reduced motion preference
    if (capabilities.prefersReducedMotion) {
      config.showSpinner = false;
    }
    
    return config;
  }

  private static applyLoadingState(element: HTMLElement, config: LoadingConfig): () => void {
    // Store original state
    const originalPointerEvents = element.style.pointerEvents;
    const originalPosition = element.style.position;
    const originalOverflow = element.style.overflow;
    
    // Apply loading state
    if (config.preventInteraction) {
      element.style.pointerEvents = 'none';
    }
    
    element.classList.add('smart-loading');
    element.setAttribute('aria-busy', 'true');
    
    if (config.showSpinner) {
      element.classList.add('smart-loading-spinner');
    }
    
    // Return cleanup function
    return () => {
      element.classList.remove('smart-loading', 'smart-loading-spinner');
      element.removeAttribute('aria-busy');
      element.style.pointerEvents = originalPointerEvents;
      element.style.position = originalPosition;
      element.style.overflow = originalOverflow;
    };
  }

  public static startLoading(key: string, config: LoadingConfig): void {
    // Validate required element
    if (!config.element) {
      console.warn(`SmartLoadingManager: No element provided for ${key}`);
      return;
    }
    
    // Clean up existing loading state
    this.finishLoading(key);
    
    const optimizedConfig = this.getOptimalConfig(config);
    const cleanup = this.applyLoadingState(config.element, optimizedConfig);
    
    this.activeLoaders.set(key, {
      element: config.element,
      config: optimizedConfig,
      startTime: Date.now(),
      cleanup,
    });
    
    console.log(`🔄 Smart loading started: ${key}`);
  }

  public static finishLoading(key: string): void {
    const loader = this.activeLoaders.get(key);
    if (!loader) return;
    
    const elapsed = Date.now() - loader.startTime;
    const minDuration = loader.config.minDuration || 0;
    const remainingTime = Math.max(0, minDuration - elapsed);
    
    if (remainingTime > 0) {
      setTimeout(() => {
        loader.cleanup();
        this.activeLoaders.delete(key);
        console.log(`✅ Smart loading finished: ${key}`);
      }, remainingTime);
    } else {
      loader.cleanup();
      this.activeLoaders.delete(key);
      console.log(`✅ Smart loading finished: ${key}`);
    }
  }

  public static async wrapAsyncOperation<T>(
    key: string,
    asyncFn: () => Promise<T>,
    config: LoadingConfig
  ): Promise<T> {
    this.startLoading(key, config);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      this.finishLoading(key);
    }
  }

  // Cleanup all active loaders (for app unmount/refresh)
  public static cleanup(): void {
    for (const [key, loader] of this.activeLoaders) {
      loader.cleanup();
    }
    this.activeLoaders.clear();
  }
}

// React hook for smart loading
export function useSmartLoading() {
  const startLoading = (key: string, element: HTMLElement, options?: Partial<LoadingConfig>) => {
    SmartLoadingManager.startLoading(key, { element, ...options });
  };
  
  const finishLoading = (key: string) => {
    SmartLoadingManager.finishLoading(key);
  };
  
  const wrapAsync = async <T>(
    key: string,
    asyncFn: () => Promise<T>,
    element: HTMLElement,
    options?: Partial<LoadingConfig>
  ): Promise<T> => {
    return SmartLoadingManager.wrapAsyncOperation(key, asyncFn, { element, ...options });
  };
  
  return { startLoading, finishLoading, wrapAsync };
}

// CSS classes for styling (add to your CSS)
export const SMART_LOADING_CSS = `
.smart-loading {
  position: relative;
  overflow: hidden;
}

.smart-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(1px);
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  animation: fadeIn 0.2s ease forwards;
}

.smart-loading-spinner::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: smartSpin 1s linear infinite;
  z-index: 1001;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

@keyframes smartSpin {
  to { transform: rotate(360deg); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .smart-loading-spinner::after {
    animation: none;
    border-top-color: #3b82f6;
  }
}
`;

export default SmartLoadingManager;
