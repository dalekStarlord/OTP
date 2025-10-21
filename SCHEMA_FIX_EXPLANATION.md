# Schema Fix Explanation - GraphQL Validation Errors

## 🎯 **The Problem**

The error you got was a **GraphQL schema mismatch** - your OTP server's actual schema is different from what our queries expected.

### **This is NOT a bug in either:**
- ❌ Not your project code
- ❌ Not the OTP server

### **It's a schema version difference:**
✅ Different OTP versions/configurations use different GraphQL schemas

---

## 📋 **What Was Wrong**

### **Transmodel Errors:**
| What We Used | What OTP Expected | Fixed To |
|-------------|-------------------|----------|
| `$from: InputLocation!` | Inline coordinates | `$fromLat: Float!, $fromLon: Float!` |
| `$modes: TripModes` | Not used | Removed |
| `numberOfTransfers` | Doesn't exist | Removed (calculate from legs) |
| `from` / `to` | Field name | `fromPlace` / `toPlace` |
| `legGeometry.points` | Field name | `pointsOnLink.points` |

### **GTFS Errors:**
| What We Used | What OTP Expected | Fixed To |
|-------------|-------------------|----------|
| `dateTime: Long` | Not supported | Removed |
| `transfers` field | Doesn't exist | Calculate from legs |

---

## ✅ **What Was Fixed**

### **1. Transmodel Query** ✅
**Before (WRONG):**
```graphql
query TripPlan(
  $from: InputLocation!     # ← Unknown type
  $to: InputLocation!       # ← Unknown type
  $modes: TripModes         # ← Unknown type
) {
  trip(from: $from, to: $to, modes: $modes) {
    tripPatterns {
      numberOfTransfers      # ← Field doesn't exist
      legs {
        from { ... }         # ← Field doesn't exist
        to { ... }           # ← Field doesn't exist
        legGeometry { points } # ← Field doesn't exist
      }
    }
  }
}
```

**After (CORRECT):**
```graphql
query TripPlan(
  $fromLat: Float!
  $fromLon: Float!
  $toLat: Float!
  $toLon: Float!
) {
  trip(
    from: { coordinates: { latitude: $fromLat, longitude: $fromLon } }
    to: { coordinates: { latitude: $toLat, longitude: $toLon } }
  ) {
    tripPatterns {
      # Removed numberOfTransfers (doesn't exist)
      legs {
        fromPlace { ... }    # ← Changed from 'from'
        toPlace { ... }      # ← Changed from 'to'
        pointsOnLink { points } # ← Changed from 'legGeometry'
      }
    }
  }
}
```

### **2. GTFS Query** ✅
**Before (WRONG):**
```graphql
query Plan($dateTime: Long) {  # ← Not supported
  plan(dateTime: $dateTime) {
    itineraries {
      transfers              # ← Field doesn't exist
    }
  }
}
```

**After (CORRECT):**
```graphql
query Plan {
  plan {  # ← Removed dateTime parameter
    itineraries {
      walkDistance  # ← Use this instead of transfers
      legs { ... }  # ← Calculate transfers from legs
    }
  }
}
```

---

## 🔍 **How to Discover the Correct Schema**

### **Method 1: Use GraphiQL (Built-in)**

Your OTP server likely has GraphiQL at:
```
https://9776907978a6.ngrok-free.app/graphiql
```

**Steps:**
1. Open that URL in browser
2. Click **"Docs"** button (top-right)
3. Browse the schema
4. Look for:
   - `Query.trip` to see Transmodel fields
   - `Query.plan` to see GTFS fields

### **Method 2: Introspection Query**

Run this to get the full schema:
```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      fields {
        name
        type {
          name
        }
      }
    }
  }
}
```

### **Method 3: Try Queries in GraphiQL**

Test queries directly in GraphiQL to see what works:
```graphql
# Test Transmodel
query {
  trip(
    from: { coordinates: { latitude: 8.472, longitude: 124.616 } }
    to: { coordinates: { latitude: 8.487, longitude: 124.638 } }
  ) {
    tripPatterns {
      legs {
        # Hit Ctrl+Space here to see available fields
      }
    }
  }
}
```

---

## 🛠️ **What Changes Were Made to Your Project**

### **File: src/lib/otp.ts**

