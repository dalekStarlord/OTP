/**
 * API utility functions
 * Provides fetch with timeout and other API helpers
 */

/**
 * Fetch with timeout
 * Automatically cancels request if it exceeds the timeout duration
 * 
 * @param url Request URL
 * @param options Fetch options
 * @param timeoutMs Timeout in milliseconds (default: 10000)
 * @returns Promise that resolves to Response or throws timeout error
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Check if error is due to timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    
    throw error;
  }
}


