import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await page.locator("#energy-flux").evaluate(el => scrollTo({top: scrollY + el.getBoundingClientRect().top - innerHeight * .35, behavior:"instant"}));
});

test("intertwined field flows before Practice and sends an accessible pulse", async ({ page }, info) => {
  const root = page.locator("#energy-flux");
  const strand = root.locator(".energy-flux-strand").first();
  await expect(root).toHaveAttribute("data-running", "true");
  expect(await root.evaluate(el => !!(el.compareDocumentPosition(document.getElementById("practice")!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const before = await strand.getAttribute("d");
  await page.waitForTimeout(250);
  expect(await strand.getAttribute("d")).not.toBe(before);
  const count = Number(await root.getAttribute("data-pulse-count"));
  await page.getByRole("button", {name:"Send an energy pulse"}).focus();
  await page.keyboard.press("Enter");
  await expect(root).toHaveAttribute("data-pulse-count", String(count+1));
  const field = await root.locator(".energy-flux-field").boundingBox();
  if (info.project.name === "desktop") {
    await page.mouse.move(field!.x + field!.width * .6, field!.y + 6);
    await expect(root).toHaveAttribute("data-active", "true");
    await page.mouse.move(4, 120);
    await expect(root).toHaveAttribute("data-active", "false");
  }
  expect(field!.height).toBeLessThanOrEqual(150);
  expect(field!.width).toBeLessThanOrEqual(await page.evaluate(()=>innerWidth));
  await page.screenshot({path:`docs/screenshots/${info.project.name}-energy-flux.png`});
});

test("flux stops offscreen and remains visible and accessible with reduced motion", async ({ page }) => {
  const root = page.locator("#energy-flux");
  const strand = root.locator(".energy-flux-strand").first();
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
  await expect(root).toHaveAttribute("data-running","false");
  await root.evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-180,behavior:"instant"}));
  await expect(root).toHaveAttribute("data-running","true");
  await page.getByRole("button", {name:"Open experience settings"}).click();
  await page.getByRole("button", {name:"Pause",exact:true}).click();
  await page.getByRole("button", {name:"Close experience settings"}).click();
  await expect(root).toHaveAttribute("data-running","false");
  await page.getByRole("button", {name:"Open experience settings"}).click();
  await page.getByRole("button", {name:"Resume",exact:true}).click();
  await page.getByRole("button", {name:"Close experience settings"}).click();
  await expect(root).toHaveAttribute("data-running","true");
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(root).toHaveAttribute("data-running","false");
  await expect(root.locator(".energy-flux-field")).toBeVisible();
  await page.waitForTimeout(200);
  const still=await strand.getAttribute("d");
  await page.waitForTimeout(250);
  expect(await strand.getAttribute("d")).toBe(still);
  const result=await new AxeBuilder({page}).include("#energy-flux").withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
  expect(result.violations).toEqual([]);
});

test("the latest queued visibility change stops the offscreen field", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeObserver = window.IntersectionObserver;
    window.IntersectionObserver = class extends NativeObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        let pending: IntersectionObserverEntry[] = [];
        super((entries, observer) => {
          if (!entries.every(entry => entry.target.id === "energy-flux")) {
            callback(entries, observer);
            return;
          }
          // Coalesce real browser entry/exit records into one valid delivery.
          // This makes rapid-scroll batching deterministic without fake geometry.
          const target = entries[0].target as HTMLElement;
          if (entries.some(entry => entry.isIntersecting)) {
            pending.push(...entries);
            target.dataset.testVisibilityQueued = "true";
            return;
          }
          const batch = [...pending, ...entries];
          pending = [];
          if (batch.length > 1) target.dataset.testVisibilityDelivered = "true";
          callback(batch, observer);
        }, options);
      }
    };
  });
  await page.reload();
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  const root = page.locator("#energy-flux");
  const strand = root.locator(".energy-flux-strand").first();
  await root.evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 180, behavior: "instant" }));
  await expect(root).toHaveAttribute("data-test-visibility-queued", "true");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(root).toHaveAttribute("data-test-visibility-delivered", "true");
  await expect(root).toHaveAttribute("data-running", "false");
  const stopped = await strand.getAttribute("d");
  await page.waitForTimeout(250);
  expect(await strand.getAttribute("d")).toBe(stopped);
});

test("swiping the energy band keeps native phone scrolling", async ({ page, context }, info) => {
  test.skip(info.project.name!=="mobile","Requires native touch emulation.");
  const root=page.locator("#energy-flux");
  const pulseBefore = Number(await root.getAttribute("data-pulse-count"));
  await page.getByRole("button", {name:"Send an energy pulse"}).tap();
  await expect(root).toHaveAttribute("data-pulse-count", String(pulseBefore + 1));
  const field=(await root.locator(".energy-flux-field").boundingBox())!;
  const y=field.y+field.height/2;
  const before=await page.evaluate(()=>scrollY);
  const cdp=await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:180,y}]});
  for(let py=y-20;py>=y-120;py-=20) await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:180,y:py}]});
  await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+50);
  await cdp.detach();
});
