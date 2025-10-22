/**
 * Design system constants and tokens
 */

// CDO-specific coordinates
export const CDO_CENTER = { lat: 8.4542, lon: 124.6319 };
export const CDO_BOUNDS = {
  north: 8.5500,
  south: 8.3500,
  east: 124.7500,
  west: 124.5000,
};

// Common places for quick access
export const QUICK_PLACES = [
  { id: 'home', nameKey: 'quickPlaces.home', icon: 'home' },
  { id: 'work', nameKey: 'quickPlaces.work', icon: 'briefcase' },
  { id: 'university', nameKey: 'quickPlaces.university', icon: 'graduation-cap' },
];

// CDO Landmarks for better wayfinding
export const CDO_LANDMARKS = [
  { name: 'SM CDO Downtown Premier', lat: 8.4781, lon: 124.6472 },
  { name: 'Limketkai Center', lat: 8.4853, lon: 124.6542 },
  { name: 'Divisoria Night Cafe', lat: 8.4833, lon: 124.6472 },
  { name: 'Capitol University', lat: 8.4856, lon: 124.6514 },
  { name: 'Xavier University', lat: 8.4894, lon: 124.6525 },
  { name: 'Cogon Market', lat: 8.4664, lon: 124.6358 },
  { name: 'Gaisano City Mall', lat: 8.4586, lon: 124.6350 },
  { name: 'City Hall', lat: 8.4822, lon: 124.6467 },
];

// Transport modes
export const TRANSPORT_MODES = [
  { id: 'JEEPNEY', nameKey: 'modes.jeepney', icon: 'bus', color: 'yellow' },
  { id: 'BUS', nameKey: 'modes.bus', icon: 'bus', color: 'blue' },
  { id: 'TRICYCLE', nameKey: 'modes.tricycle', icon: 'bike', color: 'orange' },
  { id: 'WALK', nameKey: 'modes.walk', icon: 'footprints', color: 'green' },
  { id: 'FERRY', nameKey: 'modes.ferry', icon: 'ship', color: 'cyan' },
];

// Sort options
export const SORT_OPTIONS = [
  { id: 'fastest', nameKey: 'sort.fastest', field: 'duration' },
  { id: 'cheapest', nameKey: 'sort.cheapest', field: 'fare' },
  { id: 'fewestTransfers', nameKey: 'sort.fewestTransfers', field: 'transfers' },
];

// Status messages display duration
export const TOAST_DURATION = 3000;
export const STATUS_UPDATE_INTERVAL = 250; // For system status visibility

// Accessibility
export const FOCUS_RING_CLASSES = 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
export const SKIP_LINK_CLASSES = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg';

// Animation durations (respecting prefers-reduced-motion)
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Z-index layers
export const Z_INDEX = {
  map: 0,
  mapOverlay: 400,
  drawer: 900,
  header: 1000,
  modal: 1100,
  toast: 1200,
  tooltip: 1300,
};

// Storage keys
export const STORAGE_KEYS = {
  recentSearches: 'cdo-recent-searches',
  favorites: 'cdo-favorites',
  savedRoutes: 'cdo-saved-routes',
  userPreferences: 'cdo-user-preferences',
  quickPlaces: 'cdo-quick-places',
  offlineData: 'cdo-offline-data',
};

// Performance targets
export const PERFORMANCE = {
  routeSearchTTI: 1500, // ms
  mapPanFPS: 50,
  LCP: 2500, // ms
};

// API timeouts
export const API_TIMEOUT = 10000; // 10 seconds
export const RETRY_ATTEMPTS = 3;

