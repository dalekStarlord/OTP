/**
 * RouteDetailsSheet component - Main container with two-level navigation
 * Level 1: Route Overview (leg cards)
 * Level 2: Individual Leg Detail
 */

import { useTranslation } from 'react-i18next';
import { usePlanStore } from '../../store/planStore';
import { LegCard } from './LegCard';
import { LegDetailView } from './LegDetailView';
import type { NormalizedItinerary, FareType } from '../../lib/types';
import { formatDuration, formatFare, calculateTotalFare } from '../../lib/utils';

interface RouteDetailsSheetProps {
  itinerary: NormalizedItinerary;
  fareType: FareType;
}

export default function RouteDetailsSheet({ itinerary, fareType }: RouteDetailsSheetProps) {
  const { t, i18n } = useTranslation();
  const { viewingLegIndex, setViewingLegIndex, setFocusedLegIndex, setSelectedItineraryId } = usePlanStore();

  const totalFare = calculateTotalFare(itinerary, fareType);

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
          {t('route.routeDetails')}
        </h2>
        <button
          onClick={handleBackToJourneys}
          className="text-sm text-blue-600 dark:text-blue-400 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          aria-label={t('route.backToJourneys')}
        >
          {t('route.back')}
        </button>
      </div>

      {/* Route Summary */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">{t('route.totalDuration')}</span>
            <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">
              {formatDuration(itinerary.duration, i18n.language)}
            </span>
          </div>
          {totalFare > 0 && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">{t('fare.totalFare')}</span>
              <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">
                ₱{formatFare(totalFare)}
              </span>
            </div>
          )}
        </div>
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
