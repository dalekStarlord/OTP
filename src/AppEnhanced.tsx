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
import { LocationTracker } from './components/LocationTracker';
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
  Settings as SettingsIcon,
} from 'lucide-react';
import { cn } from './lib/utils';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { useState } from 'react';

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
  // { to: '/live', icon: Radio, labelKey: 'nav.live' },
  // { to: '/favorites', icon: Star, labelKey: 'nav.favorites' },
  // { to: '/advisories', icon: AlertCircle, labelKey: 'nav.advisories' },
  // { to: '/contribute', icon: MessageSquarePlus, labelKey: 'nav.contribute' },
  { to: '/settings', icon: SettingsIcon, labelKey: 'nav.settings' },
];

function AppContent() {
  const location = useRouterLocation();
  const isHomePage = location.pathname === '/';
  const [mobileActiveTab, setMobileActiveTab] = useState<'plan' | 'settings'>('plan');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip link for accessibility */}
      <SkipLink />

      {/* App status bar */}
      <AppStatusBar />

      {/* Toast notifications */}
      <ToastContainer />

      {/* Help dialog */}
      <HelpDialog />

      {/* Location tracking - Always active */}
      <LocationTracker />

      {/* Mobile header with tabs - Only on Home page */}
      {isHomePage && (
        <header className="lg:hidden bg-blue-600 dark:bg-blue-700 text-white shadow-md relative z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold">CDO Jeepney Planner</h1>
          </div>
          <div className="flex border-t border-blue-500 dark:border-blue-600">
            <button
              onClick={() => setMobileActiveTab('plan')}
              className={cn(
                "flex-1 py-3 text-center font-medium text-sm transition-colors relative",
                mobileActiveTab === 'plan'
                  ? "text-white"
                  : "text-blue-100 hover:text-white"
              )}
            >
              <HomeIcon className="h-4 w-4 inline-block mr-1" />
              Plan Trip
              {mobileActiveTab === 'plan' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              onClick={() => setMobileActiveTab('settings')}
              className={cn(
                "flex-1 py-3 text-center font-medium text-sm transition-colors relative",
                mobileActiveTab === 'settings'
                  ? "text-white"
                  : "text-blue-100 hover:text-white"
              )}
            >
              <SettingsIcon className="h-4 w-4 inline-block mr-1" />
              Settings
              {mobileActiveTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          </div>
        </header>
      )}

      <div className="flex">
        {/* Desktop sidebar - Hidden on Home page (≥ md) */}
        {!isHomePage && (
          <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                 CDO Jeepney Planner
              </h1>
            </div>

            <nav className="flex-1 px-3">
              <Navigation />
            </nav>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1" id="main-content">
          <Routes>
            <Route path="/" element={isHomePage && mobileActiveTab === 'settings' ? <Settings /> : <Home />} />
            <Route path="/live" element={<LiveTracker />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/advisories" element={<Advisories />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AppEnhanced() {
  const { preferences } = useAppStore();

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
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
          <AppContent />
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
            {() => {
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

