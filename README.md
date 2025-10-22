# CDOJeepney Trip Planner

A comprehensive React-based jeepney trip planner for Cagayan de Oro, Philippines. Features dual routing engines (Transmodel v3 & GTFS v1), interactive map-based location picking, and real-time route visualization.

## 🚀 Features

### Core Functionality
- **Dual Routing Engines**: Query both Transmodel v3 and GTFS v1 APIs in parallel or individually
- **Smart Location Search**: Autocomplete-powered search using Nominatim with recent location caching
- **Map-Based Picking**: Click directly on the map to set From/To locations
- **Interactive Route Visualization**: 
  - Per-leg polylines with different styles for WALK vs BUS modes
  - Hover to highlight routes
  - Click to select and auto-fit map bounds
- **Detailed Itineraries**: View transfers, duration, distance, and per-leg breakdowns
- **Health Monitoring**: Real-time GraphQL endpoint health checks

### User Experience
- **No Hardcoded Coordinates**: All queries use actual user-selected locations
- **Shareable State**: URL-based state management (coming soon)
- **Mobile-First Design**: Responsive UI with Tailwind CSS
- **Smart Caching**: Local storage for recent location searches

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **State** | Zustand |
| **Maps** | React-Leaflet (Leaflet) |
| **GraphQL** | graphql-request |
| **Geocoding** | Nominatim OSM |
| **Polyline** | @mapbox/polyline |

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to OTP GraphQL endpoints (ngrok or production)

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
# Install all dependencies
npm install
```

### 2. Configure Environment

Update `.env` with your OTP endpoints:

```env
# OpenTripPlanner Base URL
VITE_OTP_BASE=https://408444805012.ngrok-free.app

# OTP GraphQL Endpoint
VITE_OTP_GTFS_GQL=${VITE_OTP_BASE}/otp/gtfs/v1
```

**Note**: If your ngrok URL changes, only update `VITE_OTP_BASE`.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎯 Usage Guide

### Setting Locations

**Method 1: Search**
1. Type location name in "From" or "To" search box
2. Select from autocomplete suggestions
3. Recent selections are cached for quick access

**Method 2: Map Click**
1. Click the 📍 pin button next to search box
2. Click anywhere on the map to set that location
3. Click the pin button again to deactivate

### Planning a Trip

1. Set both From and To locations (required)
2. Configure options:
   - ✅ **Transmodel v3**: Enable/disable Transmodel routing
   - ✅ **GTFS v1**: Enable/disable GTFS routing
   - **Itineraries**: Number of route options (1-10)
   - **Depart at**: Choose departure time
3. Click **Get Routes** button
4. View results in bottom panel

### Interacting with Results

- **Hover** over an itinerary card → route highlights on map
- **Click** an itinerary → select and auto-zoom to route
- View detailed leg-by-leg breakdown in right panel (desktop)

## 🔍 How It Works

### Variable Construction

All GraphQL queries use **variables constructed from user inputs**—never hardcoded coordinates.

**Transmodel v3 Query Variables:**
```typescript
{
  from: { 
    coordinates: { 
      latitude: userSelectedFrom.lat, 
      longitude: userSelectedFrom.lon 
    } 
  },
  to: { 
    coordinates: { 
      latitude: userSelectedTo.lat, 
      longitude: userSelectedTo.lon 
    } 
  },
  dateTime: userSelectedDateTime,
  modes: {
    direct: [],
    transit: { modes: [{ transportMode: "bus" }] }
  },
  numTripPatterns: userSelectedCount
}
```

**GTFS v1 Query Variables:**
```typescript
{
  fromLat: userSelectedFrom.lat,
  fromLon: userSelectedFrom.lon,
  toLat: userSelectedTo.lat,
  toLon: userSelectedTo.lon,
  dateTime: Date.parse(userSelectedDateTime),
  numItineraries: userSelectedCount
}
```

### Normalization Layer

Both Transmodel and GTFS responses are normalized to a unified format:

```typescript
type NormalizedItinerary = {
  id: string;
  source: 'transmodel' | 'gtfs';
  startTime: number;        // epoch ms
  endTime: number;          // epoch ms
  duration: number;         // seconds
  transfers: number;
  legs: NormalizedLeg[];
};
```

This allows:
- Parallel querying of both engines
- Unified rendering logic
- Easy deduplication and sorting

### Polyline Rendering

- Uses **@mapbox/polyline** to decode OTP geometry
- Per-leg rendering with mode-specific styles:
  - **WALK**: Dashed gray line
  - **BUS/TRANSIT**: Solid blue line
- Highlights on hover/select by increasing weight and opacity

## 🧪 Testing Endpoints

Test your OTP endpoints directly:

```bash
# Health check (GraphQL __typename)
curl -X POST https://f390d61fb579.ngrok-free.app/otp/transmodel/v3 \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}'

