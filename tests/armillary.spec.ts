import { expect, test, type Locator, type Page } from "@playwright/test";

// Compare the rendered artwork, excluding grain, text, touch trails and the cursor.
const canvasOnly = ".observatory * { visibility: hidden !important; } .signal-sculpture canvas { visibility: visible !important; }";
const capture = (canvas: Locator) => canvas.screenshot({ style: canvasOnly });

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
  await expect.poll(async () => (await capture(canvas)).equals(initial), {
    message: "Reset must restore the initial reduced-motion pose exactly.", intervals: [100, 180, 260],
  }).toBe(true);
});
