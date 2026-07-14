import type { Metadata } from "next";
import { headers } from "next/headers";

import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/space-grotesk";

import { themeInitScript } from "@/lib/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: "CVLens — análisis verificable de CVs",
  description:
    "Análisis auditable de CVs con evidencia citada y puntuación determinística.",
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
