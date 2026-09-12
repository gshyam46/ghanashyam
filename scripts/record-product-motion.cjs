// Local visual evidence: ordinary wheel reveal followed by more than two live cycles.
const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

(async () => {
  const output = path.resolve("docs/motion");
  fs.mkdirSync(output, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-motion-"));
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined),
    args: ["--enable-unsafe-swiftshader"],
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 650 },
    reducedMotion: "no-preference",
    recordVideo: { dir: temporary, size: { width: 1366, height: 650 } },
  });
  const page = await context.newPage();
  const video = page.video();
  const started = Date.now();
  const frames = [];
  async function wheelTo(destination, step = 250) {
    for (let index = 0; index < 100; index++) {
      const before = await page.evaluate(() => scrollY);
      const delta = destination - before;
      if (Math.abs(delta) < 2) return;
      await page.mouse.wheel(0, Math.sign(delta) * Math.min(Math.abs(delta), step));
      await page.waitForTimeout(85);
    }
    throw new Error("Wheel navigation did not settle.");
  }
  async function capture(name) {
    const state = await page.locator(".system-map").evaluate(figure => {
      const application = figure.querySelector(".system-map-application");
      const bounds = application.getBoundingClientRect();
      let opacity = 1;
      for (let element = application; element; element = element.parentElement) {
        const style = getComputedStyle(element);
        opacity *= Number(style.opacity);
        if (style.display === "none" || style.visibility === "hidden") opacity = 0;
      }
      return {
        expansion: figure.dataset.expansion,
        flow: figure.dataset.flow,
        scroll: scrollY,
        application: { width: bounds.width, height: bounds.height, centerX: bounds.x + bounds.width / 2, centerY: bounds.y + bounds.height / 2, opacity },
        packets: [...figure.querySelectorAll(".system-map-packet")].filter(element => parseFloat(getComputedStyle(element).opacity) > .3).map(element => ({
          edge: element.dataset.connection,
          direction: element.dataset.direction,
          x: Number(element.getAttribute("cx")),
          y: Number(element.getAttribute("cy")),
        })),
      };
    });
    await page.screenshot({ path: path.join(output, `product-loop-${name}.png`) });
    frames.push({ name, elapsedMs: Date.now() - started, ...state });
  }
  try {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3001");
    await page.waitForFunction(() => document.querySelector(".observatory")?.dataset.loading === "ready");
    await page.locator(".loading-screen").waitFor({ state: "detached" });
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(1336, 460);
    await page.waitForTimeout(600);
    const map = await page.locator(".system-map-track").evaluate(track => {
      const stage = track.querySelector(".system-map-stage");
      const inset = parseFloat(getComputedStyle(stage).top) || 0;
      const runway = track.clientHeight - stage.clientHeight;
      const distance = parseFloat(getComputedStyle(track.closest(".system-map")).getPropertyValue("--system-reveal-distance"));
      return { start: scrollY + track.getBoundingClientRect().top - inset, runway, distance };
    });
    await wheelTo(map.start);
    await page.waitForTimeout(1700);
    await capture("idea");
    await wheelTo(map.start + map.distance * .25, 14);
    await page.waitForTimeout(650);
    await capture("reveal");
    await wheelTo(map.start + map.distance * .52, 14);
    await page.waitForFunction(() => document.querySelector(".system-map")?.dataset.flow === "running");
    await page.waitForTimeout(450);
    await capture("flow-start");
    await wheelTo(map.start + map.runway * .94, 18);
    await page.waitForFunction(() => document.querySelector(".system-map")?.dataset.flow === "running");
    await page.waitForTimeout(450);
    await capture("live-0");
    for (let index = 1; index <= 3; index++) {
      await page.waitForTimeout(8300);
      await capture(`live-${index}`);
    }
    const live = frames.filter(frame => frame.name.startsWith("live"));
    if (live.some(frame => frame.flow !== "running") || new Set(live.map(frame => frame.scroll)).size !== 1) throw new Error("The recorded system did not stay running at a fixed scroll position.");
    const handoff = frames.filter(frame => ["idea", "reveal", "flow-start"].includes(frame.name));
    if (handoff.some(frame => frame.application.opacity < .99) || !(handoff[0].application.width > handoff[1].application.width && handoff[1].application.width > handoff[2].application.width)) throw new Error("The application window did not remain visible while shrinking into the interface.");
    fs.writeFileSync(path.join(output, "product-loop-laptop.frames.json"), JSON.stringify({ viewport: "1366x650", longestCircuitMs: 11200, recordedMs: Date.now() - started, frames }, null, 2));
  } finally {
    await context.close();
    await video.saveAs(path.join(output, "product-loop-laptop.webm"));
    await browser.close();
  }
  console.log(JSON.stringify({ video: path.join(output, "product-loop-laptop.webm"), recordedMs: Date.now() - started, frames: frames.map(({ name, flow, packets }) => ({ name, flow, visibleEdges: new Set(packets.map(packet => packet.edge)).size })) }));
})().catch(error => { console.error(error); process.exit(1); });
