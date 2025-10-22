# CDOJeepney Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
# Copy and paste this into .env
VITE_OTP_BASE=https://408444805012.ngrok-free.app
VITE_OTP_GTFS_GQL=${VITE_OTP_BASE}/otp/gtfs/v1
```

**If your ngrok URL changes**, only update `VITE_OTP_BASE`.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## ✅ Verify It's Working

### Health Check
Look at the top-right corner:
- 🟢 **Green "OTP Ready"** = Both endpoints working
- 🟡 **Yellow** = One endpoint down
- 🔴 **Red "OTP Down"** = Both endpoints down

### Test Trip Planning

**From**: Type "downtown" or click 📍 and click on map  
**To**: Type "uptown" or use map click  
**Get Routes**: Click button  

Expected: 3-6 route options appear at bottom

---

## 🔧 Troubleshooting

### "OTP Down" in health chip
```bash
# Test endpoint directly
curl -X POST https://408444805012.ngrok-free.app/otp/gtfs/v1 \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}'
```

Expected response: `{"data":{"__typename":"QueryType"}}`

### No autocomplete suggestions
- Requires minimum 3 characters
- Uses Nominatim (respects rate limits)
- Check browser console for errors

### "No routes found"
- Verify both From/To are set (coordinates shown below inputs)
- Check that at least one routing toggle is enabled
- Try closer locations (within CDO area)
- Check browser console for GraphQL errors

### CORS errors with ngrok
Add to your fetch calls (already handled in `src/lib/otp.ts`):
```typescript
headers: {
  'ngrok-skip-browser-warning': 'true'
}
```

---

## 📖 Usage Examples

### Example 1: Search-based planning
1. Type "Divisoria" in From field
2. Select from suggestions
3. Type "SM CDO" in To field
4. Select from suggestions
5. Click "Get Routes"

### Example 2: Map-click planning
1. Click 📍 pin next to "From"
2. Click on map at starting location
3. Click 📍 pin next to "To"
4. Click on map at destination
5. Click "Get Routes"

### Example 3: Compare routing engines
1. Set From/To
2. Enable only "Transmodel v3"
3. Get Routes → note results
4. Enable only "GTFS v1"
5. Get Routes → compare
6. Enable both → merged results

---

## 🎯 Key Features to Test

### Interactive Map
- ✅ Click route in list → map zooms to fit
- ✅ Hover route in list → route highlights on map
- ✅ Different line styles: dashed = walk, solid = bus

### Controls
- ✅ Toggle Transmodel/GTFS independently
- ✅ Adjust number of itineraries (1-10)
- ✅ Change departure time
- ✅ Clear button resets everything

### Details Panel (Desktop)
- ✅ Right side shows per-leg breakdown
- ✅ Mode icons, distances, durations
- ✅ Stop names for each leg

---

## 🔍 GraphQL Query Verification

### Check what variables are sent

Open browser DevTools → Network → Filter by "graphql"

**Transmodel request body:**
```json
{
  "query": "query TripPlan($from: InputLocation! ...",
  "variables": {
    "from": {"coordinates": {"latitude": 8.xxx, "longitude": 124.xxx}},
    "to": {"coordinates": {"latitude": 8.yyy, "longitude": 124.yyy}},
    "dateTime": "2025-10-21T12:00:00.000Z",
    "modes": {...},
    "numTripPatterns": 5
  }
}
```

✅ **Correct**: Variables use actual selected coordinates  
❌ **Wrong**: Hardcoded example numbers

---

## 📱 Mobile Testing

The app is mobile-responsive:

1. Open DevTools → Toggle device toolbar
2. Select mobile device (iPhone, Android)
3. Test features:
   - Search boxes stack vertically
   - Controls panel adapts width
   - Itinerary list scrollable
   - Map click still works

---

## 🏗️ Build for Production

```bash
# Build
npm run build

# Test production build locally
npm run preview
```

Output in `dist/` folder ready to deploy to Vercel/Netlify.

---

## 📚 Next Steps

See [README.md](./README.md) for:
- Detailed architecture
- API documentation
- Customization guide
- Deployment instructions
- Advanced troubleshooting

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Dependencies not installing | Try `npm ci` or delete `node_modules` + `package-lock.json` |
| Port 5173 in use | Vite will auto-increment (5174, 5175, etc.) |
| Map not loading | Check browser console, verify Leaflet CSS imported |
| TypeScript errors | Run `npm run build` to see full errors |
| Polylines not rendering | Check OTP response includes `legGeometry.points` |

---

**You're all set!** 🎉

If you encounter issues not covered here, check:
1. Browser console (F12)
2. Network tab for failed requests
3. OTP endpoint responses
4. README.md troubleshooting section

