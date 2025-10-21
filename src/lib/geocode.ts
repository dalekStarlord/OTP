import type { Coord } from './types';

export type GeocodeSuggestion = {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
};

// Nominatim geocoding (respecting usage policy with 1 req/sec via debounce)
export async function geocodeSearch(
  query: string,
  signal?: AbortSignal
): Promise<GeocodeSuggestion[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    // Use Nominatim with viewbox for Cagayan de Oro area
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '5',
      addressdetails: '1',
      viewbox: '124.5,8.3,124.8,8.6', // CDO bounding box
      bounded: '1',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        signal,
        headers: {
          'User-Agent': 'CDOJeepney/0.2.0',
        },
      }
    );

    if (!response.ok) throw new Error('Geocode failed');

    const data = await response.json();

    return data.map((item: any) => ({
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Ignore abort errors
      return [];
    }
    console.error('Geocoding error:', error);
    return [];
  }
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

