/**
 * Map Legend - Nielsen Heuristic #2: Match between system and real world
 * Shows transport mode colors and symbols
 */

import { useTranslation } from 'react-i18next';
import { TRANSPORT_MODES } from '../../lib/constants';
import { getModeColor } from '../../lib/utils';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function MapLegend() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={expanded}
      >
        <span className="text-sm font-medium text-gray-700">Legend</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="border-t border-gray-200 p-3 space-y-2"
        >
          {TRANSPORT_MODES.map((mode) => {
            const IconComponent = (LucideIcons as any)[
              mode.icon.charAt(0).toUpperCase() + mode.icon.slice(1)
            ] || LucideIcons.Circle;

            return (
              <div key={mode.id} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center ${getModeColor(
                    mode.id
                  )}`}
                >
                  <IconComponent className="h-3 w-3" aria-hidden="true" />
                </div>
                <span className="text-sm text-gray-700">
                  {t(mode.nameKey)}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

