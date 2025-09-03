import { test, expect } from "@playwright/test";

test.describe("IQ Test App", () => {
  test("should load homepage with animations", async ({ page }) => {
    await page.goto("http://localhost:3000");
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Testify/);
    
    // Check if hero section is visible
    await expect(page.locator("h1")).toBeVisible();
    
    // Check if start test button is present
    await expect(page.getByRole("button", { name: /start test/i })).toBeVisible();
  });

  test("should navigate to test page", async ({ page }) => {
    await page.goto("http://localhost:3000");
    
    // Click start test button
    await page.getByRole("button", { name: /start test/i }).first().click();
    
    // Should navigate to test page
    await expect(page).toHaveURL(/.*test/);
  });

  test("should respect reduced motion preferences", async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });
    
    await page.goto("http://localhost:3000");
    
    // Check if page still loads correctly with reduced motion
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have accessible focus states", async ({ page }) => {
    await page.goto("http://localhost:3000");
    
    // Tab through interactive elements
    await page.keyboard.press("Tab");
    
    // Check if focus is visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});
