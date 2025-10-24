/**
 * Contribute/Report page - Nielsen Heuristic #9: Help users recognize, diagnose, and recover from errors
 * Optimistic UI for contributions
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitContribution } from '../lib/api';
import { useAppStore } from '../store/appStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Contribute() {
  const { t } = useTranslation();
  const { addToast } = useAppStore();
  const [type, setType] = useState<string>('wrongStop');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contributionTypes = [
    'wrongStop',
    'wrongRoute',
    'wrongName',
    'missing',
    'other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!details.trim()) {
      addToast({
        type: 'warning',
        message: 'Please provide details about the issue',
      });
      return;
    }

    setLoading(true);

    try {
      await submitContribution({
        type: type as any,
        details,
      });

      // Optimistic UI - show success immediately
      setSubmitted(true);
      
      addToast({
        type: 'success',
        message: t('contribute.success'),
      });

      // Reset form after delay
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        setType('wrongStop');
      }, 3000);
    } catch (error) {
      addToast({
        type: 'error',
        message: t('contribute.error'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('contribute.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1.5 sm:mt-2">{t('contribute.description')}</p>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-green-50 dark:bg-green-900/20 border-2 border-green-600 dark:border-green-500 rounded-xl p-6 sm:p-8 text-center"
            >
              <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 dark:text-green-500 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
                Thank You!
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('contribute.success')}</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6"
            >
              {/* Issue type */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contribute.type')}
                </label>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {contributionTypes.map((issueType) => (
                    <button
                      key={issueType}
                      type="button"
                      onClick={() => setType(issueType)}
                      className={`px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all ${
                        type === issueType
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 dark:border-blue-400'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500'
                      }`}
                    >
                      {t(`contribute.types.${issueType}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div>
                <label
                  htmlFor="details"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('contribute.details')}
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t('contribute.detailsPlaceholder')}
                  rows={5}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Location (optional - would integrate with map) */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">
                    Location will be auto-detected from your current position
                  </span>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                loading={loading}
                disabled={!details.trim()}
                fullWidth
                size="lg"
              >
                {loading ? t('contribute.submitting') : t('contribute.submit')}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Guidelines */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">Reporting Guidelines:</h3>
          <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1">
            <li>• Be specific about the location and issue</li>
            <li>• Include landmarks or nearby establishments</li>
            <li>• One report per issue for faster processing</li>
            <li>• Your reports help improve the service for everyone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

