import { test, expect, type Page } from "@playwright/test";

async function ready(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".observatory")).toHaveAttribute("data-loading", "ready");
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".system-map")).toHaveAttribute("data-animation", "scroll");
  await page.mouse.move(width - 30, Math.round(height * .6));
}

async function geometry(page: Page) {
  return page.locator(".system-map-track").evaluate(track => {
    const stage = track.querySelector<HTMLElement>(".system-map-stage")!;
    const flow = track.closest<HTMLElement>(".system-map")!.dataset.layout === "flow";
    const top = scrollY + track.getBoundingClientRect().top;
    const runway = track.clientHeight - stage.clientHeight;
    const inset = parseFloat(getComputedStyle(stage).top) || 0;
    const start = top - (flow ? innerHeight * .65 : inset);
    const distance = flow ? Math.min(240, innerHeight * .6) : parseFloat(getComputedStyle(track.closest(".system-map")!).getPropertyValue("--system-reveal-distance"));
    return { start, distance, runway, inset, open: start + distance * (flow ? 1.02 : .78), end: top + track.clientHeight };
  });
}

/** Real wheel events, deliberately broken into normal-sized input steps. */
async function wheelTo(page: Page, destination: number, step = 280) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const before = await page.evaluate(() => scrollY);
    const delta = destination - before;
    if (Math.abs(delta) < 2) return;
    await page.mouse.wheel(0, Math.sign(delta) * Math.min(Math.abs(delta), step));
    await page.waitForTimeout(65);
    const after = await page.evaluate(() => scrollY);
    if (Math.abs(after - before) < .5 && attempt > 0) return;
  }
  throw new Error("The wheel approach did not settle within its bounded input sequence.");
}

async function visibleTraffic(page: Page) {
  return page.locator(".system-map-packet").evaluateAll(elements => {
    const footerTop = document.querySelector(".experience-bar")!.getBoundingClientRect().top;
    const headerBottom = document.querySelector(".site-header")!.getBoundingClientRect().bottom;
    return {
      scroll: scrollY,
      packets: elements.map(element => {
        const rect = element.getBoundingClientRect();
        return { edge: (element as SVGElement).dataset.connection || "", direction: (element as SVGElement).dataset.direction || "", x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, opacity: parseFloat(getComputedStyle(element).opacity) };
      }).filter(packet => packet.opacity > .3 && packet.x > 0 && packet.x < innerWidth && packet.y > headerBottom && packet.y < footerTop),
    };
  });
}

test("laptop wheel reveal keeps visible traffic alive for more than two complete cycles", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "The explicit viewport matrix already covers the phone and landscape variants.");
  test.setTimeout(90000);
  await ready(page, 1366, 650);
  const diagram = page.locator(".system-map");
  await expect(diagram).toHaveAttribute("data-layout", "sticky");
  const map = await geometry(page);
  // Stay just before the threshold so fractional CSS pixels cannot open it early.
  await wheelTo(page, map.start - 4);
  await expect.poll(async () => Number(await diagram.getAttribute("data-expansion"))).toBeLessThan(.025);
  const idea = page.locator(".system-map-vision");
  const application = page.locator(".system-map-application");
  await expect(idea).toHaveCSS("opacity", "1");
  const beginning = await idea.boundingBox();
  const applicationBefore = await application.boundingBox();
  const initialStage = await page.locator(".system-map-stage").boundingBox();
  expect(applicationBefore!.width).toBeLessThanOrEqual(220.5);
  expect(applicationBefore!.y).toBeGreaterThanOrEqual(initialStage!.y);
  expect(beginning!.y + beginning!.height).toBeLessThanOrEqual(initialStage!.y + initialStage!.height);
  await wheelTo(page, map.start + map.distance * .25, 24);
  await expect.poll(async () => Number(await diagram.getAttribute("data-expansion"))).toBeGreaterThan(.2);
  const rising = await idea.boundingBox();
  expect(rising!.y).toBeLessThan(beginning!.y - 15);
  const applicationDuring = await application.boundingBox();
  expect(applicationDuring!.width).toBeLessThan(applicationBefore!.width - 30);
  expect(applicationDuring!.width).toBeGreaterThan(75);
  await expect(application).toBeVisible();
  // Copy clears before the emerging engineering reaches its position. The
  // application itself stays visible throughout the same quarter-distance move.
  await expect(idea).toHaveCSS("opacity", "0");
  // The copy fades while the same window becomes the Interface component.
  // Traffic already moves here without requiring another scroll gesture.
  await wheelTo(page, map.start + map.distance * .52, 24);
  await expect(idea).toHaveCSS("opacity", "0");
  await expect(application).toBeVisible();
  await expect.poll(async () => (await application.boundingBox())!.width).toBeLessThanOrEqual(56);
  await expect(diagram).toHaveAttribute("data-flow", "running");
  await expect.poll(async () => new Set((await visibleTraffic(page)).packets.map(packet => packet.edge)).size).toBeGreaterThanOrEqual(4);
  const earlyTraffic = await visibleTraffic(page);
  await page.waitForTimeout(1200);
  const continuingTraffic = await visibleTraffic(page);
  expect(continuingTraffic.packets.length).toBeGreaterThan(2);
  expect(JSON.stringify(continuingTraffic.packets)).not.toBe(JSON.stringify(earlyTraffic.packets));
  expect(Math.abs(continuingTraffic.scroll - earlyTraffic.scroll)).toBeLessThan(2);
  await wheelTo(page, map.open, 25);
  await expect(idea).toHaveCSS("opacity", "0");
  await expect(diagram).toHaveAttribute("data-flow", "running");
  await expect.poll(() => diagram.locator(".system-map-node").evaluateAll(elements => elements.filter(element => parseFloat(getComputedStyle(element).opacity) > .95).length)).toBe(15);

  const samples: Awaited<ReturnType<typeof visibleTraffic>>[] = [];
  const started = Date.now();
  // Longest request circuit is 11.2 seconds. Observe more than two cycles at rest.
  while (Date.now() - started < 24000) {
    samples.push(await visibleTraffic(page));
    await page.waitForTimeout(480);
  }
  expect(Date.now() - started).toBeGreaterThan(22400);
  const scrolls = samples.map(sample => sample.scroll);
  expect(Math.max(...scrolls) - Math.min(...scrolls)).toBeLessThan(2);
  for (let offset = 0; offset < samples.length; offset += 10) {
    const window = samples.slice(offset, offset + 10).flatMap(sample => sample.packets);
    expect(new Set(window.map(packet => packet.edge)).size, `visible connections in sample window ${offset}`).toBeGreaterThanOrEqual(4);
    expect(new Set(window.map(packet => `${packet.edge}:${packet.x.toFixed(1)},${packet.y.toFixed(1)}`)).size).toBeGreaterThan(15);
  }
  expect(new Set(samples.flatMap(sample => sample.packets.map(packet => packet.direction)))).toEqual(new Set(["request", "response"]));
  await expect(diagram).toHaveAttribute("data-flow", "running");

  // Opening still takes the same wheel distance. Once the nodes have settled,
  // only a brief handoff remains: pinning holds at +24px and releases by +44px.
  const stage = page.locator(".system-map-stage");
  const pinned = await stage.boundingBox();
  const completeAt = map.start + map.distance * .72;
  await wheelTo(page, completeAt + 24, 12);
  expect(Math.abs((await stage.boundingBox())!.y - pinned!.y)).toBeLessThan(2);
  await wheelTo(page, completeAt + 44, 12);
  const released = await stage.boundingBox();
  expect(pinned!.y - released!.y).toBeGreaterThan(7);
  expect(pinned!.y - released!.y).toBeLessThan(18);
  await expect(diagram).toHaveAttribute("data-flow", "running");

  await page.setViewportSize({ width: 844, height: 390 });
  await expect(diagram).toHaveAttribute("data-layout", "flow");
  const shorter = await geometry(page);
  await wheelTo(page, shorter.open);
  await expect(diagram).toHaveAttribute("data-flow", "running");
  const beforeResizeSample = JSON.stringify((await visibleTraffic(page)).packets);
  await expect.poll(async () => JSON.stringify((await visibleTraffic(page)).packets)).not.toBe(beforeResizeSample);
  await wheelTo(page, shorter.end + 700);
  await expect(diagram).toHaveAttribute("data-flow", "still");
  await wheelTo(page, shorter.open);
  await expect(diagram).toHaveAttribute("data-flow", "running");
  await expect.poll(async () => (await visibleTraffic(page)).packets.length).toBeGreaterThan(1);
});

