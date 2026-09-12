import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".loading-screen")).toHaveCount(0);
});

test("sections leave and return, and the work light moves left to right", async ({ page }) => {
  const heading = page.locator(".work-heading");
  await heading.evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight * .4, behavior: "instant" }));
  await expect(heading).toHaveAttribute("data-reveal", "shown");
  const sweep = page.locator(".signal-sweep");
  await expect(sweep).toHaveAttribute("data-running", "true");
  const x = () => sweep.locator("i").evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41);
  const before = await x();
  await page.waitForTimeout(350);
  expect(await x()).toBeGreaterThan(before);
  await heading.evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().bottom - Math.min(innerHeight * .18, document.querySelector(".site-header")!.getBoundingClientRect().bottom + 24) + 18, behavior: "instant" }));
  await expect(heading).toHaveAttribute("data-reveal", "departed");
  await expect(heading).toHaveCSS("opacity", "0");
  await heading.evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight * .4, behavior: "instant" }));
  await expect(heading).toHaveAttribute("data-reveal", "shown");
  await expect(heading).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("motion pause and reduced motion keep content readable and stop the sweep", async ({ page }) => {
  await page.getByRole("button", { name: "Open experience settings" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Close experience settings" }).click();
  await expect(page.locator(".observatory")).toHaveAttribute("data-motion", "still");
  await expect(page.locator(".work-heading")).toHaveCSS("opacity", "1");
  await expect(page.locator(".signal-sweep")).toHaveAttribute("data-running", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".touch-light")).toHaveCSS("display", "none");
  await expect(page.locator(".signal-sweep")).toHaveCSS("display", "none");
});

test("native phone swipe paints a short light trail without blocking scroll or taps", async ({ page, context }, info) => {
  test.skip(info.project.name !== "mobile", "Uses a real emulated touch device.");
  const cdp = await context.newCDPSession(page);
  const light = page.locator(".touch-light");
  const painted = () => light.evaluate(element => {
    const canvas = element as HTMLCanvasElement;
    return canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data.some((value, index) => index % 4 === 3 && value > 0);
  });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 30, y: 690 }] });
  await expect(light).toHaveAttribute("data-active", "true");
  expect(await painted()).toBe(true);
  for (let y = 660; y >= 390; y -= 30) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 30, y }] });
    await page.waitForTimeout(28);
  }
  await page.screenshot({ path: "docs/screenshots/mobile-touch-trail.png" });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(80);
  await expect(light).toHaveAttribute("data-active", "false");
  expect(await painted()).toBe(false);
  await page.getByRole("button", { name: "Open experience settings" }).tap();
  await expect(page.getByRole("dialog", { name: "Set the atmosphere." })).toBeVisible();
  await expect(light).toHaveCSS("pointer-events", "none");
  await cdp.detach();
});

test("launch metadata and public discovery routes are complete", async ({ page, request }) => {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://ghanashyamg.vercel.app");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap: https://ghanashyamg.vercel.app/sitemap.xml");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("<loc>https://ghanashyamg.vercel.app/</loc>");
  const social = await request.get("/opengraph-image");
  expect(social.ok()).toBe(true);
  expect(social.headers()["content-type"]).toContain("image/png");
  for (const path of ["/resume.pdf", "/resume/", "/.env.local"]) expect((await request.get(path)).status()).toBe(404);
});


test("chapter navigation preserves the section label below the header", async ({ page }) => {
  await page.locator('.chapter-nav a[href="#systems"]').click();
  const label = page.locator("#systems > .section-topline");
  await expect(page.locator('.chapter-nav a[href="#systems"]')).toHaveAttribute("aria-current", "location");
  await expect.poll(() => label.evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(180);
  await expect(label).toHaveAttribute("data-reveal", "shown");
  await expect(label).toHaveCSS("opacity", "1");
});
