// Enhanced mobile layout utilities to prevent flashing and layout shifts

export const MOBILE_BREAKPOINT = 768;

// Improved mobile detection with caching
let cachedIsMobile: boolean | null = null;

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  if (cachedIsMobile === null) {
    // Use multiple detection methods for accuracy
    const userAgent = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    const screenWidth = window.innerWidth < MOBILE_BREAKPOINT;
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Consider mobile if any condition is true, but prioritize screen width
    cachedIsMobile = screenWidth || (userAgent && touchDevice);
  }
  
  return cachedIsMobile;
};

// Reset cache when window resizes
export const resetMobileCache = (): void => {
  cachedIsMobile = null;
};

// Smooth transition manager for mobile layout changes
export class MobileLayoutManager {
  private static instance: MobileLayoutManager;
  private isTransitioning = false;
  
  static getInstance(): MobileLayoutManager {
    if (!MobileLayoutManager.instance) {
      MobileLayoutManager.instance = new MobileLayoutManager();
    }
    return MobileLayoutManager.instance;
  }
  
  // Prevent layout shifts during mobile detection - MINIMAL APPROACH
  public preventFlash(): void {
    if (typeof document === 'undefined') return;
    
    // Just ensure viewport meta exists
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
    
    // Don't add any CSS classes that could interfere with animations
  }
  
  // Handle smooth transitions between mobile/desktop layouts - SAFE APPROACH
  public transitionLayout(isMobile: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (this.isTransitioning) {
        resolve();
        return;
      }
      
      this.isTransitioning = true;
      
      if (typeof document !== 'undefined') {
        // Use body element instead of documentElement to avoid global effects
        const body = document.body;
        body.classList.add('layout-transitioning');
        body.setAttribute('data-mobile-layout', isMobile.toString());
        
        // Complete transition
        setTimeout(() => {
          body.classList.remove('layout-transitioning');
          this.isTransitioning = false;
          resolve();
        }, 150);
      } else {
        this.isTransitioning = false;
        resolve();
      }
    });
  }
}

// Enhanced localStorage for mobile devices
export const mobileLocalStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
      
      // Verify on mobile devices
      if (isMobileDevice()) {
        await new Promise(resolve => setTimeout(resolve, 50));
        const stored = localStorage.getItem(key);
        if (stored !== value) {
          console.warn(`Mobile localStorage verification failed for ${key}, retrying...`);
          localStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.error(`Failed to set localStorage ${key}:`, error);
      throw error;
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
      
      // Verify on mobile devices
      if (isMobileDevice()) {
        await new Promise(resolve => setTimeout(resolve, 25));
      }
    } catch (error) {
      console.error(`Failed to remove localStorage ${key}:`, error);
    }
  },
  
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get localStorage ${key}:`, error);
      return null;
    }
  }
};

// Initialize mobile detection on module load
if (typeof window !== 'undefined') {
  // Reset cache on resize
  window.addEventListener('resize', resetMobileCache);
  
  // Initialize layout manager
  MobileLayoutManager.getInstance().preventFlash();
}
