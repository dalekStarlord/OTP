/**
 * Mock API adapter - simulates OTP/GTFS backend
 * Replace these functions with real API calls in production
 */

import type { Coord, NormalizedItinerary } from '../lib/types';
import type {
  GeocodeResult,
  LiveVehicle,
  ServiceAdvisory,
  ContributionReport,
} from '../lib/enhanced-types';
import {
  mockGeocodeResults,
  mockPlanRoute,
  mockLiveVehicles,
  mockAdvisories,
} from './mockData';

/**
 * Simulate network delay
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock geocoding API
 */
export async function geocode(query: string): Promise<GeocodeResult[]> {
  await delay(300 + Math.random() * 200); // Simulate network latency

  if (!query || query.length < 2) {
    return [];
  }

  // Simple mock search
  const lowerQuery = query.toLowerCase();
  return mockGeocodeResults.filter(
    (result) =>
      result.name.toLowerCase().includes(lowerQuery) ||
      result.address.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Mock reverse geocoding
 */
export async function reverseGeocode(coord: Coord): Promise<GeocodeResult | null> {
  await delay(200 + Math.random() * 100);

  // Find closest landmark
  let closest = mockGeocodeResults[0];
  let minDist = distance(coord, closest.coord);

  mockGeocodeResults.forEach((result) => {
    const dist = distance(coord, result.coord);
    if (dist < minDist) {
      minDist = dist;
      closest = result;
    }
  });

  return {
    ...closest,
    coord,
    name: `Near ${closest.name}`,
  };
}

/**
 * Mock route planning API
 */
export async function planRoute(
  from: Coord,
  to: Coord,
  options: {
    numItineraries?: number;
    modes?: string[];
    maxWalkDistance?: number;
  } = {}
): Promise<NormalizedItinerary[]> {
  await delay(500 + Math.random() * 500); // Simulate route computation

  // Simulate occasional errors for testing
  if (Math.random() < 0.05) {
    throw new Error('Unable to find routes between these locations');
  }

  return mockPlanRoute(from, to, options.numItineraries || 3);
}

/**
 * Mock live vehicles API
 */
export async function getLiveVehicles(
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
): Promise<LiveVehicle[]> {
  await delay(100 + Math.random() * 100);

  if (!bounds) {
    return mockLiveVehicles;
  }

  // Filter vehicles within bounds
  return mockLiveVehicles.filter(
    (vehicle) =>
      vehicle.position.lat >= bounds.south &&
      vehicle.position.lat <= bounds.north &&
      vehicle.position.lon >= bounds.west &&
      vehicle.position.lon <= bounds.east
  );
}

/**
 * Mock service advisories API
 */
export async function getServiceAdvisories(): Promise<ServiceAdvisory[]> {
  await delay(200);

  // Filter out expired advisories
  const now = Date.now();
  return mockAdvisories.filter(
    (advisory) => !advisory.endTime || advisory.endTime > now
  );
}

/**
 * Mock contribution submission
 */
export async function submitContribution(
  report: Omit<ContributionReport, 'id' | 'status' | 'createdAt'>
): Promise<ContributionReport> {
  await delay(800 + Math.random() * 400);

  // Simulate rare failures
  if (Math.random() < 0.02) {
    throw new Error('Failed to submit report. Please try again.');
  }

  return {
    ...report,
    id: `report-${Date.now()}`,
    status: 'pending',
    createdAt: Date.now(),
  };
}

/**
 * Helper: Calculate distance between two coordinates (Haversine formula)
 */
function distance(coord1: Coord, coord2: Coord): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lon - coord1.lon) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

