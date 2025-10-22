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
            className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-dialog-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 id="help-dialog-title" className="text-xl font-bold text-gray-900">
                  {t('help.title')}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label={t('a11y.close')}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      Step 1
                    </div>
                    <p className="text-gray-600">{t('help.step1')}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Filter className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      Step 2
                    </div>
                    <p className="text-gray-600">{t('help.step2')}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Route className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      Step 3
                    </div>
                    <p className="text-gray-600">{t('help.step3')}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-gray-900">Pro Tips:</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Use the location button to set your current position</li>
                    <li>• Tap mode icons to prefer or exclude transport types</li>
                    <li>• Save your favorite places for quick access</li>
                    <li>• View live vehicles on the map in real-time</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                <Button onClick={handleClose} variant="primary" fullWidth>
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

