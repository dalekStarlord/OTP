/**
 * Real API implementations for geocoding, advisories, live tracking, etc.
 * All data comes from real services (Photon API for geocoding, OTP for routing)
 */

import { geocodeSearch } from './geocode';
import type { GeocodeResult, LiveVehicle, ServiceAdvisory, ContributionReport } from './enhanced-types';
import type { Coord } from './types';

/**
 * Geocode search using Nominatim OSM
 * Converts Nominatim results to GeocodeResult format
 */
export async function geocode(query: string): Promise<GeocodeResult[]> {
  const suggestions = await geocodeSearch(query);
  
  return suggestions.map((suggestion, index) => ({
    id: `geocode-${suggestion.lat}-${suggestion.lon}-${index}`,
    name: suggestion.name,
    address: suggestion.displayName,
    coord: {
      lat: suggestion.lat,
      lon: suggestion.lon,
      name: suggestion.name,
    },
    type: determineType(suggestion.displayName),
    landmark: extractLandmark(suggestion.displayName),
  }));
}

/**
 * Reverse geocode (convert coordinates to address)
 * Using Photon API for CORS-friendly requests
 */
export async function reverseGeocode(coord: Coord): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(
      `https://photon.komoot.io/reverse?lat=${coord.lat}&lon=${coord.lon}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const feature = data.features?.[0];
    
    if (!feature) return null;

    const props = feature.properties;
    const name = props.name || props.street || `Location (${coord.lat.toFixed(4)}, ${coord.lon.toFixed(4)})`;
    const displayName = formatDisplayName(props);

    return {
      id: `reverse-${coord.lat}-${coord.lon}`,
      name,
      address: displayName,
      coord,
      type: determineType(displayName),
      landmark: extractLandmark(displayName),
    };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
}

/**
 * Format Photon properties into display name
 */
function formatDisplayName(props: any): string {
  const parts: string[] = [];
  
  if (props.name) parts.push(props.name);
  if (props.street) parts.push(props.street);
  if (props.city || props.county) parts.push(props.city || props.county);
  if (props.state) parts.push(props.state);
  
  return parts.join(', ') || 'Unnamed location';
}

/**
 * Get live vehicle positions
 * TODO: Replace with actual GTFS-RT feed when available
 */
export async function getLiveVehicles(): Promise<LiveVehicle[]> {
  // TODO: Implement real GTFS-RT integration
  // For now, return empty array
  console.warn('Live vehicle tracking not yet implemented - needs GTFS-RT feed');
  return [];
}

/**
 * Get service advisories
 * TODO: Replace with actual advisory service/API
 */
export async function getServiceAdvisories(): Promise<ServiceAdvisory[]> {
  // TODO: Implement real advisory service
  // This could be:
  // - A custom backend API
  // - RSS feed from city/transit authority
  // - Social media integration
  console.warn('Service advisories not yet implemented - needs advisory data source');
  return [];
}

/**
 * Submit user contribution/report
 * TODO: Replace with actual backend API
 */
export async function submitContribution(
  report: Omit<ContributionReport, 'id' | 'status' | 'createdAt'>
): Promise<ContributionReport> {
  // TODO: Implement real backend submission
  // This would POST to a backend API that:
  // - Stores reports in a database
  // - Sends notifications to administrators
  // - Allows status tracking
  
  console.warn('Contribution submission not yet implemented - needs backend API');
  
  // For now, simulate success
  const submitted: ContributionReport = {
    ...report,
    id: `report-${Date.now()}`,
    status: 'pending',
    createdAt: Date.now(),
  };
  
  // In a real implementation, you would POST to your backend:
  // const response = await fetch('/api/contributions', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(report),
  // });
  // return await response.json();
  
  return submitted;
}

/**
 * Helper: Determine location type from display name
 */
function determineType(displayName: string): 'landmark' | 'street' | 'barangay' | 'poi' {
  const lower = displayName.toLowerCase();
  
  // Check for landmarks
  if (
    lower.includes('mall') ||
    lower.includes('market') ||
    lower.includes('university') ||
    lower.includes('hospital') ||
    lower.includes('church') ||
    lower.includes('terminal') ||
    lower.includes('plaza')
  ) {
    return 'landmark';
  }
  
  // Check for barangays
  if (lower.includes('barangay')) {
    return 'barangay';
  }
  
  // Check for streets
  if (
    lower.includes('street') ||
    lower.includes('road') ||
    lower.includes('avenue') ||
    lower.includes('st,') ||
    lower.includes('ave,')
  ) {
    return 'street';
  }
  
  // Default to POI
  return 'poi';
}

/**
 * Helper: Extract nearest landmark from display name
 */
function extractLandmark(displayName: string): string | undefined {
  const parts = displayName.split(',');
  
  // Look for known landmarks in the display name
  const landmarks = [
    'SM CDO',
    'Limketkai',
    'Divisoria',
    'Capitol',
    'Xavier',
    'Cogon',
    'Gaisano',
    'Ayala',
    'Centrio',
    'City Hall',
  ];
  
  for (const landmark of landmarks) {
    if (displayName.includes(landmark)) {
      return landmark;
    }
  }
  
  // Return first part (usually most specific)
  return parts[0]?.trim();
}

