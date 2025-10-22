/**
 * Contribute/Report page - Nielsen Heuristic #9: Help users recognize, diagnose, and recover from errors
 * Optimistic UI for contributions
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitContribution } from '../mocks/mockApi';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('contribute.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('contribute.description')}</p>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-green-50 border-2 border-green-600 rounded-xl p-8 text-center"
            >
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thank You!
              </h2>
              <p className="text-gray-600">{t('contribute.success')}</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-md p-6 space-y-6"
            >
              {/* Issue type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contribute.type')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {contributionTypes.map((issueType) => (
                    <button
                      key={issueType}
                      type="button"
                      onClick={() => setType(issueType)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        type === issueType
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-blue-400'
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
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t('contribute.details')}
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t('contribute.detailsPlaceholder')}
                  rows={6}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Location (optional - would integrate with map) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm font-medium">
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
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Reporting Guidelines:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
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

