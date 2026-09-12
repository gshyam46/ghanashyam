import { test, expect, type Page } from "@playwright/test";

async function holdFonts(page: Page) {
  let release = () => {};
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\.woff2(?:\?|$)/, async route => {
    await held;
    await route.continue();
  });
  return release;
}

test("entrance waits for critical fonts and a real artwork frame", async ({ page }) => {
  const releaseFonts = await holdFonts(page);
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".loading-screen")).toBeVisible();
    await expect(page.locator(".signal-sculpture")).toHaveAttribute("data-render-state", /webgl|fallback/);
    await expect(page.locator(".observatory")).toHaveAttribute("data-loading", "loading");
    // The sculpture notification is already past; font completion must read its persistent state.
    releaseFonts();
    await expect(page.locator(".observatory")).toHaveAttribute("data-loading", "ready");
    await expect(page.locator(".observatory")).toHaveAttribute("data-loading-result", /ready|fallback/);
    await expect(page.locator(".loading-screen")).toHaveCount(0);
    expect(await page.evaluate(() => document.fonts.status)).toBe("loaded");
    await page.getByRole("button", { name: "Explore my work" }).click();
    await expect(page.getByRole("heading", { name: "Ideas, in operation." })).toBeInViewport();
  } finally { releaseFonts(); }
});

test("WebGL failure opens the portfolio with its existing SVG fallback", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
        if (["webgl", "webgl2", "experimental-webgl"].includes(kind)) return null;
        return Reflect.apply(original, this, [kind, ...args]);
      },
    });
  });
  await page.goto("/");
  await expect(page.locator(".signal-sculpture")).toHaveAttribute("data-render-state", "fallback");
  await expect(page.locator(".observatory")).toHaveAttribute("data-loading-result", "fallback");
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await expect(page.locator(".signal-sculpture svg")).toBeVisible();
  await expect(page.locator(".signal-sculpture canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Open experience settings" }).click();
  await expect(page.getByRole("dialog", { name: "Set the atmosphere." })).toBeVisible();
});

test("a slow critical asset cannot keep the page covered indefinitely", async ({ page }) => {
  const releaseFonts = await holdFonts(page);
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".observatory")).toHaveAttribute("data-loading", "loading");
    const started = Date.now();
    await expect(page.locator(".observatory")).toHaveAttribute("data-loading-result", "timeout", { timeout: 8000 });
    expect(Date.now() - started).toBeLessThan(7800);
    await expect(page.locator(".loading-screen")).toHaveCount(0);
    await page.getByRole("button", { name: "Open experience settings" }).click();
    await expect(page.getByRole("dialog", { name: "Set the atmosphere." })).toBeVisible();
  } finally { releaseFonts(); }
});

test("reduced-motion visitors can continue immediately while assets are pending", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const releaseFonts = await holdFonts(page);
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const cover = page.locator(".loading-screen");
    await expect(cover).toBeVisible();
    await expect(cover).toHaveCSS("transition-duration", "0s");
    expect(await cover.locator(".loading-screen-rule").evaluate(element => getComputedStyle(element, "::after").animationName)).toBe("none");
    await page.getByRole("button", { name: "Continue to the portfolio" }).click();
    await expect(page.locator(".observatory")).toHaveAttribute("data-loading-result", "skipped");
    await expect(cover).toHaveCount(0);
  } finally { releaseFonts(); }
});
