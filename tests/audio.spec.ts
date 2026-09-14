import { test, expect } from "@playwright/test";

type AudioAudit = { contexts: AudioContext[] };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const observedWindow = window as typeof window & { audioAudit: AudioAudit };
    observedWindow.audioAudit = { contexts: [] };
    const BrowserAudioContext = window.AudioContext;
    window.AudioContext = class extends BrowserAudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        observedWindow.audioAudit.contexts.push(this);
      }
    };
  });
});

test("the original sound starts off at 30% and only its explicit control enables it", async ({ page }) => {
  await page.goto("/");
  const sound = page.locator(".sound-button");
  await expect(sound).toHaveAttribute("data-audio-state", "muted");
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".volume-control input")).toHaveValue("30");
  await page.getByRole("button", { name: "Open experience settings" }).click();
  expect(await page.evaluate(() => (window as typeof window & { audioAudit: AudioAudit }).audioAudit.contexts.length)).toBe(0);
  await page.getByRole("button", { name: "Off", exact: true }).click();
  await expect(sound).toHaveAttribute("data-audio-state", "playing");
  expect(await page.evaluate(() => (window as typeof window & { audioAudit: AudioAudit }).audioAudit.contexts.map(ctx => ctx.state))).toEqual(["running"]);
});

test("the original mute fades while keeping one graph and reload starts off again", async ({ page }) => {
  await page.goto("/");
  const sound = page.locator(".sound-button");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => (window as typeof window & { audioAudit: AudioAudit }).audioAudit.contexts.map(ctx => ctx.state))).toEqual(["running"]);
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => (window as typeof window & { audioAudit: AudioAudit }).audioAudit.contexts.length)).toBe(1);
  await page.reload();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => (window as typeof window & { audioAudit: AudioAudit }).audioAudit.contexts.length)).toBe(0);
});

test("hidden tabs suspend and resume the original graph without replacing it", async ({ page }) => {
  await page.goto("/");
  const sound = page.locator(".sound-button");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => page.evaluate(() => (window as typeof window & { audioAudit: AudioAudit }).audioAudit.contexts[0].state)).toBe("suspended");
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => page.evaluate(() => (window as typeof window & { audioAudit: AudioAudit }).audioAudit.contexts[0].state)).toBe("running");
  expect(await page.evaluate(() => (window as typeof window & { audioAudit: AudioAudit }).audioAudit.contexts.length)).toBe(1);
});

test("old saved sound preferences are ignored and the default volume returns on reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => sessionStorage.setItem("observatory-audio", JSON.stringify({ enabled: true, volume: 55, preset: "original-d-major" })));
  await page.reload();
  await expect(page.locator(".volume-control input")).toHaveValue("30");
  await expect(page.locator(".sound-button")).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Open experience settings" }).click();
  await page.getByRole("button", { name: "Off", exact: true }).click();
  await page.getByRole("slider", { name: "Volume" }).fill("0");
  await expect(page.locator(".sound-button")).toHaveAttribute("data-audio-state", "silent");
  await page.getByRole("slider", { name: "Volume" }).fill("42");
  await page.reload();
  await expect(page.locator(".volume-control input")).toHaveValue("30");
  await expect(page.locator(".sound-button")).toHaveAttribute("aria-pressed", "false");
});

test("touch chimes play by default while ambient sound stays off until its own control is used", async ({ page }) => {
  await page.goto("/");
  const sound = page.locator(".sound-button");
  await expect(sound).toHaveAttribute("data-audio-state", "muted");
  await page.getByRole("button", { name: "Explore my work" }).click();
  await page.getByRole("tab", { name: /Sillage/ }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { audioAudit: AudioAudit }).audioAudit.contexts.map(ctx => ctx.state))).toEqual(["running"]);
  await expect(sound).toHaveAttribute("data-audio-state", "muted");
  await expect(sound).toHaveAttribute("aria-pressed", "false");
});
