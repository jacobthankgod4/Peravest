/**
 * Rate Limiting Service
 * Prevents API abuse with configurable limits
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultConfig: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  };

  /**
   * Check if request is allowed
   */
  checkLimit(key: string, config?: Partial<RateLimitConfig>): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const { maxRequests, windowMs } = { ...this.defaultConfig, ...config };
    const now = Date.now();
    const entry = this.limits.get(key);

    // No entry or expired
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      };
    }

    // Check limit
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Reset limit for key
   */
  resetLimit(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all limits
   */
  clearAll(): void {
    this.limits.clear();
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.limits.entries());
    for (const [key, entry] of entries) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimitService();

// Cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * Rate limit wrapper for functions
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getUserKey: (...args: Parameters<T>) => string,
  config?: Partial<RateLimitConfig>
): T {
  return (async (...args: Parameters<T>) => {
    const key = getUserKey(...args);
    const { allowed, remaining, resetTime } = rateLimiter.checkLimit(key, config);

    if (!allowed) {
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      throw new Error(`Rate limit exceeded. Try again in ${waitTime} seconds.`);
    }

    return fn(...args);
  }) as T;
}
