import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SeoJsonLd } from "./components/SeoJsonLd";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://img-gen.mandy9943.dev";
const SITE_NAME = "Bulk AI Image Generator";
const SITE_DESCRIPTION =
  "Generate multiple images in one run with Google Gemini. Paste a JSON array of prompts, choose variants/aspect ratios, and download results as a ZIP.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "bulk image generator",
    "ai image generator",
    "gemini",
    "google gemini",
    "image generation",
    "json prompts",
    "batch image generation",
  ],
  authors: [
    {
      name: "Armando Martin (Mandy9943)",
      url: "https://mandy9943.dev",
    },
  ],
  creator: "Armando Martin (Mandy9943)",
  publisher: "Armando Martin (Mandy9943)",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SeoJsonLd />
        {children}
      </body>
    </html>
  );
}

