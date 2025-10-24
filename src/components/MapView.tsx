import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { usePlanStore } from '../store/planStore';
import { decodePolyline, getLegStyle, getHighlightedLegStyle, getRouteColor } from '../lib/polyline';
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
  const { from, to, itineraries, selectedItineraryId, navigation, focusedLegIndex } = usePlanStore();

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
    <div className="absolute inset-0">
      <MapContainer
        center={[8.48, 124.63]}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler />
        <MapBoundsHandler />
        <LegFocusHandler />
        <NavigationSimulator />
        
        {/* Render polylines ONLY for selected itinerary */}
        {itineraries?.map((itinerary, index) => {
          const isSelected = itinerary.id === selectedItineraryId;
          const isHovered = itinerary.id === hoveredItineraryId;
          
          // Only render if this itinerary is selected or hovered
          if (!isSelected && !isHovered) return null;
          
          const shouldHighlight = isSelected || isHovered;

          return (
            <ItineraryPolylines
              key={itinerary.id}
              itinerary={itinerary}
              itineraryIndex={index}
              highlight={shouldHighlight}
              focusedLegIndex={isSelected ? focusedLegIndex : null}
            />
          );
        })}
        
        {/* Markers */}
        {from && !navigation.isNavigating && (
          <Marker 
            position={[from.lat, from.lon]} 
            icon={fromIcon}
            zIndexOffset={1000}
          />
        )}
        {to && (
          <Marker 
            position={[to.lat, to.lon]} 
            icon={toIcon}
            zIndexOffset={1000}
          />
        )}
        {userPosition && navigation.isNavigating && (
          <Marker 
            position={userPosition} 
            icon={userIcon}
            zIndexOffset={2000}
          />
        )}
      </MapContainer>
    </div>
  );
}

// Component to handle map clicks for picking locations
function MapClickHandler() {
  const { pickingMode, setFrom, setTo, setPickingMode } = usePlanStore();
  const map = useMap();

  useEffect(() => {
    if (pickingMode) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [pickingMode, map]);

  useMapEvents({
    click: (e) => {
      console.log('🗺️ Map clicked:', { lat: e.latlng.lat, lon: e.latlng.lng, pickingMode });
      
      if (pickingMode === 'from') {
        const location = { lat: e.latlng.lat, lon: e.latlng.lng, name: `Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})` };
        console.log('✅ Setting FROM location:', location);
        setFrom(location);
        setPickingMode(null);
      } else if (pickingMode === 'to') {
        const location = { lat: e.latlng.lat, lon: e.latlng.lng, name: `Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})` };
        console.log('✅ Setting TO location:', location);
        setTo(location);
        setPickingMode(null);
      } else {
        console.log('ℹ️ Map clicked but picking mode not active');
      }
    },
  });

  return null;
}

// Component to focus map on a specific leg when clicked
function LegFocusHandler() {
  const map = useMap();
  const { selectedItineraryId, itineraries, focusedLegIndex } = usePlanStore();

  useEffect(() => {
    if (focusedLegIndex === null || !selectedItineraryId || !itineraries) {
      return;
    }

    const selectedItinerary = itineraries.find(it => it.id === selectedItineraryId);
    if (!selectedItinerary) return;

    const focusedLeg = selectedItinerary.legs[focusedLegIndex];
    if (!focusedLeg) return;

    // If leg has polyline, use it for bounds
    if (focusedLeg.polyline) {
      const coords = decodePolyline(focusedLeg.polyline);
      if (coords.length > 0) {
        // Filter out any invalid coordinates
        const validCoords = coords.filter(c => 
          c && 
          typeof c.lat === 'number' && 
          typeof c.lon === 'number' && 
          !isNaN(c.lat) && 
          !isNaN(c.lon)
        );
        
        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords.map(c => [c.lat, c.lon]));
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: true,
            duration: 0.5
          });
          return;
        }
      }
    }

    // Fallback: use from/to coordinates
    if (focusedLeg.from?.lat && focusedLeg.from?.lon && focusedLeg.to?.lat && focusedLeg.to?.lon) {
      const bounds = L.latLngBounds([
        [focusedLeg.from.lat, focusedLeg.from.lon],
        [focusedLeg.to.lat, focusedLeg.to.lon]
      ]);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
        animate: true,
        duration: 0.5
      });
    }
  }, [map, selectedItineraryId, itineraries, focusedLegIndex]);

  return null;
}

