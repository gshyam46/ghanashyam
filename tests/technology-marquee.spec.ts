import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await page.locator("#toolkit").evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 140, behavior: "instant" }));
  await expect(page.locator("#toolkit")).toHaveAttribute("data-running", "true");
});

test("text loops right and reverses when scrolling up, then returns right on downward scroll", async ({ page }, info) => {
  const root = page.locator("#toolkit");
  const track = root.locator(".technology-track").first();
  const x = () => track.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41);
  await page.mouse.move(4, 120);
  const width = await track.locator(".technology-group").first().evaluate(el => el.getBoundingClientRect().width);
  const travel = (start: number, end: number) => { const delta=end-start; return delta > width / 2 ? delta-width : delta < -width / 2 ? delta+width : delta; };
  const fontSize = await page.locator(".technology-word").first().evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeLessThanOrEqual(44);
  expect(await page.locator("#toolkit").evaluate(el => !!(document.getElementById("practice")!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) && !document.getElementById("practice")!.contains(el))).toBe(true);
  const initial = await x();
  await page.waitForTimeout(300);
  expect(travel(initial, await x())).toBeGreaterThan(9);
  await page.evaluate(() => scrollBy({top: -45, behavior: "instant"}));
  await expect(root).toHaveAttribute("data-direction", "left");
  await page.waitForTimeout(600);
  const left = await x();
  await page.waitForTimeout(300);
  expect(travel(left, await x())).toBeLessThan(0);
  await page.evaluate(() => scrollBy({top: 45, behavior: "instant"}));
  await expect(root).toHaveAttribute("data-direction", "right");
  await page.waitForTimeout(600);
  const right = await x();
  await page.waitForTimeout(300);
  expect(travel(right, await x())).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path: `docs/screenshots/${info.project.name}-technology-band.png`});
});

test("pause keeps the text still and the complete toolkit remains keyboard accessible", async ({ page }) => {
  const track = page.locator(".technology-track").first();
  await page.getByRole("button", {name:"Pause technology motion"}).click();
  await expect(page.locator("#toolkit")).toHaveAttribute("data-running", "false");
  const stopped = await track.getAttribute("style");
  await page.waitForTimeout(350);
  expect(await track.getAttribute("style")).toBe(stopped);
  await page.locator(".technology-index summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".technology-index")).toHaveAttribute("open", "");
  await expect(page.locator(".technology-index-content")).toContainText("LangChain");
  await expect(page.locator(".technology-index-content")).toContainText("Langfuse");
  await expect(page.locator(".technology-index-content")).toContainText("Kubernetes");
  const accessibility = await new AxeBuilder({page}).include("#toolkit").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole("button", {name:"Resume technology motion"}).click();
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(page.locator("#toolkit")).toHaveAttribute("data-running", "false");
  const reduced = await track.getAttribute("style");
  await page.waitForTimeout(300);
  expect(await track.getAttribute("style")).toBe(reduced);
});

test("mouse hover slows the band and horizontal dragging scrubs the text", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Requires a mouse.");
  const lane = page.locator(".technology-lane").first();
  const track = lane.locator(".technology-track");
  const x = () => track.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41);
  await page.mouse.move(4, 120);
  await page.waitForTimeout(600);
  const baseline = await x();
  await page.waitForTimeout(300);
  const normal = (await x()) - baseline;
  const box = (await lane.boundingBox())!;
  await page.mouse.move(400, box.y + box.height / 2);
  await page.waitForTimeout(600);
  const hoverStart = await x();
  await page.waitForTimeout(300);
  const hoverDelta = (await x()) - hoverStart;
  expect(hoverDelta).toBeLessThan(normal * .7);
  const beforeDrag = await x();
  await page.mouse.down();
  await page.mouse.move(510, box.y + box.height / 2, {steps:5});
  expect(await x()).toBeGreaterThan(beforeDrag + 80);
  await page.mouse.up();
  await expect(page.locator("#toolkit")).toHaveAttribute("data-dragging", "false");
});

test("phone gestures keep vertical page scrolling and horizontal text dragging", async ({ page, context }, info) => {
  test.skip(info.project.name !== "mobile", "Requires touch emulation.");
  const cdp = await context.newCDPSession(page);
  const lane = page.locator(".technology-lane").first();
  const track = lane.locator(".technology-track");
  const box = (await lane.boundingBox())!;
  const y = box.y + box.height / 2;
  const x = () => track.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41);
  const before = await x();
  await cdp.send("Input.dispatchTouchEvent", {type:"touchStart",touchPoints:[{x:80,y}]});
  for (let px=100;px<=200;px+=20) await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:px,y}]});
  await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  expect(await x()).toBeGreaterThan(before + 80);
  const scrollBefore = await page.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:180,y}]});
  for(let py=y-20;py>=y-100;py-=20) await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:180,y:py}]});
  await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(scrollBefore+30);
  await cdp.detach();
});
