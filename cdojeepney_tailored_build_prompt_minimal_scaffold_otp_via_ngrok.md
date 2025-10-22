# CDOJeepney — Tailored Build Prompt + Minimal Scaffold

> Use this as a **ready-to-run blueprint** for scaffolding the brand‑new CDOJeepney site wired to your current OTP endpoints (ngrok). Copy blocks into your repo as noted.

---

## 0) Environment — your current OTP endpoints

- **Transmodel GraphQL (routing)**: `https://f390d61fb579.ngrok-free.app/otp/transmodel/v3`
- **GTFS GraphQL (static index)**: `https://f390d61fb579.ngrok-free.app/otp/gtfs/v1`
- **Actuator/Health** (optional): `https://f390d61fb579.ngrok-free.app/otp/actuators/health`

Create a project `.env` (Vite) as:

```env
VITE_OTP_TM_URL=https://f390d61fb579.ngrok-free.app/otp/transmodel/v3
VITE_OTP_GTFS_URL=https://f390d61fb579.ngrok-free.app/otp/gtfs/v1
VITE_HEALTH_URL=https://f390d61fb579.ngrok-free.app/otp/actuators/health
VITE_GEOCODER_URL=""  # optional; add Pelias/Photon later
```

> If ngrok rotates, only update this file.

---

## 1) Tech decisions (locked for MVP)

- **React + TypeScript + Vite**
- **UI**: Tailwind (with shadcn/ui optional)
- **State & Data**: TanStack Query, URL params
- **GraphQL**: `graphql-request` clients (two instances: TM + GTFS)
- **Map**: MapLibre GL (fallback: Leaflet)
- **Deploy**: Vercel/Netlify

---

## 2) App features (MVP)

- Plan trip (A → B) for **jeepney-only** using Transmodel `trip` query
- See jeepney routes overlay (from GTFS `routes` + `patterns`)
- Shareable deep link (URL params)
- Health banner when OTP not ready

---

## 3) File tree (copy/paste)

```
cdojeepney/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  .env
  src/
    main.tsx
    App.tsx
    styles.css
    lib/
      gqlClient.ts
      schema.d.ts
      urlState.ts
      health.ts
    queries/
      tm_trip.ts
      gtfs_routes.ts
      gtfs_route_detail.ts
    components/
      MapView.tsx
      SearchPanel.tsx
      ItineraryList.tsx
      SystemHealthChip.tsx
```

---

## 4) package.json

```json
{
  "name": "cdojeepney",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 5173"
  },
  "dependencies": {
    "graphql": "^16.9.0",
    "graphql-request": "^7.1.1",
    "maplibre-gl": "^4.7.1",
    "zustand": "^4.5.5",
    "@tanstack/react-query": "^5.59.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/maplibre-gl": "^2.4.9",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2",
    "vite": "^5.4.8"
  }
}
```

---

## 5) Vite + Tailwind minimal

**vite.config.ts**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
```

**tailwind.config.js**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: []
}
```

**postcss.config.js**
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

**src/styles.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
html, body, #root { height: 100%; }
```

---

## 6) GraphQL clients (two endpoints)

**src/lib/gqlClient.ts**
```ts
import { GraphQLClient } from 'graphql-request'

export const tm = new GraphQLClient(import.meta.env.VITE_OTP_TM_URL, {
  headers: () => ({ 'content-type': 'application/json' })
})

export const gtfs = new GraphQLClient(import.meta.env.VITE_OTP_GTFS_URL, {
  headers: () => ({ 'content-type': 'application/json' })
})
```

---

## 7) Health util + chip

**src/lib/health.ts**
```ts
export async function fetchHealth(): Promise<'ok'|'down'|'unknown'> {
  const url = import.meta.env.VITE_HEALTH_URL
  if (!url) return 'unknown'
  try {
    const res = await fetch(url, { method: 'GET' })
    return res.ok ? 'ok' : 'down'
  } catch {
    return 'down'
  }
}
```

**src/components/SystemHealthChip.tsx**
```tsx
import { useEffect, useState } from 'react'
import { fetchHealth } from '../lib/health'

