// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill fetch for Node.js environment
import 'whatwg-fetch';

// Setup MSW (Mock Service Worker) - only if available
let server = null;
try {
  const mswModule = require('./mocks/server');
  server = mswModule.server;
  
  // Establish API mocking before all tests
  beforeAll(() => {
    if (server) {
      server.listen({ onUnhandledRequest: 'warn' });
    }
  });

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => {
    if (server) {
      server.resetHandlers();
    }
  });

  // Clean up after the tests are finished.
  afterAll(() => {
    if (server) {
      server.close();
    }
  });
} catch (error) {
  console.warn('MSW not available, skipping API mocking:', error);
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

