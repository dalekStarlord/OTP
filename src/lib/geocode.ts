import type { Coord } from './types';

export type GeocodeSuggestion = {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
};

// Photon geocoding API (CORS-friendly, built on OpenStreetMap)
export async function geocodeSearch(
  query: string,
  signal?: AbortSignal
): Promise<GeocodeSuggestion[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    // Use Photon API - CORS-friendly alternative to Nominatim
    // Focus on Cagayan de Oro area
    const params = new URLSearchParams({
      q: query,
      limit: '5',
      lat: '8.48',  // CDO center
      lon: '124.63',
      bbox: '124.5,8.3,124.8,8.6', // CDO bounding box
    });

    const response = await fetch(
      `https://photon.komoot.io/api/?${params}`,
      {
        signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('Photon API failed, falling back to local search');
      return getFallbackResults(query);
    }

    const data = await response.json();

    return data.features.map((item: any) => ({
      name: item.properties.name || item.properties.street || 'Unknown location',
      displayName: formatDisplayName(item.properties),
      lat: item.geometry.coordinates[1],
      lon: item.geometry.coordinates[0],
    }));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Ignore abort errors
      return [];
    }
    console.warn('Geocoding error, using fallback:', error);
    return getFallbackResults(query);
  }
}

// Format Photon response into readable display name
function formatDisplayName(props: any): string {
  const parts: string[] = [];
  
  if (props.name) parts.push(props.name);
  if (props.street) parts.push(props.street);
  if (props.city || props.county) parts.push(props.city || props.county);
  if (props.state) parts.push(props.state);
  
  return parts.join(', ') || 'Unnamed location';
}

// Fallback with common CDO locations if API fails
function getFallbackResults(query: string): GeocodeSuggestion[] {
  const commonLocations = [
    { name: 'SM CDO Downtown Premier', lat: 8.4823, lon: 124.6474 },
    { name: 'Limketkai Center', lat: 8.4853, lon: 124.6324 },
    { name: 'Divisoria Night Cafe', lat: 8.4813, lon: 124.6467 },
    { name: 'Capitol University', lat: 8.4771, lon: 124.6441 },
    { name: 'Xavier University', lat: 8.4844, lon: 124.6419 },
    { name: 'Cogon Market', lat: 8.4917, lon: 124.6459 },
    { name: 'Gaisano City Mall', lat: 8.4864, lon: 124.6503 },
    { name: 'Centrio Mall', lat: 8.4778, lon: 124.6428 },
    { name: 'CDO City Hall', lat: 8.4819, lon: 124.6464 },
    { name: 'Macabalan Port', lat: 8.5095, lon: 124.6314 },
  ];
  
  const lowerQuery = query.toLowerCase();
  const filtered = commonLocations.filter(loc => 
    loc.name.toLowerCase().includes(lowerQuery)
  );
  
  return filtered.map(loc => ({
    ...loc,
    displayName: `${loc.name}, Cagayan de Oro, Philippines`,
  }));
}

// Debounce helper
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Local storage cache for recent selections
const CACHE_KEY = 'cdojeepney_geocode_cache';
const MAX_CACHE_SIZE = 5;

export function getCachedSelections(): GeocodeSuggestion[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export function cacheSelection(selection: GeocodeSuggestion): void {
  try {
    const cached = getCachedSelections();
    const filtered = cached.filter(
      (item) => item.lat !== selection.lat || item.lon !== selection.lon
    );
    const updated = [selection, ...filtered].slice(0, MAX_CACHE_SIZE);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to cache selection:', error);
  }
}

// Convert GeocodeSuggestion to Coord
export function suggestionToCoord(suggestion: GeocodeSuggestion): Coord {
  return {
    lat: suggestion.lat,
    lon: suggestion.lon,
    name: suggestion.name,
  };
}

