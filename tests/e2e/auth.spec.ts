import { expect, test } from "@playwright/test";

test("register no existe", async ({ page }) => {
  const response = await page.goto("/register");
  expect(response?.status()).toBe(404);
});

test("editor redirige a login sin sesion", async ({ page }) => {
  await page.goto("/editor");
  await expect(page).toHaveURL(/login/);
});
