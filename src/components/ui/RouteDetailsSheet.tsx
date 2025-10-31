/**
 * RouteDetailsSheet component - Main container with two-level navigation
 * Level 1: Route Overview (leg cards)
 * Level 2: Individual Leg Detail
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlanStore } from '../../store/planStore';
import { useAppStore } from '../../store/appStore';
import { LegCard } from './LegCard';
import { LegDetailView } from './LegDetailView';
import type { NormalizedItinerary, FareType } from '../../lib/types';
import { formatDuration, formatFare, calculateTotalFare } from '../../lib/utils';
import { Navigation, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface RouteDetailsSheetProps {
  itinerary: NormalizedItinerary;
  fareType: FareType;
}

export default function RouteDetailsSheet({ itinerary, fareType }: RouteDetailsSheetProps) {
  const { t, i18n } = useTranslation();
  const { 
    viewingLegIndex, 
    setViewingLegIndex, 
    focusedLegIndex, 
    setFocusedLegIndex, 
    setSelectedItineraryId,
    navigation,
    startRealTimeNavigation,
    stopRealTimeNavigation,
    pauseNavigation,
    resumeNavigation,
  } = usePlanStore();
  const { addToast } = useAppStore();
  const [isStartingNavigation, setIsStartingNavigation] = useState(false);

  const totalFare = calculateTotalFare(itinerary, fareType);
  const isNavigating = navigation.isNavigating && navigation.isRealTimeTracking;

  // Handle leg card click - navigate to leg detail
  const handleLegClick = (index: number) => {
    setViewingLegIndex(index);
    setSelectedItineraryId(itinerary.id);
    setFocusedLegIndex(index); // Highlight this leg on map
  };

  // Handle back to legs list
  const handleBackToLegsList = () => {
    setViewingLegIndex(null);
    setFocusedLegIndex(null); // Clear map highlight
  };

  // Handle back to journey list (from route overview)
  const handleBackToJourneys = () => {
    setSelectedItineraryId(undefined);
    setViewingLegIndex(null);
    setFocusedLegIndex(null);
  };

  // Handle start real-time navigation
  const handleStartNavigation = async () => {
    if (!navigator.geolocation) {
      addToast({
        type: 'error',
        message: 'GPS is not supported on this device',
      });
      return;
    }

    setIsStartingNavigation(true);
    try {
      const success = await startRealTimeNavigation();
      if (success) {
        addToast({
          type: 'success',
          message: 'Real-time navigation started',
        });
      } else {
        addToast({
          type: 'error',
          message: 'Failed to start GPS tracking. Please enable location permissions.',
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to start navigation',
      });
    } finally {
      setIsStartingNavigation(false);
    }
  };

  const handleStopNavigation = () => {
    stopRealTimeNavigation();
    addToast({
      type: 'info',
      message: 'Navigation stopped',
    });
  };

  // If viewing a specific leg detail (Level 2)
  if (viewingLegIndex !== null) {
    const leg = itinerary.legs[viewingLegIndex];
    if (!leg) {
      // Invalid leg index, go back to legs list
      handleBackToLegsList();
      return null;
    }

    return (
      <LegDetailView
        leg={leg}
        legIndex={viewingLegIndex}
        fareType={fareType}
        onBack={handleBackToLegsList}
      />
    );
  }

  // Level 1: Route Overview (leg cards)
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">
          Route Details
        </h2>
        <button
          onClick={handleBackToJourneys}
          className="text-sm text-blue-600 dark:text-blue-400 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          aria-label="Back to journey list"
        >
          ← Back
        </button>
      </div>

      {/* Route Summary */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Duration:</span>
            <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">
              {formatDuration(itinerary.duration, i18n.language)}
            </span>
          </div>
          {totalFare > 0 && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total Fare:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">
                ₱{formatFare(totalFare)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Control */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {!isNavigating ? (
          <Button
            onClick={handleStartNavigation}
            disabled={isStartingNavigation}
            fullWidth
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isStartingNavigation ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Starting Navigation...</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                <span>Start Real-Time Navigation</span>
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Navigation Active
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={navigation.isPaused ? resumeNavigation : pauseNavigation}
                variant="secondary"
                fullWidth
              >
                {navigation.isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                onClick={handleStopNavigation}
                variant="secondary"
                fullWidth
              >
                Stop
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Leg Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {itinerary.legs.map((leg, index) => (
          <LegCard
            key={index}
            leg={leg}
            legIndex={index}
            fareType={fareType}
            onClick={() => handleLegClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
