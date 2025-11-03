import { GraphQLClient } from 'graphql-request';
import type { Coord, NormalizedItinerary, NormalizedLeg } from './types';

const OTP_BASE = import.meta.env.VITE_OTP_BASE || 'https://e8f47a74a2af.ngrok-free.app';
const GTFS_URL = import.meta.env.VITE_OTP_GTFS_GQL || `${OTP_BASE}/otp/gtfs/v1`;

export const gtfsClient = new GraphQLClient(GTFS_URL, {
  headers: { 
    'content-type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
});

// ===== GTFS V1 =====

const GTFS_PLAN_QUERY = /* GraphQL */ `
  query Plan(
    $fromLat: Float!
    $fromLon: Float!
    $toLat: Float!
    $toLon: Float!
    $numItineraries: Int
  ) {
    plan(
      from: { lat: $fromLat, lon: $fromLon }
      to: { lat: $toLat, lon: $toLon }
      numItineraries: $numItineraries
    ) {
      itineraries {
        startTime
        endTime
        duration
        walkDistance
        legs {
          mode
          distance
          duration
          from {
            name
            lat
            lon
          }
          to {
            name
            lat
            lon
          }
          route {
            shortName
            longName
            gtfsId
          }
          trip {
            tripShortName
            tripHeadsign
            gtfsId
          }
          legGeometry {
            points
          }
        }
      }
    }
  }
`;

type GtfsVars = {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  numItineraries: number;
};

export async function planTripGtfs(
  from: Coord,
  to: Coord,
  _dateTime: string, // Not used by this OTP GTFS endpoint
  numItineraries: number = 5
): Promise<NormalizedItinerary[]> {
  // Simplified query for OTP 2.x - let it use defaults
  const variables: GtfsVars = {
    fromLat: from.lat,
    fromLon: from.lon,
    toLat: to.lat,
    toLon: to.lon,
    numItineraries,
  };

  try {
    const data: any = await gtfsClient.request(GTFS_PLAN_QUERY, variables);
    return normalizeGtfs(data);
  } catch (error) {
    console.error('❌ GTFS trip planning error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

/**
 * Calculate LTFRB-compliant fare based on distance
 * First 4km: ₱13.00 regular / ₱10.50 discount
 * Additional km: ₱1.80/km regular / ₱1.44/km discount
 */
function calculateFareProducts(distanceMeters: number, routeId: string): any[] {
  if (distanceMeters === 0) return [];
  
  const distanceKm = distanceMeters / 1000;
  const BASE_FARE_REGULAR = 13.00;
  const BASE_FARE_DISCOUNT = 10.50;
  const BASE_DISTANCE_KM = 4.0;
  const RATE_PER_KM_REGULAR = 1.80;
  const RATE_PER_KM_DISCOUNT = 1.44;
  
  let regularFare = BASE_FARE_REGULAR;
  let discountFare = BASE_FARE_DISCOUNT;
  
  if (distanceKm > BASE_DISTANCE_KM) {
    const extraKm = distanceKm - BASE_DISTANCE_KM;
    regularFare += extraKm * RATE_PER_KM_REGULAR;
    discountFare += extraKm * RATE_PER_KM_DISCOUNT;
  }
  
  return [
    {
      id: `fare_${routeId}_regular`,
      price: {
        amount: Math.round(regularFare * 100) / 100, // Round to 2 decimals
        currency: 'PHP'
      }
    },
    {
      id: `fare_${routeId}_discount`,
      price: {
        amount: Math.round(discountFare * 100) / 100, // Round to 2 decimals
        currency: 'PHP'
      }
    }
  ];
}

function normalizeGtfs(data: any): NormalizedItinerary[] {
  const itineraries = data?.plan?.itineraries || [];
  
  return itineraries.map((itinerary: any, idx: number) => {
    const legs: NormalizedLeg[] = (itinerary.legs || []).map((leg: any) => {
      const routeId = leg.route?.gtfsId || leg.route?.shortName || 'unknown';
      // Check if this is a transit leg (not WALK) - includes BUS, TRANSIT, etc.
      const isTransit = leg.mode && leg.mode !== 'WALK';
      
      // Map BUS mode to JEEPNEY for UI display (since it's CDO jeepney data)
      const displayMode = leg.mode === 'BUS' ? 'JEEPNEY' : leg.mode;
      
      return {
        mode: displayMode || 'UNKNOWN',
        from: {
          lat: leg.from?.lat || 0,
          lon: leg.from?.lon || 0,
          name: leg.from?.name,
        },
        to: {
          lat: leg.to?.lat || 0,
          lon: leg.to?.lon || 0,
          name: leg.to?.name,
        },
        distance: leg.distance || 0,
        duration: leg.duration || 0,
        lineName: leg.route?.shortName || leg.route?.longName,
        polyline: leg.legGeometry?.points,
        fareProducts: isTransit ? calculateFareProducts(leg.distance || 0, routeId) : [],
        // Extract vehicle information from trip object
        vehicleName: leg.trip?.tripShortName || undefined,
        vehicleId: leg.trip?.gtfsId || undefined,
        headsign: leg.trip?.tripHeadsign || undefined,
      };
    });

    // Count transfers as number of non-walk legs minus 1
    const transitLegs = legs.filter(leg => leg.mode !== 'WALK' && leg.mode !== 'UNKNOWN').length;
    const transfers = Math.max(0, transitLegs - 1);

    return {
      id: `gtfs-${itinerary.startTime}-${idx}`,
      source: 'gtfs',
      startTime: itinerary.startTime,
      endTime: itinerary.endTime,
      duration: itinerary.duration || 0,
      transfers,
      legs,
    };
  });
}

// ===== MERGE & DEDUPE =====

export function dedupeAndSort(
  itineraries: NormalizedItinerary[]
): NormalizedItinerary[] {
  // Sort by duration ascending
  const sorted = [...itineraries].sort((a, b) => a.duration - b.duration);
  
  // Simple dedupe based on similar duration and transfer count
  const deduped: NormalizedItinerary[] = [];
  for (const itin of sorted) {
    const isDuplicate = deduped.some(
      (existing) =>
        Math.abs(existing.duration - itin.duration) < 60 && // within 60 seconds
        existing.transfers === itin.transfers
    );
    if (!isDuplicate) {
      deduped.push(itin);
    }
  }
  
  return deduped;
}

// ===== HEALTH CHECK =====

const HEALTH_QUERY = `{ __typename }`;

export async function checkHealth(
  client: GraphQLClient
): Promise<'ok' | 'down'> {
  try {
    const data: any = await client.request(HEALTH_QUERY);
    return data?.__typename === 'QueryType' ? 'ok' : 'down';
  } catch {
    return 'down';
  }
}

export async function checkGtfsHealth(): Promise<'ok' | 'down'> {
  return checkHealth(gtfsClient);
}

// ===== DIAGNOSTICS =====

/**
 * Check what routes are available in the OTP server
 */
export async function checkAvailableRoutes(): Promise<void> {
  const ROUTES_QUERY = `{
    routes {
      gtfsId
      shortName
      longName
      mode
    }
  }`;
  
  try {
    const data: any = await gtfsClient.request(ROUTES_QUERY);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch routes:', error);
    throw error;
  }
}

/**
 * Check what stops are available in the OTP server
 */
export async function checkAvailableStops(): Promise<void> {
  const STOPS_QUERY = `{
    stops {
      gtfsId
      name
      lat
      lon
    }
  }`;
  
  try {
    const data: any = await gtfsClient.request(STOPS_QUERY);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch stops:', error);
    throw error;
  }
}

/**
 * Check the GraphQL schema for plan query parameters
 */
export async function checkPlanSchema(): Promise<void> {
  const SCHEMA_QUERY = `{
    __type(name: "QueryType") {
      fields {
        name
        args {
          name
          type {
            name
            kind
          }
        }
      }
    }
  }`;
  
  try {
    const data: any = await gtfsClient.request(SCHEMA_QUERY);
    return data;
  } catch (error) {
    console.error('❌ Failed to check schema:', error);
    throw error;
  }
}

/**
 * Check what service dates are available in GTFS
 */
export async function checkServiceDates(): Promise<void> {
  // Try to get a sample trip with its service dates
  const SERVICE_QUERY = `{
    routes {
      gtfsId
      shortName
      trips {
        gtfsId
        serviceId
        tripHeadsign
      }
    }
  }`;
  
  try {
    const data: any = await gtfsClient.request(SERVICE_QUERY);
    // Limit results in JavaScript instead of GraphQL
    const limitedRoutes = data?.routes?.slice(0, 1) || [];
    console.log('✅ Service dates check completed:', limitedRoutes.length, 'route(s) found');
  } catch (error) {
    console.error('❌ Failed to check service dates:', error);
    throw error;
  }
}

/**
 * Check if routes have any trips scheduled
 */
export async function checkRouteTrips(): Promise<void> {
  const TRIPS_QUERY = `{
    routes {
      gtfsId
      shortName
      longName
      mode
      trips {
        gtfsId
      }
    }
  }`;
  
  try {
    const data: any = await gtfsClient.request(TRIPS_QUERY);
    const routesWithTrips = data?.routes?.filter((r: any) => r.trips && r.trips.length > 0) || [];
    
    if (routesWithTrips.length === 0) {
      console.error('❌ CRITICAL: No routes have trips scheduled! GTFS data is incomplete.');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Failed to check trips:', error);
    throw error;
  }
}

/**
 * Test a simple route with minimal constraints
 */
export async function testSimpleRoute(from: Coord, to: Coord): Promise<void> {
  const SIMPLE_QUERY = `
    query TestPlan($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!) {
      plan(
        from: { lat: $fromLat, lon: $fromLon }
        to: { lat: $toLat, lon: $toLon }
        maxWalkDistance: 10000
      ) {
        itineraries {
          duration
          legs {
            mode
            from { name lat lon }
            to { name lat lon }
            route { shortName longName mode }
          }
        }
      }
    }
  `;
  
  const variables = {
    fromLat: from.lat,
    fromLon: from.lon,
    toLat: to.lat,
    toLon: to.lon
  };
  
  try {
    const data: any = await gtfsClient.request(SIMPLE_QUERY, variables);
    return data;
  } catch (error) {
    console.error('❌ Simple route test failed:', error);
    throw error;
  }
}

