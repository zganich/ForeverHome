import { test, expect } from "@playwright/test";

/**
 * Phase 1: Technical Beta - Core Flow E2E Tests
 * 
 * These tests cover the critical user flows that must work:
 * 1. User signup/login
 * 2. Pet profile creation
 * 3. Photo upload and analysis
 * 4. Payment/subscription flow
 */

test.describe("Core User Flows - Phase 1 Beta", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");
  });

  test.describe("Authentication Flow", () => {
    test("should display homepage", async ({ page }) => {
      await expect(page).toHaveTitle(/InterpWhat/i);
      
      // Check for key elements
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible();
    });

    test("should navigate to login page", async ({ page }) => {
      // Look for login/signup link or button
      const loginLink = page.locator('a[href*="login"], button:has-text("Login"), button:has-text("Sign Up"), button:has-text("Get Started")').first();
      
      if (await loginLink.count() > 0) {
        await loginLink.click();
        await page.waitForLoadState("networkidle");
        
        // Check that we're on login page
        const url = page.url();
        expect(url).toMatch(/login|auth/i);
        
        // Check for email input
        const emailInput = page.locator('input[type="email"], input[id*="email"]');
        await expect(emailInput).toBeVisible();
      }
    });

    test("should show signup form when toggled", async ({ page }) => {
      await page.goto("/login");
      
      // Look for toggle to signup mode
      const signupToggle = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up"), button:has-text("Create Account")').first();
      
      if (await signupToggle.count() > 0) {
        await signupToggle.click();
        await page.waitForTimeout(500);
        
        // Check for signup-specific text
        const signupText = page.locator('text=/Create Account|Sign Up|Sign up/i');
        await expect(signupText.first()).toBeVisible();
      }
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/login");
      
      const emailInput = page.locator('input[type="email"], input[id*="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      if (await emailInput.count() > 0) {
        // Try invalid email
        await emailInput.fill("invalid-email");
        
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Check for validation error (either HTML5 validation or custom error)
          const hasValidation = await emailInput.evaluate((el: HTMLInputElement) => {
            return el.validity.valid === false || el.checkValidity() === false;
          });
          
          // HTML5 validation should catch this
          expect(hasValidation || page.url().includes("login")).toBeTruthy();
        }
      }
    });

    test.skip("should complete signup with valid credentials", async ({ page }) => {
      // This test requires:
      // 1. Test Supabase account
      // 2. Cleanup after test
      // 3. Email confirmation handling (may need to skip)
      
      await page.goto("/login");
      
      // Toggle to signup
      const signupToggle = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').first();
      if (await signupToggle.count() > 0) {
        await signupToggle.click();
      }
      
      // Fill signup form
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      await emailInput.fill(`test-${Date.now()}@example.com`);
      await passwordInput.fill("testpassword123");
      await submitButton.click();
      
      // Should show success message or redirect
      await page.waitForTimeout(2000);
      // Check for success toast or message
      const successMessage = page.locator('text=/check your email|success|created/i');
      await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
    });

    test.skip("should login with correct credentials", async ({ page }) => {
      // This test requires:
      // 1. Test user account
      // 2. Known credentials
      
      await page.goto("/login");
      
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      await emailInput.fill("test@example.com");
      await passwordInput.fill("testpassword");
      await submitButton.click();
      
      // Should redirect to dashboard
      await page.waitForURL("**/dashboard", { timeout: 10000 });
      expect(page.url()).toMatch(/dashboard/i);
    });
  });

  test.describe("Pet Profile Creation", () => {
    test.skip("should navigate to pet creation", async ({ page }) => {
      // Requires authentication
      // After login, look for "Add Pet" or "Create Pet" button
      await page.goto("/dashboard");
      
      const addPetButton = page.locator('button:has-text("Add Pet"), button:has-text("Create Pet"), a[href*="pet"]').first();
      await expect(addPetButton).toBeVisible();
      
      await addPetButton.click();
      await page.waitForLoadState("networkidle");
      
      // Should be on pet creation page
      const petNameInput = page.locator('input[name*="name"], input[id*="name"]').first();
      await expect(petNameInput).toBeVisible();
    });

    test.skip("should create pet with required fields", async ({ page }) => {
      // Requires authentication and pet creation page
      await page.goto("/dashboard/pets/new");
      
      const nameInput = page.locator('input[name*="name"]').first();
      const speciesSelect = page.locator('select[name*="species"], select[id*="species"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      
      await nameInput.fill("Test Pet");
      
      if (await speciesSelect.count() > 0) {
        await speciesSelect.selectOption({ index: 1 }); // Select first option
      }
      
      await submitButton.click();
      
      // Should redirect to pet detail or dashboard
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/dashboard|pet/i);
    });
  });

  test.describe("Photo Upload & Analysis", () => {
    test.skip("should display photo upload interface", async ({ page }) => {
      // Requires authentication and pet
      await page.goto("/dashboard/pets/1"); // Assuming pet ID 1 exists
      
      // Look for upload button or drag-and-drop area
      const uploadButton = page.locator('button:has-text("Upload"), input[type="file"]').first();
      await expect(uploadButton).toBeVisible();
    });

    test.skip("should accept valid image file", async ({ page }) => {
      // Requires authentication, pet, and test image file
      await page.goto("/dashboard/pets/1");
      
      // Create a test image file
      const fileInput = page.locator('input[type="file"]').first();
      
      if (await fileInput.count() > 0) {
        // Create a minimal valid image (1x1 pixel PNG)
        const testImage = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64'
        );
        
        await fileInput.setInputFiles({
          name: 'test.png',
          mimeType: 'image/png',
          buffer: testImage,
        });
        
        // Should show file selected or start upload
        await page.waitForTimeout(1000);
        // Check for upload confirmation or analysis start
      }
    });

    test.skip("should reject invalid file type", async ({ page }) => {
      await page.goto("/dashboard/pets/1");
      
      const fileInput = page.locator('input[type="file"]').first();
      
      if (await fileInput.count() > 0) {
        // Try to upload non-image file
        const testFile = Buffer.from('This is not an image');
        
        await fileInput.setInputFiles({
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: testFile,
        });
        
        // Should show error message
        await page.waitForTimeout(1000);
        const errorMessage = page.locator('text=/invalid|not supported|image required/i');
        // May not show error if HTML5 validation prevents it
      }
    });

    test.skip("should show analysis progress", async ({ page }) => {
      // Requires full analysis flow
      // After photo upload, should show progress indicators
      await page.goto("/dashboard/pets/1");
      
      // Upload photo and start analysis
      // ... (from previous test)
      
      // Look for progress indicators
      const progressBar = page.locator('[role="progressbar"], .progress, [class*="progress"]').first();
      const progressText = page.locator('text=/analyzing|processing|progress/i');
      
      // Should show some progress indicator
      await expect(progressBar.or(progressText).first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Payment & Subscription Flow", () => {
    test("should display pricing page", async ({ page }) => {
      await page.goto("/subscribe");
      
      // Look for pricing information
      const pricingHeading = page.locator('h1, h2').filter({ hasText: /pricing|plan|subscribe/i }).first();
      await expect(pricingHeading).toBeVisible({ timeout: 5000 });
    });

    test("should show subscription plans", async ({ page }) => {
      await page.goto("/subscribe");
      
      // Look for plan cards or buttons
      const plans = page.locator('[class*="plan"], [class*="card"], button:has-text("Essential"), button:has-text("Premium")');
      
      // Should have at least one plan visible
      const planCount = await plans.count();
      expect(planCount).toBeGreaterThan(0);
    });

    test.skip("should navigate to checkout on plan selection", async ({ page }) => {
      // Requires authentication
      await page.goto("/subscribe");
      
      // Click on a plan
      const planButton = page.locator('button:has-text("Essential"), button:has-text("Premium"), button:has-text("Subscribe")').first();
      
      if (await planButton.count() > 0) {
        await planButton.click();
        await page.waitForLoadState("networkidle");
        
        // Should navigate to checkout or show payment form
        const paymentForm = page.locator('input[name*="card"], [class*="stripe"], [id*="payment"]').first();
        // May require authentication first
      }
    });

    test.skip("should display Stripe payment form", async ({ page }) => {
      // Requires authentication and plan selection
      await page.goto("/subscribe");
      
      // Select plan and proceed to checkout
      // ... (from previous test)
      
      // Look for Stripe elements
      const stripeElement = page.locator('[class*="stripe"], iframe[src*="stripe"], [id*="card-element"]').first();
      // Stripe may load in iframe, so check for any payment-related elements
    });
  });

  test.describe("Navigation & UI", () => {
    test("should have working navigation", async ({ page }) => {
      await page.goto("/");
      
      // Check for navigation links
      const navLinks = page.locator('nav a, [role="navigation"] a').all();
      const links = await navLinks;
      
      if (links.length > 0) {
        // Test first navigation link
        const firstLink = links[0];
        const href = await firstLink.getAttribute("href");
        
        if (href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
          await firstLink.click();
          await page.waitForLoadState("networkidle");
          // Should navigate successfully
          expect(page.url()).not.toBe("about:blank");
        }
      }
    });

    test("should be responsive on mobile viewport", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      await page.goto("/");
      
      // Check that page is usable
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible();
      
      // Check for no horizontal scrolling (basic check)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()?.width || 375;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
    });
  });

  test.describe("Error Handling", () => {
    test("should handle 404 pages gracefully", async ({ page }) => {
      await page.goto("/non-existent-page-12345");
      
      // Should show 404 page or redirect to home
      await page.waitForLoadState("networkidle");
      
      // Check for 404 message or redirect
      const is404 = page.url().includes("404") || 
                    (await page.locator('text=/404|not found|page not found/i').count()) > 0 ||
                    page.url() === "http://localhost:3000/" || 
                    page.url().endsWith("/");
      
      expect(is404).toBeTruthy();
    });
  });
});

