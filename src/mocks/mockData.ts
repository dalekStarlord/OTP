/**
 * Mock data for development and testing
 * Replace with real OTP/GTFS API calls in production
 */

import { CDO_CENTER, CDO_LANDMARKS } from '../lib/constants';
import type {
  GeocodeResult,
  LiveVehicle,
  ServiceAdvisory,
  SavedPlace,
} from '../lib/enhanced-types';
import type { NormalizedItinerary, NormalizedLeg, Coord } from '../lib/types';

/**
 * Mock geocoding results for CDO
 */
export const mockGeocodeResults: GeocodeResult[] = [
  {
    id: '1',
    name: 'SM CDO Downtown Premier',
    address: 'Osmeña St, Cagayan de Oro',
    coord: { lat: 8.4781, lon: 124.6472 },
    type: 'landmark',
    landmark: 'SM CDO Downtown Premier',
  },
  {
    id: '2',
    name: 'Limketkai Center',
    address: 'Lapasan, Cagayan de Oro',
    coord: { lat: 8.4853, lon: 124.6542 },
    type: 'landmark',
    landmark: 'Limketkai Center',
  },
  {
    id: '3',
    name: 'Divisoria Night Cafe',
    address: 'Divisoria, Cagayan de Oro',
    coord: { lat: 8.4833, lon: 124.6472 },
    type: 'poi',
    landmark: 'Divisoria',
  },
  {
    id: '4',
    name: 'Capitol University',
    address: 'Corrales Ave, Cagayan de Oro',
    coord: { lat: 8.4856, lon: 124.6514 },
    type: 'landmark',
    landmark: 'Capitol University',
  },
  {
    id: '5',
    name: 'Xavier University',
    address: 'Corrales Ave, Cagayan de Oro',
    coord: { lat: 8.4894, lon: 124.6525 },
    type: 'landmark',
    landmark: 'Xavier University',
  },
  {
    id: '6',
    name: 'Cogon Market',
    address: 'Cogon, Cagayan de Oro',
    coord: { lat: 8.4664, lon: 124.6358 },
    type: 'landmark',
    landmark: 'Cogon Market',
  },
  {
    id: '7',
    name: 'Gaisano City Mall',
    address: 'Velez St, Cagayan de Oro',
    coord: { lat: 8.4586, lon: 124.6350 },
    type: 'landmark',
    landmark: 'Gaisano City Mall',
  },
  {
    id: '8',
    name: 'City Hall',
    address: 'Capistrano St, Cagayan de Oro',
    coord: { lat: 8.4822, lon: 124.6467 },
    type: 'landmark',
    landmark: 'CDO City Hall',
  },
];

/**
 * Mock route planning results
 */
export function mockPlanRoute(
  from: Coord,
  to: Coord,
  numItineraries: number = 3
): NormalizedItinerary[] {
  // Generate realistic mock itineraries
  const itineraries: NormalizedItinerary[] = [];

  // Itinerary 1: Fastest with jeepney
  itineraries.push({
    id: 'itin-1',
    source: 'gtfs',
    startTime: Date.now() + 5 * 60 * 1000,
    endTime: Date.now() + 30 * 60 * 1000,
    duration: 1500, // 25 minutes
    transfers: 0,
    legs: [
      {
        mode: 'WALK',
        from,
        to: { lat: from.lat + 0.001, lon: from.lon + 0.001, name: 'Jeepney Stop' },
        distance: 150,
        duration: 120,
      },
      {
        mode: 'JEEPNEY',
        from: { lat: from.lat + 0.001, lon: from.lon + 0.001, name: 'Jeepney Stop' },
        to: { lat: to.lat - 0.001, lon: to.lon - 0.001, name: 'Destination Stop' },
        distance: 3500,
        duration: 1200,
        lineName: 'Cogon-Bulua',
        polyline: generateMockPolyline(
          { lat: from.lat + 0.001, lon: from.lon + 0.001 },
          { lat: to.lat - 0.001, lon: to.lon - 0.001 }
        ),
      },
      {
        mode: 'WALK',
        from: { lat: to.lat - 0.001, lon: to.lon - 0.001, name: 'Destination Stop' },
        to,
        distance: 100,
        duration: 180,
      },
    ],
  });

  // Itinerary 2: With transfer, cheaper
  itineraries.push({
    id: 'itin-2',
    source: 'gtfs',
    startTime: Date.now() + 8 * 60 * 1000,
    endTime: Date.now() + 40 * 60 * 1000,
    duration: 1920, // 32 minutes
    transfers: 1,
    legs: [
      {
        mode: 'WALK',
        from,
        to: { lat: from.lat + 0.002, lon: from.lon, name: 'Bus Stop' },
        distance: 200,
        duration: 150,
      },
      {
        mode: 'BUS',
        from: { lat: from.lat + 0.002, lon: from.lon, name: 'Bus Stop' },
        to: { lat: from.lat + 0.015, lon: from.lon + 0.010, name: 'Transfer Point' },
        distance: 2000,
        duration: 600,
        lineName: 'Route 12',
        polyline: generateMockPolyline(
          { lat: from.lat + 0.002, lon: from.lon },
          { lat: from.lat + 0.015, lon: from.lon + 0.010 }
        ),
      },
      {
        mode: 'WALK',
        from: { lat: from.lat + 0.015, lon: from.lon + 0.010, name: 'Transfer Point' },
        to: { lat: from.lat + 0.016, lon: from.lon + 0.011, name: 'Jeepney Stop' },
        distance: 120,
        duration: 90,
      },
      {
        mode: 'JEEPNEY',
        from: { lat: from.lat + 0.016, lon: from.lon + 0.011, name: 'Jeepney Stop' },
        to: { lat: to.lat - 0.001, lon: to.lon, name: 'Near Destination' },
        distance: 1800,
        duration: 900,
        lineName: 'Divisoria-Lapasan',
        polyline: generateMockPolyline(
          { lat: from.lat + 0.016, lon: from.lon + 0.011 },
          { lat: to.lat - 0.001, lon: to.lon }
        ),
      },
      {
        mode: 'WALK',
        from: { lat: to.lat - 0.001, lon: to.lon, name: 'Near Destination' },
        to,
        distance: 180,
        duration: 180,
      },
    ],
  });

  // Itinerary 3: More walking, no transfers
  itineraries.push({
    id: 'itin-3',
    source: 'gtfs',
    startTime: Date.now() + 2 * 60 * 1000,
    endTime: Date.now() + 35 * 60 * 1000,
    duration: 1980, // 33 minutes
    transfers: 0,
    legs: [
      {
        mode: 'WALK',
        from,
        to: { lat: from.lat + 0.003, lon: from.lon + 0.002, name: 'Jeepney Terminal' },
        distance: 350,
        duration: 300,
      },
      {
        mode: 'JEEPNEY',
        from: { lat: from.lat + 0.003, lon: from.lon + 0.002, name: 'Jeepney Terminal' },
        to: { lat: to.lat - 0.002, lon: to.lon - 0.001, name: 'Main Stop' },
        distance: 4000,
        duration: 1380,
        lineName: 'Terminal-Center',
        polyline: generateMockPolyline(
          { lat: from.lat + 0.003, lon: from.lon + 0.002 },
          { lat: to.lat - 0.002, lon: to.lon - 0.001 }
        ),
      },
      {
        mode: 'WALK',
        from: { lat: to.lat - 0.002, lon: to.lon - 0.001, name: 'Main Stop' },
        to,
        distance: 250,
        duration: 300,
      },
    ],
  });

  return itineraries.slice(0, numItineraries);
}

