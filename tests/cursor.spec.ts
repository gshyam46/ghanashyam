import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".local-time")).toHaveText(/^\d{2}:\d{2} IST$/);
});

test("desktop cursor follows precisely, changes over controls, and preserves native text input", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Custom cursor is a fine-pointer enhancement.");
  const cursor = page.locator(".experience-cursor");
  await page.mouse.move(30, 175);
  await expect(cursor).toHaveAttribute("data-active", "true");
  expect(await page.locator(".cursor-dot").evaluate(element => getComputedStyle(element).translate)).toBe("30px 175px");
  await page.getByRole("button", { name: "Explore my work" }).hover();
  await expect(cursor).toHaveAttribute("data-state", "link");
  await page.locator(".hero-description p").hover();
  await expect(cursor).toHaveAttribute("data-active", "false");
  await expect(page.locator(".hero-description p")).toHaveCSS("cursor", "text");

  await page.getByRole("button", { name: "Write me a note" }).click();
  const note = page.getByRole("dialog", { name: "A little hello." });
  await note.getByRole("button", { name: "Close note" }).hover();
  await expect(cursor).toHaveAttribute("data-state", "link");
  await expect(cursor).toHaveAttribute("data-active", "true");
  await note.getByRole("textbox", { name: "Your message" }).hover();
  await expect(cursor).toHaveAttribute("data-active", "false");
  await note.getByRole("textbox", { name: "Your message" }).fill("A draft that stays local.");
  await note.getByRole("combobox", { name: "A note about" }).click();
  const option = page.getByRole("option", { name: "an AI system", exact: true });
  await option.hover();
  await expect(cursor).toHaveAttribute("data-active", "true");
  await expect(cursor).toHaveAttribute("data-state", "link");
  await expect(note.getByRole("combobox", { name: "A note about" })).toBeFocused();
  await option.click();
  await expect(note.getByRole("combobox", { name: "A note about" })).toContainText("an AI system");
  await page.keyboard.press("Escape");
  await expect(note).not.toBeVisible();
  await expect(cursor).toHaveAttribute("data-active", "false");
  await page.getByRole("button", { name: "Open experience settings" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Close experience settings" }).hover();
  await expect(cursor).toHaveAttribute("data-active", "false");
  await expect(page.locator(".observatory")).not.toHaveAttribute("data-cursor", "active");
});

test("touch and reduced motion keep the browser cursor", async ({ page }, info) => {
  const cursor = page.locator(".experience-cursor");
  if (info.project.name === "mobile") {
    await page.mouse.move(30, 175);
    await expect(cursor).toHaveAttribute("data-active", "false");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(40, 185);
  await expect(cursor).toHaveAttribute("data-active", "false");
  await expect(page.locator(".observatory")).not.toHaveAttribute("data-cursor", "active");
  await page.getByRole("button", { name: "Explore my work" }).hover();
  await expect(page.getByRole("button", { name: "Explore my work" })).toHaveCSS("cursor", "pointer");
});
