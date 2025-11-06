/**
 * API configuration and validation
 * Centralizes API endpoint configuration with validation
 */

import { validateUrl } from './validation';
import { logger } from './logger';

export interface ApiConfig {
  base: string;
  gtfsUrl: string;
  timeout: number;
  maxRetries: number;
}

/**
 * Get and validate API configuration from environment variables
 * Throws error if configuration is invalid
 */
function getApiConfig(): ApiConfig {
  const base = import.meta.env.VITE_OTP_BASE;
  
  // Validate base URL is provided
  if (!base || typeof base !== 'string') {
    const error = new Error('OTP API endpoint not configured. Please set VITE_OTP_BASE environment variable.');
    logger.error('API configuration error', error);
    throw error;
  }
  
  // Validate URL format
  if (!validateUrl(base)) {
    const error = new Error(`Invalid OTP API endpoint URL: ${base}`);
    logger.error('API configuration error', error);
    throw error;
  }
  
  const gtfsUrl = import.meta.env.VITE_OTP_GTFS_GQL || `${base}/otp/gtfs/v1`;
  
  // Validate GTFS URL format
  if (!validateUrl(gtfsUrl)) {
    const error = new Error(`Invalid OTP GTFS URL: ${gtfsUrl}`);
    logger.error('API configuration error', error);
    throw error;
  }
  
  return {
    base,
    gtfsUrl,
    timeout: 10000, // 10 seconds
    maxRetries: 2,
  };
}

/**
 * Exported API configuration
 * Validated on module load
 */
export const API_CONFIG: ApiConfig = getApiConfig();


