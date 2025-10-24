/**
 * Enhanced type definitions for CDO Jeepney Planner
 */

import { Coord, NormalizedItinerary, NormalizedLeg } from './types';

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'en' | 'fil' | 'ceb';
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  preferredModes: string[];
  notifications: {
    delays: boolean;
    alternatives: boolean;
  };
}

// Saved places
export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  coord: Coord;
  type: 'home' | 'work' | 'university' | 'custom';
  createdAt: number;
}

// Saved routes
export interface SavedRoute {
  id: string;
  name: string;
  from: Coord;
  to: Coord;
  itinerary: NormalizedItinerary;
  savedAt: number;
  frequency: number; // How many times used
}

// Recent search
export interface RecentSearch {
  id: string;
  from: Coord;
  to: Coord;
  timestamp: number;
}

// Live vehicle
export interface LiveVehicle {
  id: string;
  route: string;
  headsign: string;
  position: Coord;
  bearing: number;
  speed: number; // m/s
  congestion: 'none' | 'light' | 'moderate' | 'heavy';
  eta: number; // timestamp
  nextStop?: string;
}

// Service advisory
export interface ServiceAdvisory {
  id: string;
  type: 'closure' | 'reroute' | 'delay' | 'fareChange';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedRoutes: string[];
  affectedArea?: {
    center: Coord;
    radius: number; // meters
  };
  alternatives?: string[];
  startTime: number;
  endTime?: number;
  createdAt: number;
}

// Contribution/report
export interface ContributionReport {
  id: string;
  type: 'wrongStop' | 'wrongRoute' | 'wrongName' | 'missing' | 'other';
  location?: Coord;
  route?: string;
  details: string;
  userId?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: number;
}

// Geocode result
export interface GeocodeResult {
  id: string;
  name: string;
  address: string;
  coord: Coord;
  type: 'landmark' | 'street' | 'barangay' | 'poi';
  district?: string; // For disambiguation
  landmark?: string; // Nearest landmark for wayfinding
}

// Route filter options
export interface RouteFilters {
  sortBy: 'fastest' | 'cheapest' | 'fewestTransfers';
  modes: {
    [key: string]: 'include' | 'exclude' | 'prefer';
  };
  maxWalkDistance?: number; // meters
  maxTransfers?: number;
  wheelchair?: boolean;
}

// Navigation step (enhanced for wayfinding)
export interface NavigationStep {
  id: string;
  type: 'walk' | 'board' | 'alight' | 'transfer';
  instruction: string;
  landmark?: string; // e.g., "near SM CDO Downtown"
  distance?: number;
  duration?: number;
  mode?: string;
  lineName?: string;
  direction?: string; // e.g., "towards Bulua"
}

// App status (for status visibility heuristic)
export interface AppStatus {
  online: boolean;
  fetching: boolean;
  gpsLock: boolean;
  computing: boolean;
  syncing: boolean;
  lastUpdate?: number;
  error?: {
    type: 'network' | 'geocode' | 'route' | 'location' | 'unknown';
    message: string;
    recoverable: boolean;
  };
}

// Toast notification
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

// Offline cache data
export interface OfflineData {
  savedRoutes: SavedRoute[];
  recentSearches: RecentSearch[];
  favorites: SavedPlace[];
  lastSync: number;
  tiles?: {
    zoom: number;
    bounds: { north: number; south: number; east: number; west: number };
  };
}

