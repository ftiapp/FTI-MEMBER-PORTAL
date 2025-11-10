"use client";

import { useEffect, useRef } from 'react';

// Performance monitoring component
export default function PerformanceMonitor() {
  const metricsRef = useRef({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
  });

  useEffect(() => {
    // Only run in production and if browser supports Performance API
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
      return;
    }

    // Measure First Contentful Paint
    const measureFCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metricsRef.current.fcp = fcpEntry.startTime;
          console.log(`FCP: ${fcpEntry.startTime}ms`);
          
          // Send to analytics if needed
          if (window.gtag) {
            window.gtag('event', 'first_contentful_paint', {
              value: Math.round(fcpEntry.startTime),
              event_category: 'Web Vitals'
            });
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    };

    // Measure Largest Contentful Paint
    const measureLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metricsRef.current.lcp = lastEntry.startTime;
        console.log(`LCP: ${lastEntry.startTime}ms`);
        
        if (window.gtag) {
          window.gtag('event', 'largest_contentful_paint', {
            value: Math.round(lastEntry.startTime),
            event_category: 'Web Vitals'
          });
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    };

    // Measure First Input Delay
    const measureFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          metricsRef.current.fid = entry.processingStart - entry.startTime;
          console.log(`FID: ${metricsRef.current.fid}ms`);
          
          if (window.gtag) {
            window.gtag('event', 'first_input_delay', {
              value: Math.round(metricsRef.current.fid),
              event_category: 'Web Vitals'
            });
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    };

    // Measure Cumulative Layout Shift
    const measureCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        metricsRef.current.cls = clsValue;
        console.log(`CLS: ${clsValue}`);
        
        if (window.gtag) {
          window.gtag('event', 'cumulative_layout_shift', {
            value: Math.round(clsValue * 1000),
            event_category: 'Web Vitals'
          });
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    };

    // Memory usage monitoring
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    };

    // Start measurements
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();

    // Monitor memory usage every 30 seconds
    const memoryInterval = setInterval(measureMemory, 30000);

    // Log performance summary every 60 seconds
    const summaryInterval = setInterval(() => {
      console.log('Performance Summary:', metricsRef.current);
    }, 60000);

    return () => {
      clearInterval(memoryInterval);
      clearInterval(summaryInterval);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

// Hook for component-level performance tracking
export function usePerformanceTracking(componentName) {
  const renderStartTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - renderStartTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times in ${renderTime}ms`);
    }

    // Track slow renders (> 100ms)
    if (renderTime > 100) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  });

  return renderCount.current;
}

// Hook to track async operations
export function useAsyncPerformanceTracker(operationName) {
  return async (asyncFn) => {
    const startTime = performance.now();
    try {
      const result = await asyncFn();
      const duration = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${operationName} completed in ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };
}
