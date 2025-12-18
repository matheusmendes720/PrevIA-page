'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent, useCallback } from 'react';

interface FastLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * FastLink - Optimized Link component with instant prefetching
 * Prefetches routes on hover/focus for faster navigation
 */
export default function FastLink({ 
  href, 
  children, 
  className = '', 
  prefetch = true,
  onClick 
}: FastLinkProps) {
  const router = useRouter();

  const handleMouseEnter = useCallback(() => {
    if (prefetch && href) {
      router.prefetch(href);
    }
  }, [href, prefetch, router]);

  const handleFocus = useCallback(() => {
    if (prefetch && href) {
      router.prefetch(href);
    }
  }, [href, prefetch, router]);

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
  }, [onClick]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onClick={handleClick}
      prefetch={false} // Disable Next.js default prefetch, we handle it manually
    >
      {children}
    </Link>
  );
}
