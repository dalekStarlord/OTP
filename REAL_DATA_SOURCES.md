# Real Data Sources

This document confirms that **NO MOCK DATA** is used in the application. All data comes from real sources.

## ✅ Data Sources Currently Used

### 1. **Route Planning & Transit Data**
- **Source**: OpenTripPlanner (OTP) API
- **Endpoint**: `http://localhost:8080/otp/routers/default/plan`
- **File**: `src/lib/otp.ts` - `planTripGtfs()` function
- **Data Includes**:
  - Real routes from GTFS feed (`cdo_jeepnsey_with_shapes.gtfs.zip`)
  - Actual polyline geometry for map display
  - Real stop locations and schedules
  - Distance and duration calculations
  - Fare information from GTFS fare rules

### 2. **Geocoding & Address Search**
- **Source**: Photon API (OpenStreetMap-based)
- **Endpoint**: `https://photon.komoot.io/api/`
- **File**: `src/lib/geocode.ts` - `geocodeSearch()` function
- **Features**:
  - CORS-friendly (works in browsers)
  - Real OpenStreetMap data
  - Focused on Cagayan de Oro area (bbox: 124.5,8.3,124.8,8.6)
  - Fallback to 10 common CDO locations if API fails

### 3. **Reverse Geocoding**
- **Source**: Photon API
- **Endpoint**: `https://photon.komoot.io/reverse`
- **File**: `src/lib/api.ts` - `reverseGeocode()` function
- **Usage**: Converts coordinates to human-readable addresses

### 4. **Fare Calculation**
- **Source**: GTFS Fare Products (LTFRB-approved rates)
- **File**: `src/lib/utils.ts` - `calculateTotalFare()`, `getDisplayFare()`
- **Data**:
  - Base fare: ₱13 for regular passengers
  - Discount fare: 20% off for students/seniors/PWD
  - Comes directly from GTFS feed fare rules

### 5. **Map Display**
- **Source**: OpenStreetMap
- **Tiles**: `https://tile.openstreetmap.org/`
- **Library**: Leaflet via react-leaflet
- **File**: `src/components/MapView.tsx`

## 🚫 Removed Mock Files

The following mock files have been **DELETED**:
- ❌ `src/mocks/mockApi.ts` - DELETED
- ❌ `src/mocks/mockData.ts` - DELETED

## 📝 Notes on Future Features

Some features are **not yet implemented** because they require external data sources:

### Live Vehicle Tracking
- **Status**: Not implemented
- **Reason**: Requires GTFS-Realtime feed from transit authority
- **File**: `src/lib/api.ts` - `getLiveVehicles()` returns empty array
- **To Implement**: Need real-time vehicle position data

### Service Advisories
- **Status**: Not implemented  
- **Reason**: Requires advisory/alert system or API
- **File**: `src/lib/api.ts` - `getServiceAdvisories()` returns empty array
- **To Implement**: Could use RSS feed, Twitter API, or custom backend

### Contribution Submission
- **Status**: Simulated only
- **Reason**: Requires backend database to store reports
- **File**: `src/lib/api.ts` - `submitContribution()` logs but doesn't persist
- **To Implement**: Need backend API endpoint

## ✅ Verification

To verify no mock data is being used:

```bash
# Search for any mock imports
grep -r "from.*mock" src/

# Should return: No matches found
```

## 🎯 Summary

**Current State**: 
- ✅ 100% real transit data from OTP/GTFS
- ✅ Real geocoding from Photon/OSM
- ✅ Real fare calculations from LTFRB rates
- ✅ Real map tiles from OpenStreetMap
- ❌ No mock data anywhere

**Future Enhancements** (require external data):
- Live vehicle tracking (needs GTFS-RT)
- Service advisories (needs alert system)
- User contributions (needs backend database)

---

Last Updated: 2024
Version: 0.3.0

