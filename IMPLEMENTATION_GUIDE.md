# Implementation Guide - Nielsen's Heuristics & Norman's Principles

This document maps how each design principle is implemented in the codebase.

## Nielsen's 10 Usability Heuristics

### 1. Visibility of System Status

**Implementation:**
- `src/components/ui/AppStatusBar.tsx` - Global status indicator
- `src/store/appStore.ts` - Status state management
- Updates trigger within `STATUS_UPDATE_INTERVAL` (250ms)

**Test:**
```typescript
// e2e/journey-planning.spec.ts
test('should show computing status', async ({ page }) => {
  await page.getByRole('button', { name: /plan route/i }).click();
  await expect(page.getByText(/computing/i)).toBeVisible();
});
```

### 2. Match Between System and Real World

**Implementation:**
- `src/lib/constants.ts` - CDO-specific landmarks
- `src/i18n/locales/*.json` - Local terminology
- `src/lib/utils.ts` - `formatFare()` uses ₱ symbol

**Example:**
```typescript
const CDO_LANDMARKS = [
  { name: 'SM CDO Downtown Premier', lat: 8.4781, lon: 124.6472 },
  { name: 'Cogon Market', lat: 8.4664, lon: 124.6358 },
];
```

### 3. User Control and Freedom

**Implementation:**
- `src/pages/Home.tsx` - Swap locations button
- `src/components/ui/EnhancedSearchBar.tsx` - Clear button
- `src/store/appStore.ts` - Undo support in state

**Code:**
```typescript
const handleSwap = () => {
  const temp = from;
  setFrom(to);
  setTo(temp);
};
```

### 4. Consistency and Standards

**Implementation:**
- `src/lib/utils.ts` - `cn()` for consistent class merging
- `src/lib/constants.ts` - Design tokens
- All components use Radix UI primitives

**Design System:**
```typescript
export const FOCUS_RING_CLASSES = 
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
```

### 5. Error Prevention

**Implementation:**
- `src/components/ui/EnhancedSearchBar.tsx` - Type-ahead with disambiguation
- `src/components/ui/Button.tsx` - Disabled states
- `src/mocks/mockApi.ts` - Input validation

**Example:**
```typescript
<Button disabled={!from || !to} onClick={handlePlanRoute}>
  Plan Route
</Button>
```

### 6. Recognition Rather than Recall

**Implementation:**
- `src/store/appStore.ts` - Recent searches, saved places
- `src/components/ui/EnhancedSearchBar.tsx` - Shows recent/favorites
- `src/lib/constants.ts` - Quick places (Home, Work, University)

**Code:**
```typescript
const relevantRecent = recentSearches.map(s => type === 'from' ? s.from : s.to);
```

### 7. Flexibility and Efficiency of Use

**Implementation:**
- `src/pages/Home.tsx` - Keyboard shortcuts, right-click menus
- `src/components/ui/ModeToggle.tsx` - Quick mode cycling
- `src/store/appStore.ts` - Filter presets

**Power User Features:**
- Keyboard: Arrow keys navigate results, Enter selects, Esc closes
- Mouse: Right-click on map sets From/To (future enhancement)

### 8. Aesthetic and Minimalist Design

**Implementation:**
- `src/components/ui/RouteCard.tsx` - Only 6 key data points visible
- `src/pages/Home.tsx` - Details behind "View steps" expansion
- `tailwind.config.js` - Calm color palette

**Card Design:**
```tsx
// Only essentials shown:
- Duration
- Fare
- Transfers
- Mode chips
- Expand button
```

### 9. Help Users Recognize, Diagnose, and Recover from Errors

**Implementation:**
- `src/store/appStore.ts` - `setError()` with recoverable flag
- `src/components/ui/Toast.tsx` - Error toasts with actions
- `src/pages/Contribute.tsx` - Optimistic UI with rollback

**Error Handling:**
```typescript
addToast({
  type: 'error',
  message: t('errors.routeFailed'),
  action: {
    label: t('errors.retry'),
    onClick: handlePlanRoute,
  },
});
```

### 10. Help and Documentation

**Implementation:**
- `src/components/ui/HelpDialog.tsx` - Interactive guided tour
- `src/pages/Settings.tsx` - Help button in About section
- First-visit tour with `firstVisit` state

