// Enhanced network manager for mobile reliability
import React from 'react'

interface NetworkState {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink?: number;
  rtt?: number;
}

class NetworkManager {
  private static instance: NetworkManager;
  private listeners: ((state: NetworkState) => void)[] = [];
  private currentState: NetworkState;
  private retryQueue: Map<string, () => Promise<any>> = new Map();

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  constructor() {
    this.currentState = this.getInitialNetworkState();
    this.initializeListeners();
  }

  private getInitialNetworkState(): NetworkState {
    const navigator = window.navigator as any;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    };
  }

  private initializeListeners(): void {
    // Online/offline detection
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);

    // Connection quality monitoring
    const navigator = window.navigator as any;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', this.handleConnectionChange);
    }

    // Visibility change for background/foreground detection
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleOnlineStatusChange = (): void => {
    const wasOnline = this.currentState.isOnline;
    this.currentState.isOnline = navigator.onLine;
    
    console.log(`📡 Network status changed: ${wasOnline ? 'online' : 'offline'} → ${this.currentState.isOnline ? 'online' : 'offline'}`);
    
    if (this.currentState.isOnline && !wasOnline) {
      // Back online - process retry queue
      this.processRetryQueue();
    }
    
    this.notifyListeners();
  };

  private handleConnectionChange = (): void => {
    const navigator = window.navigator as any;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      this.currentState.connectionType = connection.type || 'unknown';
      this.currentState.effectiveType = connection.effectiveType || '4g';
      this.currentState.downlink = connection.downlink;
      this.currentState.rtt = connection.rtt;
      
      console.log('📡 Connection quality changed:', this.currentState);
      this.notifyListeners();
    }
  };

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      // App came back to foreground - check network status
      setTimeout(() => {
        this.handleOnlineStatusChange();
      }, 100);
    }
  };

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  private async processRetryQueue(): Promise<void> {
    const retryPromises = Array.from(this.retryQueue.entries()).map(async ([key, retryFn]) => {
      try {
        await retryFn();
        this.retryQueue.delete(key);
        console.log(`✅ Retry successful for ${key}`);
      } catch (error) {
        console.warn(`❌ Retry failed for ${key}:`, error);
      }
    });

    await Promise.allSettled(retryPromises);
  }

  // Public API
  public getNetworkState(): NetworkState {
    return { ...this.currentState };
  }

  public addListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public queueRetry(key: string, retryFn: () => Promise<any>): void {
    this.retryQueue.set(key, retryFn);
  }

  public isSlowConnection(): boolean {
    return this.currentState.effectiveType === 'slow-2g' || 
           this.currentState.effectiveType === '2g' ||
           (this.currentState.downlink !== undefined && this.currentState.downlink < 1.5);
  }

  public getOptimalTimeout(): number {
    if (this.isSlowConnection()) {
      return 60000; // 60 seconds for slow connections
    }
    return 30000; // 30 seconds for normal connections
  }

  public shouldRetry(error: any): boolean {
    if (!this.currentState.isOnline) {
      return false; // Don't retry when offline
    }

    const status = error.response?.status;
    // Retry on network errors, timeouts, and 5xx errors
    return !status || status >= 500 || error.code === 'ECONNABORTED';
  }
}

// Export singleton instance
export const networkManager = NetworkManager.getInstance();

// React hook for network state
export function useNetworkState() {
  const [networkState, setNetworkState] = React.useState<NetworkState>(
    networkManager.getNetworkState()
  );

  React.useEffect(() => {
    return networkManager.addListener(setNetworkState);
  }, []);

  return networkState;
}

// Enhanced fetch with retry logic
export async function enhancedFetch<T>(
  fetchFn: () => Promise<T>,
  options: {
    key?: string;
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const { key, maxRetries = 3, retryDelay = 1000 } = options;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fetchFn();
      return result;
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        // Final attempt failed
        if (key && !networkManager.getNetworkState().isOnline) {
          // Queue for retry when back online
          networkManager.queueRetry(key, fetchFn);
        }
        throw error;
      }

      if (!networkManager.shouldRetry(error)) {
        throw error;
      }

      // Wait before retry with exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      console.log(`🔄 Retrying ${key || 'request'} in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Mobile-friendly localStorage wrapper
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage ${key}:`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<boolean> => {
    try {
      localStorage.setItem(key, value);
      
      // Verify storage on mobile
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        await new Promise(resolve => setTimeout(resolve, 10));
        const stored = localStorage.getItem(key);
        if (stored !== value) {
          console.warn(`Storage verification failed for ${key}, retrying...`);
          localStorage.setItem(key, value);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to set localStorage ${key}:`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove localStorage ${key}:`, error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }
};

export default NetworkManager;
