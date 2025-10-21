# Z-Index Fix - Search Bar Visibility Issue

## 🐛 Problem

Search boxes were not visible unless you scrolled - they appeared to be "behind" the map.

## 🔍 Root Cause

The issue was a **z-index stacking problem**:

1. MapView had `absolute inset-0` but **no z-index** specified
2. React-Leaflet manages its own z-index internally (defaults to high values)
3. The search panel had `z-20` which was not high enough to override Leaflet's internal z-index management
4. Elements rendered later in DOM can appear on top even with same z-index

## ✅ Solution Applied

Set explicit z-index values to create proper stacking order:

### Z-Index Hierarchy (Bottom to Top)

```
z-0      → MapView (background)
z-[900]  → ItineraryList & ItineraryDetail (UI panels)
z-[1000] → SearchBox, Controls, SystemHealthChip (top controls)
```

### Files Changed

**1. src/components/MapView.tsx**
```tsx
// Before:
<div className="absolute inset-0">

// After:
<div className="absolute inset-0 z-0">
```
✅ Map is now explicitly the bottom layer

**2. src/App.tsx**
```tsx
// Before:
<div className="absolute top-3 left-3 z-20 w-full max-w-md ...">

// After:
<div className="absolute top-3 left-3 z-[1000] w-full max-w-md ...">
```
✅ Search/Controls panel now on top

**3. src/components/SystemHealthChip.tsx**
```tsx
// Before:
className="fixed top-3 right-3 z-20 ..."

// After:
className="fixed top-3 right-3 z-[1000] ..."
```
✅ Health chip visible

**4. src/components/ItineraryList.tsx**
```tsx
// Before:
<div className="absolute bottom-0 left-0 right-0 max-h-[40vh] ...">

// After:
<div className="absolute bottom-0 left-0 right-0 z-[900] max-h-[40vh] ...">
```
✅ Itinerary list above map

**5. src/components/ItineraryDetail.tsx**
```tsx
// Before:
<div className="absolute top-20 right-3 w-80 ...">

// After:
<div className="absolute top-20 right-3 z-[900] w-80 ...">
```
✅ Detail panel above map

## 🧹 Cleanup

Also removed unused imports:
- `useState` from MapView.tsx (not used)
- `LeafletMap` type from MapView.tsx (not used)
- `index` prop from ItineraryDetail LegCard (not used)

## ✅ Verification

```bash
✓ Build successful (no errors)
✓ No TypeScript errors
✓ No linter warnings
✓ All z-indices properly set
```

## 🎨 Visual Hierarchy (After Fix)

```
┌─────────────────────────────────────┐
│ 🟢 Health (z-1000)          (top)   │
│                                     │
│ ┌─────────────┐                    │
│ │ From: [...] │ 📍 (z-1000)        │
│ │ To:   [...] │ 📍                 │
│ │─────────────│                    │
│ │ Get Routes  │ (z-1000)           │
│ └─────────────┘                    │
│                                     │
│        MAP (z-0)                   │
│                                     │
│           ┌──────────┐              │
│           │ Details  │ (z-900)     │
│           └──────────┘              │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Itineraries (z-900)         │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🚀 Result

✅ **Search boxes now visible immediately** - no scrolling needed
✅ **All UI controls properly layered** - correct stacking order
✅ **Map stays in background** - doesn't cover UI
✅ **Dropdown menus work** - proper z-index inheritance

## 📝 Why Use z-[1000]?

Using Tailwind's arbitrary value `z-[1000]` instead of a lower value because:

1. **Leaflet's internal z-index** - React-Leaflet components use z-index values in the 400-600 range
2. **Modal/Dropdown safety** - Ensures autocomplete dropdowns stay on top
3. **Future-proof** - Room for intermediate layers if needed
4. **Explicit hierarchy** - Clear separation between map (0) and UI (1000)

## 🧪 Test Checklist

After this fix, verify:
- [x] Search boxes visible on page load
- [x] No need to scroll to see UI
- [x] Map in background
- [x] Controls clickable
- [x] Autocomplete dropdown appears above everything
- [x] Health chip visible
- [x] Bottom itinerary panel appears above map
- [x] Right detail panel appears above map (desktop)

---

**Status:** ✅ **FIXED** - All z-index issues resolved!

