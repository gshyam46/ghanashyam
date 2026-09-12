import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function revealGeometry(page: Page) {
  return page.locator(".system-map-track").evaluate(track => {
    const stage = track.querySelector<HTMLElement>(".system-map-stage")!;
    const inset = parseFloat(getComputedStyle(stage).top) || 0;
    return {
      start: scrollY + track.getBoundingClientRect().top - inset,
      runway: track.getBoundingClientRect().height - stage.getBoundingClientRect().height,
      distance: parseFloat(getComputedStyle(track.closest(".system-map")!).getPropertyValue("--system-reveal-distance")),
      inset,
      height: stage.getBoundingClientRect().height,
    };
  });
}
const scrollTo = (page: Page, top: number) => page.evaluate(position => window.scrollTo({ top: position, behavior: "instant" }), top);

async function applicationState(page: Page) {
  return page.locator(".system-map-application").evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const stage = element.closest(".system-map-stage")!.getBoundingClientRect();
    let opacity = 1;
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      opacity *= Number(style.opacity);
      if (style.display === "none" || style.visibility === "hidden") opacity = 0;
    }
    return { width: bounds.width, height: bounds.height, centerX: bounds.x + bounds.width / 2, centerY: bounds.y + bounds.height / 2, relativeCenterY: bounds.y + bounds.height / 2 - stage.y, opacity };
  });
}

async function waitForReady(page: Page) {
  await expect(page.locator(".observatory")).toHaveAttribute("data-loading", "ready");
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await waitForReady(page);
});

async function openSystem(page: Page) {
  await page.goto("/");
  await waitForReady(page);
  await expect(page.locator(".system-map")).toHaveAttribute("data-layout", "sticky");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".system-map")).toHaveAttribute("data-animation", "scroll");
  const geometry = await revealGeometry(page);
  await scrollTo(page, geometry.start + geometry.distance * .78);
  await expect.poll(async () => Number(await page.locator(".system-map").getAttribute("data-expansion"))).toBeGreaterThan(.76);
  return geometry;
}

