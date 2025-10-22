# Quick Start Guide - CDO Jeepney Planner

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- Modern browser (Chrome, Firefox, Safari, Edge)

## Installation

```bash
cd OTP
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## First Run

The app will automatically:
1. Show a welcome tour explaining the 3-step journey planning process
2. Request location permissions (optional - you can enter addresses manually)
3. Load with mock data for demonstration

## Quick Demo

### Plan Your First Route

1. Click the "From" field and type "Cogon"
2. Select "Cogon Market" from the dropdown
3. Click the "To" field and type "Limketkai"
4. Select "Limketkai Center"
5. Click "Plan Route"
6. Browse the route options and click on one to see details

### Try Live Tracking

1. Click "Live Tracker" in the navigation
2. See mock vehicles moving on the map
3. Click a vehicle to see its route and ETA

### Customize Settings

1. Click "Settings" in navigation
2. Change language to Filipino or Cebuano
3. Toggle dark mode
4. Adjust text size for accessibility
5. Enable high contrast mode

### Save Your Favorites

1. Plan a route you use frequently
2. Click the star icon to save it
3. Go to "Favorites" to see all saved places and routes

## Testing

### Run Unit Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

## Build for Production

```bash
npm run build
npm run preview
```

The production build will be in the `dist/` folder.

## PWA Installation

When running in production mode:
1. Open the app in a browser
2. Look for "Install app" prompt
3. Click to install
4. The app will work offline after installation

## Key Features to Try

### Mobile View
- Resize your browser to mobile width (375px)
- Notice the hamburger menu
- Touch-friendly tap targets

### Keyboard Navigation
- Press Tab to navigate through inputs
- Use Arrow keys to navigate search results
- Press Enter to select
- Press Esc to close dropdowns

### Accessibility
- Enable a screen reader to hear descriptions
- Try keyboard-only navigation
- Test with high contrast mode
- Verify with different text sizes

### Offline Mode
- Open the app
- Turn off your network (or use browser DevTools to go offline)
- Notice the "Offline" status bar
- Previously viewed routes still work

## Common Use Cases

### Daily Commute
1. Set your home address in settings (Quick Places)
2. Set your work address
3. Use quick place chips for one-tap planning
4. Save your favorite route

### Tourist Navigation
1. Search for landmarks (e.g., "SM CDO")
2. Filter to prefer walking for sightseeing
3. View step-by-step directions with landmarks
4. Check live vehicles to avoid waiting

### Route Comparison
1. Plan a route
2. Use the sort options: Fastest / Cheapest / Fewest Transfers
3. Toggle transport modes to see alternatives
4. Compare total time and fare

## Troubleshooting

**Routes not loading?**
- Check that both From and To locations are selected
- Make sure you're online for first load
- Clear browser cache and reload

**Map not showing?**
- Enable JavaScript in browser settings
- Check browser console for errors
- Try a different browser

**Location not working?**
- Grant location permissions when prompted
- Use manual address entry as alternative
- Check device location services are enabled

**Performance issues?**
- Close other browser tabs
- Try the preview build (optimized)
- Check your device meets minimum requirements

## Next Steps

### For Development
- Read `IMPLEMENTATION_GUIDE.md` for architecture details
- Check `README_ENHANCED.md` for full features
- Explore the codebase in `src/`

### For Deployment
- Replace mock data with real OTP API
- Configure environment variables
- Set up analytics
- Deploy to Vercel or your hosting provider

### For Contribution
- Follow the component patterns in `src/components/ui/`
- Add translations to `src/i18n/locales/*.json`
- Write tests for new features
- Follow accessibility guidelines

## Support

This is a demonstration/template project. For questions:
- Check the README files
- Review the implementation guide
- Examine the test files for examples
- Open an issue on the repository

---

Enjoy navigating CDO! 🚌