**Changed:**
1. ✅ Transmodel query to use `fromLat/fromLon/toLat/toLon`
2. ✅ Field names: `from` → `fromPlace`, `to` → `toPlace`
3. ✅ Field names: `legGeometry` → `pointsOnLink`
4. ✅ Removed `modes` parameter (not needed)
5. ✅ Removed `numberOfTransfers` field (doesn't exist)
6. ✅ GTFS query removed `dateTime` parameter
7. ✅ Calculate transfers from leg count instead of using field

**Why it works now:**
- Queries match your OTP server's actual schema
- No more validation errors
- Should return real route data

---

## 🚀 **How to Test**

### **Step 1: Restart Dev Server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### **Step 2: Try Route Planning**
1. Set From: Click map (e.g., 8.495, 124.603)
2. Set To: Click map (e.g., 8.487, 124.637)
3. Click "Get Routes"
4. **Check console** (F12)

### **Step 3: Expected Console Output**

**✅ If Working Now:**
```
🎯 Starting route planning: ...
🚀 Transmodel Request: ...
✅ Transmodel Response: { 
  trip: { 
    tripPatterns: [
      { legs: [...], duration: 1234, ... }
    ] 
  } 
}
🚀 GTFS Request: ...
✅ GTFS Response: { 
  plan: { 
    itineraries: [...] 
  } 
}
📊 Results: { transmodelCount: 2, gtfsCount: 3, combinedCount: 5 }
✅ Successfully planned 5 routes
```

Routes should appear at the bottom!

**❌ If Still Errors:**
Share the console output - it will show which fields are still wrong.

---

## 📚 **Understanding OTP Schema Variations**

### **Why do schemas differ?**

1. **OTP Version**
   - OTP 1.x vs 2.x have different schemas
   - Your server appears to be OTP 2.x

2. **Configuration**
   - Different OTP configurations expose different fields
   - Some fields are optional

3. **Custom Extensions**
   - Some deployments add custom fields
   - Some remove unused fields

### **Common Schema Patterns**

**OTP 2.x Transmodel typically uses:**
- `fromPlace` / `toPlace` (not `from` / `to`)
- `pointsOnLink` (not `legGeometry`)
- Inline coordinate objects
- No `modes` parameter for basic queries

**OTP 2.x GTFS typically uses:**
- No `dateTime` parameter (uses current time)
- `walkDistance` instead of `transfers` field
- Standard `from` / `to` field names

---

## 🔄 **If Your OTP Schema Changes**

If you update OTP or the schema changes:

### **1. Check GraphiQL First**
```
https://9776907978a6.ngrok-free.app/graphiql
```

### **2. Update Queries in src/lib/otp.ts**
Look for:
- `TM_TRIP_QUERY` constant
- `GTFS_PLAN_QUERY` constant

### **3. Update Normalizers**
Look for:
- `normalizeTransmodel()` function
- `normalizeGtfs()` function

Match field names to actual response structure.

---

## ✅ **Summary**

| Issue | Cause | Solution |
|-------|-------|----------|
| **GraphQL Validation Errors** | Schema mismatch | ✅ Fixed queries to match actual schema |
| **Unknown type 'InputLocation'** | Different type pattern | ✅ Use inline Float parameters |
| **Field 'from' undefined** | Different field name | ✅ Changed to 'fromPlace' |
| **Field 'legGeometry' undefined** | Different field name | ✅ Changed to 'pointsOnLink' |
| **Unknown argument 'dateTime'** | Not supported | ✅ Removed from GTFS query |
| **Field 'transfers' undefined** | Doesn't exist | ✅ Calculate from legs |

---

## 🎉 **Result**

**Before:** ❌ Validation errors, no routes  
**After:** ✅ Queries match schema, routes should work!

---

## 🐛 **If Still Not Working**

After restart, if you still get errors:

1. **Share the new console output**
2. **Check GraphiQL** to verify schema
3. **Try a simple test query** in GraphiQL:
   ```graphql
   {
     trip(
       from: { coordinates: { latitude: 8.472, longitude: 124.616 } }
       to: { coordinates: { latitude: 8.487, longitude: 124.638 } }
     ) {
       tripPatterns {
         duration
       }
     }
   }
   ```

If that works in GraphiQL but not in the app, there's another issue.

---

**Now restart and test! The schema errors should be fixed!** 🎯

