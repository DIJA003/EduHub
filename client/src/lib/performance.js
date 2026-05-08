/**
 * Performance monitoring and optimization utilities
 */

/**
 * Measure component render time in development
 */
export function measurePerformance(componentName, fn) {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    console.log(`[Performance] ${componentName} took ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  }
  return fn();
}

/**
 * Debounce function for expensive operations
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for scroll/resize handlers
 */
export function throttle(fn, delay = 100) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Request idle callback with fallback
 */
export function scheduleIdleTask(callback) {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback);
  }
  return setTimeout(callback, 1);
}

/**
 * Report Core Web Vitals
 */
export function reportWebVitals(metric) {
  if (process.env.NODE_ENV === 'development') {
    const { name, value, rating } = metric;
    console.log(`[Web Vitals] ${name}: ${value.toFixed(0)}ms (${rating})`);
  }
}

/**
 * Lazy load images with blur-up effect
 */
export function createImageLoadObserver(callback) {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        
        if (src) {
          const image = new Image();
          image.onload = () => {
            img.src = src;
            img.classList.remove('blur');
            observer.unobserve(img);
            callback && callback(img);
          };
          image.src = src;
        }
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1,
  });
}

/**
 * Prefetch resources
 */
export function prefetchResource(url, type = 'fetch') {
  if (!('requestIdleCallback' in window)) return;

  requestIdleCallback(() => {
    const link = document.createElement('link');
    link.rel = type === 'style' ? 'prefetch' : 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Batch DOM updates
 */
export function batchDOMUpdates(updates) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Memory leak prevention: cleanup helper
 */
export function createCleanupManager() {
  const cleanups = [];

  return {
    add: (fn) => cleanups.push(fn),
    cleanup: () => {
      cleanups.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
      cleanups.length = 0;
    },
  };
}

/**
 * Connection quality detection
 */
export function getConnectionQuality() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType, // 'slow-2g', '2g', '3g', '4g'
      downlink: connection.downlink, // Mbps
      rtt: connection.rtt, // ms
      saveData: connection.saveData,
    };
  }
  return null;
}

/**
 * Adaptive loading based on connection
 */
export function shouldReduceAnimation() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return ['slow-2g', '2g'].includes(connection.effectiveType);
  }
  return false;
}

export function shouldLoadHighQuality() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return connection.effectiveType === '4g' && !connection.saveData;
  }
  return true;
}
