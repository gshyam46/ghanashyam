import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig(base, {
  use: { ...base.use, baseURL: "http://127.0.0.1:3100" },
  webServer: {
    command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
