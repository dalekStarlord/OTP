# Debugging "No Routes Found" Issue

## 🔧 **Fixes Applied**

### 1. Added ngrok Headers
```typescript
// src/lib/otp.ts
headers: { 
  'content-type': 'application/json',
  'ngrok-skip-browser-warning': 'true'  // ← NEW: Bypasses ngrok warning page
}
```

### 2. Enhanced Console Logging
Now you'll see detailed logs in browser console (F12):
- 🎯 Route planning start
- 🚀 API requests with variables
- ✅ Successful responses
- ❌ Detailed error messages
- 📊 Result summaries

### 3. Better Error Messages
Error messages now show which API failed and why.

---

## 🧪 **How to Debug**

### Step 1: Restart Dev Server
```bash
# MUST restart for .env.local and changes to take effect
npm run dev
```

### Step 2: Open Browser Console
1. Open http://localhost:5173
2. Press `F12` (or right-click → Inspect)
3. Go to **Console** tab
4. Keep it open while testing

### Step 3: Test Route Planning

#### Quick Test with Sample Coordinates:
1. **From**: Click map at downtown area (around 8.472, 124.616)
2. **To**: Click map at uptown area (around 8.487, 124.638)
3. Click **Get Routes**
4. **Watch the console**

#### What You Should See in Console:

**✅ If Working:**
```
🎯 Starting route planning: { from: {...}, to: {...} }
🚀 Transmodel Request: { url: "...", variables: {...} }
✅ Transmodel Response: { trip: { tripPatterns: [...] } }
🚀 GTFS Request: { url: "...", variables: {...} }
✅ GTFS Response: { plan: { itineraries: [...] } }
📊 Results: { transmodelCount: 3, gtfsCount: 2, combinedCount: 5 }
✅ Successfully planned 5 routes
```

**❌ If Failing:**
```
🎯 Starting route planning: ...
🚀 Transmodel Request: ...
❌ Transmodel trip planning error: [Error details]
Error details: { message: "...", stack: "..." }
📊 Results: { ... errors: ["Transmodel: Network error"] }
No routes found. Errors: Transmodel: Network error
```

---

## 🔍 **Common Issues & Solutions**

### Issue 1: Network Error / CORS Error

**Symptoms in Console:**
```
❌ CORS policy blocked
❌ Failed to fetch
❌ Network request failed
```

**Solution:**
The ngrok header should fix this. If not, check:

1. **Verify ngrok is running**
   ```bash
   curl -i https://9776907978a6.ngrok-free.app/otp/transmodel/v3
   ```
   Should return 200 OK (not 404 or connection refused)

2. **Update ngrok URL** if it changed
   - Edit `.env.local`
   - Update the URL
   - Restart dev server

### Issue 2: GraphQL Errors

**Symptoms in Console:**
```
❌ Transmodel trip planning error: GraphQL Error
"message": "Cannot query field 'modes' on type 'TripQuery'"
```

**Solution:**
The GraphQL schema might be different. Check with GraphiQL:
```
https://9776907978a6.ngrok-free.app/graphiql
```

Then compare our query with what the schema expects.

### Issue 3: No Data in Response

**Symptoms in Console:**
```
✅ Transmodel Response: { trip: { tripPatterns: [] } }
📊 Results: { transmodelCount: 0, gtfsCount: 0 }
No routes found. Try different locations or times.
```

**This means:**
- APIs are working ✅
- But no routes exist for those coordinates ❌

**Solutions:**
1. **Use different coordinates** within CDO area
2. **Try closer locations** (< 5km apart)
3. **Check if GTFS data loaded** in OTP server
4. **Try different time** (maybe routes don't run at that hour)

### Issue 4: Invalid Coordinates

**Symptoms:**
```
🎯 Starting route planning: { 
  from: { lat: NaN, lon: NaN },
  ...
}
```

**Solution:**
- Coordinates are not set properly
- Click the map to set From/To
- Or type valid coordinates in search

---

## 📝 **Test API Directly**

Open `test-api.html` in browser to test APIs without the app:
```bash
# In project folder
start test-api.html
```

This will test:
1. Transmodel health
2. GTFS health  
3. Transmodel trip planning
4. GTFS trip planning

---

## 🎯 **Expected Behavior**

### Working Scenario:
1. Set From: 8.472152, 124.616295
2. Set To: 8.487033, 124.638092
3. Click "Get Routes"
4. **See in console:**
   - Both APIs called
   - Responses received
   - Routes combined
5. **See in UI:**
   - 3-6 itinerary cards appear at bottom
   - Polylines drawn on map
   - Can click routes to zoom

### Not Working Scenario:
1. Console shows errors
2. Error message shows specific failure
3. **Check:**
   - Network tab for failed requests
   - Console for detailed error
   - Follow solutions above

---

## 🚀 **Next Steps**

1. **Restart dev server** (REQUIRED)
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Try to plan a route**

4. **Share console logs** if still not working:
   - Copy the 🎯, 🚀, ❌, ✅, 📊 messages
   - Share the errors
   - I can help diagnose

---

## 📊 **Environment Check**

Before debugging, verify:
```bash
# Check .env.local exists and has correct URLs
cat .env.local
# Should show:
# VITE_OTP_BASE=https://9776907978a6.ngrok-free.app
# VITE_OTP_TRANS_GQL=https://9776907978a6.ngrok-free.app/otp/transmodel/v3
# VITE_OTP_GTFS_GQL=https://9776907978a6.ngrok-free.app/otp/gtfs/v1
```

In browser console, check:
```javascript
console.log(import.meta.env.VITE_OTP_BASE);
// Should output: https://9776907978a6.ngrok-free.app
```

---

**The enhanced logging will tell us exactly what's failing!** 🎯