/**
 * Generate simple mock polyline between two points
 */
function generateMockPolyline(from: Coord, to: Coord): string {
  // Simple encoded polyline (in reality, would be properly encoded)
  // This is a placeholder - real implementation would use @mapbox/polyline
  return `mock_polyline_${from.lat}_${from.lon}_${to.lat}_${to.lon}`;
}

/**
 * Mock live vehicles
 */
export const mockLiveVehicles: LiveVehicle[] = [
  {
    id: 'veh-1',
    route: 'Cogon-Bulua',
    headsign: 'Bulua',
    position: { lat: 8.4700, lon: 124.6400 },
    bearing: 45,
    speed: 8.3, // m/s (~30 km/h)
    congestion: 'light',
    eta: Date.now() + 5 * 60 * 1000,
    nextStop: 'SM CDO Downtown',
  },
  {
    id: 'veh-2',
    route: 'Divisoria-Lapasan',
    headsign: 'Lapasan',
    position: { lat: 8.4850, lon: 124.6500 },
    bearing: 90,
    speed: 5.5, // m/s (~20 km/h)
    congestion: 'moderate',
    eta: Date.now() + 8 * 60 * 1000,
    nextStop: 'Limketkai',
  },
  {
    id: 'veh-3',
    route: 'Puerto-Carmen',
    headsign: 'Carmen',
    position: { lat: 8.4600, lon: 124.6300 },
    bearing: 180,
    speed: 11.1, // m/s (~40 km/h)
    congestion: 'none',
    eta: Date.now() + 3 * 60 * 1000,
    nextStop: 'Cogon Market',
  },
];

/**
 * Mock service advisories
 */
export const mockAdvisories: ServiceAdvisory[] = [
  {
    id: 'adv-1',
    type: 'reroute',
    severity: 'warning',
    title: 'Velez Street Re-routing',
    description: 'Due to road construction, jeepneys are taking alternate route via Chavez Street',
    affectedRoutes: ['Cogon-Bulua', 'Terminal-Center'],
    affectedArea: {
      center: { lat: 8.4600, lon: 124.6350 },
      radius: 500,
    },
    alternatives: ['Route via Chavez St'],
    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'adv-2',
    type: 'delay',
    severity: 'info',
    title: 'Heavy Traffic on Corrales Avenue',
    description: 'Expect 10-15 minute delays during rush hour',
    affectedRoutes: ['Divisoria-Lapasan'],
    startTime: Date.now() - 1 * 60 * 60 * 1000,
    createdAt: Date.now() - 1 * 60 * 60 * 1000,
  },
];

/**
 * Mock saved places
 */
export const mockSavedPlaces: SavedPlace[] = [
  {
    id: 'place-1',
    name: 'Home',
    address: 'Cogon, Cagayan de Oro',
    coord: { lat: 8.4664, lon: 124.6358 },
    type: 'home',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'place-2',
    name: 'Work',
    address: 'Limketkai Drive, Cagayan de Oro',
    coord: { lat: 8.4853, lon: 124.6542 },
    type: 'work',
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
];