test("ordinary wheel input reveals live systems on laptop, short landscape and small phone", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "This test explicitly exercises all three remaining viewport sizes.");
  test.setTimeout(90000);
  for (const [width, height] of [[1536,695], [844,390], [320,568]]) {
    await ready(page, width, height);
    const diagram = page.locator(".system-map");
    await expect(diagram).toHaveAttribute("data-layout", height <= 520 ? "flow" : "sticky");
    const map = await geometry(page);
    await wheelTo(page, map.start - 35);
    await expect.poll(async () => Number(await diagram.getAttribute("data-expansion"))).toBeLessThan(.025);
    await wheelTo(page, map.open, 24);
    await expect(diagram).toHaveAttribute("data-flow", "running");
    await expect(page.locator(".system-map-vision")).toHaveCSS("opacity", "0");
    const before = await visibleTraffic(page);
    await page.waitForTimeout(1200);
    const after = await visibleTraffic(page);
    expect(after.packets.length, `${width}x${height} visible packets`).toBeGreaterThan(1);
    expect(JSON.stringify(after.packets), `${width}x${height} live positions`).not.toBe(JSON.stringify(before.packets));
    expect(Math.abs(after.scroll - before.scroll)).toBeLessThan(2);
    await expect(diagram).toHaveAttribute("data-animation", "scroll");
  }
});

test("manual pause and reduced motion stop traffic while normal motion resumes it", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "One complete preference lifecycle is sufficient; layout variants are covered above.");
  test.setTimeout(45000);
  await ready(page, 1366, 650);
  const diagram = page.locator(".system-map");
  let map = await geometry(page);
  await wheelTo(page, map.open);
  await expect(diagram).toHaveAttribute("data-flow", "running");
  const trackHeight = await page.locator(".system-map-track").evaluate(element => element.clientHeight);
  await page.getByRole("button", { name: "Open experience settings" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(diagram).toHaveAttribute("data-flow", "still");
  expect((await visibleTraffic(page)).packets).toEqual([]);
  expect(await page.locator(".system-map-track").evaluate(element => element.clientHeight)).toBe(trackHeight);
  await page.getByRole("button", { name: "Open experience settings" }).click();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(diagram).toHaveAttribute("data-flow", "running");
  await expect.poll(async () => (await visibleTraffic(page)).packets.length).toBeGreaterThan(2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(diagram).toHaveAttribute("data-animation", "still");
  await expect(diagram).toHaveAttribute("data-layout", "static");
  await expect(diagram).toHaveAttribute("data-flow", "still");
  expect((await visibleTraffic(page)).packets).toEqual([]);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(diagram).toHaveAttribute("data-layout", "sticky");
  map = await geometry(page);
  await wheelTo(page, map.open);
  await expect(diagram).toHaveAttribute("data-flow", "running");
});
