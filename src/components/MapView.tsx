import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { usePlanStore } from '../store/planStore';
import { decodePolyline, getLegStyle, getHighlightedLegStyle } from '../lib/polyline';
import type { NormalizedItinerary } from '../lib/types';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const fromIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background-color: #22c55e; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const toIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const userIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(59,130,246,0.5); position: relative;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

type MapViewProps = {
  hoveredItineraryId: string | null;
};

export default function MapView({ hoveredItineraryId }: MapViewProps) {
  const { from, to, itineraries, selectedItineraryId, navigation } = usePlanStore();

  // Calculate user position based on navigation state
  const userPosition = React.useMemo(() => {
    if (!navigation.isNavigating || !selectedItineraryId || !itineraries) return null;
    
    const selectedItinerary = itineraries.find((it) => it.id === selectedItineraryId);
    if (!selectedItinerary) return null;
    
    const leg = selectedItinerary.legs[navigation.currentLegIndex];
    if (!leg?.polyline) return null;
    
    const coords = decodePolyline(leg.polyline);
    if (coords.length === 0) return null;
    
    const index = Math.floor(navigation.progressOnLeg * (coords.length - 1));
    return coords[index];
  }, [navigation, selectedItineraryId, itineraries]);

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[8.48, 124.63]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler />
        <MapBoundsHandler />
        <NavigationSimulator />
        
        {/* Render polylines ONLY for selected itinerary */}
        {itineraries?.map((itinerary) => {
          const isSelected = itinerary.id === selectedItineraryId;
          const isHovered = itinerary.id === hoveredItineraryId;
          
          // Only render if this itinerary is selected or hovered
          if (!isSelected && !isHovered) return null;
          
          const shouldHighlight = isSelected || isHovered;

          return (
            <ItineraryPolylines
              key={itinerary.id}
              itinerary={itinerary}
              highlight={shouldHighlight}
            />
          );
        })}
        
        {/* Markers */}
        {from && !navigation.isNavigating && <Marker position={[from.lat, from.lon]} icon={fromIcon} />}
        {to && <Marker position={[to.lat, to.lon]} icon={toIcon} />}
        {userPosition && navigation.isNavigating && (
          <Marker position={userPosition} icon={userIcon} />
        )}
      </MapContainer>
    </div>
  );
}

// Component to handle map clicks for picking locations
function MapClickHandler() {
  const { pickingMode, setFrom, setTo, setPickingMode } = usePlanStore();

  useMapEvents({
    click: (e) => {
      if (pickingMode === 'from') {
        setFrom({ lat: e.latlng.lat, lon: e.latlng.lng });
        setPickingMode(null);
      } else if (pickingMode === 'to') {
        setTo({ lat: e.latlng.lat, lon: e.latlng.lng });
        setPickingMode(null);
      }
    },
  });

  return null;
}

// Component to handle map bounds fitting
function MapBoundsHandler() {
  const map = useMap();
  const { from, to, itineraries, selectedItineraryId } = usePlanStore();
  const boundsUpdatedRef = useRef(false);

  useEffect(() => {
    if (!selectedItineraryId || !itineraries) return;

    const selectedItinerary = itineraries.find((itin) => itin.id === selectedItineraryId);
    if (!selectedItinerary) return;

    const bounds = L.latLngBounds([]);
    let hasPoints = false;

    for (const leg of selectedItinerary.legs) {
      if (leg.polyline) {
        const coords = decodePolyline(leg.polyline);
        coords.forEach(([lat, lng]) => {
          bounds.extend([lat, lng]);
          hasPoints = true;
        });
      }
    }

    // Fallback to from/to markers
    if (!hasPoints) {
      if (from) bounds.extend([from.lat, from.lon]);
      if (to) bounds.extend([to.lat, to.lon]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      boundsUpdatedRef.current = true;
    }
  }, [selectedItineraryId, itineraries, from, to, map]);

  // Initial fit to from/to markers
  useEffect(() => {
    if (boundsUpdatedRef.current) return;
    if (!from || !to) return;

    const bounds = L.latLngBounds([[from.lat, from.lon], [to.lat, to.lon]]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [from, to, map]);

  return null;
}

// Component to simulate navigation movement
function NavigationSimulator() {
  const { 
    navigation, 
    selectedItineraryId, 
    itineraries, 
    updateNavigationProgress,
    resetNavigation 
  } = usePlanStore();
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!navigation.isNavigating || navigation.isPaused || !selectedItineraryId || !itineraries) {
      return;
    }

    const selectedItinerary = itineraries.find((it) => it.id === selectedItineraryId);
    if (!selectedItinerary) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;

      const currentLeg = selectedItinerary.legs[navigation.currentLegIndex];
      if (!currentLeg) {
        resetNavigation();
        return;
      }

      // Calculate distance traveled based on speed and time
      const distanceTraveled = navigation.speed * deltaTime;
      const legDistance = currentLeg.distance;
      const progressIncrement = distanceTraveled / legDistance;

      let newProgress = navigation.progressOnLeg + progressIncrement;
      let newLegIndex = navigation.currentLegIndex;

      // Check if we've completed the current leg
      if (newProgress >= 1) {
        newProgress = 0;
        newLegIndex += 1;

        // Check if we've completed all legs
        if (newLegIndex >= selectedItinerary.legs.length) {
          resetNavigation();
          return;
        }
      }

      updateNavigationProgress(newLegIndex, newProgress);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    navigation.isNavigating,
    navigation.isPaused,
    navigation.currentLegIndex,
    navigation.progressOnLeg,
    navigation.speed,
    selectedItineraryId,
    itineraries,
    updateNavigationProgress,
    resetNavigation,
  ]);

  return null;
}