test("the same application window shrinks into the interface as the system opens and restores on reverse scroll", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await waitForReady(page);
  await page.evaluate(() => document.fonts.ready);
  const diagram = page.locator(".system-map");
  await expect(diagram).toHaveAttribute("data-animation", "scroll");
  const geometry = await revealGeometry(page);
  expect(geometry.runway).toBeGreaterThan(150);
  expect(geometry.runway).toBeLessThan(260);

  await scrollTo(page, geometry.start - 180);
  await expect.poll(async () => Number(await diagram.getAttribute("data-expansion"))).toBeLessThan(.02);
  await scrollTo(page, geometry.start);
  await expect.poll(async () => Number(await diagram.getAttribute("data-expansion"))).toBeLessThan(.02);
  const entry = await page.locator(".system-map-stage").boundingBox();
  expect(entry!.y).toBeGreaterThanOrEqual(72);
  expect(entry!.y + entry!.height).toBeLessThanOrEqual((page.viewportSize()!.height) - 60);
  await expect(page.locator(".sculpture-layer")).toHaveAttribute("data-scene", "practice");
  await expect(page.locator(".sculpture-layer")).toHaveCSS("opacity", page.viewportSize()!.width <= 900 ? "0" : "0.055");
  const application = page.locator(".system-map-application");
  await expect(application).toHaveCount(1);
  const originalApplication = await application.elementHandle();
  const windowBefore = await applicationState(page);
  expect(windowBefore.width).toBeLessThanOrEqual(220.5);
  expect(windowBefore.width).toBeGreaterThan(160);
  expect(windowBefore.opacity).toBeCloseTo(1, 2);
  await page.locator(".system-map-stage").screenshot({ path: `docs/screenshots/product-assembled-${info.project.name}.png` });
  const ideaBefore = await page.locator(".system-map-vision").boundingBox();

  await scrollTo(page, geometry.start + geometry.distance * .25);
  await expect.poll(async () => Number(await diagram.getAttribute("data-expansion"))).toBeGreaterThan(.24);
  const windowDuring = await applicationState(page);
  expect(windowDuring.opacity).toBeCloseTo(1, 2);
  expect(windowDuring.width).toBeLessThan(windowBefore.width - 30);
  expect(windowDuring.width).toBeGreaterThan(75);
  expect(windowDuring.relativeCenterY).toBeLessThan(windowBefore.relativeCenterY - 15);
  await page.locator(".system-map-stage").screenshot({ path: `docs/screenshots/product-opening-${info.project.name}.png` });

  await scrollTo(page, geometry.start + geometry.distance * .52);
  await expect.poll(async () => Number(await diagram.getAttribute("data-expansion"))).toBeGreaterThan(.5);
  expect(Number(await diagram.getAttribute("data-expansion"))).toBeLessThan(.6);
  const ideaDuring = await page.locator(".system-map-vision").boundingBox();
  expect(ideaDuring!.y).toBeLessThan(ideaBefore!.y - 30);
  await expect(page.locator(".system-map-vision")).toHaveCSS("opacity", "0");
  const windowAfter = await applicationState(page);
  expect(windowAfter.opacity).toBeCloseTo(1, 2);
  expect(windowAfter.width).toBeGreaterThanOrEqual(50);
  expect(windowAfter.width).toBeLessThanOrEqual(56);
  expect(windowAfter.relativeCenterY).toBeLessThan(windowDuring.relativeCenterY - 15);
  const interfaceBounds = await diagram.locator('[data-node="frontend"]').boundingBox();
  expect(Math.abs(windowAfter.centerX - (interfaceBounds!.x + interfaceBounds!.width / 2))).toBeLessThan(1);
  expect(Math.abs(windowAfter.centerY - (interfaceBounds!.y + interfaceBounds!.height / 2))).toBeLessThan(1);
  expect(await originalApplication!.evaluate(element => element.isConnected && element === document.querySelector(".system-map-application"))).toBe(true);
  await expect(diagram).toHaveAttribute("data-flow", "running");
  await scrollTo(page, geometry.start + geometry.distance * .78);
  await expect.poll(async () => Number(await diagram.getAttribute("data-expansion"))).toBeGreaterThan(.76);
  const final = await page.locator(".system-map-stage").boundingBox();
  expect(Math.abs(final!.y - entry!.y)).toBeLessThan(2);
  await page.locator(".system-map-stage").screenshot({ path: `docs/screenshots/product-connected-${info.project.name}.png` });
  for (const id of ["frontend", "identity", "api", "events", "services", "agents", "queue", "retrieval", "models", "workers", "data", "vectors", "cache", "tools", "integrations"]) {
    await expect(diagram.locator(`[data-node="${id}"]`)).toBeVisible();
  }
  await expect(diagram.locator('[data-node="runtime"]')).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  await scrollTo(page, geometry.start - 40);
  await expect.poll(async () => Number(await diagram.getAttribute("data-expansion"))).toBeLessThan(.02);
  await expect.poll(async () => Math.abs((await applicationState(page)).width - windowBefore.width)).toBeLessThan(1);
  const restored = await applicationState(page);
  expect(restored.opacity).toBeCloseTo(1, 2);
  expect(Math.abs(restored.relativeCenterY - windowBefore.relativeCenterY)).toBeLessThan(1);
  expect(await originalApplication!.evaluate(element => element.isConnected && element === document.querySelector(".system-map-application"))).toBe(true);
});

test("the connected product exchanges signals and pauses without shifting the page", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const geometry = await openSystem(page);
  const diagram = page.locator(".system-map");
  await expect(diagram).toHaveAttribute("data-flow", "running");
  const packets = page.locator(".system-map-packet");
  expect(await packets.count()).toBeGreaterThanOrEqual(6);
  const positions = () => packets.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return `${rect.x.toFixed(2)}|${rect.y.toFixed(2)}`;
  }).join(";"));
  const before = await positions();
  await expect.poll(positions).not.toBe(before);
  await expect.poll(() => page.locator(".system-map-trail").evaluateAll(elements => elements.filter(element => parseFloat(getComputedStyle(element).opacity) > .25).length)).toBeGreaterThan(2);
  // Several different component connections should carry visible data together.
  await expect.poll(() => packets.evaluateAll(elements => new Set(elements.filter(element => parseFloat(getComputedStyle(element).opacity) > .3).map(element => (element as SVGElement).dataset.connection)).size)).toBeGreaterThanOrEqual(4);
  const trackHeight = await page.locator(".system-map-track").evaluate(element => element.getBoundingClientRect().height);
  await page.getByRole("button", { name: "Open experience settings" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(diagram).toHaveAttribute("data-flow", "still");
  expect(await page.locator(".system-map-track").evaluate(element => element.getBoundingClientRect().height)).toBeCloseTo(trackHeight, 0);
  await page.getByRole("button", { name: "Open experience settings" }).click();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(diagram).toHaveAttribute("data-flow", "running");
  await scrollTo(page, geometry.start + geometry.runway + geometry.height + 300);
  await expect(diagram).toHaveAttribute("data-flow", "still");
});

