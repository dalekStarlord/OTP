/**
 * E2E test for journey planning flow
 * Tests Nielsen's Heuristics in real user scenarios
 */

import { test, expect } from '@playwright/test';

test.describe('Journey Planning Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display search inputs on home page', async ({ page }) => {
    // Nielsen #6: Recognition rather than recall
    await expect(page.getByRole('textbox', { name: /from/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /to/i })).toBeVisible();
  });

  test('should allow entering locations', async ({ page }) => {
    const fromInput = page.getByRole('textbox', { name: /from/i });
    const toInput = page.getByRole('textbox', { name: /to/i });

    await fromInput.fill('SM CDO');
    await toInput.fill('Limketkai');

    // Nielsen #1: Visibility of system status
    // Should show search results
    await expect(page.getByText(/sm cdo/i).first()).toBeVisible();
  });

  test('should plan a route', async ({ page }) => {
    // Fill in locations
    const fromInput = page.getByRole('textbox', { name: /from/i });
    const toInput = page.getByRole('textbox', { name: /to/i });

    await fromInput.fill('Cogon');
    await page.getByText(/cogon market/i).first().click();

    await toInput.fill('Limketkai');
    await page.getByText(/limketkai center/i).first().click();

    // Click plan route button
    await page.getByRole('button', { name: /plan route/i }).click();

    // Nielsen #1: System should show computing status
    // Results should appear
    await expect(page.getByText(/route options/i)).toBeVisible();
  });

  test('should allow swapping locations', async ({ page }) => {
    // Nielsen #3: User control and freedom
    const fromInput = page.getByRole('textbox', { name: /from/i });
    const toInput = page.getByRole('textbox', { name: /to/i });

    await fromInput.fill('Location A');
    await toInput.fill('Location B');

    const swapButton = page.getByRole('button', { name: /swap/i });
    await swapButton.click();

    // Locations should be swapped
    await expect(fromInput).toHaveValue(/location b/i);
    await expect(toInput).toHaveValue(/location a/i);
  });

  test('should show accessibility features', async ({ page }) => {
    // WCAG 2.2 AA: Skip link should be present
    const skipLink = page.getByText(/skip to main content/i);
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // WCAG 2.2 AA: Keyboard accessibility
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const fromInput = page.getByRole('textbox', { name: /from/i });
    await expect(fromInput).toBeFocused();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Nielsen #9: Help users recognize, diagnose, and recover from errors
    
    // Try to plan without locations
    const planButton = page.getByRole('button', { name: /plan route/i });
    await planButton.click();

    // Should show error or disable button
    await expect(planButton).toBeDisabled();
  });

  test('should show route details', async ({ page }) => {
    // Setup route
    await page.getByRole('textbox', { name: /from/i }).fill('Cogon');
    await page.getByText(/cogon market/i).first().click();
    await page.getByRole('textbox', { name: /to/i }).fill('Limketkai');
    await page.getByText(/limketkai center/i).first().click();
    await page.getByRole('button', { name: /plan route/i }).click();

    // Wait for results
    await page.waitForSelector('text=/route options/i');

    // Click on a route card
    const routeCard = page.locator('[role="button"]').filter({ hasText: /min/i }).first();
    await routeCard.click();

    // Nielsen #8: Aesthetic and minimalist design
    // Should show essential information
    await expect(page.getByText(/total time/i)).toBeVisible();
    await expect(page.getByText(/fare/i)).toBeVisible();
  });

  test('should persist preferences', async ({ page }) => {
    // Navigate to settings
    await page.getByRole('link', { name: /settings/i }).click();

    // Change language
    await page.getByRole('button', { name: /filipino/i }).click();

    // Reload page
    await page.reload();

    // Language should persist (check for Filipino text)
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page.getByText(/wika/i)).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/');

    // Mobile menu should be present
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();

    // Click to open
    await menuButton.click();

    // Navigation should appear
    await expect(page.getByRole('link', { name: /plan trip/i })).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Nielsen's performance target: < 2.5s LCP
    expect(loadTime).toBeLessThan(2500);
  });
});

