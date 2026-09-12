import { expect, test, type Locator, type Page } from "@playwright/test";

const canvasOnly = ".observatory * { visibility: hidden !important; } .signal-sculpture canvas { visibility: visible !important; }";
type Point = { x: number; y: number };

/** Sample painted pixels, then ask the real pointer path which visible rings it can pick. */
async function findRingHits(page: Page, sculpture: Locator) {
  const canvas = sculpture.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("The armillary needs a visible canvas.");
  const pixels = await canvas.screenshot({ style: canvasOnly });
  const candidates = await page.evaluate(async ({ png, bounds }) => {
    const image = await createImageBitmap(await (await fetch(png)).blob());
    const sample = document.createElement("canvas");
    sample.width = image.width;
    sample.height = image.height;
    const context = sample.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const rgba = context.getImageData(0, 0, image.width, image.height).data;
    const left = Math.max(bounds.x, 12);
    const right = Math.min(bounds.x + bounds.width, innerWidth - 12);
    const top = Math.max(bounds.y, 120);
    const bottom = Math.min(bounds.y + bounds.height, innerHeight - 30);
    const middle = (left + right) / 2;
    const groups: { x: number; y: number; light: number }[][] = [[], []];
    // A 12px screen grid with a small local sample catches narrow lit ring edges.
    // Only 48 candidates per side reach Playwright: no unbounded pointer search.
    for (let y = top; y < bottom; y += 12) {
      for (let x = left; x < right; x += 12) {
        let brightest = { x, y, light: 0 };
        for (let dy = -4; dy <= 4; dy += 4) {
          for (let dx = -4; dx <= 4; dx += 4) {
            const px = Math.min(image.width - 1, Math.max(0, Math.round((x + dx - bounds.x) / bounds.width * image.width)));
            const py = Math.min(image.height - 1, Math.max(0, Math.round((y + dy - bounds.y) / bounds.height * image.height)));
            const offset = (py * image.width + px) * 4;
            const light = Math.max(rgba[offset], rgba[offset + 1], rgba[offset + 2]);
            if (light > brightest.light) brightest = { x: x + dx, y: y + dy, light };
          }
        }
        const centerDistance = Math.hypot(brightest.x - (bounds.x + bounds.width / 2), brightest.y - (bounds.y + bounds.height / 2));
        // Keep the luminous central nucleus out of this ring-picking regression.
        if (brightest.light > 65 && centerDistance > Math.min(bounds.width, bounds.height) * .18) {
          groups[brightest.x < middle ? 0 : 1].push(brightest);
        }
      }
    }
    image.close();
    return groups.map(group => group.sort((a, b) => b.light - a.light).slice(0, 48));
  }, { png: `data:image/png;base64,${pixels.toString("base64")}`, bounds });

  const hits: Point[] = [];
  for (const group of candidates) {
    for (const point of group) {
      await page.mouse.move(point.x, point.y);
      if (await sculpture.getAttribute("data-drag-hit") === "true") { hits.push(point); break; }
    }
  }
  expect(hits, "Painted rings on both sides of the armillary must accept pointer input.").toHaveLength(2);
  return hits;
}

async function findOuterMisses(page: Page, sculpture: Locator) {
  const bounds = await sculpture.boundingBox();
  if (!bounds) throw new Error("The sculpture must have visible bounds.");
  const misses: Point[] = [];
  for (const [fx, fy] of [[.04, .3], [.96, .3], [.04, .7], [.96, .7], [.25, .06], [.75, .06], [.25, .94], [.75, .94]]) {
    const point = { x: bounds.x + bounds.width * fx, y: bounds.y + bounds.height * fy };
    const exposed = await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest(".signal-sculpture")), point);
    if (!exposed) continue;
    await page.mouse.move(point.x, point.y);
    if (await sculpture.getAttribute("data-drag-hit") === "false") misses.push(point);
    if (misses.length === 2) break;
  }
  expect(misses, "At least two exposed outer-canvas positions must remain empty.").toHaveLength(2);
  return misses;
}

test("visible armillary rings are draggable, while empty outer canvas is not", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Desktop layout has the overlapping text and sculpture layers.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const sculpture = page.locator(".signal-sculpture");
  const canvas = sculpture.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await expect(sculpture).toHaveAttribute("data-render-state", "webgl");
  await expect(sculpture).toHaveAttribute("tabindex", "0");
  await page.evaluate(() => document.fonts.ready);

  const hits = await findRingHits(page, sculpture);
  for (const { x, y } of hits) {
    await page.mouse.move(x, y);
    await expect(sculpture).toHaveAttribute("data-drag-hit", "true");
    await page.mouse.down();
    await expect(sculpture).toHaveAttribute("data-dragging", "true");
    await page.mouse.up();
    await expect(sculpture).toHaveAttribute("data-dragging", "false");
  }

  const misses = await findOuterMisses(page, sculpture);
  for (const { x, y } of misses) {
    await page.mouse.move(x, y);
    await expect(sculpture).toHaveAttribute("data-drag-hit", "false");
    await page.mouse.down();
    await expect(sculpture).toHaveAttribute("data-dragging", "false");
    await page.mouse.up();
  }

  const hit = hits[1];
  await page.mouse.move(hit.x, hit.y);
  await expect(sculpture).toHaveAttribute("data-drag-hit", "true");
  const before = await canvas.screenshot({ style: canvasOnly });
  await page.mouse.down();
  await page.mouse.move(hit.x - 80, hit.y + 20, { steps: 8 });
  await page.mouse.up();
  await page.mouse.move(hit.x, hit.y);
  // Restoring the pointer position isolates accumulated rotation; reduced motion
  // holds the ambient pose still while explicit drag input stays available.
  await expect.poll(async () => (await canvas.screenshot({ style: canvasOnly })).equals(before)).toBe(false);
  await expect(sculpture).toHaveAttribute("data-dragging", "false");
});

test("a vertical touch gesture on the sculpture still scrolls the page", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "Uses the real touch input path on a phone viewport.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const sculpture = page.locator(".signal-sculpture");
  await expect(sculpture.locator("canvas")).toBeVisible();
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await expect(sculpture).toHaveAttribute("data-render-state", "webgl");
  await page.evaluate(() => document.fonts.ready);
  const hits = await findRingHits(page, sculpture);
  const { x, y } = hits[1];
  await page.mouse.move(x, y);
  await expect(sculpture).toHaveAttribute("data-drag-hit", "true");
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let step = 1; step <= 10; step++) {
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - step * 18 }] });
    await page.waitForTimeout(16);
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(90);
  await expect(sculpture).toHaveAttribute("data-dragging", "false");
  await session.detach();
});

test("the static fallback does not advertise an unavailable drag interaction", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (["webgl", "webgl2", "experimental-webgl"].includes(type)) return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto("/");
  const sculpture = page.locator(".signal-sculpture");
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await expect(sculpture).toHaveAttribute("data-render-state", "fallback");
  await expect(sculpture).toHaveAttribute("data-sculpture", "armillary");
  await expect(sculpture).toHaveAttribute("aria-label", /armillary/i);
  await expect(sculpture.locator("svg")).toBeVisible();
  await expect(sculpture.locator("canvas")).toHaveCount(0);
  await expect(sculpture).toHaveAttribute("data-drag-hit", "false");
  await expect(sculpture).toHaveAttribute("tabindex", "-1");
  await expect(sculpture).not.toHaveAttribute("aria-label", /Drag/);
});
