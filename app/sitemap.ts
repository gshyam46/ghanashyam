import type { MetadataRoute } from "next";
import { isPreview, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return isPreview ? [] : [{ url: siteUrl.href, changeFrequency: "monthly", priority: 1 }];
}
