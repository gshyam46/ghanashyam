import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ghanashyam G — The Observatory",
    short_name: "Ghanashyam G",
    start_url: "/",
    display: "standalone",
    background_color: "#111210",
    theme_color: "#111210",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
