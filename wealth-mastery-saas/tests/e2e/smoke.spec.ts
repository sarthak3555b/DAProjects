import { test, expect } from "@playwright/test";

test("landing page renders and links to auth", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Wealth Mastery", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /get started|create free account/i }).first()).toBeVisible();
});

test("login page renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText(/welcome back/i)).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test("protected route redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
});
