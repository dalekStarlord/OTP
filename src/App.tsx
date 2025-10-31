import { useState } from 'react';
import { usePlanStore } from './store/planStore';
import MapView from './components/MapView';
import SearchBox from './components/SearchBox';
import Controls from './components/Controls';
import ItineraryList from './components/ItineraryList';
import ItineraryDetail from './components/ItineraryDetail';
import SystemHealthChip from './components/SystemHealthChip';
import NavigationControls from './components/NavigationControls';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [hoveredItineraryId, setHoveredItineraryId] = useState<string | null>(null);
  const { setSelectedItineraryId } = usePlanStore();

  function handleHover(id: string | null) {
    setHoveredItineraryId(id);
  }

  function handleSelect(id: string) {
    setSelectedItineraryId(id);
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-50">
      {/* Map Layer */}
      <MapView hoveredItineraryId={hoveredItineraryId} />

      {/* Header Brand */}
      <div className="absolute top-0 left-0 right-0 z-[1001] pointer-events-none">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
          <div className="px-4 py-3">
            <h1 className="text-white text-xl font-bold tracking-tight">
              🚐 CDO Jeepney Planner
            </h1>
          </div>
        </div>
      </div>

      {/* UI Overlays */}
      <SystemHealthChip />
      
      {/* Search and Controls Panel - Compact Left Side */}
      <div className="absolute top-16 left-0 right-0 md:left-3 md:right-auto z-[900] md:w-80 md:max-w-[calc(40%-1rem)] pointer-events-none">
        <div className="pointer-events-auto mx-2 md:mx-0 space-y-2">
          {/* Search Box */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-visible">
            <div className="p-3 space-y-2">
              <SearchBox type="from" />
              <SearchBox type="to" />
            </div>
          </div>
          
          {/* Controls */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <Controls />
          </div>

          {/* Navigation Controls */}
          <NavigationControls />
        </div>
      </div>

      <ItineraryDetail />
      <ItineraryList onHover={handleHover} onSelect={handleSelect} />
    </div>
  );
}
