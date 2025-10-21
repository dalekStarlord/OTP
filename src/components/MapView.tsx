import { useEffect, useRef } from 'react';
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

type MapViewProps = {
  hoveredItineraryId: string | null;
};

export default function MapView({ hoveredItineraryId }: MapViewProps) {
  const { from, to, itineraries, selectedItineraryId } = usePlanStore();

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
        {from && <Marker position={[from.lat, from.lon]} icon={fromIcon} />}
        {to && <Marker position={[to.lat, to.lon]} icon={toIcon} />}
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

// Component to render polylines for an itinerary
type ItineraryPolylinesProps = {
  itinerary: NormalizedItinerary;
  highlight: boolean;
};

function ItineraryPolylines({ itinerary, highlight }: ItineraryPolylinesProps) {
  return (
    <>
      {itinerary.legs.map((leg, idx) => {
        if (!leg.polyline) return null;

        const coords = decodePolyline(leg.polyline);
        if (coords.length === 0) return null;

        const style = highlight
          ? getHighlightedLegStyle(leg.mode)
          : getLegStyle(leg.mode);

        return (
          <Polyline
            key={`${itinerary.id}-leg-${idx}`}
            positions={coords}
            pathOptions={{
              color: style.color,
              weight: style.weight,
              opacity: style.opacity,
              dashArray: style.dashArray,
            }}
          />
        );
      })}
    </>
  );
}
