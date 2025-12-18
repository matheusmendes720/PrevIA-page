/**
 * Performance Optimizations
 * LOD system, caching, throttling, and web worker utilities
 */

/**
 * Level of Detail (LOD) Manager
 * Adjusts rendering detail based on zoom level
 */
export class LODManager {
  private zoomLevels = {
    veryLow: { zoom: [1, 3], maxPoints: 100, simplification: 0.9 },
    low: { zoom: [4, 6], maxPoints: 500, simplification: 0.7 },
    medium: { zoom: [7, 9], maxPoints: 2000, simplification: 0.5 },
    high: { zoom: [10, 12], maxPoints: 5000, simplification: 0.3 },
    veryHigh: { zoom: [13, 19], maxPoints: 20000, simplification: 0 }
  };

  getLODConfig(zoom: number) {
    for (const [level, config] of Object.entries(this.zoomLevels)) {
      if (zoom >= config.zoom[0] && zoom <= config.zoom[1]) {
        return { level, ...config };
      }
    }
    return this.zoomLevels.medium;
  }

  shouldRenderPoint(index: number, totalPoints: number, zoom: number): boolean {
    const config = this.getLODConfig(zoom);
    if (totalPoints <= config.maxPoints) return true;
    
    // Sample points evenly
    const sampleRate = Math.ceil(totalPoints / config.maxPoints);
    return index % sampleRate === 0;
  }

  getSimplificationFactor(zoom: number): number {
    return this.getLODConfig(zoom).simplification;
  }
}

/**
 * Viewport culling - only render visible items
 */
export function isInViewport(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number },
  padding: number = 0.1
): boolean {
  return (
    lat >= bounds.south - padding &&
    lat <= bounds.north + padding &&
    lng >= bounds.west - padding &&
    lng <= bounds.east + padding
  );
}

/**
 * Throttle function - limit execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function - delay execution until quiet period
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Request Animation Frame throttle (60fps max)
 */
export function rafThrottle(callback: () => void): () => void {
  let rafId: number | null = null;
  let lastTime = 0;
  const fps = 60;
  const interval = 1000 / fps;

  return function() {
    const now = Date.now();
    
    if (now - lastTime < interval) {
      return;
    }
    
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    rafId = requestAnimationFrame(() => {
      lastTime = now;
      callback();
      rafId = null;
    });
  };
}

/**
 * Memoization cache for expensive calculations
 */
export class CalculationCache<K, V> {
  private cache = new Map<string, { value: V; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs: number = 60000) { // Default 1 minute TTL
    this.ttl = ttlMs;
  }

  get(key: K): V | null {
    const keyStr = JSON.stringify(key);
    const cached = this.cache.get(keyStr);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(keyStr);
      return null;
    }
    
    return cached.value;
  }

  set(key: K, value: V): void {
    const keyStr = JSON.stringify(key);
    this.cache.set(keyStr, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Lazy loader for heavy data
 */
export class LazyDataLoader<T> {
  private data: T[] = [];
  private loadedChunks = new Set<number>();
  private chunkSize: number;

  constructor(chunkSize: number = 100) {
    this.chunkSize = chunkSize;
  }

  setData(data: T[]): void {
    this.data = data;
    this.loadedChunks.clear();
  }

  getChunk(chunkIndex: number): T[] {
    const start = chunkIndex * this.chunkSize;
    const end = Math.min(start + this.chunkSize, this.data.length);
    
    this.loadedChunks.add(chunkIndex);
    
    return this.data.slice(start, end);
  }

  getChunksForViewport(
    visibleIndices: number[]
  ): T[] {
    const chunks: T[] = [];
    const chunkIndices = new Set<number>();
    
    // Determine which chunks are needed
    visibleIndices.forEach(idx => {
      chunkIndices.add(Math.floor(idx / this.chunkSize));
    });
    
    // Load chunks
    chunkIndices.forEach(chunkIdx => {
      chunks.push(...this.getChunk(chunkIdx));
    });
    
    return chunks;
  }

  isChunkLoaded(chunkIndex: number): boolean {
    return this.loadedChunks.has(chunkIndex);
  }

  getTotalChunks(): number {
    return Math.ceil(this.data.length / this.chunkSize);
  }
}

/**
 * Canvas optimization utilities
 */
export class CanvasOptimizer {
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private devicePixelRatio: number;

  constructor() {
    this.devicePixelRatio = typeof window !== 'undefined' 
      ? window.devicePixelRatio || 1 
      : 1;
  }

  /**
   * Create offscreen canvas for pre-rendering
   */
  createOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
    if (typeof document === 'undefined') {
      // Server-side rendering fallback
      return {} as HTMLCanvasElement;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = width * this.devicePixelRatio;
    canvas.height = height * this.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }
    
    return canvas;
  }

  /**
   * Optimize canvas context settings
   */
  optimizeContext(ctx: CanvasRenderingContext2D): void {
    // Disable anti-aliasing for better performance
    (ctx as any).imageSmoothingEnabled = false;
    
    // Use willReadFrequently hint
    if (ctx.getContextAttributes) {
      (ctx as any).willReadFrequently = true;
    }
  }

  /**
   * Batch draw operations
   */
  batchDraw(
    ctx: CanvasRenderingContext2D,
    drawFunctions: Array<() => void>
  ): void {
    ctx.save();
    drawFunctions.forEach(fn => fn());
    ctx.restore();
  }
}

/**
 * Web Worker wrapper for heavy calculations
 * (Simplified - full implementation would use actual Web Workers)
 */
export class WorkerPool {
  private workers: Worker[] = [];
  private maxWorkers: number;

  constructor(maxWorkers: number = 4) {
    this.maxWorkers = maxWorkers;
  }

  /**
   * Run calculation in background
   * In production, this would use actual Web Workers
   */
  async runAsync<T, R>(
    data: T,
    processor: (data: T) => R
  ): Promise<R> {
    // Simplified: run in microtask for now
    // In production, offload to Web Worker
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(processor(data));
      }, 0);
    });
  }

  /**
   * Run multiple calculations in parallel
   */
  async runParallel<T, R>(
    dataArray: T[],
    processor: (data: T) => R
  ): Promise<R[]> {
    const chunks: T[][] = [];
    const chunkSize = Math.ceil(dataArray.length / this.maxWorkers);
    
    for (let i = 0; i < dataArray.length; i += chunkSize) {
      chunks.push(dataArray.slice(i, i + chunkSize));
    }
    
    const results = await Promise.all(
      chunks.map(chunk => 
        this.runAsync(chunk, data => data.map(processor))
      )
    );
    
    return results.flat();
  }
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  start(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(label)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }

  getAverage(label: string): number {
    const measurements = this.metrics.get(label);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }

  getStats(label: string): { avg: number; min: number; max: number; count: number } {
    const measurements = this.metrics.get(label) || [];
    
    if (measurements.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    return {
      avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    };
  }

  clear(): void {
    this.metrics.clear();
  }

  logStats(): void {
    console.log('=== Performance Stats ===');
    this.metrics.forEach((_, label) => {
      const stats = this.getStats(label);
      console.log(`${label}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms (${stats.count} samples)`);
    });
  }
}

// Export singleton instances
export const lodManager = new LODManager();
export const canvasOptimizer = new CanvasOptimizer();
export const workerPool = new WorkerPool(4);
export const perfMonitor = new PerformanceMonitor();

