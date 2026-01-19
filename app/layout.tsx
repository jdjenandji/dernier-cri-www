import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "dernier cri live",
  description: "TikTok-style radio streaming - swipe to discover new stations from around the world",
  keywords: ["radio", "streaming", "live", "music", "global", "stations", "ambient"],
  authors: [{ name: "dernier cri" }],
  openGraph: {
    title: "dernier cri live",
    description: "Discover global radio stations with a simple swipe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "dernier cri live",
    description: "Discover global radio stations with a simple swipe",
  },
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
