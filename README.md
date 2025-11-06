# CDOJeepney Trip Planner

A comprehensive React-based jeepney trip planner for Cagayan de Oro, Philippines. Plan your routes, track your location in real-time, and navigate the city with ease using public transportation.

## 📖 About the Project

CDOJeepney Trip Planner is a Progressive Web App (PWA) designed to help residents and visitors of Cagayan de Oro navigate the city using jeepneys and other public transportation. The app integrates with OpenTripPlanner (OTP) to provide real-time route planning, interactive maps, and step-by-step navigation guidance.

### Key Highlights
- **Real-time Route Planning**: Uses OpenTripPlanner GTFS API for accurate route calculations
- **Interactive Maps**: Click directly on the map to set locations or use smart search
- **GPS Tracking**: Real-time location tracking with auto-centering map
- **Multi-language Support**: Available in English, Filipino (Tagalog), and Cebuano
- **Accessibility First**: WCAG 2.1 AA compliant with keyboard navigation, screen reader support, and customizable display options
- **Offline Capable**: PWA with service worker for offline functionality
- **Mobile-First Design**: Optimized for mobile devices with responsive desktop layout

## 🚀 Features

### Core Functionality
- **Route Planning**: Plan trips using GTFS v1 API with OpenTripPlanner
- **Smart Location Search**: Autocomplete-powered search using Nominatim with recent location caching
- **Map-Based Picking**: Click directly on the map to set From/To locations
- **Interactive Route Visualization**: 
  - Per-leg polylines with different styles for WALK vs BUS/JEEPNEY modes
  - Hover to highlight routes on map
  - Click to select and auto-fit map bounds
  - Step-by-step navigation focus (click a step to zoom to that leg)
- **Detailed Itineraries**: View transfers, duration, distance, and per-leg breakdowns
- **Route Sorting**: Sort by fastest, cheapest, or fewest transfers
- **Fare Calculation**: Calculate fares for regular and discount (student/senior/PWD) passengers
- **Health Monitoring**: Real-time GraphQL endpoint health checks

### User Experience Features
- **Real-time GPS Tracking**: Continuous location tracking with accuracy display
- **Auto-center Map**: Automatically center map on your current location
- **Recent Searches**: Quick access to recently searched locations (cached in localStorage)
- **Saved Places & Routes**: Save favorite locations and frequently used routes
- **Quick Places**: Quick access to Home, Work, and University locations
- **Location Swap**: One-click swap between From and To locations
- **Toast Notifications**: User-friendly feedback for actions and errors
- **Status Bar**: Real-time system status (online/offline, GPS lock, computing routes)

### Pages & Navigation
- **Home**: Main trip planning interface with map and route results
- **Live Tracker**: Real-time vehicle tracking (coming soon)
- **Favorites**: Manage saved places and routes
- **Advisories**: Service advisories and route updates (coming soon)
- **Contribute**: Report issues or incorrect information
- **Settings**: Customize appearance, language, accessibility, and preferences

### Accessibility & Customization
- **Theme Support**: Light, dark, and auto themes
- **Language Support**: English, Filipino (Tagalog), and Cebuano
- **Text Size**: Adjustable text sizes (small, medium, large)
- **High Contrast Mode**: Enhanced visibility for low vision users
- **Reduced Motion**: Respects user's motion preferences
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Skip Links**: Quick navigation to main content

### Technical Features
- **Rate Limiting**: Built-in rate limiting for geocoding API calls
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Offline Support**: Service worker caches routes and map tiles
- **Performance Optimized**: Code splitting, lazy loading, and optimized bundle sizes
- **Type Safety**: Full TypeScript coverage
- **State Management**: Zustand for efficient state management with persistence

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend Framework** | React 18 + TypeScript + Vite |
| **Routing** | React Router DOM v6 |
| **Styling** | Tailwind CSS |
| **State Management** | Zustand (with persistence) |
| **Data Fetching** | TanStack React Query |
| **UI Components** | Radix UI (accessible primitives) |
| **Animations** | Framer Motion |
| **Maps** | React-Leaflet (Leaflet) |
| **GraphQL** | graphql-request |
| **Geocoding** | Nominatim OSM |
| **Polyline Decoding** | @mapbox/polyline |
| **Internationalization** | i18next/react-i18next |
| **PWA** | vite-plugin-pwa, Workbox |
| **Date Handling** | date-fns |
| **Icons** | Lucide React |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Virtual Scrolling** | react-virtuoso |

## 🎯 Tutorial / Usage Guide

### Planning Your First Trip

**Step 1: Set Your Starting Point**
- **Method 1 - Search**: Type a location name in the "From" search box and select from autocomplete suggestions
- **Method 2 - Map Click**: Click the 📍 pin button next to "From", then click anywhere on the map
- **Method 3 - Current Location**: Click "Use current location" to use your GPS position
- **Method 4 - Quick Places**: Select from saved Home, Work, or University locations

