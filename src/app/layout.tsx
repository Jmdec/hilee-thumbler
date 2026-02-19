import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://hilee.ph"),

  title: {
    default: "Hilee — Premium Everyday Tumblers",
    template: "%s | Hilee"
  },

  description:
    "Hilee offers stylish insulated tumblers designed for everyday life. Keep drinks cold for 24 hours and hot for 12 hours. Affordable premium drinkware in the Philippines.",

  keywords: [
    "Hilee tumbler",
    "Hilee flask",
    "tumbler Philippines",
    "insulated tumbler PH",
    "affordable tumbler Philippines",
    "vacuum flask Philippines",
    "Hilee drinkware",
    "Shopee tumbler Philippines",
    "TikTok tumbler Philippines",
    "Aquaflask alternative",
    "aesthetic tumbler PH"
  ],

  authors: [{ name: "Hilee" }],
  creator: "Hilee",
  publisher: "Hilee",
  applicationName: "Hilee",

  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://hilee.ph",
    siteName: "Hilee",
    title: "Hilee — Premium Everyday Tumblers",
    description:
      "Stylish insulated tumblers designed for everyday life. Affordable premium drinkware in the Philippines.",
    images: [
      {
        url: "https://hilee.ph/hilee-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Hilee Tumblers",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Hilee — Premium Everyday Tumblers",
    description:
      "Stylish insulated tumblers designed for everyday life.",
    images: ["https://hilee.ph/hilee-logo.jpg"],
  },

  icons: {
    icon: [{ url: "/hilee-logo.jpg", sizes: "any" }],
    apple: [{ url: "/hilee-logo.jpg", sizes: "180x180" }],
  },

  category: "ecommerce",
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3d5a3d" },
    { media: "(prefers-color-scheme: dark)", color: "#2a3f2a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": "https://hilee.ph/#brand",
    name: "Hilee",
    url: "https://hilee.ph",
    logo: "https://hilee.ph/hilee-logo.jpg",
    image: "https://hilee.ph/hilee-logo.jpg",
    description:
      "Hilee is a drinkware brand offering stylish insulated tumblers designed for everyday use.",
    sameAs: [
      "https://www.tiktok.com/@hilee",
      "https://www.instagram.com/hilee",
      "https://www.facebook.com/hilee"
    ]
  }

  return (
    <html lang="en-PH">
      <head>
        {/* Organization / Brand Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Brand",
              name: "Hilee",
              url: "https://hilee.ph",
              logo: "https://hilee.ph/hilee-logo.jpg",
              image: "https://hilee.ph/hilee-logo.jpg",
              description:
                "Hilee offers stylish insulated tumblers designed for everyday life.",
            }),
          }}
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Hilee — Premium Everyday Tumblers" />
        <meta
          property="og:description"
          content="Stylish insulated tumblers designed for everyday life. Keep drinks cold for 24 hours and hot for 12 hours."
        />
        <meta property="og:url" content="https://hilee.ph" />
        <meta property="og:image" content="https://hilee.ph/hilee-logo.jpg" />
        <meta property="og:image:secure_url" content="https://hilee.ph/hilee-logo.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Hilee Tumblers" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hilee — Premium Everyday Tumblers" />
        <meta
          name="twitter:description"
          content="Stylish insulated tumblers designed for everyday life."
        />
        <meta name="twitter:image" content="https://hilee.ph/hilee-logo.jpg" />

        {/* Canonical */}
        <link rel="canonical" href="https://hilee.ph" />

        {/* Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Basic meta */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="language" content="English" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
      </head>

      <body>
        <ServiceWorkerProvider />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
