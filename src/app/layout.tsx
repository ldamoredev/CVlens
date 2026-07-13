import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CVLens",
  description: "Evidence-backed CV analysis with deterministic scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