export default function SystemHealthChip() {
  const [status, setStatus] = useState<'ok'|'down'|'unknown'>('unknown')
  useEffect(() => {
    let t: any
    const loop = async () => { setStatus(await fetchHealth()); t = setTimeout(loop, 10000) }
    loop();
    return () => clearTimeout(t)
  }, [])

  const color = status === 'ok' ? 'bg-green-500' : status === 'down' ? 'bg-red-500' : 'bg-gray-400'
  const text  = status === 'ok' ? 'OTP ready' : status === 'down' ? 'OTP starting…' : 'Unknown'

  return (
    <div className={`fixed top-3 right-3 px-3 py-1 rounded-full text-white text-sm ${color}`}>{text}</div>
  )
}
```

---

## 8) Planner queries (Transmodel + GTFS)

**src/queries/tm_trip.ts**
```ts
export const TM_PLAN_TRIP = /* GraphQL */ `
query PlanTrip($from: InputCoordinates!, $to: InputCoordinates!, $dateTime: DateTime!, $modes: [TransportMode!], $num: Int) {
  trip(
    from: { coordinates: $from }
    to: { coordinates: $to }
    dateTime: $dateTime
    modes: $modes
    numTripPatterns: $num
  ) {
    tripPatterns {
      startTime
      endTime
      duration
      legs {
        mode
        distance
        fromPlace { name quay { id } }
        toPlace { name quay { id } }
        line { id publicCode name }
        pointsOnLink { points }
      }
    }
  }
}`
```

**src/queries/gtfs_routes.ts**
```ts
export const GTFS_ROUTES = /* GraphQL */ `
{ routes { id shortName longName color textColor } }
`
```

**src/queries/gtfs_route_detail.ts**
```ts
export const GTFS_ROUTE_DETAIL = /* GraphQL */ `
query RouteTrips($routeId: String!) {
  route(id: $routeId) {
    id shortName longName
    patterns { id headsign directionId stops { id name lat lon } }
  }
}`
```

---

## 9) URL state helper

**src/lib/urlState.ts**
```ts
export type LatLng = { latitude: number; longitude: number }

export function readCoords(search: URLSearchParams, key: 'from'|'to'): LatLng | null {
  const v = search.get(key)
  if (!v) return null
  const [lat, lon] = v.split(',').map(Number)
  if (Number.isFinite(lat) && Number.isFinite(lon)) return { latitude: lat, longitude: lon }
  return null
}

export function writeCoords(url: URL, key: 'from'|'to', c: LatLng | null) {
  if (c) url.searchParams.set(key, `${c.latitude},${c.longitude}`)
  else url.searchParams.delete(key)
}
```

---

## 10) Core UI — App & main

**src/main.tsx**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles.css'

const qc = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
```

**src/App.tsx**
```tsx
import { useMemo, useState } from 'react'
import { tm, gtfs } from './lib/gqlClient'
import { TM_PLAN_TRIP } from './queries/tm_trip'
import { GTFS_ROUTES } from './queries/gtfs_routes'
import SystemHealthChip from './components/SystemHealthChip'
import MapView from './components/MapView'
import SearchPanel from './components/SearchPanel'
import ItineraryList from './components/ItineraryList'
import { useQuery } from '@tanstack/react-query'
import { readCoords } from './lib/urlState'

export default function App() {
  const [url, setUrl] = useState(() => new URL(window.location.href))
  const from = useMemo(() => readCoords(url.searchParams, 'from'), [url])
  const to   = useMemo(() => readCoords(url.searchParams, 'to'),   [url])

  const { data: routesData } = useQuery({
    queryKey: ['gtfs-routes'],
    queryFn: async () => gtfs.request(GTFS_ROUTES),
    staleTime: 60_000
  })

  const { data: tripData, refetch: refetchTrip, isFetching: planning } = useQuery({
    queryKey: ['tm-trip', from, to],
    queryFn: async () => {
      if (!from || !to) return null
      const dateTime = new Date().toISOString()
      return tm.request(TM_PLAN_TRIP, {
        from, to, dateTime, modes: ['bus'], num: 5
      })
    },
    enabled: !!from && !!to
  })

  return (
    <div className="h-screen w-full">
      <SystemHealthChip />
      <SearchPanel onChangeUrl={setUrl} onPlan={() => refetchTrip()} planning={planning} />
      <MapView from={from} to={to} trip={tripData?.trip?.tripPatterns ?? []} routes={routesData?.routes ?? []} />
      <ItineraryList patterns={tripData?.trip?.tripPatterns ?? []} />
    </div>
  )
}
```

