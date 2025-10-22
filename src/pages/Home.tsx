/**
 * Home/Plan Trip page - Main journey planning interface
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlanStore } from '../store/planStore';
import { useAppStore } from '../store/appStore';
import { EnhancedSearchBar } from '../components/ui/EnhancedSearchBar';
import { ModeToggleGroup } from '../components/ui/ModeToggle';
import { RouteCard } from '../components/ui/RouteCard';
import { Button } from '../components/ui/Button';
import { MapLegend } from '../components/ui/MapLegend';
import { planRoute } from '../mocks/mockApi';
import { SORT_OPTIONS } from '../lib/constants';
import { ArrowLeftRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Coord } from '../lib/types';
import MapView from '../components/MapView';

export function Home() {
  const { t } = useTranslation();
  const { from, to, setFrom, setTo, itineraries, setItineraries, selectedItineraryId, setSelectedItineraryId } = usePlanStore();
  const { filters, setFilters, setStatus, addToast, addRecentSearch } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredItineraryId, setHoveredItineraryId] = useState<string | null>(null);

  // Auto-search when from and to are set
  useEffect(() => {
    if (from && to) {
      handlePlanRoute();
    }
  }, [from, to]);

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
      const results = await planRoute(from, to, {
        numItineraries: 5,
        modes: Object.entries(filters.modes)
          .filter(([_, state]) => state !== 'exclude')
          .map(([mode]) => mode),
      });

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

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-50">
      {/* Map layer */}
      <MapView hoveredItineraryId={hoveredItineraryId} />

      {/* Main content */}
      <main id="main-content" className="relative z-10 h-full flex flex-col md:flex-row">
        {/* Left sidebar - Search & Controls */}
        <div className="w-full md:w-96 bg-white md:h-full overflow-y-auto shadow-xl flex flex-col">
          <div className="p-4 space-y-4 flex-1">
            {/* Search boxes */}
            <div className="relative space-y-3">
              <EnhancedSearchBar
                type="from"
                value={from}
                onChange={setFrom}
                autoFocus
              />

              {/* Swap button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwap}
                  disabled={!from && !to}
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('search.swap')}
                  title={t('search.swap')}
                >
                  <ArrowLeftRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <EnhancedSearchBar
                type="to"
                value={to}
                onChange={setTo}
              />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="font-medium text-gray-700">
                {t('results.title')} • {t(`sort.${filters.sortBy}`)}
              </span>
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            </button>

            {/* Filters panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 border-2 border-gray-200 rounded-lg p-4"
                >
                  {/* Sort options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <h2 className="font-bold text-lg text-gray-900">
                  {itineraries.length} {t('results.title')}
                </h2>
                
                {itineraries.map((itinerary) => (
                  <RouteCard
                    key={itinerary.id}
                    itinerary={itinerary}
                    selected={selectedItineraryId === itinerary.id}
                    onSelect={() => setSelectedItineraryId(itinerary.id)}
                    onHover={(hover) => setHoveredItineraryId(hover ? itinerary.id : null)}
                  />
                ))}
              </div>
            )}

            {/* No results */}
            {itineraries && itineraries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>{t('results.noResults')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Map legend (desktop) */}
        <div className="hidden md:block absolute bottom-4 right-4 z-20">
          <MapLegend />
        </div>
      </main>
    </div>
  );
}

