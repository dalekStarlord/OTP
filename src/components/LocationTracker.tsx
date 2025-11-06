/**
 * LocationTracker - Handles real-time GPS tracking
 * Uses watchPosition to continuously update user location
 */

import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import {
  startLocationWatch,
  stopLocationWatch,
  positionToCoord,
  getLocationErrorMessage,
  getLocationInstructions,
} from '../lib/location';
import { logger } from '../lib/logger';

export function LocationTracker() {
  const {
    isTrackingLocation,
    setCurrentLocation,
    setLocationAccuracy,
    setLocationWatchId,
    setIsTrackingLocation,
    setStatus,
    addToast,
  } = useAppStore();

  const lastUpdateRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const THROTTLE_MS = 1000; // Update max once per second

  useEffect(() => {
    if (!isTrackingLocation) {
      // Stop tracking if it was active
      if (watchIdRef.current !== null) {
        stopLocationWatch(watchIdRef.current);
        watchIdRef.current = null;
        setLocationWatchId(null);
        setStatus({ gpsLock: false });
      }
      return;
    }

    // Start tracking
    const watchIdPromise = startLocationWatch(
      {
        onSuccess: (position) => {
          const now = Date.now();
          
          // Throttle updates to prevent excessive state changes
          if (now - lastUpdateRef.current < THROTTLE_MS) {
            return;
          }
          lastUpdateRef.current = now;

          // Update location
          const coord = positionToCoord(position);
          setCurrentLocation(coord);
          
          // Update accuracy
          const accuracy = position.coords.accuracy;
          setLocationAccuracy(accuracy);
          
          // Clear GPS lock status once we have a position
          setStatus({ gpsLock: false });
        },
        onError: (error) => {
          logger.error('Location tracking error', error);
          
          // Stop tracking on error
          setIsTrackingLocation(false);
          setLocationWatchId(null);
          setStatus({ gpsLock: false });
          
          // Show error message
          const errorMessage = getLocationErrorMessage(error);
          const instructions = error.code === error.PERMISSION_DENIED 
            ? getLocationInstructions() 
            : '';
          
          addToast({
            type: 'error',
            message: instructions 
              ? `${errorMessage} ${instructions}` 
              : errorMessage,
            duration: instructions ? 8000 : 5000,
          });
        },
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdPromise.then((watchId) => {
      if (watchId !== null) {
        watchIdRef.current = watchId;
        setLocationWatchId(watchId);
        setStatus({ gpsLock: true });
      } else {
        // Failed to start tracking
        setIsTrackingLocation(false);
        addToast({
          type: 'error',
          message: 'Failed to start location tracking. Geolocation may not be supported.',
          duration: 5000,
        });
      }
    });

    // Cleanup on unmount or when tracking stops
    return () => {
      if (watchIdRef.current !== null) {
        stopLocationWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [
    isTrackingLocation,
    setCurrentLocation,
    setLocationAccuracy,
    setLocationWatchId,
    setIsTrackingLocation,
    setStatus,
    addToast,
  ]);

  // This component doesn't render anything
  return null;
}

