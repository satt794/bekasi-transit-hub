import { test, expect } from "@playwright/test";

const base = process.env.QA_URL || "https://transitkita.vercel.app";

test("mobile: live WIB clock, navigation, and theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const clock = page.locator("header time");
  await expect(clock).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
  const before = await clock.innerText();
  await expect.poll(() => clock.innerText()).not.toBe(before);
  await page.getByRole("radio", { name: "Gelap", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Gelap", exact: true })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("radio", { name: "Terang", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Terang", exact: true })).toHaveAttribute("aria-checked", "true");
  const nav = page.getByRole("navigation", { name: "Navigasi utama" });
  await nav.getByRole("button", { name: "Panduan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Panduan pengguna pemula" })).toBeVisible();
  await page.getByRole("button", { name: "Langkah berikutnya" }).click();
  await expect(page.getByText("Langkah 2 dari 5")).toBeVisible();
  await nav.getByRole("button", { name: "Sekitar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Transportasi di sekitar" })).toBeVisible();
  await nav.getByRole("button", { name: "Beranda", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Mau ke mana hari ini?" })).toBeVisible();
});

test("desktop: route selection, swap, and transfer guidance", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const planner = page.locator("form.tk-planner");
  const from = planner.locator("select").nth(0);
  const to = planner.locator("select").nth(1);
  await from.selectOption("BKS");
  await to.selectOption("BOO");
  await planner.getByRole("button", { name: "Tukar asal dan tujuan" }).click();
  await expect(from).toHaveValue("BOO");
  await expect(to).toHaveValue("BKS");
  await planner.getByRole("button", { name: "Tukar asal dan tujuan" }).click();
  await planner.getByRole("button", { name: "Cari perjalanan" }).click();
  await expect(page.getByRole("heading", { name: "Hasil perjalanan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Panduan rute jaringan/ })).toBeVisible();
  const itinerary = page.getByTestId("connected-journey");
  await expect(itinerary).toBeVisible();
  await expect(itinerary.getByText("Memuat jadwal sambungan…")).toHaveCount(0, { timeout: 45000 });
  await expect(itinerary.getByRole("button", { name: "Perbarui jadwal sambungan" })).toBeVisible();
});
