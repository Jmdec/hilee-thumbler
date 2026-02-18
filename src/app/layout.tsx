import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://izakayaph.com"),
  
  title: {
    default: "Izakaya Tori Ichizu Poblacion Makati - Authentic Japanese Restaurant Philippines",
    template: "%s | Izakaya Tori Ichizu Poblacion"
  },
  
  description:
    "Newly opened authentic Japanese izakaya in Poblacion, Makati, Philippines. Experience premium yakitori, fresh sushi, ramen, and Japanese craft sake. Traditional Japanese dining with modern ambiance. Reserve your table today!",
  
  keywords: [
    // Location-specific keywords
    "Japanese restaurant Poblacion Makati",
    "izakaya Poblacion",
    "Japanese restaurant Makati",
    "izakaya Makati",
    "Japanese restaurant Philippines",
    "best Japanese food Poblacion",
    "Japanese restaurant near me Poblacion",
    "Poblacion Japanese dining",
    "izakaya Metro Manila",
    "Japanese restaurant BGC",
    "Makati nightlife restaurant",
    "Poblacion restaurant",
    "47 Polaris Makati",
    
    // Cuisine-specific keywords
    "yakitori Poblacion",
    "yakitori Makati",
    "authentic yakitori Philippines",
    "sushi Poblacion",
    "sushi Makati",
    "fresh sushi Philippines",
    "ramen Poblacion",
    "ramen Makati",
    "authentic ramen Philippines",
    "tonkotsu ramen Makati",
    "aburasoba Philippines",
    "Japanese BBQ Makati",
    "robatayaki Philippines",
    "takoyaki Makati",
    "gyoza Poblacion",
    
    // Experience keywords
    "authentic Japanese cuisine",
    "traditional izakaya",
    "Japanese sake bar Poblacion",
    "Japanese sake bar Makati",
    "Japanese craft beer",
    "Japanese whisky bar",
    "omakase Makati",
    "Japanese fine dining Makati",
    
    // Occasion keywords
    "Japanese restaurant for dates Poblacion",
    "business lunch Makati Japanese",
    "after work drinks Poblacion",
    "Japanese restaurant reservations Makati",
    "private dining Makati Japanese",
    "Poblacion nightlife dining",
    
    // Brand
    "Tori Ichizu",
    "Izakaya Tori Ichizu",
    "Tori Ichizu Poblacion",
    "Tori Ichizu Makati",
    
    // New opening
    "new Japanese restaurant Poblacion 2025",
    "new Japanese restaurant Makati 2025",
    "newly opened izakaya Philippines",
    "new restaurant Poblacion",
  ],
  
  authors: [{ name: "Izakaya Tori Ichizu Poblacion" }],
  creator: "Izakaya Tori Ichizu",
  publisher: "Izakaya Tori Ichizu Restaurant",
  applicationName: "Izakaya Tori Ichizu",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",
  
  // Open Graph metadata for social sharing - THIS MAKES IMAGES APPEAR WHEN SHARING LINKS
  openGraph: {
    type: "website",
    locale: "en_PH",
    alternateLocale: ["en_US", "ja_JP"],
    url: "https://izakayaph.com",
    siteName: "Izakaya Tori Ichizu Poblacion",
    title: "Izakaya Tori Ichizu - New Authentic Japanese Restaurant in Poblacion Makati",
    description:
      "Newly opened authentic Japanese izakaya in Poblacion, Makati! Experience premium yakitori, fresh sushi, ramen, and Japanese craft sake. Book your table now!",
    images: [
      {
        url: "https://izakayaph.com/og-image.jpg", // Main share image
        width: 1200,
        height: 630,
        alt: "Izakaya Tori Ichizu Restaurant Poblacion Makati Interior",
        type: "image/jpeg",
      },
      {
        url: "https://izakayaph.com/restaurant-exterior.jpg",
        width: 1200,
        height: 630,
        alt: "Izakaya Tori Ichizu Exterior - 47 Polaris, Poblacion",
        type: "image/jpeg",
      },
      {
        url: "https://izakayaph.com/restaurant-interior.jpg",
        width: 1200,
        height: 630,
        alt: "Izakaya Tori Ichizu Interior Ambiance",
        type: "image/jpeg",
      },
      {
        url: "https://izakayaph.com/signature-dishes.jpg",
        width: 1200,
        height: 630,
        alt: "Premium Yakitori and Japanese Dishes at Tori Ichizu",
        type: "image/jpeg",
      },
    ],
    countryName: "Philippines",
  },

  // Twitter Card metadata - FOR TWITTER/X SHARING
  twitter: {
    card: "summary_large_image",
    title: "Izakaya Tori Ichizu Poblacion - New Authentic Japanese Restaurant",
    description:
      "Newly opened in Poblacion, Makati! Authentic yakitori, sushi, ramen & sake. Experience traditional Japanese izakaya dining.",
    images: ["https://izakayaph.com/og-image.jpg"], // Use full URL
    creator: "@toriichizuph",
    site: "@toriichizuph",
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tori Ichizu Poblacion",
    startupImage: [
      {
        url: "/apple-splash-2048-2732.jpg",
        media: "(device-width: 1024px) and (device-height: 1366px)",
      },
      {
        url: "/apple-splash-1668-2388.jpg",
        media: "(device-width: 834px) and (device-height: 1194px)",
      },
    ],
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon192_rounded.png", sizes: "192x192", type: "image/png" },
      { url: "/icon512_rounded.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon180_rounded.png", sizes: "180x180", type: "image/png" },
      { url: "/icon192_rounded.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icon512_rounded.png",
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },

  // Additional metadata
  category: "restaurant",
  classification: "Japanese Restaurant",
  
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  alternates: {
    canonical: "https://izakayaph.com",
    languages: {
      "en-PH": "https://izakayaph.com",
      "en-US": "https://izakayaph.com/en",
    },
  },
  
  verification: {
    google: "your-google-search-console-verification-code",
    yandex: "your-yandex-verification-code",
    other: {
      "facebook-domain-verification": "your-facebook-domain-verification",
    },
  },

  // Additional App-specific metadata
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
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
  // Primary Restaurant Structured Data (JSON-LD)
  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": "https://izakayaph.com/#restaurant",
    "name": "Izakaya Tori Ichizu",
    "alternateName": "Tori Ichizu Poblacion",
    "image": [
      "https://izakayaph.com/restaurant-exterior.jpg",
      "https://izakayaph.com/restaurant-interior.jpg",
      "https://izakayaph.com/signature-dishes.jpg"
    ],
    "description": "Newly opened authentic Japanese izakaya in Poblacion, Makati, Philippines. Specializing in premium yakitori, fresh sushi, authentic ramen, and curated Japanese sake selection.",
    "servesCuisine": ["Japanese", "Asian", "Izakaya", "Yakitori", "Sushi", "Ramen"],
    "priceRange": "₱₱-₱₱₱",
    "currenciesAccepted": "PHP",
    "paymentAccepted": "Cash, Credit Card, Debit Card, GCash, Maya",
    
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "47 Polaris, Poblacion",
      "addressLocality": "Makati City",
      "addressRegion": "Metro Manila",
      "postalCode": "1209",
      "addressCountry": "PH"
    },
    
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.5635",
      "longitude": "121.0298"
    },
    
    "telephone": "(02) 8362 0676",
    "email": "reservations@izakayaph.com",
    "url": "https://izakayaph.com",
    
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
        "opens": "11:00",
        "closes": "02:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Friday", "Saturday", "Sunday"],
        "opens": "11:00",
        "closes": "04:00"
      }
    ],
    
    "menu": "https://izakayaph.com/menu",
    "acceptsReservations": true,
    "hasMenu": "https://izakayaph.com/menu",
    
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "52",
      "bestRating": "5",
      "worstRating": "1"
    },
    
    "starRating": {
      "@type": "Rating",
      "ratingValue": "4.8"
    },
    
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free Wi-Fi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Outdoor Seating",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Private Dining Room",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Bar",
        "value": true
      }
    ],
    
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://izakayaph.com/reservations",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "Reservation",
        "name": "Table Reservation"
      }
    }
  }

  // LocalBusiness Schema for better local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://izakayaph.com/#localbusiness",
    "name": "Izakaya Tori Ichizu",
    "image": "https://izakayaph.com/og-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "47 Polaris, Poblacion",
      "addressLocality": "Makati City",
      "addressRegion": "Metro Manila",
      "postalCode": "1209",
      "addressCountry": "Philippines"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.5635",
      "longitude": "121.0298"
    },
    "url": "https://izakayaph.com",
    "telephone": "(02) 8362 0676",
    "priceRange": "₱₱-₱₱₱",
    "openingHours": "Mo-Th 11:00-02:00, Fr-Su 11:00-04:00"
  }

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://izakayaph.com/#organization",
    "name": "Izakaya Tori Ichizu",
    "url": "https://izakayaph.com",
    "logo": "https://izakayaph.com/logo.png",
    "image": "https://izakayaph.com/og-image.jpg",
    "description": "Authentic Japanese izakaya restaurant in Poblacion, Makati, Philippines",
    "email": "info@izakayaph.com",
    "telephone": "(02) 8362 0676",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "47 Polaris, Poblacion",
      "addressLocality": "Makati City",
      "addressRegion": "Metro Manila",
      "postalCode": "1209",
      "addressCountry": "PH"
    },
    "sameAs": [
      "https://www.facebook.com/toriichizupoblacion",
      "https://www.instagram.com/toriichizupoblacion",
      "https://twitter.com/toriichizuph",
      "https://www.tiktok.com/@toriichizupoblacion"
    ],
    "foundingDate": "2025-01",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Poblacion, Makati",
        "addressCountry": "Philippines"
      }
    }
  }

  // WebSite Schema for search box
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://izakayaph.com/#website",
    "url": "https://izakayaph.com",
    "name": "Izakaya Tori Ichizu Poblacion",
    "description": "Authentic Japanese Restaurant in Poblacion, Makati",
    "publisher": {
      "@id": "https://izakayaph.com/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://izakayaph.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <html lang="en-PH">
      <head>
        {/* Primary Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        
        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        
        {/* Open Graph Image Tags - CRITICAL FOR LINK PREVIEW */}
        <meta property="og:image" content="https://izakayaph.com/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://izakayaph.com/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Izakaya Tori Ichizu Restaurant Poblacion Makati" />
        
        {/* Twitter Card Image */}
        <meta name="twitter:image" content="https://izakayaph.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="Izakaya Tori Ichizu Poblacion" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Geographic meta tags */}
        <meta name="geo.region" content="PH-NCR" />
        <meta name="geo.placename" content="47 Polaris, Poblacion, Makati City" />
        <meta name="geo.position" content="14.5635;121.0298" />
        <meta name="ICBM" content="14.5635, 121.0298" />
        
        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        
        {/* Business-specific meta */}
        <meta property="business:contact_data:street_address" content="47 Polaris, Poblacion" />
        <meta property="business:contact_data:locality" content="Poblacion, Makati City" />
        <meta property="business:contact_data:region" content="Metro Manila" />
        <meta property="business:contact_data:postal_code" content="1209" />
        <meta property="business:contact_data:country_name" content="Philippines" />
        <meta property="place:location:latitude" content="14.5635" />
        <meta property="place:location:longitude" content="121.0298" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://izakayaph.com" />
        
        {/* Alternative languages */}
        <link rel="alternate" hrefLang="en-ph" href="https://izakayaph.com" />
        <link rel="alternate" hrefLang="en" href="https://izakayaph.com/en" />
        <link rel="alternate" hrefLang="x-default" href="https://izakayaph.com" />
      </head>
      <body>
        <ServiceWorkerProvider />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
