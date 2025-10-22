/**
 * Main App component with routing and layout
 * Implements Nielsen's Heuristics and Don Norman's Principles throughout
 */

import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import { AppStatusBar } from './components/ui/AppStatusBar';
import { ToastContainer } from './components/ui/Toast';
import { SkipLink } from './components/ui/SkipLink';
import { HelpDialog } from './components/ui/HelpDialog';
import { Home } from './pages/Home';
import { LiveTracker } from './pages/LiveTracker';
import { Favorites } from './pages/Favorites';
import { Advisories } from './pages/Advisories';
import { Contribute } from './pages/Contribute';
import { Settings } from './pages/Settings';
import { useAppStore } from './store/appStore';
import { useEffect } from 'react';
import {
  Home as HomeIcon,
  Radio,
  Star,
  AlertCircle,
  MessageSquarePlus,
  Settings as SettingsIcon,
  Menu,
  X,
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

const navItems = [
  { to: '/', icon: HomeIcon, labelKey: 'nav.home' },
  { to: '/live', icon: Radio, labelKey: 'nav.live' },
  { to: '/favorites', icon: Star, labelKey: 'nav.favorites' },
  { to: '/advisories', icon: AlertCircle, labelKey: 'nav.advisories' },
  { to: '/contribute', icon: MessageSquarePlus, labelKey: 'nav.contribute' },
  { to: '/settings', icon: SettingsIcon, labelKey: 'nav.settings' },
];

export default function AppEnhanced() {
  const { preferences, sidebarOpen, setSidebarOpen } = useAppStore();

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto: use system preference
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (darkModeQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply text size
    root.style.fontSize =
      preferences.textSize === 'small'
        ? '14px'
        : preferences.textSize === 'large'
        ? '18px'
        : '16px';

    // Apply high contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [preferences]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Skip link for accessibility */}
            <SkipLink />

            {/* App status bar */}
            <AppStatusBar />

            {/* Toast notifications */}
            <ToastContainer />

            {/* Help dialog */}
            <HelpDialog />

            {/* Mobile header */}
            <header className="md:hidden bg-blue-600 dark:bg-blue-700 text-white shadow-md relative z-50">
              <div className="flex items-center justify-between px-4 py-3">
                <h1 className="text-xl font-bold">CDO Jeepney</h1>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Menu"
                  aria-expanded={sidebarOpen}
                >
                  {sidebarOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </header>

            <div className="flex">
              {/* Desktop sidebar */}
              <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    🚌 CDO Jeepney
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Navigate with ease
                  </p>
                </div>

                <nav className="flex-1 px-3">
                  <Navigation />
                </nav>
              </aside>

              {/* Mobile sidebar */}
              <AnimatePresence>
                {sidebarOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSidebarOpen(false)}
                      className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    />
                    <motion.aside
                      initial={{ x: -280 }}
                      animate={{ x: 0 }}
                      exit={{ x: -280 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 md:hidden"
                    >
                      <div className="p-6">
                        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          🚌 CDO Jeepney
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Navigate with ease
                        </p>
                      </div>

                      <nav className="px-3">
                        <Navigation onNavigate={() => setSidebarOpen(false)} />
                      </nav>
                    </motion.aside>
                  </>
                )}
              </AnimatePresence>

              {/* Main content */}
              <main className="flex-1" id="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/live" element={<LiveTracker />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/advisories" element={<Advisories />} />
                  <Route path="/contribute" element={<Contribute />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {navItems.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                isActive
                  ? 'bg-blue-600 dark:bg-blue-700 text-white font-medium'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              )
            }
          >
            {({ isActive }) => {
              const IconComponent = item.icon;
              return (
                <>
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  <span>{i18n.t(item.labelKey)}</span>
                </>
              );
            }}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

