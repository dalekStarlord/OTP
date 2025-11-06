/**
 * Input validation and sanitization utilities
 * Validates user inputs to prevent injection attacks and invalid data
 */

import type { Coord } from './types';

/**
 * Validate coordinates are within Philippines bounds
 * Philippines bounds: lat 4-21, lon 116-127
 */
export function validateCoordinate(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    isFinite(lat) &&
    isFinite(lon) &&
    lat >= 4 &&
    lat <= 21 &&
    lon >= 116 &&
    lon <= 127
  );
}

/**
 * Validate a Coord object
 */
export function validateCoord(coord: Coord): boolean {
  if (!coord || typeof coord !== 'object') return false;
  return validateCoordinate(coord.lat, coord.lon);
}

/**
 * Sanitize search query to prevent XSS attacks
 * Removes potentially dangerous characters and limits length
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return '';
  
  return query
    .replace(/[<>\"']/g, '') // Remove XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Validate and clamp number of itineraries
 * Returns a number between 1-10
 */
export function validateNumItineraries(num: number): number {
  if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
    return 5; // Default
  }
  
  const clamped = Math.max(1, Math.min(10, Math.floor(num)));
  return clamped;
}

/**
 * Validate ISO 8601 date string
 */
export function validateDateTime(dateTime: string): boolean {
  if (typeof dateTime !== 'string') return false;
  
  try {
    const date = new Date(dateTime);
    return !isNaN(date.getTime()) && date.toISOString() === dateTime;
  } catch {
    return false;
  }
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  if (typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Validate geocode suggestion structure
 */
export function validateGeocodeSuggestion(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  return (
    typeof data.lat === 'number' &&
    typeof data.lon === 'number' &&
    typeof data.name === 'string' &&
    typeof data.displayName === 'string' &&
    validateCoordinate(data.lat, data.lon) &&
    data.name.length < 200 &&
    data.displayName.length < 500
  );
}


