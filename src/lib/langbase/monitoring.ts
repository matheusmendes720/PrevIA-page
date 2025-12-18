/**
 * Langbase Performance Monitoring
 * Production-grade monitoring and analytics for agent operations
 */

// ============================================================================
// Types
// ============================================================================

interface PerformanceMetric {
  operation: string
  duration: number
  success: boolean
  timestamp: Date
  metadata?: Record<string, any>
}

interface MetricsSummary {
  totalOperations: number
  successRate: number
  averageResponseTime: number
  errorRate: number
  operationCounts: Record<string, number>
}

// ============================================================================
// Monitoring Class
// ============================================================================

class LangbaseMonitoring {
  private metrics: PerformanceMetric[] = []
  private readonly MAX_METRICS = 1000 // Keep last 1000 metrics

  /**
   * Track an async operation
   */
  async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now()

    try {
      const result = await fn()
      
      this.recordMetric({
        operation,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        metadata,
      })
      
      return result
    } catch (error) {
      this.recordMetric({
        operation,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        metadata: { 
          ...metadata, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
      })
      
      throw error
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)

    // Keep only last N metrics to prevent memory issues
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift()
    }

    // Send to analytics (if available)
    this.sendToAnalytics(metric)
  }

  /**
   * Send metric to analytics service
   */
  private sendToAnalytics(metric: PerformanceMetric) {
    if (typeof window === 'undefined') return

    // Vercel Analytics
    if ((window as any).va) {
      ;(window as any).va('track', 'langbase_operation', {
        operation: metric.operation,
        duration: metric.duration,
        success: metric.success,
        timestamp: metric.timestamp.toISOString(),
      })
    }

    // Google Analytics (if available)
    if ((window as any).gtag) {
      ;(window as any).gtag('event', 'langbase_operation', {
        event_category: 'Agent',
        event_label: metric.operation,
        value: metric.duration,
        success: metric.success,
      })
    }

    // Custom analytics
    if ((window as any).analytics) {
      ;(window as any).analytics.track('langbase_operation', {
        operation: metric.operation,
        duration: metric.duration,
        success: metric.success,
        ...metric.metadata,
      })
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get average response time
   */
  getAverageResponseTime(operation?: string): number {
    const filtered = operation
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics

    if (filtered.length === 0) return 0

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0)
    return Math.round(sum / filtered.length)
  }

  /**
   * Get success rate
   */
  getSuccessRate(operation?: string): number {
    const filtered = operation
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics

    if (filtered.length === 0) return 0

    const successCount = filtered.filter(m => m.success).length
    return Math.round((successCount / filtered.length) * 100)
  }

  /**
   * Get error rate
   */
  getErrorRate(operation?: string): number {
    return 100 - this.getSuccessRate(operation)
  }

  /**
   * Get metrics summary
   */
  getSummary(): MetricsSummary {
    const operationCounts: Record<string, number> = {}
    
    this.metrics.forEach(m => {
      operationCounts[m.operation] = (operationCounts[m.operation] || 0) + 1
    })

    return {
      totalOperations: this.metrics.length,
      successRate: this.getSuccessRate(),
      averageResponseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      operationCounts,
    }
  }

  /**
   * Get performance report
   */
  getReport(): string {
    const summary = this.getSummary()
    
    let report = '\n' + '='.repeat(60) + '\n'
    report += 'LANGBASE PERFORMANCE REPORT\n'
    report += '='.repeat(60) + '\n\n'
    
    report += `Total Operations:     ${summary.totalOperations}\n`
    report += `Success Rate:         ${summary.successRate}%\n`
    report += `Error Rate:           ${summary.errorRate}%\n`
    report += `Avg Response Time:    ${summary.averageResponseTime}ms\n\n`
    
    report += 'Operations Breakdown:\n'
    Object.entries(summary.operationCounts).forEach(([op, count]) => {
      const avgTime = this.getAverageResponseTime(op)
      const successRate = this.getSuccessRate(op)
      report += `  ${op}: ${count} calls, ${avgTime}ms avg, ${successRate}% success\n`
    })
    
    report += '\n' + '='.repeat(60) + '\n'
    
    return report
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = []
  }

  /**
   * Export metrics to JSON
   */
  export(): string {
    return JSON.stringify({
      summary: this.getSummary(),
      metrics: this.metrics,
      exportedAt: new Date().toISOString(),
    }, null, 2)
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const monitoring = new LangbaseMonitoring()

// ============================================================================
// Export
// ============================================================================

export default monitoring

