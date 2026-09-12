import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".observatory")).toHaveAttribute("data-loading", "ready");
  // Readiness releases controls as the cover starts fading. Visual/contrast
  // checks must sample the stable page after that cover has been removed.
  await expect(page.locator(".loading-screen")).toHaveCount(0);
});

test("renders the experience without page errors or horizontal overflow", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Engineeringthe invisible.");
  await expect(page.locator(".signal-sculpture")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("button", { name: "Enable ambient sound" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-audio-state]")).toHaveAttribute("data-audio-state", "muted");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-overview.png` });
  expect(errors).toEqual([]);
});

test("Relay exposes stages and an inspection dialog with focus restoration", async ({ page }) => {
  await page.getByRole("button", { name: "Explore my work" }).click();
  const exhibit = page.getByRole("tabpanel");
  await exhibit.getByRole("button", { name: /Enrich/ }).click();
  await expect(exhibit.getByText("Give the signal context.")).toBeVisible();
  await exhibit.getByRole("button", { name: "Next stage" }).click();
  await expect(exhibit.getByText("Make a considered next move.")).toBeVisible();
  await page.getByRole("button", { name: "Inspect the system" }).click();
  await expect(page.getByRole("dialog", { name: "Relay" })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("link", { name: "Explore repository" })).toHaveAttribute("href", "https://github.com/gshyam46/relay");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Inspect the system" })).toBeFocused();
});

test("observability and AIDA controls change the visible model", async ({ page }, info) => {
  await page.getByRole("button", { name: "Explore my work" }).click();
  await page.getByRole("tab", { name: /LLM observability/ }).click();
  const exhibit = page.getByRole("tabpanel");
  const slider = exhibit.getByRole("slider", { name: "Context budget" });
  await slider.focus();
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("25");
  await expect(exhibit.getByText("25% · 2,600 input tokens")).toBeVisible();
  await exhibit.getByRole("button", { name: /retrieve.context/ }).click();
  await expect(exhibit.getByText("Retrieve candidate context for this example request.")).toBeVisible();
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-systems.png` });
  await page.getByRole("tab", { name: /AIDA/ }).click();
  await exhibit.getByRole("combobox", { name: "START WITH A QUESTION" }).click();
  await page.getByRole("option", { name: "How many orders are pending?" }).click();
  await expect(exhibit.locator("code").first()).toContainText("COUNT(*) AS pending_orders");
  await expect(exhibit.getByRole("cell", { name: "3", exact: true })).toBeVisible();
});

test("index supports keyboard access and direct chapter navigation", async ({ page }) => {
  // Keyboard events cannot auto-wait for React's client-side event listeners.
  await expect(page.locator(".local-time")).toHaveText(/^\d{2}:\d{2} IST$/);
  await page.keyboard.press("k");
  await expect(page.getByRole("dialog", { name: "A LITTLE ORIENTATION" })).toBeVisible();
  await page.getByRole("button", { name: "03 The practice" }).click();
  // Let smooth navigation reach this chapter before another click can interrupt it.
  await expect.poll(() => page.locator("#practice").evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThanOrEqual(1);
  await expect(page.locator('.chapter-nav a[href="#practice"]')).toHaveAttribute("aria-current", "location");
  await expect(page.getByRole("heading", { name: "See the whole. Care for the details." })).toBeInViewport();
  await page.getByRole("button", { name: /02 Applied intelligence/ }).click();
  await expect(page.getByText("Put intelligence where it is useful.", { exact: false })).toBeVisible();
  await expect(page.locator('.chapter-nav a[href="#practice"]')).toHaveAttribute("aria-current", "location");
});

test("settings change materials, persist the choice, and control sound and motion", async ({ page }, info) => {
  await page.getByRole("button", { name: "Open experience settings" }).click();
  const dialog = page.getByRole("dialog", { name: "Set the atmosphere." });
  await dialog.getByRole("radio", { name: /Field notes/ }).check();
  await expect(page.locator(".observatory")).toHaveAttribute("data-palette", "ink");
  await dialog.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator(".observatory")).toHaveAttribute("data-motion", "still");
  await dialog.getByRole("button", { name: "Off", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "On", exact: true })).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "On", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-field-notes.png` });
  await page.reload();
  await expect(page.locator(".observatory")).toHaveAttribute("data-palette", "ink");
  await expect(page.getByRole("button", { name: "Enable ambient sound" })).toHaveAttribute("aria-pressed", "false");
});

test("contact offers the confirmed email and a casual note", async ({ page }) => {
  await page.locator('.chapter-nav a[href="#contact"]').click();
  await expect(page.getByRole("link", { name: "Start a conversation" })).toHaveAttribute("href", "mailto:gshyam2603@gmail.com");
  await page.getByRole("button", { name: "Write me a note" }).click();
  const note = page.getByRole("dialog", { name: "A little hello." });
  await expect(note.getByRole("combobox", { name: "A note about" })).toContainText("just saying hi");
  await expect(note.getByRole("link", { name: "gshyam2603@gmail.com" })).toHaveAttribute("href", "mailto:gshyam2603@gmail.com");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Write me a note" })).toBeFocused();
});

test("career details preserve confirmed dates, show skills, and reset each view", async ({ page }) => {
  await page.locator('.chapter-nav a[href="#practice"]').click();
  await expect(page.getByText("Python · Go · Java · SQL")).toBeVisible();
  await page.getByRole("button", { name: "Read about Vizares experience" }).click();
  const dialog = page.getByRole("dialog", { name: "Vizares" });
  await expect(dialog.getByText("2024–25", { exact: true })).toBeVisible();
  await expect(dialog.getByText("eBPF", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Previous experience" }).click();
  await expect(page.getByRole("dialog", { name: "ContentEaseAI" }).getByText("2023", { exact: true })).toBeVisible();
  await expect(page.locator("#career-title")).toBeFocused();
  expect(await page.locator(".career-dialog").evaluate(element => element.scrollTop)).toBe(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Read about Vizares experience" })).toBeFocused();
  await expect(page.getByRole("link", { name: /résumé|resume/i })).toHaveCount(0);
});

test("reduced motion and WebGL fallback keep the portfolio usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl2" || type === "webgl" || type === "experimental-webgl") return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.reload();
  await expect(page.locator(".observatory")).toHaveAttribute("data-motion", "still");
  await expect(page.locator(".signal-sculpture svg")).toBeVisible();
  await page.getByRole("button", { name: "Explore my work" }).click();
  await expect(page.getByRole("heading", { name: "Ideas, in operation." })).toBeInViewport();
});

test("key scenes and settings have no serious accessibility violations", async ({ page }) => {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-cta")).toHaveCSS("opacity", "1");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole("button", { name: "Open experience settings" }).click();
  await expect(page.getByRole("dialog")).toHaveCSS("opacity", "1");
  const settings = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(settings.violations).toEqual([]);
});
