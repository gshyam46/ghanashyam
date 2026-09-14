import type { Metadata } from "next";
import { isPreview, siteUrl } from "@/lib/site";
import { profile } from "@/data/portfolio";
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

// Ties this site to Ghanashyam's GitHub and LinkedIn as one entity, so search engines can
// surface them together instead of treating each profile as an unrelated, disconnected result.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: siteUrl.href,
  image: new URL("/opengraph-image", siteUrl).href,
  jobTitle: profile.role,
  worksFor: { "@type": "Organization", name: "Oracle" },
  sameAs: [profile.github, profile.linkedin],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </body>
    </html>
  );
}