# GTFS routes list
curl -X POST https://f390d61fb579.ngrok-free.app/otp/gtfs/v1 \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ routes { id shortName longName } }"}'

# Transmodel trip planning (with variables)
curl -X POST https://f390d61fb579.ngrok-free.app/otp/transmodel/v3 \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "query TripPlan($from: InputLocation!, $to: InputLocation!, $dateTime: DateTime!) { trip(from: $from, to: $to, dateTime: $dateTime) { tripPatterns { duration legs { mode } } } }",
    "variables": {
      "from": {"coordinates": {"latitude": 8.472152, "longitude": 124.616295}},
      "to": {"coordinates": {"latitude": 8.487033, "longitude": 124.638092}},
      "dateTime": "2025-10-21T12:00:00Z"
    }
  }'
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Controls.tsx     # Get Routes button, toggles, settings
│   ├── SearchBox.tsx    # From/To search with autocomplete
│   ├── MapView.tsx      # React-Leaflet map with polylines
│   ├── ItineraryList.tsx    # Trip options cards
│   ├── ItineraryDetail.tsx  # Per-leg breakdown panel
│   └── SystemHealthChip.tsx # Health status indicator
├── lib/                 # Core utilities
│   ├── types.ts         # TypeScript type definitions
│   ├── otp.ts           # OTP queries, normalizers, health checks
│   ├── geocode.ts       # Nominatim search with debounce
│   └── polyline.ts      # Polyline decode & styling helpers
├── store/               # State management
│   └── planStore.ts     # Zustand store for app state
├── App.tsx              # Main app component
├── main.tsx             # React entry point
└── styles.css           # Tailwind + custom styles
```

## 🐛 Troubleshooting

### No routes found
- Verify both From/To are set
- Check that at least one routing engine is enabled
- Ensure OTP endpoints are accessible (check health chip)
- Try different locations or times

### CORS errors
- Add `ngrok-skip-browser-warning` header if using ngrok
- Configure Vite proxy in `vite.config.ts` if needed

### Map polylines not rendering
- Check browser console for decode errors
- Verify `legGeometry.points` or `points` exists in OTP response
- Some OTP builds may have different schema—check with GraphiQL

### Search not working
- Check browser console for Nominatim rate limit errors
- Searches are debounced 500ms and limited to 1 req/sec
- Nominatim requires User-Agent header (already configured)

### Schema differences
- Use OTP's built-in GraphiQL: `${VITE_OTP_BASE}/graphiql`
- Introspect actual schema and adjust queries in `src/lib/otp.ts`

## 🏗️ Build & Deploy

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Environment Variables**: Add `VITE_OTP_BASE` in Vercel dashboard.

### Deploy to Netlify

```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_OTP_BASE=<your-otp-url>
```

## 📊 Data Flow

```
User Input (Search/Map Click)
        ↓
Zustand Store (from/to coords)
        ↓
Controls → Get Routes
        ↓
OTP Queries (Transmodel + GTFS with variables)
        ↓
Normalize to unified format
        ↓
Dedupe & Sort by duration
        ↓
Render in ItineraryList
        ↓
User selects → MapView highlights + fitBounds
```

## 🎨 Customization

### Change Map Tile Provider

Edit `src/components/MapView.tsx`:

```tsx
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  // Change to your preferred tile provider
/>
```

### Adjust Geocoding Provider

Replace Nominatim in `src/lib/geocode.ts` with:
- Photon
- Pelias
- Mapbox Geocoding API
- Google Places API

### Modify Route Colors

Edit `src/lib/polyline.ts`:

```typescript
export function getLegStyle(mode: string) {
  if (upperMode === 'WALK') {
    return { color: '#666666', ... };
  }
  return { color: '#2563eb', ... }; // Change this
}
```

## 📝 Notes

- Jeepneys are treated as `BUS` mode in GTFS/Transmodel
- Health checks run every 10 seconds via GraphQL `__typename` query
- Recent geocode selections cached in localStorage (max 5)
- Itineraries deduped based on duration (±60s) and transfer count
- Map bounds auto-fit to selected itinerary polylines

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use for any purpose.

## 🙏 Acknowledgments

- **OpenTripPlanner** for the routing engine
- **Nominatim** for geocoding
- **OpenStreetMap** contributors for map tiles and data
- **Leaflet** for mapping library
- **Tailwind CSS** for styling
