import { usePlanStore } from '../store/planStore';
import { planTripGtfs, dedupeAndSort } from '../lib/otp';

export default function Controls() {
  const {
    from,
    to,
    dateTimeISO,
    numItineraries,
    fareType,
    isLoading,
    setNumItineraries,
    setFareType,
    setItineraries,
    setSelectedItineraryId,
    setLoading,
    setError,
    clear,
  } = usePlanStore();

  const canPlan = from && to && !isLoading;

  async function handleGetRoutes() {
    if (!from || !to) {
      setError('Please set both From and To locations');
      return;
    }

    console.log('🎯 Starting route planning:', {
      from,
      to,
      dateTime: dateTimeISO,
      numItineraries
    });

    setLoading(true);
    setError(undefined);

    try {
      const itineraries = await planTripGtfs(from, to, dateTimeISO, numItineraries);

      console.log('📊 GTFS Results:', {
        count: itineraries.length
      });

      if (itineraries.length === 0) {
        setError('No routes found. Try different locations or times.');
        setItineraries(undefined);
        setSelectedItineraryId(undefined);
      } else {
        const deduped = dedupeAndSort(itineraries);
        console.log('✅ Successfully planned', deduped.length, 'routes');
        setItineraries(deduped);
        // Don't auto-select to prevent re-render issues
        // setSelectedItineraryId(deduped[0]?.id);
      }
    } catch (error) {
      console.error('❌ GTFS Planning error:', error);
      setError(error instanceof Error ? error.message : 'Failed to plan trip. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleGetRoutes}
          disabled={!canPlan}
          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-200 disabled:shadow-none active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-1.5">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Planning...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Find Routes
            </span>
          )}
        </button>
        <button
          onClick={clear}
          className="px-2.5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 active:scale-95"
          title="Clear all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-2 text-xs">
        <details className="group">
          <summary className="cursor-pointer text-gray-600 text-[11px] font-medium hover:text-gray-900 transition-colors flex items-center justify-between py-1">
            <span>⚙️ Options</span>
            <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          
          <div className="mt-2 space-y-2">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Fare Type
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="fareType"
                    value="regular"
                    checked={fareType === 'regular'}
                    onChange={(e) => setFareType(e.target.value as 'regular' | 'discount')}
                    className="w-3.5 h-3.5 text-blue-600 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700 group-hover:text-gray-900">
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
                    className="w-3.5 h-3.5 text-blue-600 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700 group-hover:text-gray-900">
                    Discounted (20% off)
                  </span>
                  <span className="text-[9px] text-gray-500">
                    Student/Senior/PWD
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Routes
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numItineraries}
                onChange={(e) => setNumItineraries(parseInt(e.target.value) || 5)}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Depart
              </label>
              <input
                type="datetime-local"
                value={dateTimeISO.slice(0, 16)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    usePlanStore.getState().setDateTime(date.toISOString());
                  }
                }}
                className="w-full px-2 py-1 border border-gray-200 rounded text-[11px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

