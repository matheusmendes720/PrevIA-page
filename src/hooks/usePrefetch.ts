'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to prefetch routes on hover or when component mounts
 * Improves navigation performance by preloading pages
 */
export function usePrefetch(routes: string[] = [], trigger: 'hover' | 'mount' | 'both' = 'hover') {
  const router = useRouter();
  const prefetchedRoutes = useRef(new Set<string>());

  useEffect(() => {
    if (trigger === 'mount' || trigger === 'both') {
      // Prefetch all routes on mount with a delay
      const timer = setTimeout(() => {
        routes.forEach(route => {
          if (!prefetchedRoutes.current.has(route)) {
            router.prefetch(route);
            prefetchedRoutes.current.add(route);
          }
        });
      }, 500); // Small delay to avoid blocking initial render
      
      return () => clearTimeout(timer);
    }
  }, [routes, router, trigger]);

  const handleMouseEnter = useCallback((route: string) => {
    if ((trigger === 'hover' || trigger === 'both') && !prefetchedRoutes.current.has(route)) {
      router.prefetch(route);
      prefetchedRoutes.current.add(route);
    }
  }, [trigger, router]);

  const prefetchRoute = useCallback((route: string) => {
    if (!prefetchedRoutes.current.has(route)) {
      router.prefetch(route);
      prefetchedRoutes.current.add(route);
    }
  }, [router]);

  return { handleMouseEnter, prefetchRoute };
}

/**
 * Hook to prefetch feature pages when sidebar is visible
 */
export function usePrefetchFeatures() {
  const featureRoutes = [
    '/features/temporal',
    '/features/climate',
    '/features/economic',
    '/features/5g',
    '/features/lead-time',
    '/features/sla',
    '/features/hierarchical',
    '/features/categorical',
    '/features/business',
    '/features/towers',
  ];

  usePrefetch(featureRoutes, 'mount');
}

/**
 * Hook to prefetch main pages
 */
export function usePrefetchMainPages() {
  const mainRoutes = [
    '/main',
    '/',
    '/ai-assistant',
  ];

  usePrefetch(mainRoutes, 'mount');
}

/**
 * Hook for smart prefetching based on user behavior
 * Prefetches likely next routes based on current route
 */
export function useSmartPrefetch(currentRoute: string) {
  const router = useRouter();
  
  useEffect(() => {
    const prefetchMap: Record<string, string[]> = {
      '/': ['/main', '/features/climate', '/features/5g'],
      '/main': ['/features/temporal', '/features/climate', '/features/business'],
      '/features/climate': ['/features/temporal', '/features/towers', '/main'],
      '/features/5g': ['/features/towers', '/features/business', '/main'],
      '/features/temporal': ['/features/lead-time', '/features/climate', '/main'],
      '/features/business': ['/features/economic', '/features/5g', '/main'],
    };

    const routesToPrefetch = prefetchMap[currentRoute] || [];
    
    if (routesToPrefetch.length > 0) {
      const timer = setTimeout(() => {
        routesToPrefetch.forEach(route => {
          router.prefetch(route);
        });
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentRoute, router]);
}
