import React from 'react';

/**
 * Responsive breakpoints and utilities
 * Mobile-first approach
 */

export const breakpoints = {
  xs: 320,   // Extra small devices
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (laptops)
  xl: 1280,  // Extra large devices
  '2xl': 1536, // Ultra wide screens
};

/**
 * Media query helpers using mobile-first approach
 */
export const media = {
  xs: '@media (min-width: 320px)',
  sm: '@media (min-width: 640px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 1024px)',
  xl: '@media (min-width: 1280px)',
  '2xl': '@media (min-width: 1536px)',
  
  // Touch devices
  touch: '@media (hover: none) and (pointer: coarse)',
  
  // Landscape orientation
  landscape: '@media (orientation: landscape)',
  
  // Reduced motion
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  
  // Dark mode
  dark: '@media (prefers-color-scheme: dark)',
  light: '@media (prefers-color-scheme: light)',
};

/**
 * Custom hook for responsive state
 * Useful for conditional rendering based on screen size
 */
export function useResponsive() {
  const [size, setSize] = React.useState(() => {
    if (typeof window === 'undefined') return 'lg';
    
    const width = window.innerWidth;
    if (width < breakpoints.sm) return 'xs';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < breakpoints.xl) return 'lg';
    if (width < breakpoints['2xl']) return 'xl';
    return '2xl';
  });

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < breakpoints.sm) setSize('xs');
      else if (width < breakpoints.md) setSize('sm');
      else if (width < breakpoints.lg) setSize('md');
      else if (width < breakpoints.xl) setSize('lg');
      else if (width < breakpoints['2xl']) setSize('xl');
      else setSize('2xl');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    size,
    isXs: size === 'xs',
    isSm: size === 'sm',
    isMd: size === 'md',
    isLg: size === 'lg',
    isXl: size === 'xl',
    is2xl: size === '2xl',
    isMobile: ['xs', 'sm'].includes(size),
    isTablet: ['md'].includes(size),
    isDesktop: ['lg', 'xl', '2xl'].includes(size),
  };
}

/**
 * Performance optimization helpers
 */
export const performance = {
  // Debounce function for resize events
  debounce: (fn, delay = 300) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },

  // Throttle function for scroll events
  throttle: (fn, delay = 100) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  },

  // Intersection observer for lazy loading
  observeElement: (element, callback, options = {}) => {
    const defaults = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(callback, { ...defaults, ...options });
    if (element) observer.observe(element);
    return observer;
  },
};

/**
 * Touch detection utilities
 */
export const touch = {
  isTouchDevice: () => {
    return (
      typeof window !== 'undefined' &&
      (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0))
    );
  },

  handleTouchDown: (e) => {
    return e.touches[0];
  },

  handleTouchMove: (e) => {
    return e.touches[0];
  },

  handleTouchEnd: (e) => {
    return e.changedTouches[0];
  },
};
