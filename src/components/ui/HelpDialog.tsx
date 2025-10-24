/**
 * Help Dialog - Nielsen Heuristic #10: Help and documentation
 * First-run tour and help information
 */

import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';
import { X, MapPin, Filter, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { useEffect } from 'react';

export function HelpDialog() {
  const { t } = useTranslation();
  const { helpDialogOpen, setHelpDialogOpen, firstVisit, markFirstVisitComplete } =
    useAppStore();

  // Show on first visit
  useEffect(() => {
    if (firstVisit) {
      setHelpDialogOpen(true);
    }
  }, [firstVisit]);

  const handleClose = () => {
    setHelpDialogOpen(false);
    if (firstVisit) {
      markFirstVisitComplete();
    }
  };

  return (
    <AnimatePresence>
      {helpDialogOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-[1100]"
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-dialog-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-5 md:px-6 py-3 sm:py-4 flex items-center justify-between">
                <h2 id="help-dialog-title" className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t('help.title')}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label={t('a11y.close')}
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                {/* Step 1 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1">
                      Step 1
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('help.step1')}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1">
                      Step 2
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('help.step2')}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Route className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1">
                      Step 3
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('help.step3')}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Pro Tips:</h3>
                  <ul className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <li>• Use the location button to set your current position</li>
                    <li>• Tap mode icons to prefer or exclude transport types</li>
                    <li>• Save your favorite places for quick access</li>
                    <li>• View live vehicles on the map in real-time</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-5 md:px-6 py-3 sm:py-4">
                <Button onClick={handleClose} variant="primary" fullWidth size="md">
                  {firstVisit ? t('help.gotIt') : t('common.ok')}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

