import polyline from '@mapbox/polyline';
import type { LatLngTuple } from 'leaflet';

/**
 * Decode an encoded polyline string to lat/lng coordinates
 * @param encoded - Encoded polyline string from OTP
 * @returns Array of [lat, lng] tuples for Leaflet
 */
export function decodePolyline(encoded?: string | null): LatLngTuple[] {
  if (!encoded) return [];
  
  try {
    // Try precision 5 (OTP default for most versions)
    let decoded = polyline.decode(encoded, 5);
    
    console.log('🔍 Decoded with precision 5:', {
      count: decoded.length,
      sample: decoded.length > 0 ? decoded[0] : null,
    });
    
    // Validate: check if coordinates are reasonable (within Philippines bounds)
    // Philippines is roughly lat: 4-21, lon: 116-127
    const isValid = decoded.length > 0 && decoded.every(([lat, lon]: [number, number]) => 
      lat >= 4 && lat <= 21 && lon >= 116 && lon <= 127
    );
    
    // If precision 5 gives bad results, try precision 6
    if (!isValid) {
      console.log('⚠️ Precision 5 failed validation, trying precision 6');
      decoded = polyline.decode(encoded, 6);
      
      console.log('🔍 Decoded with precision 6:', {
        count: decoded.length,
        sample: decoded.length > 0 ? decoded[0] : null,
      });
      
      // Validate precision 6 result
      const isValid6 = decoded.length > 0 && decoded.every(([lat, lon]: [number, number]) => 
        lat >= 4 && lat <= 21 && lon >= 116 && lon <= 127
      );
      
      if (!isValid6) {
        console.error('❌ Both precision 5 and 6 produced invalid coordinates');
        console.error('Sample coordinate:', decoded.length > 0 ? decoded[0] : null);
        console.error('Encoded string (first 100 chars):', encoded.substring(0, 100));
        return [];
      }
    }
    
    // Remove consecutive duplicate points that can cause rendering issues
    const cleaned = removeDuplicatePoints(decoded as LatLngTuple[]);
    
    return cleaned;
  } catch (error) {
    console.error('Failed to decode polyline:', error);
    console.error('Encoded string (first 100 chars):', encoded?.substring(0, 100));
    return [];
  }
}

/**
 * Remove consecutive duplicate points from a polyline
 * This prevents visual artifacts and ensures clean connections
 */
function removeDuplicatePoints(coords: LatLngTuple[]): LatLngTuple[] {
  if (coords.length <= 1) return coords;
  
  const cleaned: LatLngTuple[] = [coords[0]];
  const threshold = 0.00001; // ~1 meter tolerance
  
  for (let i = 1; i < coords.length; i++) {
    const [prevLat, prevLon] = cleaned[cleaned.length - 1];
    const [currLat, currLon] = coords[i];
    
    // Only add if point is different enough from previous
    const latDiff = Math.abs(currLat - prevLat);
    const lonDiff = Math.abs(currLon - prevLon);
    
    if (latDiff > threshold || lonDiff > threshold) {
      cleaned.push(coords[i]);
    }
  }
  
  return cleaned;
}

/**
 * Predefined color palette for different route options
 * Each route gets a unique color for easy visual distinction
 */
const ROUTE_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#a855f7', // purple-500
  '#14b8a6', // teal-500
  '#ef4444', // red-500
];

/**
 * Get a unique color for a route based on its index
 */
export function getRouteColor(index: number): string {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
}

/**
 * Get the style configuration for a leg with uniform route color
 */
export function getLegStyle(mode: string, routeColor: string): {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
} {
  const upperMode = mode.toUpperCase();
  
  if (upperMode === 'WALK' || upperMode === 'FOOT') {
    return {
      color: '#888888', // Walking legs remain gray
      weight: 4,
      opacity: 0.6,
      dashArray: '8, 8',
    };
  }
  
  // All transit legs use the same route color
  return {
    color: routeColor,
    weight: 5,
    opacity: 0.85,
  };
}

/**
 * Get highlighted style for selected/hovered itinerary with uniform color
 */
export function getHighlightedLegStyle(mode: string, routeColor: string): {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
} {
  const upperMode = mode.toUpperCase();
  
  if (upperMode === 'WALK' || upperMode === 'FOOT') {
    return {
      color: '#666666',
      weight: 6,
      opacity: 0.8,
      dashArray: '8, 8',
    };
  }
  
  // Make selected route very visible with the route color
  return {
    color: routeColor,
    weight: 7,
    opacity: 1,
  };
}

