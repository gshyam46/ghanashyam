import { test, expect } from "@playwright/test";

test("chapter tracking follows the practice illustration after resizing from contact", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "This regression iterates desktop and mobile sizes in one session.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('.chapter-nav a[href="#contact"]').click();
  for (const [width, height] of [[390,844], [768,1024], [844,390], [1440,1000], [320,568]]) {
    await page.setViewportSize({ width, height });
    await page.locator(".system-map").scrollIntoViewIfNeeded();
    await expect(page.locator('.chapter-nav a[href="#practice"]')).toHaveAttribute("aria-current", "location");
    await expect(page.locator(".sculpture-layer")).toHaveAttribute("data-scene", "practice");
  }
});

test("phone, tablet, landscape and desktop layouts retain usable bounds", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "This test explicitly iterates all target viewport sizes.");
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [[320,568], [360,740], [390,844], [430,932], [768,1024], [844,390], [1024,768], [1440,1000]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".observatory")).toHaveAttribute("data-motion", "still");
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width} page width`).toBeLessThanOrEqual(width);
    const outOfBounds = await page.locator(".site-header a:visible, .site-header button:visible, .experience-bar a:visible, .experience-bar button:visible").evaluateAll(elements => elements.filter(element => {
      const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > innerWidth + 1;
    }).map(element => element.getAttribute("aria-label") || element.textContent));
    expect(outOfBounds, `${width} navigation bounds`).toEqual([]);
    if (width <= 900) {
      const copy = await page.locator(".hero-copy").boundingBox();
      const artwork = await page.locator(".sculpture-layer").boundingBox();
      expect(artwork!.y, `${width} artwork below the complete introduction`).toBeGreaterThanOrEqual(copy!.y + copy!.height);
    }
    await page.locator('.chapter-nav a[href="#practice"]').click();
    await page.getByRole("button", { name: "Read about ContentEaseAI experience" }).click();
    const career = page.locator(".career-dialog");
    expect(await career.evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${width} career width`).toBeTruthy();
    await career.getByRole("button", { name: "Next experience" }).click();
    expect(await career.evaluate(element => element.scrollTop), `${width} career scroll reset`).toBe(0);
    await page.keyboard.press("Escape");
    await page.locator('.chapter-nav a[href="#contact"]').click();
    await page.getByRole("button", { name: "Write me a note" }).click();
    await page.getByRole("combobox", { name: "A note about" }).click();
    await page.getByRole("option", { name: "an engineering opportunity" }).click();
    const note = page.getByRole("dialog", { name: "A little hello." });
    expect(await note.evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${width} note width`).toBeTruthy();
    await page.keyboard.press("Escape");
  }
});
