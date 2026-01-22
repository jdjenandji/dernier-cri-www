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
  title: "FOUND FM",
  description: "Global Radio Stations",
  keywords: ["radio", "streaming", "live", "music", "global", "stations", "ambient"],
  authors: [{ name: "FOUND FM" }],
  openGraph: {
    title: "FOUND FM",
    description: "Global Radio Stations",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 1024,
        height: 1024,
        alt: "FOUND FM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FOUND FM",
    description: "Global Radio Stations",
    images: ["/icon.png"],
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
