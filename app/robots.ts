import type { MetadataRoute } from "next";
import { isPreview, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isPreview ? { userAgent: "*", disallow: "/" } : { userAgent: "*", allow: "/" },
    ...(!isPreview && { sitemap: new URL("/sitemap.xml", siteUrl).href }),
  };
}
