import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDuration, formatFare, getModeIcon, getModeColor, cn } from '../../lib/utils';
import type { NormalizedItinerary, FareType } from '../../lib/types';
import { usePlanStore } from '../../store/planStore';

interface RouteDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  itinerary: NormalizedItinerary | null;
  itineraryIndex: number | null;
  fareType: FareType;
}

export default function RouteDetailsSheet({ open, onClose, itinerary, itineraryIndex, fareType }: RouteDetailsSheetProps) {
  const { t, i18n } = useTranslation();
  const { focusedLegIndex, setFocusedLegIndex, setSelectedItineraryId } = usePlanStore();
  
  if (!itinerary) return null;

  const handleLegClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle: if clicking the same leg, unfocus it and show full route
    if (focusedLegIndex === index) {
      setFocusedLegIndex(null);
    } else {
      setFocusedLegIndex(index);
      // Ensure this itinerary is selected
      setSelectedItineraryId(itinerary.id);
    }
  };

  const transitLegs = itinerary.legs.filter(l => ['JEEPNEY', 'BUS', 'TRICYCLE', 'FERRY', 'TRANSIT'].includes(l.mode));
  const primaryTransit = transitLegs[0];
  const mode = primaryTransit?.mode || itinerary.legs.find(l => l.mode !== 'WALK')?.mode || 'TRANSIT';
  const IconComponent = (LucideIcons as any)[
    getModeIcon(mode).charAt(0).toUpperCase() + getModeIcon(mode).slice(1)
  ] || LucideIcons.Circle;

  const fare = formatFare(
    // rough fare calc consistent with Home.tsx sorting
    (itinerary.legs.filter(l => l.mode !== 'WALK').length * 13) * (fareType === 'discount' ? 0.8 : 1)
  );

  const getOnStop = primaryTransit?.from?.name || itinerary.legs[0]?.from?.name || '';
  const getOffStop = primaryTransit?.to?.name || itinerary.legs[itinerary.legs.length - 1]?.to?.name || '';
  const lineName = (primaryTransit?.lineName || `${t('steps.board')} ${t(`modes.${mode.toLowerCase()}`)}`);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[1000]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[1001] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4">
              <div className="mx-auto h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-700 mb-4" />

              {/* Header with left rail style */}
              <div className="flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="w-12 bg-purple-600 text-white flex items-start justify-center py-3">
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                    <IconComponent className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-extrabold tracking-wide">{mode === 'JEEPNEY' ? 'JEEP' : mode}</div>
                    <div className="text-sm font-semibold">{fare}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{formatDuration(itinerary.duration, i18n.language)}</div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

                  <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('results.route') || 'ROUTE'}</div>
                  <div className="text-sm font-medium mt-0.5">{lineName}</div>
                  <button className="text-xs text-blue-600 dark:text-blue-400 mt-1" type="button">1 alternatives</button>

                  <div className="mt-3 flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      <span className="flex-1 w-0.5 bg-gray-300 dark:bg-gray-600" />
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                    </div>
                    <div className="flex-1 text-sm">
                      <div>
                        <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Get on</div>
                        <div className="font-medium">{getOnStop}</div>
                      </div>
                      <div className="mt-3">
                        <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Get off</div>
                        <div className="font-medium">{getOffStop}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* All legs as clickable steps */}
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {itinerary.legs.map((leg, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleLegClick(index, e)}
                    className={cn(
                      'flex gap-2 w-full text-left p-2 rounded-lg transition-all duration-200',
                      'hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-98',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                      'min-h-[44px]',
                      focusedLegIndex === index
                        ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 shadow-sm'
                        : ''
                    )}
                    aria-label={`View step ${index + 1}: ${leg.mode === 'WALK' ? 'Walk' : leg.lineName || leg.mode} from ${leg.from.name} to ${leg.to.name}`}
                    aria-pressed={focusedLegIndex === index}
                  >
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center transition-transform',
                        getModeColor(leg.mode),
                        focusedLegIndex === index && 'scale-110 ring-2 ring-white dark:ring-gray-900'
                      )}>
                        <span className="text-[10px] font-bold">{index + 1}</span>
                      </div>
                      {index < itinerary.legs.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-300 dark:bg-gray-600 my-1 min-h-[16px]" />
                      )}
                    </div>

                    <div className="flex-1 pb-2 min-w-0">
                      <div className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                        {leg.mode === 'WALK'
                          ? t('steps.walk')
                          : `${t('steps.board')} ${leg.lineName || t(`modes.${leg.mode.toLowerCase()}`)}`}
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                        {leg.from.name} → {leg.to.name}
                      </div>
                      <div className="text-[9px] text-gray-500 dark:text-gray-500 mt-0.5">
                        {formatDuration(leg.duration, i18n.language)} • {(leg.distance / 1000).toFixed(1)} km
                      </div>
                      {focusedLegIndex === index && (
                        <div className="text-[9px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                          🔍 Showing on map
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium">Close</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


