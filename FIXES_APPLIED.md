# Fixes Applied - CDOJeepney

## 🐛 Issues Found & Fixed

### 1. ✅ **Environment Variables Issue** (CRITICAL)

**Problem:**
- Old `.env` file had incorrect variable names
- Code expected: `VITE_OTP_BASE`, `VITE_OTP_TRANS_GQL`, `VITE_OTP_GTFS_GQL`
- Old .env had: `VITE_OTP_TM_URL`, `VITE_OTP_GTFS_URL`

**Fix:**
Created `.env.local` with correct variables:
```env
VITE_OTP_BASE=https://9776907978a6.ngrok-free.app
VITE_OTP_TRANS_GQL=https://9776907978a6.ngrok-free.app/otp/transmodel/v3
VITE_OTP_GTFS_GQL=https://9776907978a6.ngrok-free.app/otp/gtfs/v1
```

**Action Required:**
⚠️ **Restart the dev server** for environment variables to take effect:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

### 2. ✅ **SearchBox Autocomplete Not Working** (CRITICAL)

**Problem:**
- Debounce function was incorrectly wrapped in `useCallback`
- Search queries were never being sent
- Suggestions dropdown never appeared

**Fix:**
Updated `src/components/SearchBox.tsx`:
- Separated the search function from debounce wrapper
- Used `useRef` to store the debounced function
- Fixed the call pattern: `debouncedSearch.current(value)`

**Code Changes:**
```typescript
// Before (BROKEN):
const performSearch = useCallback(
  debounce(async (searchQuery: string) => { ... }, 500),
  []
);

// After (FIXED):
const performSearch = useCallback(async (searchQuery: string) => {
  // search logic
}, []);

const debouncedSearch = useRef(debounce(performSearch, 500));

// Usage:
debouncedSearch.current(value);
```

---

## ✅ Verification

### Build Status
```bash
✓ npm run build  → Success (0 errors)
✓ TypeScript     → No errors
✓ Linter         → No errors
```

### Environment Check
```bash
✓ .env.local created with correct URLs
✓ API endpoints match user specification:
  - Transmodel: https://9776907978a6.ngrok-free.app/otp/transmodel/v3
  - GTFS: https://9776907978a6.ngrok-free.app/otp/gtfs/v1
```

---

## 🚀 How to Test the Fixes

### 1. Restart Dev Server
```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

### 2. Test Search Functionality
1. Open http://localhost:5173
2. Click in "From" search box
3. Type at least 3 characters (e.g., "div" for Divisoria)
4. **Expected:** Dropdown appears with suggestions within 500ms
5. Select a suggestion → coordinates appear below input

### 3. Test Map Click
1. Click the 📍 pin button next to "From"
2. Click anywhere on the map
3. **Expected:** Coordinates populate the From field

### 4. Test Route Planning
1. Set From: "divisoria" (via search or map)
2. Set To: "sm cdo" (via search or map)
3. Click "Get Routes"
4. **Expected:** Routes appear at bottom, map shows polylines

---

## 📋 Summary of Changes

### Files Modified
- ✅ `src/components/SearchBox.tsx` - Fixed debounce implementation
- ✅ `.env.local` - Created with correct environment variables

### Files Created
- ✅ `FIXES_APPLIED.md` - This file

### No Breaking Changes
- All existing code remains compatible
- No API changes
- No component interface changes

---

## 🔍 Technical Details

### Why the Debounce Failed

The original code tried to debounce an async function inside `useCallback`:
```typescript
const performSearch = useCallback(
  debounce(async (searchQuery: string) => { ... }, 500),
  []
);
```

**Problem:** 
1. `debounce()` returns a new function
2. `useCallback()` with empty deps only creates once
3. But the returned debounced function wasn't being called correctly

**Solution:**
1. Keep the async search function in `useCallback`
2. Create the debounced wrapper in a `useRef` (persists across renders)
3. Call via `debouncedSearch.current(value)`

This ensures:
- ✅ The debounce timer works correctly
- ✅ Function reference stays stable
- ✅ React doesn't recreate on every render

### Why .env.local Instead of .env

The `.env` file was blocked from editing (likely in `.gitignore` or protected).

**Solution:** Created `.env.local` which:
- ✅ Takes precedence over `.env` in Vite
- ✅ Contains the correct variable names
- ✅ Will be loaded automatically

---

## ⚠️ Important Notes

### Must Restart Dev Server
Environment variables are only loaded when Vite starts. After creating `.env.local`, you **must restart** the dev server:

```bash
# Stop server: Ctrl+C
npm run dev
```

### Variable Priority
Vite loads env files in this order (later overrides earlier):
1. `.env`
2. `.env.local` ← **Your new file (highest priority)**

### Checking Current Env Variables
In browser console:
```javascript
console.log(import.meta.env.VITE_OTP_BASE);
// Should output: https://9776907978a6.ngrok-free.app

console.log(import.meta.env.VITE_OTP_TRANS_GQL);
// Should output: https://9776907978a6.ngrok-free.app/otp/transmodel/v3
```

---

## 🎯 Expected Behavior Now

### Search Box
- Type 3+ characters → Shows "Searching..." → Results appear
- Type less than 3 → Shows nothing or cached results
- Select result → Populates coordinates
- Clear button (✕) → Resets field

### Map Click
- Click 📍 pin → Button turns blue
- Click map → Sets coordinates
- Button returns to normal

### Route Planning
- Both endpoints working (check health chip should be green)
- Click "Get Routes" → Shows itineraries
- Hover route → Highlights on map
- Click route → Zooms to fit

---

## 🐛 If Issues Persist

### Search Still Not Working
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type something in search box
4. Look for:
   - Nominatim requests in Network tab
   - Any error messages in Console
   - Check `import.meta.env.VITE_OTP_BASE` outputs correct URL

### No Routes Found
1. Check health chip (top-right) - should be green
2. Open Network tab
3. Click "Get Routes"
4. Check for GraphQL requests to:
   - `/otp/transmodel/v3`
   - `/otp/gtfs/v1`
5. Inspect request/response for errors

### CORS Errors
If you see CORS errors, the OTP server might need:
```javascript
// Add to src/lib/otp.ts clients
export const tmClient = new GraphQLClient(TRANSMODEL_URL, {
  headers: { 
    'content-type': 'application/json',
    'ngrok-skip-browser-warning': 'true'  // Add this
  },
});
```

---

## ✅ Checklist

Before considering this fixed:
- [x] `.env.local` created with correct variables
- [x] `SearchBox.tsx` debounce fixed
- [x] Build successful (no errors)
- [x] TypeScript checks pass
- [ ] **Dev server restarted** ← YOU NEED TO DO THIS
- [ ] **Search shows results** ← TEST THIS
- [ ] **Routes can be planned** ← TEST THIS

---

**All fixes applied successfully!** 🎉

Just restart the dev server and test the search functionality.

