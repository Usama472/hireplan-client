// Smart loading component that adapts to device capabilities
import React, { useRef, useEffect } from 'react';
import { useSmartLoading } from '@/utils/smart-loading';

interface SmartLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingKey?: string;
  showSpinner?: boolean;
  minDuration?: number;
  preventInteraction?: boolean;
  className?: string;
}

export function SmartLoader({
  isLoading,
  children,
  loadingKey = 'smart-loader',
  showSpinner,
  minDuration,
  preventInteraction = true,
  className,
}: SmartLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { startLoading, finishLoading } = useSmartLoading();
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    if (isLoading) {
      startLoading(loadingKey, containerRef.current, {
        showSpinner,
        minDuration,
        preventInteraction,
      });
    } else {
      finishLoading(loadingKey);
    }
  }, [isLoading, loadingKey, showSpinner, minDuration, preventInteraction, startLoading, finishLoading]);
  
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// HOC version for wrapping existing components
export function withSmartLoader<P extends object>(
  Component: React.ComponentType<P>,
  defaultOptions?: Partial<SmartLoaderProps>
) {
  return function SmartLoaderHOC(props: P & { isLoading?: boolean }) {
    const { isLoading, ...componentProps } = props;
    
    return (
      <SmartLoader isLoading={!!isLoading} {...defaultOptions}>
        <Component {...(componentProps as P)} />
      </SmartLoader>
    );
  };
}

export default SmartLoader;
