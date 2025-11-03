import React, { createContext, useContext, useEffect, useRef } from 'react';

interface PerformanceContextType {
  markStart: (name: string) => void;
  markEnd: (name: string) => void;
  measure: (name: string, startMark: string, endMark: string) => void;
  getMetrics: () => PerformanceEntry[];
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const metricsRef = useRef<PerformanceEntry[]>([]);

  const markStart = (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  };

  const markEnd = (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-end`);
    }
  };

  const measure = (name: string, startMark: string, endMark: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name);
        metricsRef.current.push(...entries);
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error);
      }
    }
  };

  const getMetrics = () => metricsRef.current;

  // Auto-measure component render times
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        // Track DOM mutations that might cause layout shifts
        if (process.env.NODE_ENV === 'development') {
          console.debug('DOM mutation detected - potential layout shift');
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, []);

  const value: PerformanceContextType = {
    markStart,
    markEnd,
    measure,
    getMetrics,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

// HOC for measuring component render time
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) {
  const componentName = displayName || Component.displayName || Component.name || 'Component';
  
  const ComponentWithTracking = (props: P) => {
    const { markStart, markEnd, measure } = usePerformance();

    useEffect(() => {
      markStart(componentName);
      return () => {
        markEnd(componentName);
        measure(`${componentName}-render`, `${componentName}-start`, `${componentName}-end`);
      };
    });

    return <Component {...props} />;
  };

  ComponentWithTracking.displayName = `withPerformanceTracking(${componentName})`;
  return ComponentWithTracking;
}
