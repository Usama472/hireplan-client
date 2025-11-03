import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSmartLoading } from '@/utils/smart-loading';

// Modern React patterns for preventing unnecessary re-renders
export function useOptimizedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef(state);
  
  // Always keep ref in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Memoized setter that prevents unnecessary updates
  const setStateOptimized = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      
      // Prevent update if value hasn't changed (shallow comparison)
      if (nextValue === prev) return prev;
      
      // For objects/arrays, you might want deep comparison
      if (typeof nextValue === 'object' && typeof prev === 'object') {
        if (JSON.stringify(nextValue) === JSON.stringify(prev)) {
          return prev;
        }
      }
      
      return nextValue;
    });
  }, []);
  
  // Stable getter that doesn't cause re-renders
  const getState = useCallback(() => stateRef.current, []);
  
  return [state, setStateOptimized, getState] as const;
}

// Hook for preventing expensive calculations
export function useComputedValue<T, D extends readonly unknown[]>(
  computeFn: () => T,
  dependencies: D
): T {
  return useMemo(computeFn, dependencies);
}

// Hook for stable callbacks (prevents child re-renders)
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: readonly unknown[]
): T {
  return useCallback(callback, dependencies) as T;
}

// Hook for preventing layout shifts during async operations - DESKTOP SAFE
export function useAsyncOperation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wrapAsync } = useSmartLoading();
  
  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
      loadingKey?: string;
      element?: HTMLElement;
      showSpinner?: boolean;
    }
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      let result: T;
      
      // Use smart loading if element provided, otherwise just run operation
      if (options?.element) {
        result = await wrapAsync(
          options.loadingKey || 'async-operation',
          operation,
          options.element,
          { showSpinner: options.showSpinner }
        );
      } else {
        result = await operation();
      }
      
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [wrapAsync]);
  
  return { execute, isLoading, error, setError };
}
