/**
 * LegCard component - Compact clickable card for each route leg
 */

import { ChevronRight, CircleDot } from 'lucide-react';
import { cn, formatDuration, formatFare, getModeIcon, getModeColor, getDisplayFare } from '../../lib/utils';
import type { NormalizedLeg, FareType } from '../../lib/types';
import * as LucideIcons from 'lucide-react';

interface LegCardProps {
  leg: NormalizedLeg;
  legIndex: number;
  fareType: FareType;
  onClick: () => void;
}

export function LegCard({ leg, legIndex, fareType, onClick }: LegCardProps) {
  const IconComponent = (LucideIcons as any)[
    getModeIcon(leg.mode).charAt(0).toUpperCase() + getModeIcon(leg.mode).slice(1)
  ] || LucideIcons.Circle;

  // Display priority: vehicleName > lineName > mode
  const displayName = leg.mode === 'WALK'
    ? 'Walk'
    : (leg.headsign);

  // Get fare for this leg (only for transit legs)
  const legFare = leg.mode !== 'WALK' && leg.fareProducts
    ? getDisplayFare(leg, fareType)
    : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md',
        'active:scale-[0.98]',
        'text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
      )}
      aria-label={`View details for ${displayName}`}
    >
      {/* Mode Icon */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
        getModeColor(leg.mode)
      )}>
        <IconComponent className="h-5 w-5" aria-hidden="true" />
      </div>

      {/* Route Name and Duration */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
          {displayName}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {formatDuration(leg.duration)}
        </div>
      </div>

      {/* Fare and Chevron */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {legFare > 0 && (
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            ₱{formatFare(legFare)}
          </div>
        )}
        <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      </div>
    </button>
  );
}

