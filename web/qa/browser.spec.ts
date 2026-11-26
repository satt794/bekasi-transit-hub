import { test, expect } from "@playwright/test";

const base = process.env.QA_URL || "http://127.0.0.1:3000";

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

for (const width of [360, 390, 768, 1440]) {
 test("transport logo bounds at "+width+"px", async ({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto(base);
  const tiles=page.locator(".tk-mode-brand");
  await expect(tiles).toHaveCount(4);
  for(const tile of await tiles.all()){
   const wrapper=tile.locator(":scope > span").first();
   const img=wrapper.locator("img");
   await expect.poll(async()=>await img.evaluate((el:HTMLImageElement)=>el.complete)).toBe(true);
   const fallback=wrapper.locator(".tk-mode-fallback");
   if(await img.isVisible()){
    await expect(fallback).toBeHidden();
    const b=await wrapper.boundingBox(),i=await img.boundingBox();
    expect(b).not.toBeNull();expect(i).not.toBeNull();
    expect(i!.width).toBeLessThanOrEqual(b!.width);
    expect(i!.height).toBeLessThanOrEqual(b!.height);
    expect(i!.x).toBeGreaterThanOrEqual(b!.x-1);
    expect(i!.x+i!.width).toBeLessThanOrEqual(b!.x+b!.width+1);
    expect(i!.y).toBeGreaterThanOrEqual(b!.y-1);
    expect(i!.y+i!.height).toBeLessThanOrEqual(b!.y+b!.height+1);
   }else await expect(fallback).toBeVisible();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 });
}
test("balance calculator and persistent confirmed expenses",async({page})=>{
 await page.goto(base);
 await page.getByRole("button",{name:/Cek saldo terakhir/}).click();
 await expect(page.getByRole("heading",{name:"Cek saldo terakhir"}).first()).toBeVisible();
 await page.getByLabel("Saldo awal kartu (Rp)").fill("50000");
 await page.getByLabel("Estimasi tarif sekali jalan (Rp)").fill("4000");
 await expect(page.locator(".tk-balance-result strong")).toHaveText("Rp46.000");
 await page.getByLabel("Pulang-pergi dengan estimasi tarif sama").check();
 await expect(page.locator(".tk-balance-result strong")).toHaveText("Rp42.000");
 await page.getByRole("button",{name:"Simpan saldo awal"}).click();
 await page.getByRole("button",{name:"Gunakan biaya ini untuk pencatatan"}).click();
 await page.getByRole("button",{name:"Konfirmasi dan simpan"}).click();
 await expect(page.locator(".tk-balance-hero h2")).toHaveText("Rp42.000");
 await page.reload();
 await page.getByRole("button",{name:/Cek saldo terakhir/}).click();
 await expect(page.locator(".tk-balance-hero h2")).toHaveText("Rp42.000");
 await page.getByRole("button",{name:"Top up",exact:true}).click();
 await page.getByLabel("Nominal top up yang berhasil (Rp)").fill("10000");
 await page.getByRole("button",{name:"Konfirmasi dan simpan"}).click();
 await expect(page.locator(".tk-balance-hero h2")).toHaveText("Rp52.000");
});
