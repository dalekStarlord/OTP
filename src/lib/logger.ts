/**
 * Secure logging utility
 * Prevents exposing sensitive information in production
 */

const isDev = import.meta.env.DEV;

interface LogContext {
  [key: string]: any;
}

/**
 * Sanitize error object for production logging
 * Removes stack traces and sensitive information
 */
function sanitizeError(error: Error | unknown): string {
  if (error instanceof Error) {
    // In production, only return message
    // In dev, include stack trace
    if (isDev) {
      return error.message;
    }
    return error.message.split('\n')[0]; // Only first line
  }
  return String(error);
}

/**
 * Secure logger that prevents information leakage in production
 */
export const logger = {
  /**
   * Log errors
   * In dev: logs full error details
   * In prod: logs sanitized message only
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const sanitizedError = error ? sanitizeError(error) : undefined;
    
    if (isDev) {
      // Development: log full details
      console.error(`[ERROR] ${message}`, {
        error: sanitizedError,
        context,
        ...(error instanceof Error && { stack: error.stack }),
      });
    } else {
      // Production: log sanitized message only
      console.error(`[ERROR] ${message}${sanitizedError ? `: ${sanitizedError}` : ''}`);
    }
  },

  /**
   * Log warnings
   * Only logs in development
   */
  warn: (message: string, context?: LogContext) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  },

  /**
   * Log info messages
   * Only logs in development
   */
  log: (message: string, context?: LogContext) => {
    if (isDev) {
      console.log(`[LOG] ${message}`, context || '');
    }
  },

  /**
   * Log info messages
   * Only logs in development
   */
  info: (message: string, context?: LogContext) => {
    if (isDev) {
      console.info(`[INFO] ${message}`, context || '');
    }
  },
};

