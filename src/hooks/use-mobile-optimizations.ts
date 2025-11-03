// Comprehensive mobile optimization hook
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNetworkState } from '../utils/network-manager';
import { mobileSessionManager } from '../utils/mobile-session-manager';
// Removed global DataLoadingManager import

interface MobileOptimizationState {
  isOnline: boolean;
  isSlowConnection: boolean;
  networkType: string;
  sessionValid: boolean;
  performanceMode: 'high' | 'balanced' | 'low';
  backgrounded: boolean;
}

export function useMobileOptimizations() {
  const networkState = useNetworkState();
  const [optimizationState, setOptimizationState] = useState<MobileOptimizationState>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    networkType: 'unknown',
    sessionValid: false,
    performanceMode: 'balanced',
    backgrounded: false,
  });

  const performanceModeRef = useRef<'high' | 'balanced' | 'low'>('balanced');
  const backgroundTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Performance mode detection based on device capabilities
  const detectPerformanceMode = useCallback((): 'high' | 'balanced' | 'low' => {
    const navigator = window.navigator as any;
    const memory = navigator.deviceMemory || 4; // Default to 4GB
    const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
    const connection = navigator.connection || {};
    
    // Low-end device detection
    if (memory <= 2 || cores <= 2 || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 'low';
    }
    
    // High-end device detection
    if (memory >= 8 && cores >= 8 && (connection.effectiveType === '4g' || connection.downlink > 10)) {
      return 'high';
    }
    
    return 'balanced';
  }, []);

  // Handle visibility changes (app backgrounding)
  const handleVisibilityChange = useCallback(() => {
    const isVisible = document.visibilityState === 'visible';
    
    if (!isVisible) {
      // App going to background
      setOptimizationState(prev => ({ ...prev, backgrounded: true }));
      
      // Reduce performance after being backgrounded for a while
      backgroundTimeoutRef.current = setTimeout(() => {
        performanceModeRef.current = 'low';
        setOptimizationState(prev => ({ ...prev, performanceMode: 'low' }));
      }, 30000); // 30 seconds
      
    } else {
      // App coming to foreground
      setOptimizationState(prev => ({ ...prev, backgrounded: false }));
      
      // Clear background timeout
      if (backgroundTimeoutRef.current) {
        clearTimeout(backgroundTimeoutRef.current);
        backgroundTimeoutRef.current = null;
      }
      
      // Restore performance mode
      const newMode = detectPerformanceMode();
      performanceModeRef.current = newMode;
      setOptimizationState(prev => ({ ...prev, performanceMode: newMode }));
      
      // Validate session when coming back
      mobileSessionManager.validateSession().then(isValid => {
        setOptimizationState(prev => ({ ...prev, sessionValid: isValid }));
      });
    }
  }, [detectPerformanceMode]);

  // Network state updates
  useEffect(() => {
    const isSlowConnection = 
      networkState.effectiveType === 'slow-2g' || 
      networkState.effectiveType === '2g' ||
      (networkState.downlink !== undefined && networkState.downlink < 1.5);

    setOptimizationState(prev => ({
      ...prev,
      isOnline: networkState.isOnline,
      isSlowConnection,
      networkType: networkState.effectiveType,
    }));

    // Adjust performance mode based on connection
    if (isSlowConnection && performanceModeRef.current !== 'low') {
      performanceModeRef.current = 'low';
      setOptimizationState(prev => ({ ...prev, performanceMode: 'low' }));
    }
  }, [networkState]);

  // Session validation
  useEffect(() => {
    mobileSessionManager.validateSession().then(isValid => {
      setOptimizationState(prev => ({ ...prev, sessionValid: isValid }));
    });

    // Listen for session events
    const handleSessionUpdated = () => {
      setOptimizationState(prev => ({ ...prev, sessionValid: true }));
    };

    const handleSessionCleared = () => {
      setOptimizationState(prev => ({ ...prev, sessionValid: false }));
    };

    window.addEventListener('sessionUpdated', handleSessionUpdated);
    window.addEventListener('sessionCleared', handleSessionCleared);

    return () => {
      window.removeEventListener('sessionUpdated', handleSessionUpdated);
      window.removeEventListener('sessionCleared', handleSessionCleared);
    };
  }, []);

  // Initialize visibility listeners
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (backgroundTimeoutRef.current) {
        clearTimeout(backgroundTimeoutRef.current);
      }
    };
  }, [handleVisibilityChange]);

  // Performance optimizations based on current state
  const getOptimizedRequestConfig = useCallback((baseConfig: any = {}) => {
    const config = { ...baseConfig };
    
    switch (optimizationState.performanceMode) {
      case 'low':
        config.timeout = 60000; // Longer timeout for low-end devices
        config.maxRetries = 1; // Fewer retries
        break;
      case 'high':
        config.timeout = 15000; // Shorter timeout for high-end devices
        config.maxRetries = 3; // More retries
        break;
      default: // balanced
        config.timeout = 30000;
        config.maxRetries = 2;
    }
    
    if (optimizationState.isSlowConnection) {
      config.timeout *= 2; // Double timeout on slow connections
    }
    
    return config;
  }, [optimizationState]);

  // Preload management
  const shouldPreload = useCallback(() => {
    return optimizationState.isOnline && 
           !optimizationState.isSlowConnection && 
           optimizationState.performanceMode !== 'low' &&
           !optimizationState.backgrounded;
  }, [optimizationState]);

  // Loading state optimization - NO GLOBAL EFFECTS
  const optimizeLoadingState = useCallback((key: string, isLoading: boolean, element?: HTMLElement) => {
    // Only operate on provided elements to avoid global effects
    if (isLoading && element) {
      element.classList.add('optimized-loading');
    } else if (element) {
      element.classList.remove('optimized-loading');
    }
  }, []);

  // Memory cleanup helper
  const cleanupResources = useCallback(() => {
    // Clear unnecessary caches on low-end devices
    if (optimizationState.performanceMode === 'low') {
      // Clear image caches, reduce stored data, etc.
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('images') || name.includes('assets')) {
              caches.delete(name);
            }
          });
        });
      }
    }
  }, [optimizationState.performanceMode]);

  // Auto cleanup when memory is low
  useEffect(() => {
    if (optimizationState.performanceMode === 'low') {
      const timeout = setTimeout(cleanupResources, 5000);
      return () => clearTimeout(timeout);
    }
  }, [optimizationState.performanceMode, cleanupResources]);

  return {
    // State
    ...optimizationState,
    
    // Helpers
    getOptimizedRequestConfig,
    shouldPreload,
    optimizeLoadingState,
    cleanupResources,
    
    // Utilities
    isMobileDevice: () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    isLowEndDevice: () => optimizationState.performanceMode === 'low',
    shouldReduceAnimations: () => optimizationState.performanceMode === 'low' || optimizationState.isSlowConnection,
    shouldDeferNonCritical: () => optimizationState.isSlowConnection || optimizationState.backgrounded,
  };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<{
    renderTime: number;
    loadTime: number;
    memoryUsage?: number;
  }>({
    renderTime: 0,
    loadTime: 0,
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor initial load
    const handleLoad = () => {
      setMetrics(prev => ({
        ...prev,
        loadTime: performance.now() - startTime,
      }));
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Monitor memory usage if available
    const updateMemoryUsage = () => {
      const memory = (performance as any).memory;
      if (memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    };

    const memoryInterval = setInterval(updateMemoryUsage, 10000); // Every 10 seconds

    return () => {
      window.removeEventListener('load', handleLoad);
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
}