**Step 2: Set Your Destination**
- Use any of the same methods above in the "To" field
- Click the swap button (↔️) to quickly swap From and To locations

**Step 3: Plan Your Route**
- Click the **"Plan Route"** button
- Wait for route calculation (status shown in status bar)
- View multiple route options sorted by your preference

**Step 4: Explore Route Options**
- **Sort Routes**: Use the sort dropdown to sort by fastest, cheapest, or fewest transfers
- **Fare Type**: Toggle between Regular and Discount (20% off for students/seniors/PWD)
- **Hover**: Hover over a route card to highlight it on the map
- **Select**: Click a route card to view detailed step-by-step directions

**Step 5: View Step-by-Step Directions**
- Click on any route to see detailed leg-by-leg breakdown
- Each step shows: mode (walk/jeepney), route name, distance, and duration
- Click on a specific step to focus the map on that leg
- Use the back button to return to the route list

### Using the Map

- **Zoom**: Use mouse wheel, pinch gesture, or +/- buttons
- **Pan**: Click and drag to move around
- **Set Location**: Click the 📍 pin button, then click on the map
- **Center on Location**: Click the location button to center map on your GPS position
- **Map Legend**: View legend for route line styles (desktop)

### Real-time Location Tracking

1. **Start Tracking**: Location tracking starts automatically when you grant permission
2. **View Status**: Check the status bar for GPS lock indicator
3. **Auto-center**: Enable auto-center to keep map centered on your location
4. **Stop Tracking**: Disable in settings or close the app

### Managing Favorites

- **Save a Place**: After searching, click the star icon to save
- **Save a Route**: After planning, save frequently used routes
- **View Favorites**: Go to Favorites page to see all saved items
- **Quick Access**: Favorites appear in search dropdown for quick selection

### Customizing Settings

1. **Theme**: Switch between Light, Dark, or Auto (follows system)
2. **Language**: Choose English, Filipino, or Cebuano
3. **Text Size**: Adjust for better readability (Small, Medium, Large)
4. **Accessibility**: Enable high contrast mode or reduced motion
5. **Notifications**: Configure delay and alternative route notifications

### Keyboard Shortcuts

- **Tab**: Navigate through interactive elements
- **Arrow Keys**: Navigate search results dropdown
- **Enter**: Select an item or submit
- **Esc**: Close dropdowns or dialogs
- **Space**: Activate buttons

## 📱 Progressive Web App (PWA)

This app is installable as a PWA:

1. **Install**: Look for "Install app" prompt in supported browsers (Chrome, Edge, Safari)
2. **Offline**: Previously viewed routes are cached and available offline
3. **Updates**: Automatic updates when new version is available
4. **Home Screen**: App icon appears on your device home screen

## 🌐 Internationalization

The app supports three languages:
- **English** (en) - Default
- **Filipino/Tagalog** (fil)
- **Cebuano** (ceb)

Change language in Settings page. All UI text, error messages, and instructions are translated.

## ♿ Accessibility

This application follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: Semantic HTML, ARIA labels, and proper heading hierarchy
- **Visual Accessibility**: High contrast mode, adjustable text sizes, color-blind friendly palette
- **Skip Links**: Quick navigation to main content
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

## 🎨 Design Principles

The app follows Nielsen's Heuristics and Don Norman's Principles:
- **Visibility of System Status**: Status bar shows real-time system state
- **User Control**: Users can customize preferences and clear data
- **Error Prevention**: Validation and helpful error messages
- **Recognition over Recall**: Recent searches and favorites reduce memory load
- **Flexibility**: Multiple ways to accomplish tasks (search, map click, GPS)
- **Aesthetic Design**: Clean, modern interface with consistent styling

## 📊 Data Sources

All data comes from real sources (no mock data):
- **Route Planning**: OpenTripPlanner GTFS API
- **Geocoding**: Nominatim OpenStreetMap API
- **Map Tiles**: OpenStreetMap
- **Fare Information**: GTFS fare rules (₱13 base fare for jeepneys)

## 🔒 Privacy & Security

- **No Tracking**: No analytics or user tracking
- **Local Storage**: All user data (favorites, preferences) stored locally
- **Secure**: HTTPS required for PWA features

## 📝 Notes

- Jeepneys are treated as `BUS` mode in GTFS/Transmodel
- Health checks run every 10 seconds via GraphQL `__typename` query
- Recent geocode selections cached in localStorage (max 10)
- Itineraries deduped based on duration (±60s) and transfer count
- Map bounds auto-fit to selected itinerary polylines
- Rate limiting: 1 geocoding request per second

## 🙏 Acknowledgments

- **OpenTripPlanner** for the routing engine
- **Nominatim** for geocoding services
- **OpenStreetMap** contributors for map tiles and data
- **Leaflet** for mapping library
- **Tailwind CSS** for styling framework
- **Radix UI** for accessible component primitives
