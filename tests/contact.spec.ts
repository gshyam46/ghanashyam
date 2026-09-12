import { test, expect, type Locator } from "@playwright/test";
import { contactConfig } from "../data/contact-config";

type NotePayload = {
  service_id: string;
  template_id: string;
  user_id: string;
  template_params: { from_name: string; from_email: string; subject: string; message: string };
};

// Never permit provider traffic to escape these tests. Individual tests install
// a more specific mock, while every other EmailJS request remains blocked.
test.beforeEach(async ({ page }) => {
  await page.route("https://api.emailjs.com/**", route => route.abort("blockedbyclient"));
  await page.goto("/");
  await page.getByRole("button", { name: "Write me a note" }).click();
  await expect(page.getByRole("dialog", { name: "A little hello." })).toBeVisible();
});

async function fillNote(dialog: Locator, message = "Hello! I would love to talk about an AI system.") {
  await dialog.getByRole("textbox", { name: "Your message" }).fill(message);
  await dialog.getByRole("textbox", { name: "FROM", exact: true }).fill("Jamie Example");
  await dialog.getByRole("textbox", { name: "REPLY TO" }).fill("jamie@example.com");
}

test("validates reply email and a short message before contacting the provider", async ({ page }) => {
  let requests = 0;
  await page.route(contactConfig.endpoint, async route => {
    requests++;
    await route.fulfill({ status: 200, contentType: "text/plain", body: "OK" });
  });
  const dialog = page.getByRole("dialog", { name: "A little hello." });
  const email = dialog.getByRole("textbox", { name: "REPLY TO" });
  const message = dialog.getByRole("textbox", { name: "Your message" });
  const send = dialog.getByRole("button", { name: "Send note", exact: true });

  await send.click();
  await expect(dialog.getByRole("alert")).toHaveText("Add a valid email so I can reply.");
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await email.fill("invalid-email");
  await send.click();
  await expect(email).toHaveAttribute("aria-invalid", "true");

  await email.fill("jamie@example.com");
  await message.fill(" ");
  await send.click();
  await expect(dialog.getByRole("alert")).toHaveText("A short hello is enough. Add your message above.");
  await expect(message).toBeFocused();
  await expect(message).toHaveAttribute("aria-invalid", "true");
  await message.fill("H");
  await send.click();
  await expect(message).toHaveAttribute("aria-invalid", "true");
  expect(requests).toBe(0);

  // A visitor can genuinely send a tiny hello without an obligatory name.
  await message.fill("Hi");
  await send.click();
  await expect(dialog.getByText("Thank you for the note.")).toBeVisible();
  expect(requests).toBe(1);
});

test("sends the existing template contract and clears only the successfully sent message", async ({ page }) => {
  let payload: NotePayload | undefined;
  let method = "";
  let contentType = "";
  await page.route(contactConfig.endpoint, async route => {
    method = route.request().method();
    contentType = route.request().headers()["content-type"];
    payload = route.request().postDataJSON() as NotePayload;
    await route.fulfill({ status: 200, contentType: "text/plain", body: "OK" });
  });
  const dialog = page.getByRole("dialog", { name: "A little hello." });
  await fillNote(dialog, "  I would love to discuss a collaboration.  ");
  await dialog.getByRole("textbox", { name: "FROM", exact: true }).fill("  Jamie Example  ");
  await dialog.getByRole("textbox", { name: "REPLY TO" }).fill("jamie@example.com ");
  await dialog.getByRole("combobox", { name: "A note about" }).click();
  await page.getByRole("option", { name: "an interesting collaboration", exact: true }).click();
  await dialog.getByRole("button", { name: "Send note", exact: true }).click();
  await expect(dialog.getByText("Thank you for the note.")).toBeVisible();

  expect(method).toBe("POST");
  expect(contentType).toContain("application/json");
  expect(payload).toEqual({
    service_id: "service_pi20arf",
    template_id: "template_g6xdg9a",
    user_id: contactConfig.publicKey,
    template_params: {
      from_name: "Jamie Example",
      from_email: "jamie@example.com",
      subject: "Portfolio · an interesting collaboration",
      message: "I would love to discuss a collaboration.",
    },
  });
  await expect(dialog.getByRole("link", { name: "gshyam2603@gmail.com" })).toHaveAttribute("href", "mailto:gshyam2603@gmail.com");
  await dialog.getByRole("button", { name: "Write another note" }).click();
  await expect(dialog.getByRole("textbox", { name: "Your message" })).toHaveValue("");
  await expect(dialog.getByRole("textbox", { name: "REPLY TO" })).toHaveValue("jamie@example.com");
});

