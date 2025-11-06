/**
 * Client-side rate limiter
 * Prevents API abuse by limiting request frequency
 */

export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  /**
   * Create a new rate limiter
   * @param maxRequests Maximum number of requests allowed
   * @param windowMs Time window in milliseconds
   */
  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request can be made
   * Returns true if request is allowed, false if rate limited
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove requests outside the time window
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );
    
    // Check if we've exceeded the limit
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    // Record this request
    this.requests.push(now);
    return true;
  }

  /**
   * Get remaining requests in current window
   */
  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );
    
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  /**
   * Get time until rate limit resets (in milliseconds)
   */
  getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;
    
    const now = Date.now();
    const oldestRequest = Math.min(...this.requests);
    const resetTime = oldestRequest + this.windowMs;
    
    return Math.max(0, resetTime - now);
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.requests = [];
  }
}

// Create rate limiters for different API endpoints
export const apiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute for OTP API
export const geocodeRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute for geocoding


