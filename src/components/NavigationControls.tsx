import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import { usePlanStore } from '../store/planStore';

export default function NavigationControls() {
  const { 
    navigation, 
    selectedItineraryId, 
    startNavigation, 
    pauseNavigation, 
    resumeNavigation, 
    resetNavigation,
    setNavigation 
  } = usePlanStore();

  const hasSelectedRoute = !!selectedItineraryId;

  const handleSpeedChange = (newSpeed: number) => {
    setNavigation({ ...navigation, speed: newSpeed });
  };

  if (!hasSelectedRoute) return null;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
      {/* Start/Pause/Resume Button */}
      {!navigation.isNavigating ? (
        <button
          onClick={startNavigation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          <Play size={18} fill="white" />
          Start Navigation
        </button>
      ) : navigation.isPaused ? (
        <button
          onClick={resumeNavigation}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          <Play size={18} fill="white" />
          Resume
        </button>
      ) : (
        <button
          onClick={pauseNavigation}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
        >
          <Pause size={18} fill="white" />
          Pause
        </button>
      )}

      {/* Reset Button */}
      {navigation.isNavigating && (
        <button
          onClick={resetNavigation}
          className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          title="Reset Navigation"
        >
          <RotateCcw size={18} />
        </button>
      )}

      {/* Speed Control */}
      {navigation.isNavigating && (
        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-300">
          <Gauge size={18} className="text-gray-600" />
          <select
            value={navigation.speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>0.5x (5 m/s)</option>
            <option value={10}>1x (10 m/s)</option>
            <option value={20}>2x (20 m/s)</option>
            <option value={40}>4x (40 m/s)</option>
            <option value={80}>8x (80 m/s)</option>
          </select>
        </div>
      )}
    </div>
  );
}

