import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Better Hanzi",
  description: "Minimal Hanzi stroke-order trainer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans">
      <body>{children}</body>
    </html>
  );
}
