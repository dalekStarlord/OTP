import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { NormalizedLeg, NormalizedItinerary, FareType, Coord } from './types';
import { reverseGeocode } from './api';
import { logger } from './logger';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number, locale: string = 'en'): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return locale === 'en'
      ? `${hours}h ${minutes}m`
      : locale === 'fil'
      ? `${hours} oras ${minutes} min`
      : `${hours} oras ${minutes} min`;
  }
  return locale === 'en'
    ? `${minutes} min`
    : locale === 'fil'
    ? `${minutes} minuto`
    : `${minutes} minuto`;
}

/**
 * Format fare in Philippine pesos
 */
export function formatFare(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Format distance in meters to km or m
 */
export function formatDistance(meters: number, _locale: string = 'en'): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Get color for transport mode
 */
export function getModeColor(mode: string): string {
  const colors: Record<string, string> = {
    JEEPNEY: 'bg-yellow-500 text-gray-900',
    BUS: 'bg-blue-600 text-white',
    TRICYCLE: 'bg-orange-500 text-white',
    WALK: 'bg-green-600 text-white',
    FERRY: 'bg-cyan-600 text-white',
    TRANSIT: 'bg-purple-600 text-white',
  };
  return colors[mode.toUpperCase()] || 'bg-gray-600 text-white';
}

/**
 * Get icon name for transport mode
 */
export function getModeIcon(mode: string): string {
  const icons: Record<string, string> = {
    JEEPNEY: 'bus',
    BUS: 'bus',
    TRICYCLE: 'bike',
    WALK: 'footprints',
    FERRY: 'ship',
    TRANSIT: 'train',
  };
  return icons[mode.toUpperCase()] || 'circle';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get relative time (e.g., "in 5 minutes")
 */
export function getRelativeTime(timestamp: number, locale: string = 'en'): string {
  const now = Date.now();
  const diff = timestamp - now;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 0) {
    return locale === 'en' ? 'Now' : locale === 'fil' ? 'Ngayon' : 'Karon';
  }
  if (minutes < 1) {
    return locale === 'en' ? 'Now' : locale === 'fil' ? 'Ngayon' : 'Karon';
  }
  if (minutes < 60) {
    return locale === 'en'
      ? `in ${minutes} min`
      : locale === 'fil'
      ? `sa ${minutes} min`
      : `sa ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  return locale === 'en'
    ? `in ${hours} hr`
    : locale === 'fil'
    ? `sa ${hours} oras`
    : `sa ${hours} oras`;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Save to localStorage with error handling
 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error(`Failed to save ${key} to localStorage`, error);
  }
}

/**
 * Load from localStorage with error handling
 */
export function loadFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    logger.error(`Failed to load ${key} from localStorage`, error);
    return null;
  }
}

/**
 * Get the display fare for a leg based on user's fare type selection
 */
export function getDisplayFare(leg: NormalizedLeg, fareType: FareType): number {
  const fareProducts = leg.fareProducts || [];
  
  // Find the matching fare based on user selection
  const selectedFare = fareProducts.find(fp => 
    fp.id.endsWith(`_${fareType}`)
  );
  
  return selectedFare?.price.amount || 0;
}

/**
 * Calculate total fare for an itinerary based on fare type
 */
export function calculateTotalFare(itinerary: NormalizedItinerary, fareType: FareType): number {
  return itinerary.legs
    .filter(leg => leg.mode !== 'WALK' && leg.mode !== 'UNKNOWN') // Only transit legs (JEEPNEY, BUS, etc.)
    .reduce((total, leg) => total + getDisplayFare(leg, fareType), 0);
}

/**
 * Calculate fare savings when using discount fare
 */
export function calculateFareSavings(itinerary: NormalizedItinerary): number {
  const regularFare = calculateTotalFare(itinerary, 'regular');
  const discountFare = calculateTotalFare(itinerary, 'discount');
  return regularFare - discountFare;
}

/**
 * Cache for reverse geocoded stop names to avoid repeated API calls
 */
const stopNameCache = new Map<string, Promise<string>>();

/**
 * Format stop name with enhanced location context using reverse geocoding
 * This provides user-friendly names like "SM Downtown" instead of "Stop ID 12345"
 */
export async function formatStopName(
  coord: Coord,
  rawName?: string
): Promise<string> {
  // Generate cache key from coordinates
  const cacheKey = `${coord.lat.toFixed(4)},${coord.lon.toFixed(4)}`;
  
  // Return cached promise if available
  if (stopNameCache.has(cacheKey)) {
    return stopNameCache.get(cacheKey)!;
  }
  
  // Create new promise for this coordinate
  const promise = (async () => {
    try {
      // Use reverse geocoding to get meaningful location name
      const result = await reverseGeocode(coord);
      
      if (result && result.name) {
        // Prioritize landmark/POI names over streets
        if (result.type === 'landmark' || result.type === 'poi') {
          return result.name;
        }
        
        // For streets, combine with city if available
        if (result.type === 'street' && result.address) {
          const addressParts = result.address.split(',');
          // Take the first two parts (usually street and city)
          return addressParts.slice(0, 2).join(', ').trim();
        }
        
        // Return the name if available
        return result.name;
      }
      
      // Fallback to raw name from GTFS if available
      if (rawName && rawName.length > 0) {
        // Clean up common GTFS stop name patterns
        return cleanStopName(rawName);
      }
      
      // Final fallback
      return 'Unknown location';
    } catch (error) {
      logger.warn('Failed to format stop name', { error });
      
      // Return cleaned raw name or fallback
      if (rawName && rawName.length > 0) {
        return cleanStopName(rawName);
      }
      return 'Unknown location';
    }
  })();
  
  // Cache the promise
  stopNameCache.set(cacheKey, promise);
  
  return promise;
}

/**
 * Clean up GTFS stop names to be more user-friendly
 */
function cleanStopName(rawName: string): string {
  // Remove common prefixes/suffixes
  let cleaned = rawName.trim();
  
  // Remove "Stop ID" patterns
  cleaned = cleaned.replace(/^Stop\s*(ID\s*)?[:\s-]*/i, '');
  
  // Remove route prefixes like "R070-"
  cleaned = cleaned.replace(/^[A-Z]\d+[-_]\s*/, '');
  
  // Remove terminal suffixes
  cleaned = cleaned.replace(/-?\s*Terminal\s*$/i, '');
  
  // Capitalize properly
  return cleaned.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

