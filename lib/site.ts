// Explicit overrides take priority; Vercel supplies the production domain for each project.
const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (productionDomain ? `https://${productionDomain}` : "https://ghanashyamg.vercel.app"),
);
export const isPreview = process.env.VERCEL_ENV === "preview";