// Component to render polylines for an itinerary
type ItineraryPolylinesProps = {
  itinerary: NormalizedItinerary;
  highlight: boolean;
};

function ItineraryPolylines({ itinerary, highlight }: ItineraryPolylinesProps) {
  const { navigation, selectedItineraryId } = usePlanStore();
  const isNavigating = navigation.isNavigating && itinerary.id === selectedItineraryId;

  return (
    <>
      {itinerary.legs.map((leg, idx) => {
        if (!leg.polyline) return null;

        const coords = decodePolyline(leg.polyline);
        if (coords.length === 0) return null;

        const baseStyle = highlight
          ? getHighlightedLegStyle(leg.mode)
          : getLegStyle(leg.mode);

        // If navigating, show consumed path effect
        if (isNavigating) {
          if (idx < navigation.currentLegIndex) {
            // Completed legs: show in faded gray/dashed
            return (
              <Polyline
                key={`${itinerary.id}-leg-${idx}-consumed`}
                positions={coords}
                pathOptions={{
                  color: '#9ca3af',
                  weight: 3,
                  opacity: 0.4,
                  dashArray: '5, 10',
                }}
              />
            );
          } else if (idx === navigation.currentLegIndex) {
            // Current leg: split into consumed and remaining
            const splitIndex = Math.floor(navigation.progressOnLeg * (coords.length - 1));
            const consumedCoords = coords.slice(0, splitIndex + 1);
            const remainingCoords = coords.slice(splitIndex);

            return (
              <React.Fragment key={`${itinerary.id}-leg-${idx}-split`}>
                {/* Consumed portion - faded */}
                {consumedCoords.length > 1 && (
                  <Polyline
                    positions={consumedCoords}
                    pathOptions={{
                      color: '#9ca3af',
                      weight: 3,
                      opacity: 0.4,
                      dashArray: '5, 10',
                    }}
                  />
                )}
                {/* Remaining portion - bright */}
                {remainingCoords.length > 1 && (
                  <Polyline
                    positions={remainingCoords}
                    pathOptions={{
                      color: baseStyle.color,
                      weight: baseStyle.weight + 2,
                      opacity: 1,
                      dashArray: baseStyle.dashArray,
                    }}
                  />
                )}
              </React.Fragment>
            );
          } else {
            // Future legs: show normal
            return (
              <Polyline
                key={`${itinerary.id}-leg-${idx}`}
                positions={coords}
                pathOptions={{
                  color: baseStyle.color,
                  weight: baseStyle.weight,
                  opacity: baseStyle.opacity,
                  dashArray: baseStyle.dashArray,
                }}
              />
            );
          }
        }

        // Not navigating: show normal
        return (
          <Polyline
            key={`${itinerary.id}-leg-${idx}`}
            positions={coords}
            pathOptions={{
              color: baseStyle.color,
              weight: baseStyle.weight,
              opacity: baseStyle.opacity,
              dashArray: baseStyle.dashArray,
            }}
          />
        );
      })}
    </>
  );
}
