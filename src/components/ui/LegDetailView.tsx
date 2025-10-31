/**
 * LegDetailView component - Detailed view of individual leg
 */

import { CircleDot, Circle } from 'lucide-react';
import { cn, formatDuration, formatFare, formatDistance, getModeIcon, getDisplayFare, formatStopName } from '../../lib/utils';
import type { NormalizedLeg, FareType } from '../../lib/types';
import * as LucideIcons from 'lucide-react';
import { useState, useEffect } from 'react';

interface LegDetailViewProps {
  leg: NormalizedLeg;
  legIndex: number;
  fareType: FareType;
  onBack: () => void;
}

export function LegDetailView({ leg, legIndex, fareType, onBack }: LegDetailViewProps) {
  const IconComponent = (LucideIcons as any)[
    getModeIcon(leg.mode).charAt(0).toUpperCase() + getModeIcon(leg.mode).slice(1)
  ] || LucideIcons.Circle;

  // State for formatted stop names
  const [boardingLocation, setBoardingLocation] = useState<string>(leg.from.name || 'Loading...');
  const [alightingLocation, setAlightingLocation] = useState<string>(leg.to.name || 'Loading...');

  // Load formatted stop names
  useEffect(() => {
    // Fetch boarding location name
    formatStopName(leg.from, leg.from.name).then(setBoardingLocation).catch(() => {
      setBoardingLocation(leg.from.name || 'Unknown location');
    });

    // Fetch alighting location name
    formatStopName(leg.to, leg.to.name).then(setAlightingLocation).catch(() => {
      setAlightingLocation(leg.to.name || 'Unknown location');
    });
  }, [leg.from, leg.to]);

  // Display priority: vehicleName > lineName > mode
  const displayName = leg.mode === 'WALK'
    ? 'Walk'
    : (leg.vehicleName || leg.lineName || leg.mode);

  // Get fare for this leg (only for transit legs)
  const legFare = leg.mode !== 'WALK' && leg.fareProducts
    ? getDisplayFare(leg, fareType)
    : 0;

  // Get mode color
  const modeColors: Record<string, string> = {
    'JEEPNEY': 'from-blue-500 to-blue-600',
    'BUS': 'from-purple-500 to-purple-600',
    'TRICYCLE': 'from-orange-500 to-orange-600',
    'FERRY': 'from-cyan-500 to-cyan-600',
    'TRANSIT': 'from-indigo-500 to-indigo-600',
    'WALK': 'from-green-500 to-green-600',
  };

  const gradientClass = modeColors[leg.mode] || 'from-gray-500 to-gray-600';

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Back to route overview"
        >
          <span className="text-lg">←</span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">
            {displayName}
          </div>
          {leg.headsign && (
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {leg.headsign}
            </div>
          )}
        </div>
      </div>

      {/* Gradient Header Card */}
      <div className={cn(
        'mx-4 mt-4 rounded-xl overflow-hidden shadow-lg',
        'bg-gradient-to-br', gradientClass
      )}>
        <div className="p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <IconComponent className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">{displayName}</div>
              {leg.headsign && (
                <div className="text-sm opacity-90 mt-0.5">{leg.headsign}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {legFare > 0 && (
              <div>
                <div className="opacity-80 text-xs">Fare</div>
                <div className="font-bold">₱{formatFare(legFare)}</div>
              </div>
            )}
            <div>
              <div className="opacity-80 text-xs">Duration</div>
              <div className="font-bold">{formatDuration(leg.duration)}</div>
            </div>
            <div>
              <div className="opacity-80 text-xs">Distance</div>
              <div className="font-bold">{formatDistance(leg.distance)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* GET ON / GET OFF Locations */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* GET ON */}
        <div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CircleDot className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                GET ON
              </div>
              <div className="font-medium text-base text-gray-900 dark:text-gray-100">
                {boardingLocation}
              </div>
            </div>
          </div>
        </div>

        {/* GET OFF */}
        <div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <Circle className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                GET OFF
              </div>
              <div className="font-medium text-base text-gray-900 dark:text-gray-100">
                {alightingLocation}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

