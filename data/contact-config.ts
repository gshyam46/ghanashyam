// Existing owner-owned EmailJS browser integration. These identifiers and the
// public browser key are intentionally public, not server credentials.
// Source: https://github.com/gshyam46/gshyam46.github.io/blob/main/src/components/Contact/index.js
// API: https://www.emailjs.com/docs/rest-api/send/
export const contactConfig = {
  serviceId: "service_pi20arf",
  templateId: "template_g6xdg9a",
  publicKey: "m61jXe06BCg-mMrUe",
  endpoint: "https://api.emailjs.com/api/v1.0/email/send",
} as const;
