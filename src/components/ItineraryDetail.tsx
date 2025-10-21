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
    <div className="absolute top-16 right-3 z-[950] w-96 max-w-[calc(50%-2rem)] max-h-[calc(100vh-20rem)] overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-100 hidden md:block">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">Route Details</h3>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">
            {durationMin} min
          </span>
        </div>
        <div className="text-sm opacity-90">
          {startTime} → {endTime}
        </div>
      </div>
      
      {/* Legs */}
      <div className="overflow-y-auto max-h-[calc(100vh-26rem)] p-4 space-y-3">
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
      <div className="absolute -left-4 top-0 w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
        {legNumber}
      </div>

      <div className={`ml-6 p-3 rounded-xl border-2 ${isWalk ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
        {/* Mode Header */}
        <div className="flex items-center gap-2 mb-3">
          <ModeIcon mode={leg.mode} />
          <div className="flex-1">
            <div className="font-bold text-sm text-gray-900">
              {isWalk ? '🚶 Walk' : `🚌 ${leg.lineName || 'Transit'}`}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {durationMin} min • {distanceKm} km
            </div>
          </div>
        </div>

        {/* From/To */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 p-2 bg-white rounded-lg">
            <span className="text-green-600 font-bold text-base">●</span>
            <div className="flex-1 min-w-0">
              <div className="text-gray-500 uppercase text-[10px] font-semibold mb-0.5">From</div>
              <div className="text-gray-900 font-semibold truncate">{leg.from.name || 'Start Point'}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 bg-white rounded-lg">
            <span className="text-red-600 font-bold text-base">●</span>
            <div className="flex-1 min-w-0">
              <div className="text-gray-500 uppercase text-[10px] font-semibold mb-0.5">To</div>
              <div className="text-gray-900 font-semibold truncate">{leg.to.name || 'End Point'}</div>
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
      <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-xl">🚶</span>
      </div>
    );
  }
  
  if (upperMode === 'BUS') {
    return (
      <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center">
        <span className="text-xl">🚌</span>
      </div>
    );
  }
  
  return (
    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-xs font-bold">
      {mode}
    </div>
  );
}

