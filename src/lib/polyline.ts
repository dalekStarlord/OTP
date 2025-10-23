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
    
    return decoded as LatLngTuple[];
  } catch (error) {
    console.error('❌ Failed to decode polyline:', error);
    console.error('Encoded string (first 100 chars):', encoded?.substring(0, 100));
    return [];
  }
}

/**
 * Get the style configuration for a leg based on its mode
 */
export function getLegStyle(mode: string): {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
} {
  const upperMode = mode.toUpperCase();
  
  if (upperMode === 'WALK' || upperMode === 'FOOT') {
    return {
      color: '#888888',
      weight: 4,
      opacity: 0.6,
      dashArray: '8, 8',
    };
  }
  
  // BUS, TRANSIT, etc. - Make it bolder and more visible
  return {
    color: '#ef4444', // red-500 - more visible than blue
    weight: 5,
    opacity: 0.85,
  };
}

/**
 * Get highlighted style for selected/hovered itinerary
 */
export function getHighlightedLegStyle(mode: string): {
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
  
  // Make selected route very visible
  return {
    color: '#dc2626', // red-600 - darker red for emphasis
    weight: 7,
    opacity: 1,
  };
}

