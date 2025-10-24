import { GraphQLClient } from 'graphql-request';
import type { Coord, NormalizedItinerary, NormalizedLeg } from './types';

const OTP_BASE = import.meta.env.VITE_OTP_BASE || 'https://babce7b6d65e.ngrok-free.app';
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
      transportModes: [{ mode: BUS }, { mode: WALK }]
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
  const variables: GtfsVars = {
    fromLat: from.lat,
    fromLon: from.lon,
    toLat: to.lat,
    toLon: to.lon,
    numItineraries,
  };

  console.log('🚀 GTFS Request:', {
    url: GTFS_URL,
    variables
  });

  try {
    const data: any = await gtfsClient.request(GTFS_PLAN_QUERY, variables);
    console.log('✅ GTFS Response:', data);
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
      const isBus = leg.mode === 'BUS';
      
      return {
        mode: leg.mode || 'UNKNOWN',
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
        fareProducts: isBus ? calculateFareProducts(leg.distance || 0, routeId) : [],
      };
    });

    // Count transfers as number of non-walk legs minus 1
    const transitLegs = legs.filter(leg => leg.mode !== 'WALK').length;
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

