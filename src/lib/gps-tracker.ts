/**
 * GPS Tracking Utilities
 * Functions for calculating user position relative to route polylines
 */

import type { NormalizedItinerary, NormalizedLeg } from './types';
import { decodePolyline } from './polyline';
import type { LatLngTuple } from 'leaflet';

/**
 * Calculate the distance between two lat/lng points in meters
 * Using Haversine formula
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the nearest point on a polyline to a given GPS position
 * Returns the nearest point and its index in the polyline
 */
export function calculateNearestPointOnPolyline(
  gpsPos: { lat: number; lon: number },
  polyline: LatLngTuple[]
): { point: LatLngTuple; index: number; distance: number } {
  if (polyline.length === 0) {
    throw new Error('Polyline is empty');
  }

  let minDistance = Infinity;
  let nearestIndex = 0;
  let nearestPoint: LatLngTuple = polyline[0];

  for (let i = 0; i < polyline.length; i++) {
    const [lat, lon] = polyline[i];
    const distance = haversineDistance(gpsPos.lat, gpsPos.lon, lat, lon);

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
      nearestPoint = polyline[i];
    }
  }

  // Check segments between points for closer matches
  for (let i = 0; i < polyline.length - 1; i++) {
    const [lat1, lon1] = polyline[i];
    const [lat2, lon2] = polyline[i + 1];

    // Find closest point on line segment
    const segmentPoint = findClosestPointOnSegment(
      gpsPos,
      { lat: lat1, lon: lon1 },
      { lat: lat2, lon: lon2 }
    );

    const distance = haversineDistance(
      gpsPos.lat,
      gpsPos.lon,
      segmentPoint.lat,
      segmentPoint.lon
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
      nearestPoint = [segmentPoint.lat, segmentPoint.lon];
    }
  }

  return { point: nearestPoint, index: nearestIndex, distance: minDistance };
}

/**
 * Find the closest point on a line segment to a given point
 */
function findClosestPointOnSegment(
  point: { lat: number; lon: number },
  start: { lat: number; lon: number },
  end: { lat: number; lon: number }
): { lat: number; lon: number } {
  const A = point.lat - start.lat;
  const B = point.lon - start.lon;
  const C = end.lat - start.lat;
  const D = end.lon - start.lon;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let lat, lon;

  if (param < 0) {
    lat = start.lat;
    lon = start.lon;
  } else if (param > 1) {
    lat = end.lat;
    lon = end.lon;
  } else {
    lat = start.lat + param * C;
    lon = start.lon + param * D;
  }

  return { lat, lon };
}

/**
 * Calculate total distance along a polyline from start to a given index
 */
function calculateDistanceAlongPolyline(
  polyline: LatLngTuple[],
  endIndex: number
): number {
  let totalDistance = 0;
  const stopIndex = Math.min(endIndex, polyline.length - 1);

  for (let i = 0; i < stopIndex; i++) {
    const [lat1, lon1] = polyline[i];
    const [lat2, lon2] = polyline[i + 1];
    totalDistance += haversineDistance(lat1, lon1, lat2, lon2);
  }

  return totalDistance;
}

/**
 * Calculate route progress based on GPS position
 * Returns the current leg index and progress (0-1) on that leg
 */
export function calculateRouteProgress(
  gpsPosition: { lat: number; lon: number },
  itinerary: NormalizedItinerary
): { legIndex: number; progress: number; distanceFromRoute: number } {
  let totalDistanceTraveled = 0;
  let bestMatch: {
    legIndex: number;
    progress: number;
    distance: number;
  } | null = null;

  // Check each leg to find the best match
  for (let legIdx = 0; legIdx < itinerary.legs.length; legIdx++) {
    const leg = itinerary.legs[legIdx];
    
    if (!leg.polyline) {
      // For legs without polyline (e.g., WALK), check if GPS is near endpoints
      const fromDist = haversineDistance(
        gpsPosition.lat,
        gpsPosition.lon,
        leg.from.lat,
        leg.from.lon
      );
      const toDist = haversineDistance(
        gpsPosition.lat,
        gpsPosition.lon,
        leg.to.lat,
        leg.to.lon
      );

      // If close to start, progress is 0
      if (fromDist < 50) {
        if (!bestMatch || fromDist < bestMatch.distance) {
          bestMatch = {
            legIndex: legIdx,
            progress: 0,
            distance: fromDist,
          };
        }
      }
      // If close to end, progress is 1
      else if (toDist < 50) {
        if (!bestMatch || toDist < bestMatch.distance) {
          bestMatch = {
            legIndex: legIdx,
            progress: 1,
            distance: toDist,
          };
        }
      }
      continue;
    }

    const coords = decodePolyline(leg.polyline);
    if (coords.length === 0) continue;

    const nearest = calculateNearestPointOnPolyline(gpsPosition, coords);
    const legDistance = calculateDistanceAlongPolyline(coords, nearest.index);
    const totalLegDistance = calculateDistanceAlongPolyline(coords, coords.length);
    
    // If this is a better match (closer to route), use it
    if (!bestMatch || nearest.distance < bestMatch.distance) {
      bestMatch = {
        legIndex: legIdx,
        progress: totalLegDistance > 0 ? legDistance / totalLegDistance : 0,
        distance: nearest.distance,
      };
    }

    // If we've passed this leg, add its distance to total
    // Check if GPS position is past the end of this leg
    if (nearest.index >= coords.length - 5) {
      // Near the end of this leg
      totalDistanceTraveled += totalLegDistance;
    }
  }

  if (!bestMatch) {
    // Default to first leg, start position
    return { legIndex: 0, progress: 0, distanceFromRoute: 1000 };
  }

  // Clamp progress between 0 and 1
  bestMatch.progress = Math.max(0, Math.min(1, bestMatch.progress));

  return {
    legIndex: bestMatch.legIndex,
    progress: bestMatch.progress,
    distanceFromRoute: bestMatch.distance,
  };
}

/**
 * Determine which segments of a polyline have been passed based on GPS position
 * Returns a set of segment indices (0 to length-2) that have been passed
 */
export function getPassedSegments(
  gpsPosition: { lat: number; lon: number },
  polyline: LatLngTuple[],
  tolerance: number = 50
): Set<number> {
  const passed = new Set<number>();

  if (polyline.length < 2) return passed;

  const nearest = calculateNearestPointOnPolyline(gpsPosition, polyline);

  // All segments up to and including the nearest segment are considered passed
  for (let i = 0; i <= nearest.index && i < polyline.length - 1; i++) {
    // Check if GPS is actually past this segment
    const [lat1, lon1] = polyline[i];
    const [lat2, lon2] = polyline[i + 1];
    
    // Calculate distance from GPS to each endpoint
    const distToStart = haversineDistance(gpsPosition.lat, gpsPosition.lon, lat1, lon1);
    const distToEnd = haversineDistance(gpsPosition.lat, gpsPosition.lon, lat2, lon2);
    
    // If GPS is closer to end than start, or very close to end, segment is passed
    if (distToEnd < distToStart || distToEnd < tolerance) {
      passed.add(i);
    }
  }

  return passed;
}