test("compact components reveal their roles on focus and tap without permanent captions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await waitForReady(page);
  await page.locator(".system-map-stage").scrollIntoViewIfNeeded();
  const agents = page.getByRole("button", { name: "Agent orchestration: Context, decisions and actions" });
  await agents.focus();
  await expect(page.locator(".system-map-inspection")).toContainText("Agent orchestration");
  const cache = page.getByRole("button", { name: "Cache: Reuse work that is already done" });
  await cache.click();
  await expect(page.locator(".system-map-inspection")).toContainText("Reuse work that is already done");
  const icon = await cache.locator("svg").boundingBox();
  expect(icon!.width).toBeLessThanOrEqual(24);
  await expect(page.locator(".system-map-node strong")).toHaveCount(0);
  await expect(page.locator(".system-map figcaption")).toContainText("I build interfaces, backend systems, and AI workflows.");
});

test("the complete still product stays legible and bounded on phones, tablets, and short screens", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "This test iterates all target sizes in one browser context.");
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForReady(page);
  const diagram = page.locator(".system-map");
  for (const [width, height] of [[320,568], [390,844], [430,932], [700,900], [768,1024], [844,390], [1440,1000]]) {
    await page.setViewportSize({ width, height });
    await page.locator(".system-map-stage").scrollIntoViewIfNeeded();
    await expect(diagram).toHaveAttribute("data-animation", "still");
    await expect(diagram).toHaveAttribute("data-expansion", "1.000");
    await expect(diagram).toHaveAttribute("data-flow", "still");
    const overflow = await diagram.evaluate(element => {
      const boundary = element.querySelector(".system-map-stage")!.getBoundingClientRect();
      return [...element.querySelectorAll(".system-map-node")].filter(child => {
        const rect = child.getBoundingClientRect();
        return rect.left < boundary.left - 1 || rect.right > boundary.right + 1 || rect.top < boundary.top - 1 || rect.bottom > boundary.bottom + 1;
      }).map(child => child.getAttribute("data-node"));
    });
    expect(overflow, `${width}x${height} component bounds`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test("the product hierarchy has readable contrast and accessible structure in each material", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "This check explicitly covers desktop and phone widths in every material.");
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const palette of ["copper", "ink", "silver"]) {
      await page.goto(`/?theme=${palette}`);
      await waitForReady(page);
      await expect(page.locator(".observatory")).toHaveAttribute("data-palette", palette);
      await page.locator(".system-map-stage").scrollIntoViewIfNeeded();
      await expect(page.locator(".system-map")).toHaveAttribute("data-expansion", "1.000");
      const result = await new AxeBuilder({ page }).include(".system-map").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(result.violations, `${width}px ${palette} product`).toEqual([]);
    }
  }
});

test("the held reveal fits shorter portrait and tablet screens without overlapping components", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "This check iterates several viewport ratios in one context.");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await waitForReady(page);
  await expect(page.locator(".system-map")).toHaveAttribute("data-animation", "scroll");
  for (const [width, height] of [[360,740], [768,1024], [1024,768], [1366,650], [1536,695], [844,650], [320,568], [320,640]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator(".system-map")).toHaveAttribute("data-layout", "sticky");
    const geometry = await revealGeometry(page);
    await scrollTo(page, geometry.start + geometry.distance * .78);
    await expect.poll(async () => Number(await page.locator(".system-map").getAttribute("data-expansion"))).toBeGreaterThan(.76);
    const stage = await page.locator(".system-map-stage").boundingBox();
    const footer = await page.locator(".experience-bar").boundingBox();
    expect(stage!.y + stage!.height, `${width}x${height} complete product above footer`).toBeLessThanOrEqual(footer!.y + 1);
    await expect(page.locator(".system-map")).toHaveAttribute("data-flow", "running");
    const overlaps = await page.locator(".system-map-node").evaluateAll(elements => {
      const boxes = elements.map(element => ({ id: element.getAttribute("data-node"), rect: element.getBoundingClientRect() }));
      return boxes.flatMap((a, index) => boxes.slice(index + 1).filter(b => Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left) > 2 && Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top) > 2).map(b => `${a.id}/${b.id}`));
    });
    expect(overlaps, `${width}x${height} component overlap`).toEqual([]);
  }
});
