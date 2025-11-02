/**
 * Real-time GPS location tracking service
 * Uses navigator.geolocation.watchPosition() for continuous tracking
 */

import type { Coord } from './types';

export interface LocationWatchCallbacks {
  onSuccess: (position: GeolocationPosition) => void;
  onError: (error: GeolocationPositionError) => void;
}

export interface LocationWatchOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const DEFAULT_OPTIONS: Required<LocationWatchOptions> = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * Check if geolocation is supported
 */
export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Start watching user's position with real-time updates
 * Returns a watch ID that can be used to stop tracking
 */
export function startLocationWatch(
  callbacks: LocationWatchCallbacks,
  options: LocationWatchOptions = {}
): number | null {
  if (!isGeolocationSupported()) {
    const mockError: GeolocationPositionError = {
      code: 1, // PERMISSION_DENIED
      message: 'Geolocation is not supported by this browser',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };
    callbacks.onError(mockError);
    return null;
  }

  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  const watchId = navigator.geolocation.watchPosition(
    callbacks.onSuccess,
    callbacks.onError,
    finalOptions
  );

  return watchId;
}

/**
 * Stop watching position
 */
export function stopLocationWatch(watchId: number): void {
  if (!isGeolocationSupported()) {
    return;
  }
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Convert GeolocationPosition to Coord
 */
export function positionToCoord(position: GeolocationPosition): Coord {
  return {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    name: 'My Location',
  };
}

/**
 * Get error message for geolocation errors
 */
export function getLocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access denied. Please enable location permissions in your browser settings.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable. Please check your GPS settings.';
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while getting your location.';
  }
}

/**
 * Get browser-specific instructions for enabling location
 */
export function getLocationInstructions(): string {
  if (typeof navigator === 'undefined') {
    return '';
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

  if (isIOS && isSafari) {
    return 'Go to Settings > Safari > Location Services, then turn it on and allow this website.';
  } else if (isChrome) {
    return 'Click the location icon 🔒 in the address bar, then allow location access.';
  } else if (isFirefox) {
    return 'Click the location icon in the address bar, then click "Allow".';
  } else if (isSafari) {
    return 'Go to Safari > Settings for this Website > Location, then select "Allow".';
  } else {
    return 'Click the location icon in your browser\'s address bar and select "Allow".';
  }
}

