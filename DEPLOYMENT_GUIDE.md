# Deployment Guide - CDO Jeepney Planner

Complete guide for deploying the application to production.

## Pre-Deployment Checklist

### 1. Environment Setup

Create a `.env.production` file:

```env
VITE_APP_NAME=CDO Jeepney Planner
VITE_OTP_API_URL=https://your-otp-api.com
VITE_GTFS_API_URL=https://your-gtfs-api.com
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

### 2. Replace Mock APIs

Update `src/mocks/mockApi.ts` to use real endpoints:

```typescript
// Example: Real OTP API integration
export async function planRoute(from: Coord, to: Coord, options = {}) {
  const response = await fetch(
    `${import.meta.env.VITE_OTP_API_URL}/plan?` +
    `fromPlace=${from.lat},${from.lon}&` +
    `toPlace=${to.lat},${to.lon}&` +
    `mode=TRANSIT,WALK&` +
    `numItineraries=${options.numItineraries || 3}`
  );
  
  if (!response.ok) {
    throw new Error('Route planning failed');
  }
  
  const data = await response.json();
  return normalizeOTPResponse(data);
}
```

### 3. Update CDO Data

Update `src/lib/constants.ts` with real CDO landmarks:

```typescript
export const CDO_LANDMARKS = [
  // Add all actual CDO landmarks from local database
  { name: 'SM CDO Downtown Premier', lat: 8.4781, lon: 124.6472 },
  // ... more landmarks
];
```

## Deployment Platforms

### Option 1: Vercel (Recommended)

#### Setup

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

#### Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

#### Setup

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

#### Configuration

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"
```

### Option 3: Docker

#### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
  location /sw.js {
    root /usr/share/nginx/html;
    add_header Cache-Control "no-cache";
  }
}
```

#### Build and Run

```bash
docker build -t cdo-jeepney .
docker run -p 80:80 cdo-jeepney
```

## Performance Optimization

### 1. Enable Compression

Most platforms auto-enable, but verify gzip/brotli compression is active.

### 2. CDN Setup

Configure CDN for static assets:

```typescript
// vite.config.ts
export default defineConfig({
  base: process.env.CDN_URL || '/',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
});
```

### 3. Image Optimization

Add optimized PWA icons:

```bash
# Generate icons
npx pwa-asset-generator public/logo.svg public --favicon
```

### 4. Map Tile Caching

Configure aggressive caching for map tiles in service worker.

## Monitoring Setup

### 1. Error Tracking (Sentry)

Install Sentry:
```bash
npm install @sentry/react
```

Configure in `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}
```

### 2. Analytics (Plausible)

Add to `index.html`:
```html
<script defer data-domain="cdojeepney.com" src="https://plausible.io/js/script.js"></script>
```

### 3. Performance Monitoring

Use Lighthouse CI in GitHub Actions:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci && npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

## Security Hardening

### 1. Content Security Policy

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https://*.tile.openstreetmap.org;
               connect-src 'self' https://your-api.com">
```

### 2. HTTPS Only

Ensure platform enforces HTTPS redirects.

### 3. API Security

- Use CORS properly on backend
- Implement rate limiting
- Add API authentication

## Testing in Production

### 1. Smoke Tests

```bash
# Test production build locally
npm run build
npm run preview

# Run E2E against preview
npx playwright test --headed
```

### 2. Load Testing

Use Artillery or k6:
```bash
npm install -g artillery
artillery quick --count 100 --num 10 https://your-app.com
```

### 3. Accessibility Audit

```bash
npm install -g @axe-core/cli
axe https://your-app.com
```

## Post-Deployment

### 1. Verify Functionality

- [ ] Routes load correctly
- [ ] Map tiles render
- [ ] Search autocomplete works
- [ ] All pages accessible
- [ ] PWA installable
- [ ] Offline mode works
- [ ] Translations work
- [ ] Analytics tracking

### 2. Performance Check

Run Lighthouse:
```bash
lighthouse https://your-app.com --view
```

Target scores:
- Performance: 90+
- Accessibility: 100
- Best Practices: 95+
- SEO: 90+

### 3. Monitor Errors

Check Sentry dashboard for:
- JavaScript errors
- API failures
- Performance issues

### 4. Setup Alerts

Configure alerts for:
- Error rate > 1%
- Response time > 3s
- Availability < 99%

## Rollback Plan

### Quick Rollback

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
Use dashboard to restore previous deployment

**Docker:**
```bash
docker pull cdo-jeepney:previous-tag
docker run -p 80:80 cdo-jeepney:previous-tag
```

## Maintenance

### Regular Tasks

**Weekly:**
- Review error logs
- Check performance metrics
- Update dependencies (patch versions)

**Monthly:**
- Security audit: `npm audit`
- Update dependencies (minor versions)
- Review analytics

**Quarterly:**
- Major dependency updates
- Performance optimization review
- UX improvements based on feedback

## Scaling Considerations

### 1. API Caching

Implement Redis for OTP responses:
```typescript
const cache = new Redis(process.env.REDIS_URL);

export async function planRoute(from, to, options) {
  const cacheKey = `route:${from.lat},${from.lon}:${to.lat},${to.lon}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = await fetchFromOTP(from, to, options);
  await cache.setex(cacheKey, 300, JSON.stringify(result));
  return result;
}
```

### 2. CDN for Static Assets

Use Cloudflare or AWS CloudFront for:
- Map tiles
- Static assets
- API caching

### 3. Database Scaling

If adding user accounts:
- Use connection pooling
- Implement read replicas
- Cache frequently accessed data

## Backup Strategy

### 1. Code
- Git repository (GitHub/GitLab)
- Tagged releases

### 2. User Data
- Daily database backups
- Point-in-time recovery
- Backup retention: 30 days

### 3. Configuration
- Environment variables in secret manager
- Infrastructure as Code (Terraform/CDK)

## Compliance

### GDPR (if applicable)
- Cookie consent banner
- Privacy policy
- Data export functionality
- Right to deletion

### Accessibility
- Regular WCAG audits
- User testing with assistive tech
- Maintain AA compliance

## Support & Documentation

### User-Facing
- FAQ page
- How-to guides
- Video tutorials
- Support contact

### Developer
- API documentation
- Architecture diagrams
- Runbooks for common issues

---

## Quick Deploy Commands

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Deploy via Docker
docker build -t cdo-jeepney . && docker push cdo-jeepney:latest
```

## Emergency Contacts

- **DevOps**: [contact info]
- **API Support**: [OTP/GTFS provider]
- **Hosting Support**: [Vercel/Netlify support]

---

**Last Updated**: [Date]
**Version**: 0.3.0

