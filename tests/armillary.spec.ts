import { expect, test, type Locator, type Page } from "@playwright/test";
import { inflateSync } from "node:zlib";

// Compare the rendered artwork, excluding grain, text, touch trails and the cursor.
const canvasOnly = ".observatory * { visibility: hidden !important; } .signal-sculpture canvas { visibility: visible !important; }";
const capture = (canvas: Locator) => canvas.screenshot({ style: canvasOnly });

// Minimal PNG decoder (8-bit, non-interlaced RGB/RGBA) for a tolerant pixel comparison below;
// the software WebGL rasterizer can settle two separate but geometrically identical draws into
// framebuffers that differ by 1/255 on a handful of antialiased edge pixels.
function decodePng(png: Buffer) {
  let offset = 8, width = 0, height = 0, channels = 0;
  const idat: Buffer[] = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[data.readUInt8(9)] ?? 0;
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    offset += 12 + length;
  }
  const stride = width * channels;
  const raw = inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(height * stride);
  const previous = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const row = raw.subarray(pos, pos + stride);
    pos += stride;
    const out = pixels.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[x - channels] : 0;
      const b = previous[x];
      const c = x >= channels ? previous[x - channels] : 0;
      let value = row[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[x] = value & 0xff;
    }
    out.copy(previous);
  }
  return { width, height, channels, pixels };
}

// True equality still catches a stuck or wrongly-rotated pose (which differs by thousands of
// pixels across large regions); this only forgives isolated one-off rounding on edge pixels.
function nearlyEqual(pngA: Buffer, pngB: Buffer, { maxDelta = 2, maxDiffPixels = 200 } = {}) {
  const a = decodePng(pngA), b = decodePng(pngB);
  if (a.width !== b.width || a.height !== b.height || a.channels !== b.channels) return false;
  let diffPixels = 0;
  for (let pixel = 0; pixel < a.width * a.height; pixel++) {
    let differs = false;
    for (let channel = 0; channel < a.channels; channel++) {
      const index = pixel * a.channels + channel;
      const delta = Math.abs(a.pixels[index] - b.pixels[index]);
      if (delta > maxDelta) return false;
      if (delta > 0) differs = true;
    }
    if (differs && ++diffPixels > maxDiffPixels) return false;
  }
  return true;
}

async function ready(page: Page) {
  await page.goto("/");
  const sculpture = page.locator(".signal-sculpture");
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await expect(sculpture).toHaveAttribute("data-render-state", "webgl");
  await expect(sculpture).toHaveAttribute("data-sculpture", "armillary");
  await expect(sculpture).toHaveAttribute("role", "img");
  await expect(sculpture).toHaveAttribute("aria-label", /armillary/i);
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(8, 120);
  return { sculpture, canvas: sculpture.locator("canvas") };
}

async function settled(canvas: Locator) {
  let previous = await capture(canvas);
  let equalFrames = 0;
  await expect.poll(async () => {
    const next = await capture(canvas);
    equalFrames = next.equals(previous) ? equalFrames + 1 : 0;
    previous = next;
    return equalFrames;
  }, { message: "The rendered armillary must settle into identical frames.", intervals: [180, 220, 260], timeout: 7000 }).toBeGreaterThanOrEqual(3);
  return previous;
}

test("the armillary visibly moves while its ambient motion is enabled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const { canvas } = await ready(page);
  const first = await capture(canvas);
  await expect.poll(async () => (await capture(canvas)).equals(first), {
    message: "Ambient movement must change the actual rendered canvas.", intervals: [180, 260], timeout: 5000,
  }).toBe(false);
});

for (const mode of ["global pause", "reduced motion"] as const) {
  test(`${mode} stops the armillary after its current pose settles`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const { canvas } = await ready(page);
    if (mode === "global pause") {
      await page.getByRole("button", { name: "Open experience settings" }).click();
      await page.getByRole("button", { name: "Pause", exact: true }).click();
      await page.getByRole("button", { name: "Close experience settings" }).click();
      await expect(page.locator(".observatory")).toHaveAttribute("data-motion", "still");
    } else {
      await page.emulateMedia({ reducedMotion: "reduce" });
    }
    await page.mouse.move(8, 120);
    const still = await settled(canvas);
    // A second observation window catches clocks that resume after an idle frame.
    await page.waitForTimeout(450);
    expect((await capture(canvas)).equals(still)).toBe(true);
  });
}

test("keyboard rotation remains available with reduced motion and R restores the pose", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { sculpture, canvas } = await ready(page);
  await expect(sculpture).toHaveAttribute("tabindex", "0");
  await sculpture.focus();
  const initial = await settled(canvas);
  await sculpture.press("ArrowRight");
  await expect.poll(async () => (await capture(canvas)).equals(initial)).toBe(false);
  await sculpture.press("ArrowUp");
  const rotated = await settled(canvas);
  expect(rotated.equals(initial)).toBe(false);
  await sculpture.press("r");
  await expect.poll(async () => nearlyEqual(await capture(canvas), initial), {
    message: "Reset must restore the initial reduced-motion pose.", intervals: [100, 180, 260],
  }).toBe(true);
});
