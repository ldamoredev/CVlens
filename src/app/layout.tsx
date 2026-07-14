import type { Metadata } from "next";
import { headers } from "next/headers";

import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/space-grotesk";

import { themeInitScript } from "@/lib/theme";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const siteUrl = getSiteUrl();
const title = "CVLens — análisis verificable de CVs";
const description =
  "Análisis auditable de CVs con evidencia citada y puntuación determinística.";
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CVLens",
  url: siteUrl.href,
  description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  inLanguage: ["es", "en"],
  isAccessibleForFree: true,
}).replaceAll("<", "\\u003c");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "CVLens",
  authors: [{ name: "CVLens", url: siteUrl }],
  creator: "CVLens",
  publisher: "CVLens",
  category: "technology",
  keywords: [
    "análisis de CV",
    "revisión de currículum",
    "CV audit",
    "ATS",
    "evidencia citada",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title,
    description,
    siteName: "CVLens",
    type: "website",
    locale: "es_ES",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
