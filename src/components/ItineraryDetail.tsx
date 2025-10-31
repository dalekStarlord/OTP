import { usePlanStore } from '../store/planStore';
import type { NormalizedLeg } from '../lib/types';

export default function ItineraryDetail() {
  const { itineraries, selectedItineraryId } = usePlanStore();

  const selectedItinerary = itineraries?.find((itin) => itin.id === selectedItineraryId);

  if (!selectedItinerary) return null;

  const durationMin = Math.round(selectedItinerary.duration / 60);
  const startTime = new Date(selectedItinerary.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(selectedItinerary.endTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="absolute top-16 right-3 z-[950] w-80 sm:w-96 max-w-[calc(50%-2rem)] max-h-[calc(100vh-20rem)] overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 hidden md:block">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-3 sm:p-4 text-white">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <h3 className="font-bold text-base sm:text-lg">Route Details</h3>
          <span className="text-xs sm:text-sm bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium">
            {durationMin} min
          </span>
        </div>
        <div className="text-xs sm:text-sm opacity-90">
          {startTime} → {endTime}
        </div>
      </div>
      
      {/* Legs */}
      <div className="overflow-y-auto max-h-[calc(100vh-26rem)] p-3 sm:p-4 space-y-2 sm:space-y-3">
        {selectedItinerary.legs.map((leg, idx) => (
          <LegCard key={idx} leg={leg} legNumber={idx + 1} />
        ))}
      </div>
    </div>
  );
}

type LegCardProps = {
  leg: NormalizedLeg;
  legNumber: number;
};

function LegCard({ leg, legNumber }: LegCardProps) {
  const durationMin = Math.round(leg.duration / 60);
  const distanceKm = (leg.distance / 1000).toFixed(2);
  const isWalk = leg.mode.toUpperCase() === 'WALK' || leg.mode.toUpperCase() === 'FOOT';

  return (
    <div className="relative">
      {/* Step Number */}
      <div className="absolute -left-3 sm:-left-4 top-0 w-7 h-7 sm:w-8 sm:h-8 bg-gray-700 dark:bg-gray-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md">
        {legNumber}
      </div>

      <div className={`ml-5 sm:ml-6 p-2.5 sm:p-3 rounded-xl border-2 ${isWalk ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'}`}>
        {/* Mode Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <ModeIcon mode={leg.mode} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">
              {isWalk ? '🚶 Walk' : `🚌 ${leg.vehicleName || leg.lineName || 'Transit'}`}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {durationMin} min • {distanceKm} km
            </div>
          </div>
        </div>

        {/* From/To */}
        <div className="space-y-1.5 sm:space-y-2 text-xs">
          <div className="flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-lg">
            <span className="text-green-600 dark:text-green-500 font-bold text-sm sm:text-base flex-shrink-0">●</span>
            <div className="flex-1 min-w-0">
              <div className="text-gray-500 dark:text-gray-400 uppercase text-[9px] sm:text-[10px] font-semibold mb-0.5">From</div>
              <div className="text-gray-900 dark:text-gray-100 font-semibold text-[10px] sm:text-xs truncate">{leg.from.name || 'Start Point'}</div>
            </div>
          </div>
          <div className="flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-lg">
            <span className="text-red-600 dark:text-red-500 font-bold text-sm sm:text-base flex-shrink-0">●</span>
            <div className="flex-1 min-w-0">
              <div className="text-gray-500 dark:text-gray-400 uppercase text-[9px] sm:text-[10px] font-semibold mb-0.5">To</div>
              <div className="text-gray-900 dark:text-gray-100 font-semibold text-[10px] sm:text-xs truncate">{leg.to.name || 'End Point'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeIcon({ mode }: { mode: string }) {
  const upperMode = mode.toUpperCase();
  
  if (upperMode === 'WALK' || upperMode === 'FOOT') {
    return (
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-lg sm:text-xl">🚶</span>
      </div>
    );
  }
  
  if (upperMode === 'BUS') {
    return (
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-200 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-lg sm:text-xl">🚌</span>
      </div>
    );
  }
  
  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">
      {mode}
    </div>
  );
}

