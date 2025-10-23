import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { NormalizedLeg, NormalizedItinerary, FareType } from './types';

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
  return `₱${amount.toFixed(2)}`;
}

/**
 * Format distance in meters to km or m
 */
export function formatDistance(meters: number, locale: string = 'en'): string {
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
  let timeout: NodeJS.Timeout;
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
    console.error(`Failed to save ${key} to localStorage`, error);
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
    console.error(`Failed to load ${key} from localStorage`, error);
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
    .filter(leg => leg.mode === 'BUS') // Only transit legs
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

