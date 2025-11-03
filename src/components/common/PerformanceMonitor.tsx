// Performance monitoring component for development
import React, { useState, useEffect } from 'react';
import { useMobileContext } from '../providers/mobile-provider';

interface PerformanceData {
  renderTime: number;
  loadTime: number;
  memoryUsage?: number;
  networkLatency?: number;
  fps?: number;
}

export function PerformanceMonitor() {
  const mobile = useMobileContext();
  const [showMonitor, setShowMonitor] = useState(false);
  const [perfData, setPerfData] = useState<PerformanceData>({
    renderTime: 0,
    loadTime: 0,
  });

  // Only show in development mode on mobile
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    const isMobile = mobile.isMobileDevice;
    setShowMonitor(isDev && isMobile);
  }, [mobile.isMobileDevice]);

  // Update performance data
  useEffect(() => {
    if (!showMonitor) return;

    const updatePerformance = () => {
      setPerfData({
        ...mobile.performanceMetrics,
        networkLatency: mobile.isSlowConnection ? 1000 : 100,
      });
    };

    const interval = setInterval(updatePerformance, 2000);
    return () => clearInterval(interval);
  }, [showMonitor, mobile]);

  // FPS monitoring
  useEffect(() => {
    if (!showMonitor) return;

    let frames = 0;
    let lastTime = performance.now();
    
    const countFrames = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setPerfData(prev => ({ ...prev, fps: frames }));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };
    
    requestAnimationFrame(countFrames);
  }, [showMonitor]);

  if (!showMonitor) return null;

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return '#22c55e'; // green
    if (value <= thresholds[1]) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="perf-monitor">
      <div className="text-xs space-y-1">
        <div>📱 Mobile: {mobile.performanceMode}</div>
        <div>🌐 Network: {mobile.networkType}</div>
        {perfData.memoryUsage && (
          <div style={{ color: getPerformanceColor(perfData.memoryUsage, [50, 100]) }}>
            🧠 Memory: {perfData.memoryUsage.toFixed(1)}MB
          </div>
        )}
        {perfData.fps && (
          <div style={{ color: getPerformanceColor(60 - perfData.fps, [10, 20]) }}>
            🎯 FPS: {perfData.fps}
          </div>
        )}
        <div style={{ color: getPerformanceColor(perfData.loadTime, [1000, 3000]) }}>
          ⚡ Load: {perfData.loadTime.toFixed(0)}ms
        </div>
        {mobile.isSlowConnection && <div>🐌 Slow Connection</div>}
        {!mobile.isOnline && <div>📵 Offline</div>}
      </div>
    </div>
  );
}

// Lightweight performance tracker for production
export function PerformanceTracker() {
  const mobile = useMobileContext();

  useEffect(() => {
    // Only track in production for analytics
    if (process.env.NODE_ENV !== 'production') return;

    const trackPerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          deviceType: mobile.isMobileDevice ? 'mobile' : 'desktop',
          performanceMode: mobile.performanceMode,
          connectionType: mobile.networkType,
        };

        // Send to analytics service
        console.log('Performance metrics:', metrics);
        
        // You can send this to your analytics service
        // analytics.track('performance_metrics', metrics);
      }
    };

    // Track after page load
    if (document.readyState === 'complete') {
      setTimeout(trackPerformance, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(trackPerformance, 1000);
      });
    }
  }, [mobile]);

  return null; // This component doesn't render anything
}

export default PerformanceMonitor;
