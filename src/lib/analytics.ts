'use client';

interface AnalyticsEntry {
  name: string;
  payload: Record<string, unknown>;
  ts: number;
}

declare global {
  interface Window {
    __NC_ANALYTICS__?: AnalyticsEntry[];
  }
}

export function trackEvent(name: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const entry: AnalyticsEntry = {
    name,
    payload,
    ts: Date.now(),
  };

  if (!Array.isArray(window.__NC_ANALYTICS__)) {
    window.__NC_ANALYTICS__ = [];
  }

  window.__NC_ANALYTICS__!.push(entry);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', name, payload);
  }
}


