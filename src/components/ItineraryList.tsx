import { usePlanStore } from '../store/planStore';
import type { NormalizedItinerary } from '../lib/types';
import { calculateTotalFare, calculateFareSavings, formatFare } from '../lib/utils';

type ItineraryListProps = {
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

export default function ItineraryList({ onHover, onSelect }: ItineraryListProps) {
  const { itineraries, selectedItineraryId, fareType, isLoading, error } = usePlanStore();

  if (error) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-50 to-white border-t-2 border-red-200 p-5 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-red-800 font-semibold mb-1">Unable to find routes</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-6 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-gray-600">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium">Finding the best routes for you...</span>
        </div>
      </div>
    );
  }

  if (!itineraries || itineraries.length === 0) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-50 to-white border-t-2 border-blue-100 p-6 shadow-2xl">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-3">🗺️</div>
          <div className="text-gray-600 font-medium mb-1">Ready to plan your trip?</div>
          <div className="text-gray-500 text-sm">
            Set your starting point and destination, then click Find Routes
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[900] max-h-[45vh] overflow-y-auto bg-white border-t-2 border-gray-200 shadow-2xl">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-lg">
            🚌 {itineraries.length} {itineraries.length === 1 ? 'Route' : 'Routes'} Found
          </h3>
          <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-full">
            Tap to view on map
          </span>
        </div>
        <div className="space-y-2">
          {itineraries.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              fareType={fareType}
              isSelected={itinerary.id === selectedItineraryId}
              onHover={onHover}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type ItineraryCardProps = {
  itinerary: NormalizedItinerary;
  fareType: 'regular' | 'discount';
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

function ItineraryCard({ itinerary, fareType, isSelected, onHover, onSelect }: ItineraryCardProps) {
  const durationMin = Math.round(itinerary.duration / 60);
  const startTime = new Date(itinerary.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(itinerary.endTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalDistance = itinerary.legs.reduce((sum, leg) => sum + leg.distance, 0);
  const distanceKm = (totalDistance / 1000).toFixed(1);

  const modes = itinerary.legs.map((leg) => leg.mode).filter((m, i, arr) => arr.indexOf(m) === i);
  
  // Calculate fares
  const totalFare = calculateTotalFare(itinerary, fareType);
  const hasTransit = itinerary.legs.some(leg => leg.mode === 'BUS');
  const savings = fareType === 'discount' ? calculateFareSavings(itinerary) : 0;

  return (
    <button
      onClick={() => {
        onSelect(itinerary.id);
      }}
      onMouseEnter={() => onHover(itinerary.id)}
      onMouseLeave={() => onHover(null)}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
        isSelected
          ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md shadow-blue-200'
          : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Duration Badge */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
          isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="text-2xl font-bold leading-none">{durationMin}</div>
          <div className="text-xs opacity-75">min</div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base font-bold text-gray-900">
              {startTime} → {endTime}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {distanceKm} km
            </span>
            {itinerary.transfers > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {itinerary.transfers} transfer{itinerary.transfers > 1 ? 's' : ''}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-500 font-medium">
              {itinerary.source}
            </span>
          </div>
          <div className="flex gap-1.5 mb-1.5">
            {modes.map((mode, idx) => (
              <ModeIcon key={idx} mode={mode} />
            ))}
          </div>
          
          {/* Fare display */}
          {hasTransit && totalFare > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-800'
              }`}>
                <span className="text-xs font-bold">₱{formatFare(totalFare)}</span>
              </div>
              {fareType === 'discount' && savings > 0 && (
                <span className="text-[10px] text-green-600 font-medium">
                  Save ₱{formatFare(savings)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="flex-shrink-0">
          <svg className={`w-5 h-5 transition-transform ${isSelected ? 'text-blue-600 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

function ModeIcon({ mode }: { mode: string }) {
  const upperMode = mode.toUpperCase();
  
  if (upperMode === 'WALK' || upperMode === 'FOOT') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg" title="Walk">
        <span className="text-base">🚶</span>
        <span className="text-xs font-medium text-gray-600">Walk</span>
      </div>
    );
  }
  
  if (upperMode === 'BUS') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg" title="Bus/Jeepney">
        <span className="text-base">🚌</span>
        <span className="text-xs font-medium text-blue-700">Jeepney</span>
      </div>
    );
  }
  
  return <span className="text-xs bg-gray-200 px-2 py-1 rounded-lg font-medium">{mode}</span>;
}
