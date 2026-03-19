import type { Metadata } from "next";
import "./globals.css";
import {
  fontManrope,
  fontPlayfair,
  fontPlusJakarta,
  fontLibreBaskerville,
  fontSora,
  fontSpaceGrotesk,
} from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "Rushi's Notion Widgets",
    template: "%s | Rn. Widgets",
  },
  description: "Static, embeddable Notion widgets built with Next.js",
  icons: {
    // icon: "/icons/es.png",
    icon: "/icons/ees.png",
    // icon: "/icons/n_icon.png",
    // icon: "/icons/r_icon.png",
    // icon: "/icons/rr_icon.png",
    // icon: "/icons/w_icon.png",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`h-full bg-transparent ${fontSpaceGrotesk.variable} ${fontSora.variable} ${fontPlusJakarta.variable} ${fontManrope.variable} ${fontPlayfair.variable} ${fontLibreBaskerville.variable}`}
    >
      <body className="h-full bg-transparent antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