// Component to handle map bounds fitting
function MapBoundsHandler() {
  const map = useMap();
  const { from, to, itineraries, selectedItineraryId } = usePlanStore();
  const boundsUpdatedRef = useRef(false);
  const lastSelectedIdRef = useRef<string | undefined>();

  useEffect(() => {
    // Only update if selected itinerary actually changed
    if (!selectedItineraryId || !itineraries || lastSelectedIdRef.current === selectedItineraryId) return;
    
    lastSelectedIdRef.current = selectedItineraryId;

    const selectedItinerary = itineraries.find((itin) => itin.id === selectedItineraryId);
    if (!selectedItinerary) {
      console.warn('⚠️ Selected itinerary not found:', selectedItineraryId);
      return;
    }

    console.log('🎯 Fitting map bounds for selected itinerary:', selectedItineraryId);

    const bounds = L.latLngBounds([]);
    let hasPoints = false;

    for (const leg of selectedItinerary.legs) {
      if (leg.polyline) {
        const coords = decodePolyline(leg.polyline);
        if (coords.length > 0) {
          console.log(`✅ Adding ${coords.length} polyline coords from ${leg.mode} leg to bounds`);
          coords.forEach(([lat, lng]) => {
            bounds.extend([lat, lng]);
            hasPoints = true;
          });
        } else {
          console.log(`⚠️ ${leg.mode} leg polyline decoded to 0 coords, using from/to instead`);
          // Fallback to leg endpoints
          if (leg.from?.lat && leg.from?.lon) {
            bounds.extend([leg.from.lat, leg.from.lon]);
            hasPoints = true;
          }
          if (leg.to?.lat && leg.to?.lon) {
            bounds.extend([leg.to.lat, leg.to.lon]);
            hasPoints = true;
          }
        }
      } else {
        console.log(`⚠️ ${leg.mode} leg has no polyline, using from/to coordinates`);
        // No polyline - use leg endpoints (common for WALK legs)
        if (leg.from?.lat && leg.from?.lon) {
          bounds.extend([leg.from.lat, leg.from.lon]);
          hasPoints = true;
        }
        if (leg.to?.lat && leg.to?.lon) {
          bounds.extend([leg.to.lat, leg.to.lon]);
          hasPoints = true;
        }
      }
    }

    // Final fallback to overall from/to markers
    if (!hasPoints) {
      console.log('⚠️ No valid coordinates found in any leg, using overall from/to markers');
      if (from) bounds.extend([from.lat, from.lon]);
      if (to) bounds.extend([to.lat, to.lon]);
      hasPoints = !!(from && to);
    }

    if (bounds.isValid() && hasPoints) {
      console.log('✅ Fitting bounds:', bounds.toBBoxString());
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      boundsUpdatedRef.current = true;
    } else {
      console.warn('⚠️ Bounds invalid or no points found');
    }
  }, [selectedItineraryId, itineraries, map, from, to]);

  // Initial fit to from/to markers (only once)
  useEffect(() => {
    if (boundsUpdatedRef.current) return;
    if (!from || !to) return;

    console.log('🎯 Initial bounds fit to from/to markers');
    const bounds = L.latLngBounds([[from.lat, from.lon], [to.lat, to.lon]]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [from?.lat, from?.lon, to?.lat, to?.lon, map]);

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
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (!navigation.isNavigating || navigation.isPaused || !selectedItineraryId || !itineraries) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      isNavigatingRef.current = false;
      return;
    }

    // Prevent multiple animations
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    const selectedItinerary = itineraries.find((it) => it.id === selectedItineraryId);
    if (!selectedItinerary) {
      isNavigatingRef.current = false;
      return;
    }

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
      isNavigatingRef.current = false;
    };
  }, [navigation.isNavigating, navigation.isPaused, selectedItineraryId]);

  return null;
}

// Component to render polylines for an itinerary
type ItineraryPolylinesProps = {
  itinerary: NormalizedItinerary;
  itineraryIndex: number;
  highlight: boolean;
  focusedLegIndex: number | null;
};

function ItineraryPolylines({ itinerary, itineraryIndex, highlight, focusedLegIndex }: ItineraryPolylinesProps) {
  const { navigation, selectedItineraryId } = usePlanStore();
  const isNavigating = navigation.isNavigating && itinerary.id === selectedItineraryId;
  
  // Get unique color for this route
  const routeColor = getRouteColor(itineraryIndex);

  // Debug logging
  console.log('🗺️ Rendering polylines for itinerary:', itinerary.id, {
    highlight,
    isNavigating,
    legCount: itinerary.legs.length,
    routeColor,
  });

  return (
    <>
      {itinerary.legs.map((leg, idx) => {
        // If a leg is focused, only render that specific leg
        if (focusedLegIndex !== null && focusedLegIndex !== idx) {
          return null; // Hide all other legs when one is focused
        }

        if (!leg.polyline) {
          console.warn(`⚠️ Leg ${idx} of itinerary ${itinerary.id} has no polyline data`);
          return null;
        }

        const coords = decodePolyline(leg.polyline);
        console.log(`📍 Leg ${idx} (${leg.mode}):`, {
          polylineLength: leg.polyline.length,
          decodedCoords: coords.length,
          firstCoord: coords[0],
          lastCoord: coords[coords.length - 1],
          isFocused: focusedLegIndex === idx,
        });
        
        if (coords.length === 0) {
          console.warn(`⚠️ Leg ${idx} polyline decode failed or returned 0 coordinates`);
          return null;
        }

        // Determine if this specific leg is focused
        const isFocused = focusedLegIndex === idx;
        
        // Build style based on focus and highlight state
        const baseStyle = isFocused
          ? { ...getHighlightedLegStyle(leg.mode, routeColor), weight: 8, opacity: 1 } // Extra prominent for focused leg
          : highlight
          ? getHighlightedLegStyle(leg.mode, routeColor)
          : getLegStyle(leg.mode, routeColor);

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
