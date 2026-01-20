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
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "dernier cri live",
  description: "TikTok-style radio streaming - swipe to discover new stations from around the world",
  keywords: ["radio", "streaming", "live", "music", "global", "stations", "ambient"],
  authors: [{ name: "dernier cri" }],
  openGraph: {
    title: "dernier cri live",
    description: "Discover global radio stations with a simple swipe",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 600,
        height: 600,
        alt: "dernier cri live",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "dernier cri live",
    description: "Discover global radio stations with a simple swipe",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
