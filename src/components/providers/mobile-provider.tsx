// Mobile optimization provider
import React, { createContext, useContext } from 'react';
import { useMobileOptimizations, usePerformanceMonitor } from '@/hooks/use-mobile-optimizations';

interface MobileContextType {
  isOnline: boolean;
  isSlowConnection: boolean;
  networkType: string;
  sessionValid: boolean;
  performanceMode: 'high' | 'balanced' | 'low';
  backgrounded: boolean;
  isMobileDevice: boolean;
  isLowEndDevice: boolean;
  shouldReduceAnimations: boolean;
  shouldDeferNonCritical: boolean;
  getOptimizedRequestConfig: (baseConfig?: any) => any;
  shouldPreload: () => boolean;
  optimizeLoadingState: (key: string, isLoading: boolean) => void;
  cleanupResources: () => void;
  performanceMetrics: {
    renderTime: number;
    loadTime: number;
    memoryUsage?: number;
  };
}

const MobileContext = createContext<MobileContextType | null>(null);

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const optimizations = useMobileOptimizations();
  const performanceMetrics = usePerformanceMonitor();

  const value: MobileContextType = {
    ...optimizations,
    isMobileDevice: optimizations.isMobileDevice(),
    isLowEndDevice: optimizations.isLowEndDevice(),
    shouldReduceAnimations: optimizations.shouldReduceAnimations(),
    shouldDeferNonCritical: optimizations.shouldDeferNonCritical(),
    performanceMetrics,
  };

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobileContext(): MobileContextType {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobileContext must be used within a MobileProvider');
  }
  return context;
}

// HOC for components that need mobile optimization
export function withMobileOptimizations<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) {
  const componentName = displayName || Component.displayName || Component.name || 'Component';
  
  const ComponentWithMobileOptimizations = (props: P) => {
    const mobile = useMobileContext();

    // Apply performance optimizations based on device capabilities - SMARTER DETECTION
    React.useEffect(() => {
      // Apply optimizations to body element only, not documentElement
      const body = document.body;
      
      // Only apply low-performance mode on truly low-end devices
      if (mobile.isLowEndDevice && mobile.performanceMode === 'low') {
        body.classList.add('low-performance-mode');
      } else {
        body.classList.remove('low-performance-mode');
      }

      // Only reduce animations if user has motion sensitivity OR device is very slow
      const shouldReduceForPerformance = mobile.performanceMode === 'low' && mobile.isSlowConnection;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion || shouldReduceForPerformance) {
        body.classList.add('reduce-animations');  
      } else {
        body.classList.remove('reduce-animations');
      }
    }, [mobile.isLowEndDevice, mobile.performanceMode, mobile.isSlowConnection]);

    return <Component {...props} />;
  };

  ComponentWithMobileOptimizations.displayName = `withMobileOptimizations(${componentName})`;
  return ComponentWithMobileOptimizations;
}

// Hook for components to easily access mobile optimization features
export function useIsMobile() {
  const context = useContext(MobileContext);
  
  // Fallback detection if context not available
  if (!context) {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }
  
  return context.isMobileDevice;
}

export default MobileProvider;
