/**
 * Home/Plan Trip page - Main journey planning interface
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlanStore } from '../store/planStore';
import { useAppStore } from '../store/appStore';
import { EnhancedSearchBar } from '../components/ui/EnhancedSearchBar';
import { RouteCard } from '../components/ui/RouteCard';
import { Button } from '../components/ui/Button';
import { MapLegend } from '../components/ui/MapLegend';
import RouteDetailsSheet from '../components/ui/RouteDetailsSheet';
import { UnifiedSidebar } from '../components/ui/UnifiedSidebar';
import { LocationToggle } from '../components/ui/LocationToggle';
import { planTripGtfs, checkAvailableRoutes, checkAvailableStops, testSimpleRoute, checkRouteTrips, checkServiceDates, checkPlanSchema } from '../lib/otp';
import { SORT_OPTIONS } from '../lib/constants';
import { ArrowLeftRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import MapView from '../components/MapView';

export function Home() {
  const { t } = useTranslation();
  const { from, to, setFrom, setTo, fareType, setFareType, itineraries, setItineraries, selectedItineraryId, setSelectedItineraryId, pickingMode } = usePlanStore();
  const { filters, setFilters, setStatus, addToast, addRecentSearch } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredItineraryId, setHoveredItineraryId] = useState<string | null>(null);

  // Run diagnostics on mount to check OTP data
  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        await checkPlanSchema(); // Check what parameters OTP 2.x accepts
        await checkAvailableRoutes();
        await checkAvailableStops();
        await checkRouteTrips();
        await checkServiceDates();
      } catch (error) {
        console.error('Diagnostics failed:', error);
      }
    };
    runDiagnostics();
  }, []);

  // Sort itineraries based on filter
  const sortedItineraries = useMemo(() => {
    if (!itineraries || itineraries.length === 0) return itineraries;
    
    return [...itineraries].sort((a, b) => {
      if (filters.sortBy === 'fastest') {
        return a.duration - b.duration;
      }
      if (filters.sortBy === 'cheapest') {
        // Calculate fare based on number of transit legs (₱13 base fare per jeepney)
        const fareA = a.legs.filter(l => l.mode !== 'WALK').length * 13;
        const fareB = b.legs.filter(l => l.mode !== 'WALK').length * 13;
        return fareA - fareB;
      }
      if (filters.sortBy === 'fewestTransfers') {
        return a.transfers - b.transfers;
      }
      return 0;
    });
  }, [itineraries, filters.sortBy]);

  const handlePlanRoute = async () => {
    if (!from || !to) {
      addToast({
        type: 'warning',
        message: t('errors.routeFailed'),
      });
      return;
    }

    setStatus({ computing: true });
    
    try {
      // Use real OTP API with GTFS endpoint
      const results = await planTripGtfs(
        from,
        to,
        new Date().toISOString(), // Current date/time
        5 // Number of itineraries
      );
      
      if (results.length === 0) {
        console.warn('⚠️ No itineraries returned from API!');
        console.warn('🧪 Running diagnostic test with relaxed constraints...');
        try {
          await testSimpleRoute(from, to);
        } catch (err) {
          console.error('Diagnostic test also failed:', err);
        }
      }

      // Store results as-is, sorting will be handled by useMemo
      setItineraries(results);
      // Clear any previous selection to prevent re-render issues
      setSelectedItineraryId(undefined);
      
      // Save to recent searches
      addRecentSearch({ from, to });

      addToast({
        type: 'success',
        message: t('plan.foundRoutes', { count: results.length }),
      });
    } catch (error) {
      console.error('Route planning error:', error);
      addToast({
        type: 'error',
        message: t('errors.routeFailed'),
        action: {
          label: t('errors.retry'),
          onClick: handlePlanRoute,
        },
      });
    } finally {
      setStatus({ computing: false });
    }
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Layout (< lg) */}
      <div className="lg:hidden h-screen flex flex-col">
        {/* Mobile From/To Bar - sticky under header */}
        <div className="flex-shrink-0 sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-2 py-1.5">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-1.5 space-y-1.5">
                <EnhancedSearchBar
                  type="from"
                  value={from}
                  onChange={setFrom}
                />
                <button
                  onClick={handleSwap}
                  disabled={!from && !to}
                  aria-label="Swap locations"
                  className="absolute right-2 top-[50%] -translate-y-[39%] h-8 w-8 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors z-10 pointer-events-auto"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </button>
                <EnhancedSearchBar
                  type="to"
                  value={to}
                  onChange={setTo}
                />
                      </div>
            <div className="mt-1">
                <Button
                  onClick={handlePlanRoute}
                  disabled={!from || !to}
                  fullWidth
                className="py-1.5 text-sm"
                >
                  {t('plan.planRoute')}
                </Button>
            </div>
          </div>
        </div>

        {/* Map Section - fills remaining space when no results, shrinks when results shown */}
        {(!itineraries || itineraries.length === 0) ? (
          <div className="flex-1 relative overflow-hidden z-0">
            <MapView hoveredItineraryId={hoveredItineraryId} />
            <LocationToggle />
          </div>
        ) : (
          <>
            <div className="relative flex-shrink-0 overflow-hidden z-0 h-[35vh]">
              <MapView hoveredItineraryId={hoveredItineraryId} />
              <LocationToggle />
            </div>

            {/* Search & Results Section - scrollable bottom area */}
            <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 overflow-y-auto relative z-10">
              {/* Results View */}
              {sortedItineraries && sortedItineraries.length > 0 && (
            <div className="h-full flex flex-col">
              {selectedItineraryId ? (
                // Show Route Details Sheet when itinerary is selected
                (() => {
                  const selectedItinerary = sortedItineraries.find(i => i.id === selectedItineraryId);
                  if (!selectedItinerary) return null;
                  return (
                    <div className="h-full flex flex-col">
                      <RouteDetailsSheet
                        itinerary={selectedItinerary}
                        fareType={fareType}
                      />
                    </div>
                  );
                })()
              ) : (
                // Show Journey List when no itinerary is selected
            <div className="p-3 space-y-2">
              {/* Journey Results Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  {sortedItineraries.length} {sortedItineraries.length === 1 ? t('plan.suggestedJourney') : t('plan.suggestedJourneysMulti')}
                </h2>
              </div>

              {/* Sort/Filter Toggle - Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 active:border-blue-500"
              >
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                  Sort: {t(`sort.${filters.sortBy}`)}
                </span>
                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2" />
              </button>

              {/* Filters panel - Mobile */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-3"
                  >
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t('plan.sortBy')}
                    </label>
                    <div className="flex flex-col gap-2">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setFilters({ sortBy: option.id as any });
                            setShowFilters(false);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                            filters.sortBy === option.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {t(option.nameKey)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fare Type Toggle - Compact (one-tap buttons) */}
              <div className="flex gap-1.5 text-xs" role="radiogroup" aria-label="Fare Type">
                <button
                  type="button"
                  onClick={() => setFareType('regular')}
                  role="radio"
                  aria-checked={fareType === 'regular'}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 cursor-pointer py-1.5 px-2 rounded-lg border transition-colors",
                    fareType === 'regular'
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-blue-300"
                  )}
                >
                  <span className="font-medium text-[11px]">{t('fare.regular')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFareType('discount')}
                  role="radio"
                  aria-checked={fareType === 'discount'}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 cursor-pointer py-1.5 px-2 rounded-lg border transition-colors",
                    fareType === 'discount'
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-green-300"
                  )}
                >
                  <span className="font-medium text-[11px]">{t('fare.discount')}</span>
                </button>
              </div>

              {/* Route Cards */}
              <div className="space-y-2">
                {sortedItineraries.map((itinerary, index) => (
                  <RouteCard
                    key={itinerary.id}
                    itinerary={itinerary}
                    itineraryIndex={index}
                    fareType={fareType}
                    selected={selectedItineraryId === itinerary.id}
                    onSelect={() => {
                      setSelectedItineraryId(itinerary.id);
                    }}
                    onHover={(hover) => setHoveredItineraryId(hover ? itinerary.id : null)}
                  />
                ))}
              </div>
                      </div>
              )}
            </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Desktop Layout (≥ lg) */}
      <main id="main-content" className="hidden lg:flex h-full flex-row">
        {/* Unified Sidebar with Plan Trip and Settings */}
        <UnifiedSidebar
          pickingMode={pickingMode || null}
          hoveredItineraryId={hoveredItineraryId}
          setHoveredItineraryId={setHoveredItineraryId}
        />

        {/* Map area */}
        <div className="flex-1 relative min-h-[45vh] lg:h-auto">
          <MapView hoveredItineraryId={hoveredItineraryId} />
          
          {/* Location toggle button */}
          <LocationToggle />
          
          {/* Map legend (desktop) */}
          <div className="hidden lg:block absolute bottom-4 right-4 z-20">
            <MapLegend />
          </div>
        </div>
      </main>
    </div>
  );
}

