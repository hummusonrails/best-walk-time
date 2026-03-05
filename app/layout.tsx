import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Inter } from "next/font/google";
import { I18nProvider } from "best-time-ui";
import { translations } from "@/lib/i18n";
import Script from "next/script";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bestwalkingtime.com"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Best Walk Time",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
  title: {
    default: "Best Walk Time | הזמן הטוב לטיול",
    template: "%s | Best Walk Time",
  },
  description:
    "Real-time safety app for Israelis — analyzes rocket alert data and nearby shelter locations to recommend the safest times for a walk. Stay informed, stay safe.",
  keywords: [
    "rocket alerts",
    "Israel safety",
    "Pikud HaOref",
    "פיקוד העורף",
    "best walk time",
    "הזמן הטוב לטיול",
    "bomb shelters",
    "מקלטים",
    "shelter finder",
    "safe time to walk",
    "real-time alerts",
    "צבע אדום",
  ],
  authors: [
    {
      name: "Ben Greenberg",
      url: "https://www.hummusonrails.com/",
    },
  ],
  creator: "Ben Greenberg",
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
  openGraph: {
    title: "Best Walk Time | הזמן הטוב לטיול",
    description:
      "Is it safe to walk right now? Real-time rocket alert analysis + nearby shelter locations for Israelis.",
    siteName: "Best Walk Time",
    locale: "en_US",
    type: "website",
    url: "https://bestwalkingtime.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Walk Time | הזמן הטוב לטיול",
    description:
      "Is it safe to walk right now? Real-time rocket alert analysis + nearby shelters for Israelis.",
  },
  alternates: {
    languages: {
      en: "/",
      he: "/",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#1E1E1C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${cormorant.variable} ${jetbrains.variable} ${inter.variable} antialiased`}
      >
        <I18nProvider translations={translations} storageKey="bwt-lang">
          {children}
        </I18nProvider>
        <ServiceWorkerRegistration />
        <Script
          data-goatcounter="https://bestwalkingtime.goatcounter.com/count"
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
