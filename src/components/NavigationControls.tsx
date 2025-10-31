import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Gauge, ChevronDown, ChevronUp, Navigation } from 'lucide-react';
import { usePlanStore } from '../store/planStore';

export default function NavigationControls() {
  const { 
    navigation, 
    selectedItineraryId,
    itineraries,
    startNavigation, 
    pauseNavigation, 
    resumeNavigation, 
    resetNavigation,
    setNavigation 
  } = usePlanStore();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const hasSelectedRoute = !!selectedItineraryId;

  // Auto-expand when navigation starts
  useEffect(() => {
    if (navigation.isNavigating) {
      setIsCollapsed(false);
    }
  }, [navigation.isNavigating]);

  const handleSpeedChange = (newSpeed: number) => {
    setNavigation({ ...navigation, speed: newSpeed });
  };

  if (!hasSelectedRoute) return null;

  // Get current progress info
  const selectedItinerary = itineraries?.find(it => it.id === selectedItineraryId);
  const currentLeg = selectedItinerary?.legs[navigation.currentLegIndex];
  const totalLegs = selectedItinerary?.legs.length || 0;
  const progressPercent = Math.round(navigation.progressOnLeg * 100);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-500 overflow-hidden">
      {/* Header - Always Visible */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Navigation size={20} className={navigation.isNavigating ? 'animate-pulse' : ''} />
            <span className="font-bold text-sm">
              {navigation.isNavigating ? 'Navigation Active' : 'Navigation'}
            </span>
          </div>
          <button className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors">
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
        
        {/* Progress Bar - Show when navigating */}
        {navigation.isNavigating && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-white/90 mb-1">
              <span>Leg {navigation.currentLegIndex + 1} of {totalLegs}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {!isCollapsed && currentLeg && (
              <div className="text-xs text-white/90 mt-1 truncate">
                {currentLeg.mode === 'WALK' ? '🚶 Walking' : `🚐 ${currentLeg.lineName || 'Transit'}`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content - Collapsible */}
      {!isCollapsed && (
        <div className="p-4 space-y-3">
          {/* Control Buttons */}
          <div className="space-y-2">
            {!navigation.isNavigating ? (
              <button
                onClick={startNavigation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md active:scale-95"
              >
                <Play size={20} fill="white" />
                Start Navigation
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {navigation.isPaused ? (
                  <button
                    onClick={resumeNavigation}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md active:scale-95"
                  >
                    <Play size={18} fill="white" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseNavigation}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all font-semibold shadow-md active:scale-95"
                  >
                    <Pause size={18} fill="white" />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={resetNavigation}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-md active:scale-95"
                  title="Reset Navigation"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Speed Control */}
          {navigation.isNavigating && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Gauge size={18} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Simulation Speed</span>
              </div>
              <select
                value={navigation.speed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value={5}>🐢 0.5x Speed (5 m/s)</option>
                <option value={10}>🚶 1x Speed (10 m/s)</option>
                <option value={20}>🏃 2x Speed (20 m/s)</option>
                <option value={40}>🚗 4x Speed (40 m/s)</option>
                <option value={80}>✈️ 8x Speed (80 m/s)</option>
              </select>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            <p className="font-semibold mb-1">💡 Navigation Features:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Traveled path fades to gray</li>
              <li>Remaining path stays bright</li>
              <li>Blue marker shows position</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