**Auto-show on first visit:**
```typescript
useEffect(() => {
  if (firstVisit) {
    setHelpDialogOpen(true);
  }
}, [firstVisit]);
```

## Don Norman's Principles

### Discoverability

**Implementation:**
- All buttons have visible labels/icons
- Focus rings on interactive elements
- Hover states reveal actions

**CSS:**
```css
.interactive:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

### Feedback

**Implementation:**
- `src/components/ui/Toast.tsx` - Immediate feedback
- `framer-motion` - Visual feedback on interactions
- Button states (pressed, loading, disabled)

**Example:**
```tsx
<motion.button whileTap={{ scale: 0.95 }}>
  Click me
</motion.button>
```

### Signifiers

**Implementation:**
- Icons from `lucide-react` with consistent meanings
- Underlined links
- Draggable handles (visual indicators)

### Mappings

**Implementation:**
- Map markers match route list
- Selecting a route highlights it on map
- Step list synced with map polylines

### Constraints

**Implementation:**
- Disabled buttons prevent invalid actions
- Bounded inputs (min/max values)
- Valid stop snapping on map

### Conceptual Model

**Implementation:**
- 3-step flow shown in help dialog
- Empty states explain next actions
- Progressive disclosure

### Error Tolerance

**Implementation:**
- `zustand persist` - Auto-save preferences
- Optimistic UI with rollback
- Network error recovery

### Affordances

**Implementation:**
- Buttons have depth (shadows, gradients)
- Sliders have tracks and thumbs
- Toggle switches have clear on/off states

## Accessibility Implementation

### Keyboard Navigation
```typescript
// src/components/ui/EnhancedSearchBar.tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    setSelectedIndex(prev => prev + 1);
  } else if (e.key === 'Enter' && selectedIndex >= 0) {
    handleSelect(results[selectedIndex]);
  }
};
```

### Screen Reader Support
```tsx
<button 
  aria-label="Search for routes"
  aria-expanded={showResults}
  aria-controls="search-results"
>
```

### Focus Management
```typescript
// Auto-focus first input
<input ref={inputRef} autoFocus />

// Trap focus in modal
<Dialog onOpenChange={handleClose} />
```

## Testing Strategies

### Unit Tests
Test individual heuristics:
```typescript
// Nielsen #5: Error Prevention
it('prevents click when disabled', async () => {
  render(<Button disabled onClick={handleClick}>Disabled</Button>);
  await user.click(screen.getByRole('button'));
  expect(handleClick).not.toHaveBeenCalled();
});
```

### E2E Tests
Test complete flows:
```typescript
// Nielsen #1: Visibility of system status
test('should show loading state', async ({ page }) => {
  await page.getByRole('button', { name: /plan route/i }).click();
  await expect(page.getByText(/computing/i)).toBeVisible();
});
```

### Accessibility Tests
Automated checks:
```typescript
// WCAG 2.2 AA: Keyboard navigation
test('should support keyboard navigation', async ({ page }) => {
  await page.keyboard.press('Tab');
  const input = page.getByRole('textbox', { name: /from/i });
  await expect(input).toBeFocused();
});
```

## Performance Optimizations

### Code Splitting
```typescript
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'map-vendor': ['leaflet', 'react-leaflet'],
}
```

### Lazy Loading
```typescript
const LiveTracker = lazy(() => import('./pages/LiveTracker'));
```

### Memoization
```typescript
const expensiveCalculation = useMemo(() => {
  return computeRoutes(from, to);
}, [from, to]);
```

### Virtual Scrolling
```typescript
// For long lists
import { Virtuoso } from 'react-virtuoso';
<Virtuoso data={routes} itemContent={renderRoute} />
```

## API Integration Checklist

When connecting real OTP/GTFS APIs:

1. [ ] Replace `src/mocks/mockApi.ts` functions
2. [ ] Update types in `src/lib/enhanced-types.ts`
3. [ ] Add environment variables for API URLs
4. [ ] Implement proper error handling
5. [ ] Add request caching with React Query
6. [ ] Set up retry logic
7. [ ] Add loading states
8. [ ] Update offline fallback behavior
9. [ ] Test with real data
10. [ ] Monitor performance

---

This guide ensures all design principles are implemented consistently across the codebase and can be verified through automated testing.