---

## 11) SearchPanel (A/B + Plan)

**src/components/SearchPanel.tsx**
```tsx
import { writeCoords, LatLng } from '../lib/urlState'

function parseLatLng(s: string): LatLng | null {
  const parts = s.split(',').map(p => p.trim())
  if (parts.length !== 2) return null
  const latitude = Number(parts[0]); const longitude = Number(parts[1])
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null
}

export default function SearchPanel({ onChangeUrl, onPlan, planning }:{
  onChangeUrl: (u: URL) => void
  onPlan: () => void
  planning: boolean
}) {
  function update(key: 'from'|'to') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = new URL(window.location.href)
      writeCoords(url, key, parseLatLng(e.target.value))
      window.history.replaceState({}, '', url)
      onChangeUrl(url)
    }
  }

  return (
    <div className="fixed top-3 left-3 right-24 z-10 flex gap-2 bg-white/90 backdrop-blur p-2 rounded-xl shadow">
      <input className="flex-1 px-3 py-2 rounded border" placeholder="From (lat,lon) e.g. 8.472152,124.616295" onChange={update('from')} />
      <input className="flex-1 px-3 py-2 rounded border" placeholder="To (lat,lon) e.g. 8.487033,124.638092" onChange={update('to')} />
      <button onClick={onPlan} disabled={planning} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">{planning ? 'Planning…' : 'Plan'}</button>
    </div>
  )
}
```

---

## 12) MapView (pins + polylines)

**src/components/MapView.tsx**
```tsx
import maplibregl, { Map } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import type { LatLng } from '../lib/urlState'

type Pattern = {
  legs: { pointsOnLink?: { points?: string } }[]
}

export default function MapView({ from, to, trip, routes }:{
  from: LatLng | null
  to: LatLng | null
  trip: Pattern[]
  routes: any[]
}) {
  const mapRef = useRef<Map | null>(null)
  const elRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: elRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [124.63, 8.48],
      zoom: 12
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }))
    mapRef.current = map
  }, [])

  useEffect(() => {
    const map = mapRef.current; if (!map) return

    // Clear existing markers
    ;(map as any)._cdoMarkers?.forEach((m: any) => m.remove())
    ;(map as any)._cdoMarkers = []

    function addMarker(c: LatLng, color: string) {
      const el = document.createElement('div')
      el.style.width = '12px'; el.style.height = '12px'; el.style.borderRadius = '9999px'; el.style.background = color
      const mk = new maplibregl.Marker({ element: el }).setLngLat([c.longitude, c.latitude]).addTo(map)
      ;(map as any)._cdoMarkers.push(mk)
    }

    if (from) addMarker(from, '#111')
    if (to) addMarker(to, '#1e90ff')
  }, [from, to])

  useEffect(() => {
    const map = mapRef.current; if (!map) return

    const id = 'trip-lines'
    if (map.getSource(id)) { map.removeLayer(id); map.removeSource(id) }

    const features: any[] = []
    for (const p of trip) {
      for (const leg of p.legs) {
        const poly = leg.pointsOnLink?.points
        if (!poly) continue
        // decode polyline-5 quickly (basic)
        const coords = decode(poly).map(([lat, lon]) => [lon, lat])
        features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } })
      }
    }

    map.addSource(id, { type: 'geojson', data: { type: 'FeatureCollection', features } as any })
    map.addLayer({ id, type: 'line', source: id, paint: { 'line-width': 4 } })
  }, [trip])

  return <div ref={elRef} className="absolute inset-0" />
}

// Minimal polyline decoder (precision 5)
function decode(str: string) {
  let u=0, x=0, y=0, out:number[][]=[]
  while (u < str.length) { x += n(); y += n(); out.push([y/1e5, x/1e5]) }
  return out
  function n(){ let r=0, s=0, b; do { b=str.charCodeAt(u++)-63; r|=(b&31)<<s; s+=5 } while (b>=32); return (r&1)?~(r>>1):(r>>1) }
}
```

---

## 13) Itinerary list (simple)

