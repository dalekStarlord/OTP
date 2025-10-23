/**
 * Home/Plan Trip page - Main journey planning interface
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlanStore } from '../store/planStore';
import { useAppStore } from '../store/appStore';
import { EnhancedSearchBar } from '../components/ui/EnhancedSearchBar';
import { ModeToggleGroup } from '../components/ui/ModeToggle';
import { RouteCard } from '../components/ui/RouteCard';
import { Button } from '../components/ui/Button';
import { MapLegend } from '../components/ui/MapLegend';
import { planTripGtfs } from '../lib/otp';
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
      
      // Log first itinerary structure for debugging
      if (results.length > 0) {
        console.log('📦 First itinerary structure:', {
          id: results[0].id,
          legs: results[0].legs.map(leg => ({
            mode: leg.mode,
            hasPolyline: !!leg.polyline,
            polylineLength: leg.polyline?.length || 0,
            from: { lat: leg.from.lat, lon: leg.from.lon, name: leg.from.name },
            to: { lat: leg.to.lat, lon: leg.to.lon, name: leg.to.name },
          }))
        });
      }

      // Sort based on filter
      const sorted = [...results].sort((a, b) => {
        if (filters.sortBy === 'fastest') {
          return a.duration - b.duration;
        }
        if (filters.sortBy === 'cheapest') {
          // Mock fare calculation
          const fareA = a.legs.filter(l => l.mode !== 'WALK').length * 13;
          const fareB = b.legs.filter(l => l.mode !== 'WALK').length * 13;
          return fareA - fareB;
        }
        if (filters.sortBy === 'fewestTransfers') {
          return a.transfers - b.transfers;
        }
        return 0;
      });

      setItineraries(sorted);
      // Clear any previous selection to prevent re-render issues
      setSelectedItineraryId(undefined);
      
      // Save to recent searches
      addRecentSearch({ from, to });

      addToast({
        type: 'success',
        message: `Found ${sorted.length} routes`,
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

  const handleClear = () => {
    setFrom(undefined);
    setTo(undefined);
    setItineraries(undefined);
    setSelectedItineraryId(undefined);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Picking mode indicator - Bottom right corner */}
      {pickingMode && (
        <div className="absolute bottom-24 right-4 z-50 pointer-events-none">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                📍 {pickingMode === 'from' ? 'Click map for start point' : 'Click map for destination'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main content - NO z-index on main wrapper */}
      <main id="main-content" className="h-full flex flex-col md:flex-row">
        {/* Left sidebar - Search & Controls */}
        <div 
          className={cn(
            "w-full md:w-96 md:h-full overflow-y-auto shadow-xl flex flex-col transition-all duration-300",
            pickingMode
              ? "bg-white/90 dark:bg-gray-800/90"
              : "bg-white dark:bg-gray-800"
          )}
        >
          <div className="p-4 space-y-4 flex-1">
            {/* Search boxes */}
            <div className="relative space-y-3">
              <EnhancedSearchBar
                type="from"
                value={from}
                onChange={setFrom}
                autoFocus
              />

              {/* Swap and Clear buttons */}
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={handleSwap}
                  disabled={!from && !to}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('search.swap')}
                  title={t('search.swap')}
                >
                  <ArrowLeftRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleClear}
                  disabled={!from && !to}
                  className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Clear locations"
                  title="Clear all locations"
                >
                  <svg 
                    className="h-5 w-5 text-red-600 dark:text-red-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </button>
              </div>

              <EnhancedSearchBar
                type="to"
                value={to}
                onChange={setTo}
              />
            </div>

            {/* Fare Type Selector */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-3">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
                💰 Fare Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="fareType"
                    value="regular"
                    checked={fareType === 'regular'}
                    onChange={(e) => setFareType(e.target.value as 'regular' | 'discount')}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600">
                    Regular Fare
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="fareType"
                    value="discount"
                    checked={fareType === 'discount'}
                    onChange={(e) => setFareType(e.target.value as 'regular' | 'discount')}
                    className="w-4 h-4 text-green-600 focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-green-600">
                      Discounted (20% off)
                    </span>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      Student/Senior/PWD
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {t('results.title')} • {t(`sort.${filters.sortBy}`)}
              </span>
              <SlidersHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Filters panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  {/* Sort options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Sort by
                    </label>
                    <div className="flex gap-2">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setFilters({ sortBy: option.id as any })}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filters.sortBy === option.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t(option.nameKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode toggles */}
                  <ModeToggleGroup
                    modes={filters.modes}
                    onChange={(mode, state) => {
                      setFilters({
                        modes: { ...filters.modes, [mode]: state },
                      });
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Plan route button */}
            <Button
              onClick={handlePlanRoute}
              disabled={!from || !to}
              fullWidth
              size="lg"
            >
              Plan Route
            </Button>

            {/* Results list */}
            {itineraries && itineraries.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {itineraries.length} {t('results.title')}
                </h2>
                
                {itineraries.map((itinerary) => (
                  <RouteCard
                    key={itinerary.id}
                    itinerary={itinerary}
                    fareType={fareType}
                    selected={selectedItineraryId === itinerary.id}
                    onSelect={() => {
                      console.log('🟢 Home: Setting selected itinerary ID:', itinerary.id);
                      setSelectedItineraryId(itinerary.id);
                    }}
                    onHover={(hover) => setHoveredItineraryId(hover ? itinerary.id : null)}
                  />
                ))}
              </div>
            )}

            {/* No results */}
            {itineraries && itineraries.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>{t('results.noResults')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative">
          <MapView hoveredItineraryId={hoveredItineraryId} />
          
          {/* Map legend (desktop) */}
          <div className="hidden md:block absolute bottom-4 right-4 z-20">
            <MapLegend />
          </div>
        </div>
      </main>
    </div>
  );
}

