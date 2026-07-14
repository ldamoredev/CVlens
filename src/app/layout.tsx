import type { Metadata } from "next";
import { headers } from "next/headers";

import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/space-grotesk";

import { themeInitScript } from "@/lib/theme";

import "./globals.css";

const siteUrl = process.env.CVLENS_SITE_URL ?? "http://localhost:3000";
const title = "CVLens — análisis verificable de CVs";
const description =
  "Análisis auditable de CVs con evidencia citada y puntuación determinística.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "CVLens",
  openGraph: {
    title,
    description,
    siteName: "CVLens",
    type: "website",
    locale: "es_ES",
    url: siteUrl,
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
      </head>
      <body>{children}</body>
    </html>
  );
}