**src/components/ItineraryList.tsx**
```tsx
export default function ItineraryList({ patterns }:{ patterns: any[] }){
  return (
    <div className="absolute bottom-0 left-0 right-0 max-h-1/2 overflow-auto bg-white/95 backdrop-blur p-3">
      <h3 className="font-semibold mb-2">Itineraries</h3>
      {patterns.length === 0 && <div className="text-sm text-gray-500">No results yet.</div>}
      <div className="grid gap-2">
        {patterns.map((p, i) => (
          <div key={i} className="border rounded p-2">
            <div className="text-sm">Duration: {Math.round((p.duration||0)/60)} min</div>
            <div className="text-xs text-gray-600">Legs: {p.legs?.map((l:any)=>l.mode).join(' → ')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 14) index.html

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CDOJeepney</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 15) Run commands

```bash
# 1) Create
npm create vite@latest cdojeepney -- --template react-ts
cd cdojeepney

# 2) Install deps
npm i graphql graphql-request maplibre-gl zustand @tanstack/react-query
npm i -D tailwindcss postcss autoprefixer @types/maplibre-gl
npx tailwindcss init -p

# 3) Add files from this doc, update .env

# 4) Dev
npm run dev
# open http://localhost:5173
```

---

## 16) Smoke tests (curl)


```bash
# Health
curl -i https://f390d61fb579.ngrok-free.app/otp/actuators/health

# GTFS routes
curl -s https://f390d61fb579.ngrok-free.app/otp/gtfs/v1 \
  -H 'content-type: application/json' \
  -d '{"query":"{ routes { id shortName longName } }"}'

# Transmodel trip
curl -s https://f390d61fb579.ngrok-free.app/otp/transmodel/v3 \
  -H 'content-type: application/json' \
  -d '{"query":"query($f:InputCoordinates!,$t:InputCoordinates!,$dt:DateTime!){ trip(from:{coordinates:$f}, to:{coordinates:$t}, dateTime:$dt){ tripPatterns { duration legs { mode line { publicCode } pointsOnLink { points } }}}}", "variables":{"f":{"latitude":8.472152,"longitude":124.616295},"t":{"latitude":8.487033,"longitude":124.638092},"dt":"2025-10-21T04:30:00Z"}}'
```

---

## 17) Build Prompt (paste to an AI agent)

**Instruction:**
> You are an expert React/TypeScript engineer. Scaffold and implement the CDOJeepney MVP using the file tree and code style below. Wire to the following OTP endpoints: Transmodel `https://f390d61fb579.ngrok-free.app/otp/transmodel/v3`, GTFS `https://f390d61fb579.ngrok-free.app/otp/gtfs/v1`, Health `https://f390d61fb579.ngrok-free.app/otp/actuators/health`. Implement the planner (A/B inputs → Transmodel trip), map rendering (pins + polylines), routes overlay (GTFS routes), and health chip. Preserve state in URL. Ship a clean, mobile-first UI with Tailwind. Ensure code matches the exact filenames/paths below and runs with `npm run dev`.

**Deliverables to produce:**
1) Complete repo with files from sections **3–14**
2) Verified npm scripts (`dev`, `build`, `preview`)
3) Planner works for the provided sample coordinates
4) Map shows pins and polylines from returned legs
5) Health chip shows **OTP ready** when health is 200
6) README with setup steps (use sections 0, 15, 16)

**Constraints:**
- Use `graphql-request` for GraphQL
- Limit itineraries to `numTripPatterns: 5`
- Use `modes: ["bus"]` (treat jeepneys as bus‑like GTFS routes)
- No auth assumptions
- Keep components small and typed

**Stretch:** Add `/route/:routeId` page using `GTFS_ROUTE_DETAIL`.

---

## 18) Notes & Gotchas

- If Transmodel schema differs, open `/graphiql` on the ngrok host to introspect, then align the `TM_PLAN_TRIP` fields.
- If map polylines don’t render, check `pointsOnLink.points` exists. Some builds require decoding from leg geometry or falling back to GTFS shapes.
- If health endpoint is blocked by CORS, proxy via Vite or a tiny edge function.

---

**You’re set.** Update the `.env` if ngrok rotates; the rest of the app remains unchanged.

