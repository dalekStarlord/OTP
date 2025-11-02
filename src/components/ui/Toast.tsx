/**
 * Toast component - Don Norman: Feedback principle
 * Provides immediate feedback for user actions
 */

import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { prefersReducedMotion } from '../../lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();
  const reducedMotion = prefersReducedMotion();

  return (
    <div
      className="fixed bottom-4 right-4 z-[1200] flex flex-col gap-2 max-w-md"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
            reducedMotion={reducedMotion}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onClose: () => void;
  reducedMotion: boolean;
}

function Toast({ toast, onClose, reducedMotion }: ToastProps) {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'rounded-lg shadow-lg p-4 flex items-start gap-3',
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.message}</p>
        
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onClose();
            }}
            className="mt-2 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white rounded"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

