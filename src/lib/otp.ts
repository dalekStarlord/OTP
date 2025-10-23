import { GraphQLClient } from 'graphql-request';
import type { Coord, NormalizedItinerary, NormalizedLeg } from './types';

const OTP_BASE = import.meta.env.VITE_OTP_BASE || 'https://67841b82a6c7.ngrok-free.app';
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

function normalizeGtfs(data: any): NormalizedItinerary[] {
  const itineraries = data?.plan?.itineraries || [];
  
  return itineraries.map((itinerary: any, idx: number) => {
    const legs: NormalizedLeg[] = (itinerary.legs || []).map((leg: any) => ({
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
    }));

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

