import type { Metadata } from "next";
import "./globals.css";
import {
  fontKarla,
  fontManrope,
  fontPlayfair,
  fontPlusJakarta,
  fontLibreBaskerville,
  fontSora,
  fontSpaceGrotesk,
} from "./fonts";
import AuthProvider from "../components/AuthProvider";
import { getSiteUrl } from "@/lib/site";
import ModernNavbar from "../components/ui/ModernNavbar";
import ModernFooter from "../components/ui/ModernFooter";

const siteUrl = getSiteUrl();
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "ScLbPuILYWTWtNMP4oWQnBpW2VF037R5IA7QfrSvxyU";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rushi's Notion Widgets",
    template: "%s | Rn. Widgets",
  },
  description:
    "Embeddable Notion widgets for clock, timer, stopwatch, quotes, weather, progress, d-day, and music player use cases.",
  applicationName: "Notion Widgets",
  keywords: [
    "notion widgets",
    "notion clock widget",
    "notion timer widget",
    "notion weather widget",
    "notion quote widget",
    "embeddable widgets",
    "next.js notion widgets",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Rushi's Notion Widgets",
    title: "Rushi's Notion Widgets",
    description:
      "Embeddable Notion widgets for clock, timer, stopwatch, quotes, weather, progress, d-day, and music player use cases.",
    images: [
      {
        url: "/readme/hero_dashboard.png",
        width: 1600,
        height: 860,
        alt: "Notion widgets dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rushi's Notion Widgets",
    description:
      "Embeddable Notion widgets for clock, timer, stopwatch, quotes, weather, progress, d-day, and music player use cases.",
    images: ["/readme/hero_dashboard.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: googleSiteVerification,
  },
  icons: {
    icon: "/icons/ees.png",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`h-full bg-slate-950 ${fontSpaceGrotesk.variable} ${fontSora.variable} ${fontPlusJakarta.variable} ${fontManrope.variable} ${fontPlayfair.variable} ${fontLibreBaskerville.variable} ${fontKarla.variable}`}
    >
      <body className="h-full bg-slate-950 antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ModernNavbar />
          <main className="min-h-screen">{children}</main>
          <ModernFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
