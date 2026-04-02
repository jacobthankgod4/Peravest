/**
 * Monitoring Service - Error tracking and performance monitoring
 * Lightweight implementation without external dependencies
 */

interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

class MonitoringService {
  private errors: ErrorLog[] = [];
  private maxLogs = 1000;

  /**
   * Log error with context
   */
  logError(error: Error, context?: Record<string, any>): void {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context
    };

    this.errors.push(log);
    this.trimLogs();

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', log);
    }

    // Send to backend in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToBackend(log);
    }
  }

  /**
   * Log warning
   */
  logWarning(message: string, context?: Record<string, any>): void {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context
    };

    this.errors.push(log);
    this.trimLogs();

    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARN]', log);
    }
  }

  /**
   * Log info
   */
  logInfo(message: string, context?: Record<string, any>): void {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context
    };

    if (process.env.NODE_ENV === 'development') {
      console.info('[INFO]', log);
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 50): ErrorLog[] {
    return this.errors.slice(-limit);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.errors = [];
  }

  /**
   * Trim logs to max size
   */
  private trimLogs(): void {
    if (this.errors.length > this.maxLogs) {
      this.errors = this.errors.slice(-this.maxLogs);
    }
  }

  /**
   * Send to backend (implement your backend endpoint)
   */
  private async sendToBackend(log: ErrorLog): Promise<void> {
    try {
      await fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
    } catch (error) {
      console.error('Failed to send error log:', error);
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, duration: number, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${metric}: ${duration}ms`, context);
    }

    if (process.env.NODE_ENV === 'production' && duration > 1000) {
      this.logWarning(`Slow operation: ${metric}`, { duration, ...context });
    }
  }
}

export const monitoring = new MonitoringService();

/**
 * Error boundary wrapper for async functions
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      monitoring.trackPerformance(fn.name, duration, context);
      return result;
    } catch (error) {
      monitoring.logError(error as Error, { ...context, args });
      throw error;
    }
  }) as T;
}
