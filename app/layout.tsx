import type { Metadata } from "next";
import { isPreview, siteUrl } from "@/lib/site";
import "@fontsource-variable/manrope";
import "@fontsource/dm-mono/400.css";
import "./globals.css";
import "./refinements.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  alternates: { canonical: "/" },
  title: "Ghanashyam G — Systems, thoughtfully engineered.",
  description: "An interactive look inside Ghanashyam's practice: AI integration, agentic systems, automation, and observability.",
  openGraph: {
    title: "Ghanashyam G — The Observatory",
    description: "Systems thinking. Applied intelligence. Human outcomes.",
    type: "website",
    url: "/",
    siteName: "Ghanashyam — The Observatory",
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
  robots: { index: !isPreview, follow: !isPreview },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