test("a rejected provider response retains the draft and allows a retry or direct email", async ({ page }) => {
  const payloads: NotePayload[] = [];
  await page.route(contactConfig.endpoint, async route => {
    payloads.push(route.request().postDataJSON() as NotePayload);
    await route.fulfill({
      status: payloads.length === 1 ? 503 : 200,
      contentType: "text/plain",
      body: payloads.length === 1 ? "Provider unavailable" : "OK",
    });
  });
  const dialog = page.getByRole("dialog", { name: "A little hello." });
  const draft = "A draft worth keeping if the email provider is temporarily unavailable.";
  await fillNote(dialog, draft);
  await dialog.getByRole("button", { name: "Send note", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Your note hasn’t been sent.");
  await expect(dialog.getByRole("textbox", { name: "Your message" })).toHaveValue(draft);
  await expect(dialog.getByRole("textbox", { name: "FROM", exact: true })).toHaveValue("Jamie Example");
  await expect(dialog.getByRole("textbox", { name: "REPLY TO" })).toHaveValue("jamie@example.com");
  await expect(dialog.getByRole("button", { name: "Send note", exact: true })).toBeEnabled();
  await expect(dialog.getByRole("link", { name: "gshyam2603@gmail.com" })).toHaveAttribute("href", "mailto:gshyam2603@gmail.com");

  await dialog.getByRole("button", { name: "Send note", exact: true }).click();
  await expect(dialog.getByText("Thank you for the note.")).toBeVisible();
  expect(payloads).toHaveLength(2);
  expect(payloads[1]).toEqual(payloads[0]);
});

test("a slow response prevents duplicate submission and protects the in-flight draft", async ({ page }) => {
  let requests = 0;
  let finishResponse: () => void = () => {};
  const responseGate = new Promise<void>(resolve => { finishResponse = resolve; });
  await page.route(contactConfig.endpoint, async route => {
    requests++;
    await responseGate;
    await route.fulfill({ status: 200, contentType: "text/plain", body: "OK" });
  });
  const dialog = page.getByRole("dialog", { name: "A little hello." });
  await fillNote(dialog);
  await dialog.getByRole("button", { name: "Send note", exact: true }).click();

  try {
    await expect.poll(() => requests).toBe(1);
    await expect(dialog.getByRole("button", { name: "Sending…", exact: true })).toBeDisabled();
    await expect(dialog.getByRole("textbox", { name: "Your message" })).toBeDisabled();
    await expect(dialog.getByRole("textbox", { name: "FROM", exact: true })).toBeDisabled();
    await expect(dialog.getByRole("textbox", { name: "REPLY TO" })).toBeDisabled();
    await expect(dialog.getByRole("status")).toHaveText("Sending your message.");

    // Exercise duplicate submit events as well as the disabled visible button.
    await dialog.locator("form").evaluate(form => {
      (form as HTMLFormElement).requestSubmit();
      (form as HTMLFormElement).requestSubmit();
    });
    await dialog.getByRole("button", { name: "Close note" }).click();
    await page.getByRole("button", { name: "Write me a note" }).click();
    await expect(dialog.getByRole("button", { name: "Sending…", exact: true })).toBeDisabled();
    expect(requests).toBe(1);
  } finally {
    finishResponse();
  }

  await expect(dialog.getByText("Thank you for the note.")).toBeVisible();
  expect(requests).toBe(1);
});
